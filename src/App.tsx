import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { PackagesPage } from './pages/PackagesPage';
import { ClientsPage } from './pages/ClientsPage';
import { ClientDetailPage } from './pages/ClientDetailPage';
import { ClientManagementPage } from './pages/ClientManagementPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { useStore } from './store/useStore';
import { supabase } from './lib/supabase';
import { useEffect } from 'react';

function App() {
  const { session, setSession, initialized, loading } = useStore();

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [setSession]);

  if (!session) {
    return <LoginPage />;
  }

  if (!initialized && loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
        <p className="text-white/50 font-medium animate-pulse">Inizializzazione dati...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="clients/:id" element={<ClientDetailPage />} />
          <Route path="management" element={<ClientManagementPage />} />
          <Route path="packages" element={<PackagesPage />} />
          <Route path="history" element={<div className="p-4">Storico (In arrivo)</div>} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
