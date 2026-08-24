import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { studyPlanService, userStudyPlanService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UserPlan, PlanStats, StudyPlan, StudyBook, UserStudyPlan } from '../types';
import { formatChapterGroup } from '../utils/chapters';
import toast from 'react-hot-toast';
import { Flame, CheckCircle, Circle, BookOpen, Award, Compass, PlusCircle, ArrowRight, BookMarked, MessageSquare, Clock, Eye, Layers, X, Book, XCircle, RefreshCw, RotateCcw } from 'lucide-react';
import { AdminCommunityStats } from '../components/AdminCommunityStats';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userPlans, setUserPlans] = useState<UserPlan[]>([]);
  const [stats, setStats] = useState<PlanStats | null>(null);
  const [userStudyPlans, setUserStudyPlans] = useState<UserStudyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPreviewModal, setShowPreviewModal] = useState<StudyPlan | null>(null);

  const fetchDashboardData = async () => {
    try {
        const [plansRes, statsRes, userStudyPlansData] = await Promise.all([
          api.get('/user-plans/active'),
          api.get('/user-plans/stats'),
          userStudyPlanService.getAll()
        ]);
        setUserPlans(plansRes.data);
        setStats(statsRes.data);
        setUserStudyPlans(userStudyPlansData);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCancelPlan = async (id: string) => {
    try {
        await userStudyPlanService.updateStatus(id, 'canceled');
      toast.success('Plan anulat.');
      fetchDashboardData();
    } catch (err) {
      toast.error('Eroare la anularea planului.');
    }
  };

  const handleResumePlan = async (id: string) => {
    try {
        await userStudyPlanService.updateStatus(id, 'active');
      toast.success('Plan reluat!');
      fetchDashboardData();
    } catch (err) {
      toast.error('Eroare la reluarea planului.');
    }
  };

  const handleRestartStudyPlan = async (studyPlanId: string) => {
    if (!window.confirm('Sunteți sigur că doriți să resetați tot progresul și să începeți acest plan de la 0? Răspunsurile vor fi șterse.')) {
      return;
    }
    try {
      await userStudyPlanService.resetProgress(studyPlanId);
      toast.success('Plan resetat cu succes!');
      navigate(`/study/${studyPlanId}`);
    } catch (err) {
      toast.error('Eroare la resetarea planului.');
    }
  };

  const handleCancelReadingPlan = async (id: string) => {
    try {
        await api.patch(`/user-plans/${id}/status`, { status: 'canceled' });
      toast.success('Plan de citire anulat.');
      fetchDashboardData();
    } catch (err) {
      toast.error('Eroare la anularea planului.');
    }
  };

  const handleResumeReadingPlan = async (id: string) => {
    try {
        await api.patch(`/user-plans/${id}/status`, { status: 'active' });
      toast.success('Plan de citire reluat!');
      fetchDashboardData();
    } catch (err) {
      toast.error('Eroare la reluarea planului.');
    }
  };

  const handleToggleComplete = async (userPlanId: string, dayIndex: number, currentCompleted: boolean) => {
    try {
        await api.patch(`/user-plans/${userPlanId}/progress`, { dayIndex, completed: !currentCompleted });
      toast.success(currentCompleted ? 'Citire marcată ca nefinalizată' : 'Felicitări! 🎉');
      fetchDashboardData();
    } catch (err) {
      toast.error('Eroare la actualizarea progresului.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="animate-spin" style={{ width: '2.5rem', height: '2.5rem', border: '3px solid transparent', borderBottom: '3px solid #10b981', borderRadius: '50%' }} />
      </div>
    );
  }

  const activeReadingPlans = userPlans.filter(p => !p.isCompleted && p.status !== 'canceled');
  const historyReadingPlans = userPlans.filter(p => p.isCompleted || p.status === 'canceled');
  const completedStudyPlansCount = userStudyPlans.filter(p => p.status === 'completed').length;

  return (
    <>
      <div className="animate-fade-in" style={{ paddingBottom: '3rem', display: 'flex', flexDirection: 'column', gap: '4rem' }}>
        {/* Welcome Header (Simple) */}
      <div className="glass-panel" style={{ padding: '1.5rem 2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '20rem', height: '20rem', background: 'rgba(16,185,129,0.05)', borderRadius: '50%', filter: 'blur(64px)', pointerEvents: 'none' }} />
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>
          {user?.role === 'admin' ? '👑 Panou Administrator' : '📖 Panou de Control'}
        </h1>
        <p style={{ color: '#9ca3af', marginTop: '0.25rem' }}>
          Bine ai venit, {user?.name}! {user?.role === 'admin' ? 'Gestionează planurile de studiu.' : 'Urmărește-ți progresul în studiul Sfintelor Scripturi.'}
        </p>
      </div>

      {/* ── 1. Active Study Plans ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookMarked style={{ width: '1.25rem', height: '1.25rem', color: '#34d399' }} />
            Planuri Active (Studiu)
          </h2>
          <Link to="/explore" className="btn btn-secondary text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
            <PlusCircle className="w-4 h-4 mr-1" /> Explorează Planuri
          </Link>
        </div>

        {userStudyPlans.filter(p => (p.status === 'active' || !p.status) && p.studyPlanId).length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
            {userStudyPlans.filter(p => (p.status === 'active' || !p.status) && p.studyPlanId).map((usp) => {
              const plan = usp.studyPlanId;
              const totalGroups = plan?.books?.reduce((acc: any, book: any) => acc + (book.chapterGroups?.length || 0), 0) || 0;
              const completedCount = usp.completedGroups?.length || 0;
              const progressPercent = totalGroups > 0 ? Math.round((completedCount / totalGroups) * 100) : 0;
              
              return (
                <div key={usp._id} className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-gray-800/80 to-gray-900 border border-white/10 p-6 group transition-all duration-300 hover:border-emerald-500/30 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-opacity group-hover:opacity-100 opacity-50" />
                  
                  {/* Header */}
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-emerald-300 transition-colors">{plan.title}</h3>
                        <p className="text-sm text-gray-400 flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          {completedCount} din {totalGroups} grupuri finalizate
                        </p>
                      </div>
                    </div>
                    
                    {/* Badge */}
                    <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-bold shadow-inner">
                      {progressPercent}%
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-6 relative z-10">
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden shadow-inner border border-white/5">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full relative" 
                        style={{ width: `${progressPercent}%` }} 
                      >
                        <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse" style={{ animationDuration: '2s' }} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-3 relative z-10">
                    <Link to={`/study/${plan._id}`} className="font-bold py-2 px-6 rounded-lg flex justify-center items-center gap-2 transition-all" style={{ background: 'linear-gradient(to right, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', fontSize: '0.9rem' }} onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.25)'; }} onMouseOut={(e) => { e.currentTarget.style.background = 'linear-gradient(to right, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))'; }}>
                      Continuă <ArrowRight className="w-4 h-4" />
                    </Link>
                    
                    <button onClick={() => setShowPreviewModal(plan)} className="p-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-colors border border-white/5" title="Detalii Plan">
                      <Eye className="w-5 h-5" />
                    </button>
                    
                    <button onClick={() => handleCancelPlan(usp._id)} className="p-2.5 bg-gray-800 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 text-gray-300 rounded-xl transition-colors border border-white/5" title="Anulează planul">
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-panel p-8 text-center border-dashed border-white/10">
            <BookOpen className="w-10 h-10 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-400 mb-2">Niciun plan de studiu activ</h3>
            <p className="text-gray-500 text-sm mb-4">Începe un nou plan de studiu din pagina Explorează Planuri.</p>
            <Link to="/explore" className="btn btn-secondary border-purple-500/30 text-purple-400 hover:bg-purple-500/10">
              Explorează
            </Link>
          </div>
        )}
      </div>

      {/* ── 1.5 History Study Plans ── */}
      {userStudyPlans.filter(p => p.status === 'completed' && p.studyPlanId).length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award style={{ width: '1.25rem', height: '1.25rem', color: '#f59e0b' }} />
            Istoric Planuri (Studiu)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
            {userStudyPlans.filter(p => p.status === 'completed' && p.studyPlanId).map((usp) => {
              const plan = usp.studyPlanId;
              const totalGroups = plan?.books?.reduce((acc: any, book: any) => acc + (book.chapterGroups?.length || 0), 0) || 0;
              const completedCount = usp.completedGroups?.length || 0;
              
              return (
                <div key={usp._id} className="glass-card relative overflow-hidden group border-emerald-500/20 opacity-80" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
                  <div className="absolute top-0 right-0 p-3 flex gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full">
                      Finalizat
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-300 mb-1">{plan.title}</h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{plan.description}</p>
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progres ({completedCount}/{totalGroups} grupuri)</span>
                      <span>100% complet</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                      <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-2 gap-2">
                    <Link to={`/study/${plan._id}`} className="btn btn-secondary flex-1 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 justify-center">
                      <BookOpen className="w-4 h-4 mr-1" />
                      Recitește
                    </Link>
                    <button onClick={() => handleRestartStudyPlan(plan._id)} className="btn btn-secondary flex-1 border-purple-500/30 text-purple-400 hover:bg-purple-500/10 justify-center">
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Reset (de la 0)
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 2. Canceled Study Plans ── */}
      {userStudyPlans.filter(p => p.status === 'canceled' && p.studyPlanId).length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9ca3af' }}>
            <XCircle style={{ width: '1.25rem', height: '1.25rem', color: '#6b7280' }} />
            Planuri Anulate (Studiu)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
            {userStudyPlans.filter(p => p.status === 'canceled' && p.studyPlanId).map((usp) => {
              const plan = usp.studyPlanId;
              const totalGroups = plan?.books?.reduce((acc: any, book: any) => acc + (book.chapterGroups?.length || 0), 0) || 0;
              const completedCount = usp.completedGroups?.length || 0;
              const progressPercent = totalGroups > 0 ? Math.round((completedCount / totalGroups) * 100) : 0;
              
              return (
                <div key={usp._id} className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-gray-900 to-black border border-white/5 p-5 group transition-all duration-300 opacity-80 hover:opacity-100 hover:border-white/10">
                  <div className="flex justify-between items-center mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-800 border border-white/5 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-5 h-5 text-gray-500 group-hover:text-gray-400 transition-colors" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-400 group-hover:text-gray-300 transition-colors">{plan.title}</h3>
                        <p className="text-xs text-gray-600 font-medium">{progressPercent}% complet</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleResumePlan(usp._id)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold py-2.5 px-4 rounded-xl flex justify-center items-center gap-2 transition-all border border-white/5 hover:border-blue-500/30 hover:text-blue-400">
                      <RefreshCw className="w-4 h-4" /> Reia Planul
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 2. Admin Quick Links ── */}
      {user?.role === 'admin' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(16, 185, 129, 0.2)', background: 'linear-gradient(to right, rgba(16,185,129,0.05), transparent)' }}>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '1.125rem', color: '#34d399' }}>Administrare Planuri de Studiu</h3>
              <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.25rem' }}>Creează planuri noi, gestionează cărțile și întrebările pentru grupul de studiu.</p>
            </div>
            <Link to="/admin" className="btn btn-primary" style={{ flexShrink: 0, backgroundColor: '#10b981', color: '#fff', border: 'none' }}>
              Panou Admin <ArrowRight style={{ width: '1rem', height: '1rem', marginLeft: '0.5rem' }} />
            </Link>
          </div>
        </div>
      )}



      {/* ── 3. Badges & Stats ── */}
      {stats && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award style={{ width: '1.25rem', height: '1.25rem', color: '#fbbf24' }} /> Insigne & Statistici
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', borderTop: '2px solid #fb923c' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}><Flame style={{ width: '2rem', height: '2rem', fill: '#fb923c', color: '#fb923c' }} /></div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fb923c' }}>{stats.currentStreak}</div>
              <span style={{ fontSize: '0.875rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>Zile la rând</span>
            </div>
            <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', borderTop: '2px solid #fbbf24' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}><Award style={{ width: '2rem', height: '2rem', color: '#fbbf24' }} /></div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fbbf24' }}>{stats.longestStreak}</div>
              <span style={{ fontSize: '0.875rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>Record Absolut</span>
            </div>
            <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', borderTop: '2px solid #34d399' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}><CheckCircle style={{ width: '2rem', height: '2rem', color: '#34d399' }} /></div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#34d399' }}>{stats.completedDays}</div>
              <span style={{ fontSize: '0.875rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>Zile Completate</span>
            </div>
            <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', borderTop: '2px solid #60a5fa' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}><Circle style={{ width: '2rem', height: '2rem', color: '#60a5fa' }} /></div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#60a5fa' }}>{stats.percentage}%</div>
              <span style={{ fontSize: '0.875rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>Progres General</span>
            </div>
            <div className="glass-card relative overflow-hidden" style={{ padding: '1.5rem', textAlign: 'center', borderTop: '2px solid #a78bfa' }}>
              {completedStudyPlansCount > 0 && (
                <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 rounded-bl-full" />
              )}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}><BookOpen style={{ width: '2rem', height: '2rem', color: '#a78bfa' }} /></div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#a78bfa' }}>{completedStudyPlansCount}</div>
              <span style={{ fontSize: '0.875rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>Planuri Finalizate</span>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. History / Started Plans ── */}
      {historyReadingPlans.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock style={{ width: '1.25rem', height: '1.25rem', color: '#a78bfa' }} /> Istoric Planuri de Citire
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {historyReadingPlans.map((up) => {
              const currentDayIndex = up.currentDay;
              const reading = up.planId.readings.find((r: any) => r.day === currentDayIndex);
              const progressPercent = Math.round((up.progress.filter(p => p.completed).length / up.planId.readings.length) * 100);

              return (
                <div key={up._id} className="glass-card opacity-80 hover:opacity-100 transition-opacity" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
                  {up.status === 'canceled' && (
                    <button onClick={() => handleResumeReadingPlan(up._id)} className="absolute top-3 right-3 text-gray-500 hover:text-blue-400 transition-colors" title="Reia planul">
                      <RefreshCw className="w-5 h-5" />
                    </button>
                  )}
                  {up.isCompleted && (
                    <div className="absolute top-3 right-3 text-emerald-400">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'rgba(167,139,250,0.1)', padding: '0.2rem 0.5rem', borderRadius: '0.25rem' }}>
                      {up.status === 'canceled' ? 'Renunțat' : 'Finalizat'}
                    </span>
                    <span style={{ fontSize: '0.875rem', color: '#9ca3af', fontWeight: 600 }}>{progressPercent}%</span>
                  </div>
                  
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.25rem', color: '#d1d5db' }}>{up.planId.title}</h3>
                  </div>

                  <div style={{ width: '100%', height: '0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progressPercent}%`, background: up.isCompleted ? '#34d399' : '#6b7280', borderRadius: '999px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Admin Community Stats Section */}
      {user?.role === 'admin' && (
        <AdminCommunityStats />
      )}
      </div>

      {/* ── Preview Modal ── */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, height: '100vh', width: '100vw', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', boxSizing: 'border-box' }}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowPreviewModal(null)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }} />
          <div className="relative bg-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[70vh] overflow-hidden flex flex-col shadow-2xl animate-fade-in" style={{ position: 'relative', width: '100%', maxWidth: '40rem', maxHeight: '70vh', display: 'flex', flexDirection: 'column', backgroundColor: '#111827', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', margin: 'auto' }}>
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-start bg-gradient-to-br from-emerald-900/20 to-transparent">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{showPreviewModal.title}</h2>
                <p className="text-gray-400 text-sm">{showPreviewModal.description || 'Fără descriere adăugată.'}</p>
              </div>
              <button onClick={() => setShowPreviewModal(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Content (Scrollable) */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
              <div className="flex items-center gap-4 text-sm font-bold text-emerald-400">
                <span className="flex items-center gap-1 bg-emerald-500/10 px-3 py-1 rounded-lg">
                  <Layers className="w-4 h-4" /> Anul {showPreviewModal.year}
                </span>
                <span className="flex items-center gap-1 bg-blue-500/10 text-blue-400 px-3 py-1 rounded-lg">
                  <BookOpen className="w-4 h-4" /> {showPreviewModal.books.length} Cărți incluse
                </span>
              </div>

              {showPreviewModal.books.map((book, bIdx) => (
                <div key={bIdx} className="bg-black/30 border border-white/5 rounded-xl p-5">
                  <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-white">
                    <Book className="w-5 h-5 text-emerald-400" /> {book.bookName}
                  </h3>
                  
                  <div className="space-y-4 pl-4 border-l-2 border-emerald-500/20">
                    {book.chapterGroups.map((group, gIdx) => (
                      <div key={gIdx} className="bg-white/5 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-bold text-blue-300">{group.title}</h4>
                          <span className="text-xs text-gray-500 bg-black/40 px-2 py-1 rounded">Capitolele {formatChapterGroup(group)}</span>
                        </div>
                        
                        <div className="space-y-2 mt-2">
                          {group.questions.length > 0 ? (
                            group.questions.map((q, qIdx) => (
                              <div key={qIdx} className="flex gap-2 text-sm text-gray-300">
                                <span className="text-emerald-400 font-bold">{qIdx + 1}.</span>
                                <span>{q.text}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500 italic">Nu există întrebări pentru acest grup.</p>
                          )}
                        </div>
                      </div>
                    ))}
                    {book.chapterGroups.length === 0 && (
                      <p className="text-sm text-gray-500 italic">Nu există grupuri de capitole.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 bg-black/40 flex justify-end gap-3">
              <button onClick={() => setShowPreviewModal(null)} className="btn btn-primary px-6">
                Închide Detaliile
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
