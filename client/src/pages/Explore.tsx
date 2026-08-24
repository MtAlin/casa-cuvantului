import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { studyPlanService, userStudyPlanService } from '../services/api';
import { StudyPlan } from '../types';
import { formatChapterGroup } from '../utils/chapters';
import toast from 'react-hot-toast';
import { Compass, BookOpen, Clock, PlayCircle, Eye, Layers, X, Book } from 'lucide-react';

export const Explore: React.FC = () => {
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewPlan, setPreviewPlan] = useState<StudyPlan | null>(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const studyPlansData = await studyPlanService.getAll();
      setStudyPlans(studyPlansData);
    } catch (err) {
      console.error('Failed to load explore plans', err);
      toast.error('Nu s-au putut încărca planurile de studiu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const handleEnroll = async (planId: string) => {
    try {
      await userStudyPlanService.enroll(planId);
      toast.success('Te-ai înscris cu succes în plan!');
      navigate(`/study/${planId}`);
    } catch (err: any) {
      if (err.message === 'Already enrolled' || err.response?.data?.message === 'Already enrolled in this plan') {
        if (window.confirm('Ești deja înscris în acest plan. Vrei să resetezi tot progresul la 0? \n\n- Apasă OK pentru a începe din nou de la 0.\n- Apasă Cancel (Anulează) pentru a continua de unde ai rămas.')) {
          try {
            await userStudyPlanService.resetProgress(planId);
            toast.success('Plan resetat cu succes! Ai început de la 0.');
            navigate(`/study/${planId}`);
          } catch (resetErr) {
            toast.error('Eroare la resetarea planului.');
          }
        } else {
          toast.success('Reluare plan...');
          navigate(`/study/${planId}`);
        }
      } else {
        toast.error('Eroare la înregistrarea în plan.');
      }
    }
  };

  return (
    <>
      <div className="space-y-8 animate-fade-in pb-12">
      <div className="glass-panel p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Layers className="w-8 h-8 text-purple-400" /> Planuri de Studiu
        </h1>
        <p className="text-gray-400 mt-2">
          Explorează planurile de studiu biblic create special pentru grupurile de studiu și înscrie-te pentru a participa.
        </p>
      </div>

      {studyPlans.length === 0 ? (
        <div className="glass-panel p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-400">Niciun plan disponibil</h3>
          <p className="text-gray-500 mt-2">Momentan nu există planuri de studiu.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studyPlans.map((plan) => (
            <div key={plan._id} className="glass-card flex flex-col justify-between overflow-hidden group border-purple-500/20 hover:border-purple-500/50">
              <div className="relative h-28 w-full bg-gradient-to-br from-purple-900/40 to-black overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-black/40" />
                <Layers className="w-12 h-12 text-purple-400/50 relative z-10 group-hover:scale-110 transition-transform duration-500" />
                <span className="absolute bottom-2 left-2 text-[10px] font-semibold uppercase px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded z-10">
                  Studiu de Grup
                </span>
                {!plan.isActive && (
                   <span className="absolute bottom-2 right-2 text-[10px] font-bold px-2 py-0.5 bg-orange-500/80 text-white rounded z-10">
                     Draft
                   </span>
                )}
                <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-1 bg-black/50 text-white rounded-full z-10">
                  {plan.year}
                </span>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold group-hover:text-purple-400 transition-colors leading-tight">
                    {plan.title}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-2">
                    {plan.description || 'Studiu biblic aprofundat.'}
                  </p>
                </div>
                
                {/* Chapter Groups Overview */}
                {plan.books.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-1.5">Grupuri de studiu:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {plan.books.flatMap(b => b.chapterGroups).slice(0, 3).map((group, idx) => (
                         <span key={idx} className="text-[10px] bg-purple-500/10 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/20 truncate max-w-[100px]">
                           {group.title}
                         </span>
                      ))}
                      {plan.books.flatMap(b => b.chapterGroups).length > 3 && (
                         <span className="text-[10px] bg-gray-500/10 text-gray-400 px-1.5 py-0.5 rounded">
                           +{plan.books.flatMap(b => b.chapterGroups).length - 3}
                         </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-3 flex gap-2">
                  <button
                    onClick={() => setPreviewPlan(plan)}
                    className="flex-1 btn btn-secondary justify-center text-xs border-white/10 hover:border-white/30"
                  >
                    <Eye className="w-4 h-4 mr-1" /> Detalii
                  </button>
                  <button
                    onClick={() => handleEnroll(plan._id)}
                    className="flex-1 btn btn-primary bg-purple-600 hover:bg-purple-500 justify-center text-xs border-purple-500/50"
                  >
                    <PlayCircle className="w-4 h-4 mr-1" /> Începe
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>

      {previewPlan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, height: '100vh', width: '100vw', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', boxSizing: 'border-box' }}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setPreviewPlan(null)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }} />
          <div className="relative bg-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[70vh] overflow-hidden flex flex-col shadow-2xl animate-fade-in" style={{ position: 'relative', width: '100%', maxWidth: '40rem', maxHeight: '70vh', display: 'flex', flexDirection: 'column', backgroundColor: '#111827', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', margin: 'auto' }}>
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-start bg-gradient-to-br from-purple-900/20 to-transparent">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{previewPlan.title}</h2>
                <p className="text-gray-400 text-sm">{previewPlan.description || 'Fără descriere adăugată.'}</p>
              </div>
              <button onClick={() => setPreviewPlan(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Content (Scrollable) */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
              <div className="flex items-center gap-4 text-sm font-bold text-purple-400">
                <span className="flex items-center gap-1 bg-purple-500/10 px-3 py-1 rounded-lg">
                  <Layers className="w-4 h-4" /> Anul {previewPlan.year}
                </span>
                <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-lg">
                  <BookOpen className="w-4 h-4" /> {previewPlan.books.length} Cărți incluse
                </span>
              </div>

              {previewPlan.books.map((book, bIdx) => (
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
                                <span className="text-purple-400 font-bold">{qIdx + 1}.</span>
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
              <button onClick={() => setPreviewPlan(null)} className="btn btn-secondary px-6">
                Închide
              </button>
              <button 
                onClick={() => handleEnroll(previewPlan._id)} 
                className="btn btn-primary bg-purple-600 hover:bg-purple-500 px-6"
              >
                <PlayCircle className="w-4 h-4 mr-2" /> Începe Studiul
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Explore;
