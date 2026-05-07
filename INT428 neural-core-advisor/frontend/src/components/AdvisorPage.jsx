import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, BrainCircuit, User } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || '/api';

const SUGGESTIONS = [
  'Technical audit of AAPL',
  'Compare MSFT vs GOOGL',
  '30-day trend for NVDA',
  'Should I buy TCS.NS?',
];

function ChartWidget({ data }) {
  if (!data?.data?.length) return null;
  const chartData = data.data
    .filter(d => d.price)
    .map(d => ({ name: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), value: d.price }));

  return (
    <div className="mt-3 p-3 rounded-lg" style={{ background: '#0d0d10', border: '1px solid #1e1e22' }}>
      <div className="text-xs text-text-muted mb-2 font-medium">{data.symbol} — 30-Day Trend</div>
      <ResponsiveContainer width="100%" height={130}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="chatGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#B535F6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#B535F6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="name" tick={{ fill: '#6b6b7b', fontSize: 9 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#6b6b7b', fontSize: 9 }} axisLine={false} tickLine={false}
            tickFormatter={v => `$${v.toFixed(0)}`} width={50} />
          <Tooltip
            contentStyle={{ background: '#111113', border: '1px solid #1e1e22', borderRadius: 8, fontSize: 11 }}
            labelStyle={{ color: '#6b6b7b' }}
            itemStyle={{ color: '#B535F6' }}
            formatter={v => [`$${Number(v).toFixed(2)}`, 'Price']}
          />
          <Area type="monotone" dataKey="value" stroke="#B535F6" strokeWidth={2} fill="url(#chatGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === 'user';

  // Parse chart data from content
  const chartMatch = msg.content.match(/\[CHART_DATA:(.*?)\]$/s);
  const cleanContent = msg.content.replace(/\[CHART_DATA:.*?\]$/s, '').trim();
  let chartData = null;
  if (chartMatch) {
    try { chartData = JSON.parse(chartMatch[1]); } catch {}
  }

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5"
          style={{ background: '#B535F620', border: '1px solid #B535F640' }}>
          <BrainCircuit size={14} style={{ color: '#B535F6' }} />
        </div>
      )}
      <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
        isUser
          ? 'text-surface ml-auto'
          : 'text-text-primary glass-panel'
      }`}
        style={isUser ? { background: '#00FF94', color: '#0A0A0B' } : {}}>
        {isUser ? (
          <p className="font-medium">{cleanContent}</p>
        ) : (
          <div className="prose-dark">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{cleanContent}</ReactMarkdown>
            {chartData && <ChartWidget data={chartData} />}
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5"
          style={{ background: '#00FF9420', border: '1px solid #00FF9440' }}>
          <User size={14} style={{ color: '#00FF94' }} />
        </div>
      )}
    </div>
  );
}

export default function AdvisorPage() {
  const { token } = useAuth();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '## Neural Core Advisor\n\nHello! I\'m your AI-powered financial advisor. I have access to **live market data** and can perform technical analysis.\n\nAsk me about stocks, get technical audits, compare assets, or request trend charts.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');

    const newMessages = [...messages, { role: 'user', content: msg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const { data } = await axios.post(`${API}/chat`,
        { message: msg, history: messages },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Neural bridge encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <BrainCircuit size={18} style={{ color: '#B535F6' }} />
          <h1 className="text-sm font-semibold text-text-primary">AI Advisor</h1>
          <span className="px-2 py-0.5 rounded text-xs font-medium"
            style={{ background: '#00FF9420', color: '#00FF94', border: '1px solid #00FF9440' }}>
            LIVE
          </span>
        </div>
        <p className="text-xs text-text-muted mt-0.5">Powered by Llama 3.3 70B via Groq + Yahoo Finance RAG</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => <Message key={i} msg={msg} />)}
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center"
              style={{ background: '#B535F620', border: '1px solid #B535F640' }}>
              <BrainCircuit size={14} style={{ color: '#B535F6' }} />
            </div>
            <div className="glass-panel px-4 py-3 text-sm text-text-muted flex items-center gap-2">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ background: '#B535F6', animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
              Analyzing market data...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="px-6 pb-3 flex gap-2 flex-wrap flex-shrink-0">
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => send(s)}
              className="px-3 py-1.5 rounded-lg text-xs text-text-muted border border-border hover:border-opacity-60 hover:text-text-primary transition-all"
              style={{ '--hover-border': '#00FF9460' }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-6 pb-6 pt-2 border-t border-border flex-shrink-0">
        <div className="flex gap-2">
          <input
            className="input-field flex-1"
            placeholder="Ask about any stock, market, or investment..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            disabled={loading}
          />
          <button onClick={() => send()} disabled={loading || !input.trim()}
            className="btn-primary px-3 py-2 disabled:opacity-40 disabled:cursor-not-allowed">
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
