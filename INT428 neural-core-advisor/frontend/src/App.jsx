import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AdvisorPage from './components/AdvisorPage';
import Portfolio from './components/Portfolio';
import ProfileForm from './components/ProfileForm';

function AppContent() {
  const { user, loading } = useAuth();
  const [active, setActive] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-text-muted text-sm">Initializing Neural Core...</div>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  const pages = {
    dashboard: <Dashboard />,
    advisor: <AdvisorPage />,
    portfolio: <Portfolio />,
    profile: <ProfileForm />,
  };

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar active={active} setActive={setActive} />
      <main className="flex-1 overflow-hidden">
        {pages[active]}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
