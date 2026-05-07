import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, TrendingUp, TrendingDown, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || '/api';

function AddModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ symbol: '', name: '', qty: '', avgCost: '', sector: 'Technology' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuth();

  const handleAdd = async () => {
    if (!form.symbol || !form.qty || !form.avgCost) {
      setError('Symbol, quantity, and avg cost are required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API}/portfolio`, form, { headers: { Authorization: `Bearer ${token}` } });
      onAdd();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: '#0A0A0Bcc' }}>
      <div className="glass-panel p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text-primary">Add Asset</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="space-y-3">
          {[
            { key: 'symbol', label: 'Ticker Symbol', placeholder: 'AAPL, TCS.NS' },
            { key: 'name', label: 'Asset Name (optional)', placeholder: 'Apple Inc.' },
            { key: 'qty', label: 'Quantity', placeholder: '10', type: 'number' },
            { key: 'avgCost', label: 'Avg Cost ($)', placeholder: '150.00', type: 'number' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs text-text-muted mb-1 font-medium">{f.label}</label>
              <input
                className="input-field"
                type={f.type || 'text'}
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
              />
            </div>
          ))}
          <div>
            <label className="block text-xs text-text-muted mb-1 font-medium">Sector</label>
            <select className="input-field" value={form.sector}
              onChange={e => setForm(prev => ({ ...prev, sector: e.target.value }))}>
              {['Technology', 'Finance', 'Healthcare', 'Energy', 'Consumer', 'Industrial', 'Crypto', 'Trading'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        {error && <div className="mt-3 text-xs text-red-400 bg-red-900/20 border border-red-900/40 px-3 py-2 rounded-lg">{error}</div>}
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="btn-ghost flex-1 text-sm">Cancel</button>
          <button onClick={handleAdd} disabled={loading} className="btn-primary flex-1 text-sm disabled:opacity-50">
            {loading ? 'Adding...' : 'Add Asset'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Portfolio() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchPortfolio = async () => {
    try {
      const { data } = await axios.get(`${API}/portfolio`, { headers: { Authorization: `Bearer ${token}` } });
      setItems(data);
    } catch { setItems([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPortfolio(); }, []);

  const deleteItem = async (id) => {
    try {
      await axios.delete(`${API}/portfolio/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setItems(prev => prev.filter(i => i._id !== id));
    } catch {}
  };

  const totalValue = items.reduce((sum, p) => sum + p.price * p.qty, 0);
  const totalCost = items.reduce((sum, p) => sum + p.avgCost * p.qty, 0);
  const totalPnl = totalValue - totalCost;
  const pnlPct = totalCost > 0 ? ((totalPnl / totalCost) * 100).toFixed(2) : '0.00';

  return (
    <div className="p-6 space-y-5 overflow-y-auto h-full">
      {showModal && <AddModal onClose={() => setShowModal(false)} onAdd={fetchPortfolio} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Portfolio</h1>
          <p className="text-xs text-text-muted mt-0.5">Live P&amp;L tracking</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-1.5 text-sm">
          <Plus size={14} /> Add Asset
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Value', value: `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
          { label: 'Total Cost', value: `$${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
          {
            label: 'Total P&L',
            value: `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`,
            sub: `${pnlPct}%`,
            color: totalPnl >= 0 ? '#00FF94' : '#ff4757'
          },
        ].map(c => (
          <div key={c.label} className="glass-panel p-4">
            <div className="text-xs text-text-muted mb-1">{c.label}</div>
            <div className="text-base font-semibold" style={c.color ? { color: c.color } : { color: '#E3E1E9' }}>{c.value}</div>
            {c.sub && <div className="text-xs mt-0.5" style={{ color: c.color }}>{c.sub}</div>}
          </div>
        ))}
      </div>

      {/* Holdings table */}
      <div className="glass-panel overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <span className="text-sm font-medium text-text-primary">Holdings ({items.length})</span>
        </div>
        {loading ? (
          <div className="py-12 text-center text-text-muted text-sm">Loading portfolio...</div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-text-muted text-sm">No holdings yet.</p>
            <button onClick={() => setShowModal(true)} className="btn-primary mt-3 text-sm">
              Add your first asset
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {items.map(item => {
              const value = item.price * item.qty;
              const cost = item.avgCost * item.qty;
              const pnl = value - cost;
              const pnlPct = cost > 0 ? ((pnl / cost) * 100).toFixed(2) : '0.00';
              return (
                <div key={item._id} className="px-4 py-3 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-text-primary">{item.symbol}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded text-text-muted bg-surface border border-border">{item.sector}</span>
                    </div>
                    <div className="text-xs text-text-muted mt-0.5">{item.name} · {item.qty} shares</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-text-primary">${value.toFixed(2)}</div>
                    <div className="text-xs text-text-muted">@ ${item.price?.toFixed(2)}</div>
                  </div>
                  <div className="text-right w-24">
                    <div className={`text-sm font-medium flex items-center justify-end gap-0.5 ${pnl >= 0 ? 'positive' : 'negative'}`}>
                      {pnl >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                      {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                    </div>
                    <div className={`text-xs ${pnl >= 0 ? 'positive' : 'negative'}`}>
                      {pnl >= 0 ? '+' : ''}{pnlPct}%
                    </div>
                  </div>
                  <button onClick={() => deleteItem(item._id)}
                    className="text-text-muted hover:text-red-400 transition-colors ml-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
