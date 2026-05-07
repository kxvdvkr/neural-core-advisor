import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || '/api';

const FIELDS = [
  { key: 'incomeRange', label: 'Annual Income Range', options: ['Under $30K', '$30K–$75K', '$75K–$150K', '$150K–$500K', 'Above $500K'] },
  { key: 'netWorth', label: 'Net Worth', options: ['Under $50K', '$50K–$200K', '$200K–$1M', '$1M–$5M', 'Above $5M'] },
  { key: 'liquidityRatio', label: 'Liquid Assets Ratio', options: ['Less than 10%', '10–25%', '25–50%', 'More than 50%'] },
  { key: 'sourceOfWealth', label: 'Source of Wealth', options: ['Employment', 'Business', 'Investments', 'Inheritance', 'Other'] },
  { key: 'riskTolerance', label: 'Risk Tolerance', options: ['Very Low', 'Low', 'Moderate', 'High', 'Very High'] },
  { key: 'primaryObjective', label: 'Primary Objective', options: ['Capital Preservation', 'Income Generation', 'Balanced Growth', 'Aggressive Growth', 'Speculation'] },
  { key: 'tradingAutonomy', label: 'Trading Autonomy', options: ['Full Manual', 'AI-Assisted', 'Mostly Automated', 'Fully Automated'] },
];

export default function ProfileForm() {
  const { token } = useAuth();
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${API}/profile`, { headers: { Authorization: `Bearer ${token}` } });
        const profileData = {};
        FIELDS.forEach(f => { if (data[f.key]) profileData[f.key] = data[f.key]; });
        setForm(profileData);
      } catch {}
      finally { setFetching(false); }
    })();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    try {
      await axios.post(`${API}/profile`, form, { headers: { Authorization: `Bearer ${token}` } });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <div className="p-6 overflow-y-auto h-full">
      <div className="max-w-xl">
        <div className="flex items-center gap-2 mb-1">
          <UserCircle size={18} style={{ color: '#00FF94' }} />
          <h1 className="text-lg font-semibold text-text-primary">Risk Profile</h1>
        </div>
        <p className="text-xs text-text-muted mb-6">
          Your profile personalizes AI advice to your financial situation and risk tolerance.
        </p>

        {fetching ? (
          <div className="text-text-muted text-sm">Loading profile...</div>
        ) : (
          <div className="space-y-4">
            {FIELDS.map(f => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-text-muted mb-1.5">{f.label}</label>
                <div className="flex flex-wrap gap-2">
                  {f.options.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setForm(prev => ({ ...prev, [f.key]: opt }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 border ${
                        form[f.key] === opt
                          ? 'text-surface border-transparent'
                          : 'text-text-muted border-border hover:text-text-primary hover:border-opacity-60'
                      }`}
                      style={form[f.key] === opt ? { backgroundColor: '#00FF94', color: '#0A0A0B', borderColor: '#00FF94' } : {}}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="pt-2 flex items-center gap-3">
              <button onClick={handleSave} disabled={loading}
                className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50">
                <Save size={14} />
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
              {saved && (
                <span className="text-xs positive font-medium">✓ Profile saved successfully</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
