import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { supabase } from './lib/supabase';
import { useAuthStore } from './stores/authStore';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { NewEntryPage } from './pages/NewEntryPage';
import { ProfilePage } from './pages/ProfilePage';
import { PersonDetailsPage } from './pages/PersonDetailsPage';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { About } from './pages/About';
import { NeedsPage } from './pages/NeedsPage';
import { EventUpdatesPage } from './pages/EventUpdatesPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminEventsPage } from './pages/admin/AdminEventsPage';
import { AdminNetsPage } from './pages/admin/AdminNetsPage';
import { AdminUpdatesPage } from './pages/admin/AdminUpdatesPage';
import { RequireAdmin } from './components/Auth/RequireAdmin';

export function App() {
  const setUser = useAuthStore((state) => state.setUser);
  const setSession = useAuthStore((state) => state.setSession);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setSession, setUser]);

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/new-entry" element={<NewEntryPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/person/:id" element={<PersonDetailsPage />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/about" element={<About />} />
            <Route path="/needs" element={<NeedsPage />} />
            <Route path="/event-updates" element={<EventUpdatesPage />} />
            <Route
              path="/admin/users"
              element={
                <RequireAdmin>
                  <AdminUsersPage />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/events"
              element={
                <RequireAdmin>
                  <AdminEventsPage />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/nets"
              element={
                <RequireAdmin>
                  <AdminNetsPage />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/updates"
              element={
                <RequireAdmin>
                  <AdminUpdatesPage />
                </RequireAdmin>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}