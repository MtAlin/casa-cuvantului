import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { UserRole } from '../types';
import toast from 'react-hot-toast';
import { LogIn, UserPlus, BookOpen, Shield, Users } from 'lucide-react';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const res = await api.post('/auth/login', { email, password });
        login(res.data.token, res.data.user);
        toast.success(`Bine ai venit, ${res.data.user.name}!`);
        navigate('/');
      } else {
        const res = await api.post('/auth/register', { name, email, password });
        login(res.data.token, res.data.user);
        toast.success('Cont creat cu succes!');
        navigate('/');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Ceva nu a mers. Încearcă din nou.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // const handleGuestLogin = (role: UserRole) => {
  //   loginAsGuest(role);
  //   toast.success(role === 'admin' ? 'Conectat ca Administrator (Demo)' : 'Conectat ca Membru (Demo)');
  //   navigate('/');
  // };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="glass-panel p-8 animate-fade-in" style={{ width: '100%', maxWidth: '28rem', position: 'relative', overflow: 'hidden' }}>
        {/* Glow Effects */}
        <div style={{ position: 'absolute', top: '-2.5rem', right: '-2.5rem', width: '10rem', height: '10rem', background: 'rgba(16,185,129,0.1)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-2.5rem', left: '-2.5rem', width: '10rem', height: '10rem', background: 'rgba(59,130,246,0.1)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }} />

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.75rem', background: 'rgba(16,185,129,0.1)', borderRadius: '0.75rem', color: '#34d399', marginBottom: '0.75rem', border: '1px solid rgba(16,185,129,0.2)' }}>
            <BookOpen style={{ width: '2rem', height: '2rem' }} />
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, background: 'linear-gradient(to right, white, #d1d5db, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Casa Cuvântului
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.5rem' }}>
            {isLogin ? 'Conectează-te pentru a continua studiul biblic' : 'Creează un cont nou'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!isLogin && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, marginBottom: '0.25rem' }}>Nume</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Numele tău" required />
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, marginBottom: '0.25rem' }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nume@exemplu.com" required />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, marginBottom: '0.25rem' }}>Parolă</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', fontSize: '1rem', padding: '0.75rem' }}>
            {loading ? <span className="animate-spin" style={{ width: '1.25rem', height: '1.25rem', border: '2px solid transparent', borderBottom: '2px solid white', borderRadius: '50%', display: 'inline-block' }} /> : isLogin ? (<><LogIn style={{ width: '1.25rem', height: '1.25rem' }} /> Intră în cont</>) : (<><UserPlus style={{ width: '1.25rem', height: '1.25rem' }} /> Înregistrare</>)}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
          <div style={{ flex: 1, borderTop: '1px solid rgba(255,255,255,0.05)' }} />
          <span style={{ margin: '0 1rem', color: '#6b7280', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>sau intră în demo</span>
          <div style={{ flex: 1, borderTop: '1px solid rgba(255,255,255,0.05)' }} />
        </div>



        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
          <button onClick={() => setIsLogin(!isLogin)} style={{ color: '#34d399', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 500, padding: 0 }}>
            {isLogin ? 'Nu ai cont? Înregistrează-te' : 'Ai deja cont? Conectează-te'}
          </button>
        </div>
      </div>
    </div>
  );
};
export default Auth;
