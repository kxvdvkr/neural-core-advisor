import { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, TrendingDown, RefreshCw, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || '/api';

const WATCHLIST = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'GOOGL'];

function StatCard({ label, value, sub, positive }) {
  return (
    <div className="glass-panel p-4">
      <div className="text-xs text-text-muted font-medium mb-1">{label}</div>
      <div className="text-xl font-semibold text-text-primary">{value}</div>
      {sub && (
        <div className={`text-xs mt-0.5 font-medium ${positive ? 'positive' : 'negative'}`}>{sub}</div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { token } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [chart, setChart] = useState([]);
  const [chartSymbol, setChartSymbol] = useState('AAPL');
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchQuotes = async () => {
    const results = await Promise.all(
      WATCHLIST.map(s => axios.get(`${API}/market/${s}`).then(r => r.data).catch(() => null))
    );
    setQuotes(results.filter(Boolean));
  };

  const fetchChart = async (symbol) => {
    try {
      const { data } = await axios.get(`${API}/market/${symbol}/history`);
      setChart(data);
    } catch { setChart([]); }
  };

  const fetchPortfolio = async () => {
    try {
      const { data } = await axios.get(`${API}/portfolio`, { headers });
      setPortfolio(data);
    } catch { setPortfolio([]); }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchQuotes(), fetchChart(chartSymbol), fetchPortfolio()]);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    fetchChart(chartSymbol);
  }, [chartSymbol]);

  const totalValue = portfolio.reduce((sum, p) => sum + p.price * p.qty, 0);
  const totalCost = portfolio.reduce((sum, p) => sum + p.avgCost * p.qty, 0);
  const totalPnl = totalValue - totalCost;
  const pnlPct = totalCost > 0 ? ((totalPnl / totalCost) * 100).toFixed(2) : '0.00';

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Dashboard</h1>
          <p className="text-xs text-text-muted mt-0.5">Live market overview</p>
        </div>
        <button onClick={() => { fetchQuotes(); fetchPortfolio(); }}
          className="btn-ghost flex items-center gap-1.5 text-xs">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Portfolio Value" value={`$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          sub={`${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)} (${pnlPct}%)`} positive={totalPnl >= 0} />
        <StatCard label="Total Invested" value={`$${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
        <StatCard label="Holdings" value={portfolio.length} sub="active positions" />
        <StatCard label="Watchlist" value={quotes.length} sub="symbols tracked" />
      </div>

      {/* Chart */}
      <div className="glass-panel p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity size={16} style={{ color: '#00FF94' }} />
            <span className="text-sm font-medium text-text-primary">40-Day Chart</span>
          </div>
          <div className="flex gap-1">
            {['AAPL', 'MSFT', 'NVDA', 'TSLA'].map(s => (
              <button key={s} onClick={() => setChartSymbol(s)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all duration-150 ${
                  chartSymbol === s ? 'text-surface' : 'text-text-muted hover:text-text-primary bg-surface'
                }`}
                style={chartSymbol === s ? { backgroundColor: '#00FF94', color: '#0A0A0B' } : {}}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {chart.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chart}>
              <defs>
                <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00FF94" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00FF94" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fill: '#6b6b7b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b6b7b', fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={v => `$${v.toFixed(0)}`} width={55} />
              <Tooltip
                contentStyle={{ background: '#111113', border: '1px solid #1e1e22', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#6b6b7b' }}
                itemStyle={{ color: '#00FF94' }}
                formatter={v => [`$${Number(v).toFixed(2)}`, 'Price']}
              />
              <Area type="monotone" dataKey="value" stroke="#00FF94" strokeWidth={2} fill="url(#cg)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-44 flex items-center justify-center text-text-muted text-sm">
            {loading ? 'Loading chart...' : 'Chart data unavailable'}
          </div>
        )}
      </div>

      {/* Watchlist */}
      <div className="glass-panel overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <span className="text-sm font-medium text-text-primary">Market Watchlist</span>
        </div>
        <div className="divide-y divide-border">
          {quotes.length === 0 && (
            <div className="px-4 py-6 text-center text-text-muted text-sm">
              {loading ? 'Loading market data...' : 'No data available'}
            </div>
          )}
          {quotes.map(q => (
            <div key={q.symbol} className="px-4 py-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-text-primary">{q.symbol}</div>
                <div className="text-xs text-text-muted">{q.currency}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-text-primary">
                  {q.currency === 'INR' ? '₹' : '$'}{q.price?.toFixed(2)}
                </div>
                <div className={`text-xs font-medium flex items-center gap-0.5 justify-end ${q.change >= 0 ? 'positive' : 'negative'}`}>
                  {q.change >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {q.change >= 0 ? '+' : ''}{q.change?.toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
