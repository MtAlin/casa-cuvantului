import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Explore } from './pages/Explore';
import { PlanDetails } from './pages/PlanDetails';
import { BibleReader } from './pages/BibleReader';
import { AdminPanel } from './pages/AdminPanel';
import { StudyChapters } from './pages/StudyChapters';
import { Toaster } from 'react-hot-toast';
import { BookOpen, Compass, LogOut, LayoutDashboard, User, Shield } from 'lucide-react';
import { NotificationsDropdown } from './components/NotificationsDropdown';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  if (!user) return null;

  return (
    <header className="border-b border-white/5 bg-gray-950/40 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="font-bold tracking-tight text-lg bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Casa Cuvântului
          </span>
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-gray-300 hover:text-white flex items-center gap-1.5 transition">
            <LayoutDashboard className="w-4 h-4" /> Panou de Control
          </Link>
          <Link to="/explore" className="text-sm font-medium text-gray-300 hover:text-white flex items-center gap-1.5 transition">
            <Compass className="w-4 h-4" /> Explorează Planuri
          </Link>
          <Link to="/bible" className="text-sm font-medium text-gray-300 hover:text-white flex items-center gap-1.5 transition">
            <BookOpen className="w-4 h-4" /> Cititor Biblic
          </Link>
          {user.role === 'admin' && (
            <Link to="/admin" className="text-sm font-medium text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition">
              <Shield className="w-4 h-4" /> Administrare Planuri
            </Link>
          )}
        </nav>

        {/* User profile & actions */}
        <div className="flex items-center gap-4">
          <NotificationsDropdown />
          
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm uppercase">
              {user.name.charAt(0)}
            </div>
            <span className="text-xs font-semibold text-gray-300">{user.name}</span>
          </div>

          <button onClick={handleLogout} className="btn btn-secondary px-3 py-1.5 text-xs hover:text-red-400 hover:border-red-500/30">
            <LogOut className="w-3.5 h-3.5" /> Ieși
          </button>
        </div>

      </div>
    </header>
  );
};

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const isStudyPage = location.pathname.startsWith('/study/');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className={`flex-grow w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 ${isStudyPage ? 'max-w-[1800px]' : 'max-w-7xl'}`}>
        {children}
      </main>
      <footer className="border-t border-white/5 py-6 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} Casa Cuvântului. Studiu și planificare biblică.
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/"
            element={
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            }
          />
          <Route
            path="/explore"
            element={
              <ProtectedLayout>
                <Explore />
              </ProtectedLayout>
            }
          />
          <Route
            path="/plans/:id"
            element={
              <ProtectedLayout>
                <PlanDetails />
              </ProtectedLayout>
            }
          />
          <Route
            path="/study/:planId"
            element={
              <ProtectedLayout>
                <StudyChapters />
              </ProtectedLayout>
            }
          />
          <Route
            path="/bible"
            element={
              <ProtectedLayout>
                <BibleReader />
              </ProtectedLayout>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedLayout>
                <AdminPanel />
              </ProtectedLayout>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <Toaster position="bottom-right" toastOptions={{
        style: {
          background: '#1f2937',
          color: '#f3f4f6',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }
      }} />
    </AuthProvider>
  );
};

export default App;
