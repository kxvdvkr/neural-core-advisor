import { LayoutDashboard, BrainCircuit, Briefcase, UserCircle, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'advisor', label: 'AI Advisor', icon: BrainCircuit },
  { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
  { id: 'profile', label: 'Risk Profile', icon: UserCircle },
];

export default function Sidebar({ active, setActive }) {
  const { user, logout } = useAuth();

  return (
    <aside className="w-56 min-h-screen bg-panel border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #00FF94, #00C8FF)' }}>
            <span className="text-black font-bold text-xs">N</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-text-primary">Neural Core</div>
            <div className="text-xs text-text-muted">Advisor</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
              active === id
                ? 'text-surface bg-neon-green'
                : 'text-text-muted hover:text-text-primary hover:bg-border'
            }`}
            style={active === id ? { backgroundColor: '#00FF94', color: '#0A0A0B' } : {}}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2 px-2 py-1.5 mb-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: '#B535F620', color: '#B535F6', border: '1px solid #B535F640' }}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-text-primary truncate">{user?.name}</div>
            <div className="text-xs text-text-muted truncate">{user?.email}</div>
          </div>
        </div>
        <button onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-muted hover:text-red-400 hover:bg-red-900/10 transition-all duration-150">
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
