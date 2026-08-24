import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { ReadingPlan, UserPlan } from '../types';
import toast from 'react-hot-toast';
import { BookOpen, Calendar, ChevronRight, CheckCircle, Circle, Play } from 'lucide-react';

export const PlanDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [plan, setPlan] = useState<ReadingPlan | null>(null);
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPlanDetails = async () => {
    try {
        const planRes = await api.get(`/plans/${id}`);
        setPlan(planRes.data);

        // Check if user is enrolled
        const activeRes = await api.get('/user-plans/active');
        const enrolled = activeRes.data.find((ap: any) => ap.planId._id === id);
        if (enrolled) {
          setUserPlan(enrolled);
        }
    } catch (err) {
      console.error('Failed to load plan details', err);
      toast.error('Nu s-au putut încărca detaliile planului.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanDetails();
  }, [id]);

  const handleToggleComplete = async (dayIndex: number, currentCompleted: boolean) => {
    if (!userPlan) return;
    try {
        await api.patch(`/user-plans/${userPlan._id}/progress`, {
          dayIndex,
          completed: !currentCompleted,
        });
      toast.success(currentCompleted ? 'Citire marcată ca nefinalizată' : 'Felicitări! Citire finalizată.');
      fetchPlanDetails();
    } catch (err) {
      toast.error('Eroare la actualizarea progresului.');
    }
  };

  const handleEnroll = async () => {
    if (!plan) return;
    try {
        await api.post('/user-plans/enroll', { planId: plan._id });
      toast.success('Te-ai înscris în plan!');
      fetchPlanDetails();
    } catch (err: any) {
      if (err.response?.data?.message === 'Already enrolled in this plan') {
        if (window.confirm('Ești deja înscris în acest plan. Vrei să resetezi tot progresul la 0? \n\n- Apasă OK pentru a începe din nou de la 0.\n- Apasă Cancel (Anulează) pentru a continua de unde ai rămas.')) {
          try {
            await api.post(`/user-plans/reset/${plan._id}`);
            toast.success('Plan resetat cu succes! Ai început de la 0.');
            fetchPlanDetails();
          } catch (resetErr) {
            toast.error('Eroare la resetarea planului.');
          }
        }
      } else {
        toast.error('Eroare la înregistrarea în plan.');
      }
    }
  };

  if (loading || !plan) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const completedDays = userPlan ? userPlan.progress.filter((p) => p.completed).length : 0;
  const percentage = userPlan ? Math.round((completedDays / plan.duration) * 100) : 0;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="glass-panel overflow-hidden relative">
        <div className="h-64 relative w-full">
          <img
            src={plan.coverImage || 'https://images.unsplash.com/photo-1504051771394-dd2e66b2e08f?w=1200&auto=format&fit=crop&q=60'}
            alt={plan.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
        </div>

        <div className="p-6 md:p-8 -mt-20 relative z-10 space-y-4">
          <div className="inline-flex gap-2">
            <span className="text-xs font-semibold uppercase px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded">
              {plan.type}
            </span>
            <span className="text-xs font-semibold uppercase px-2 py-0.5 bg-white/5 border border-white/10 text-gray-300 rounded">
              {plan.duration} zile
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold">{plan.title}</h1>
          <p className="text-gray-300 text-sm md:text-base max-w-3xl leading-relaxed">{plan.description}</p>

          <div className="pt-4 flex flex-wrap items-center gap-4">
            {userPlan ? (
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="flex-1 sm:w-48 bg-white/5 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
                </div>
                <span className="text-sm font-semibold text-gray-300">
                  {completedDays} / {plan.duration} zile ({percentage}%)
                </span>
              </div>
            ) : (
              <button onClick={handleEnroll} className="btn btn-primary">
                <Play className="w-4 h-4 fill-white" /> Înscrie-te în Plan
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Days Reading List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-400" /> Programul Zilnic de Citire
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plan.readings.map((reading) => {
            const progress = userPlan?.progress.find((p) => p.dayIndex === reading.day);
            const isCompleted = progress?.completed || false;

            return (
              <div
                key={reading.day}
                className={`glass-card p-4 flex items-center justify-between gap-4 transition ${
                  isCompleted ? 'border-emerald-500/20 bg-emerald-500/5' : ''
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase">Ziua {reading.day}</span>
                    {isCompleted && (
                      <span className="text-[10px] bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-1.5 py-0.2 rounded font-semibold">
                        Citit
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-100">{reading.title}</h3>
                  <p className="text-xs text-gray-400 font-medium italic">{reading.book} {reading.chapters}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/bible?book=${reading.book}&chapter=${reading.chapters.split('-')[0]}${
                      userPlan ? `&planId=${userPlan._id}&day=${reading.day}` : ''
                    }`}
                    className="btn btn-secondary text-xs px-3 py-2"
                  >
                    Citește <ChevronRight className="w-3.5 h-3.5" />
                  </Link>

                  {userPlan && (
                    <button
                      onClick={() => handleToggleComplete(reading.day, isCompleted)}
                      className={`p-2 rounded-lg border transition ${
                        isCompleted
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                          : 'border-white/10 hover:border-emerald-500/50 text-gray-400'
                      }`}
                    >
                      {isCompleted ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PlanDetails;
