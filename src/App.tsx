import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import PublicPage from './pages/PublicPage';
import AdminPage from './pages/AdminPage';
import AuthPage from './pages/AuthPage';
import LandingPage from './pages/LandingPage';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="h-screen bg-black flex items-center justify-center text-white font-black italic">SDRESS...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={user ? <Navigate to="/public" /> : <AuthPage />} />
        <Route path="/public" element={user ? <PublicPage /> : <Navigate to="/login" />} />
        <Route path="/admin" element={user && user.email === 'VendeurAdmin1945@gmail.com' ? <AdminPage /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
