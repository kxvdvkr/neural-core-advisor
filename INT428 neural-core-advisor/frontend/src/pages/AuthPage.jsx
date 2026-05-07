import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || '/api';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const { data } = await axios.post(`${API}${endpoint}`, form);
      login(data.token, data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #00FF94 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #B535F6 0%, transparent 70%)' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #00FF94, #00C8FF)' }}>
              <span className="text-black font-bold text-sm">N</span>
            </div>
            <span className="text-xl font-semibold tracking-tight text-text-primary">Neural Core</span>
          </div>
          <p className="text-text-muted text-sm">AI-Powered Investment Intelligence</p>
        </div>

        <div className="glass-panel p-6">
          {/* Toggle */}
          <div className="flex gap-1 mb-6 p-1 rounded-lg bg-surface">
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all duration-200 capitalize ${
                  mode === m ? 'bg-panel text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'
                }`}>
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {mode === 'register' && (
              <div>
                <label className="block text-xs text-text-muted mb-1 font-medium">Full Name</label>
                <input
                  className="input-field"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
            )}
            <div>
              <label className="block text-xs text-text-muted mb-1 font-medium">Email</label>
              <input
                className="input-field"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1 font-medium">Password</label>
              <input
                className="input-field"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>
          </div>

          {error && (
            <div className="mt-3 px-3 py-2 rounded-lg text-sm text-red-400 bg-red-900/20 border border-red-900/40">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary w-full mt-4 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </div>

        <p className="text-center text-xs text-text-muted mt-4">
          Strictly for finance & investment insights only.
        </p>
      </div>
    </div>
  );
}
