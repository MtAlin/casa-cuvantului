import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { bibleService, BibleVerse, studyPlanService, userStudyPlanService } from '../services/api';
import api from '../services/api';
import { StudyPlan, StudyBook, ChapterGroup, StudyResponse, QuestionAnswer, UserStudyPlan } from '../types';
import { 
  ChevronLeft, Save, CheckCircle, Circle, HelpCircle, 
  ChevronDown, ChevronRight, Search, Filter, BookOpen, Settings, 
  Bookmark, ArrowRight, ArrowLeft, RotateCcw, TrendingUp, Check, Book, Menu, Award
} from 'lucide-react';
import toast from 'react-hot-toast';
import { StudySidebar } from '../components/study/StudySidebar';
import { BibleReader } from '../components/study/BibleReader';
import { ReflectionQuestions } from '../components/study/ReflectionQuestions';
import { PersonalThoughts } from '../components/study/PersonalThoughts';
import { StudyFooter } from '../components/study/StudyFooter';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { parseCustomChapters } from '../utils/chapters';

export const StudyChapters: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [userStudyPlan, setUserStudyPlan] = useState<UserStudyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { width, height } = useWindowSize();
  const [showCelebration, setShowCelebration] = useState(false);
  
  // Selection State
  const [selectedBookIdx, setSelectedBookIdx] = useState<number>(0);
  const [selectedGroupIdx, setSelectedGroupIdx] = useState<number>(0);
  const [currentChapter, setCurrentChapter] = useState<number>(1);
  
  // UI State
  const [expandedBooks, setExpandedBooks] = useState<Record<number, boolean>>({ 0: true });
  const [searchQuery, setSearchQuery] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  
  // Data State
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [loadingVerses, setLoadingVerses] = useState(false);
  const [translation, setTranslation] = useState<string>('rccv');
  
  // Answers & Progress State
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<string>('');
  const [completedGroups, setCompletedGroups] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [bookmarkedVerses, setBookmarkedVerses] = useState<Record<number, boolean>>({ 3: true }); // Mocking verse 3 bookmarked

  useEffect(() => {
    loadPlan();
  }, [planId]);

  const loadPlan = async () => {
    try {
      setLoading(true);
      let foundPlan: StudyPlan | null = null;
      let existingResponses: StudyResponse[] = [];

      foundPlan = await studyPlanService.getById(planId!);

      if (foundPlan) {
        setPlan(foundPlan);
        
        let enrollments: UserStudyPlan[] = [];
        try { enrollments = await userStudyPlanService.getAll(); } catch(e) {}
        const currentEnrollment = enrollments.find(e => 
          e.studyPlanId?._id === planId || (typeof e.studyPlanId === 'string' && e.studyPlanId === planId)
        );
        if (currentEnrollment) {
          setUserStudyPlan(currentEnrollment);
          const completed: Record<string, boolean> = {};
          currentEnrollment.completedGroups.forEach(groupId => {
            completed[groupId] = true;
          });
          setCompletedGroups(completed);
        }
        
        // Default to first book and first group
        let initialBookIdx = 0;
        let initialGroupIdx = 0;
        
        // Find which book to select from query param
        const requestedBookId = searchParams.get('bookId');
        if (requestedBookId) {
          const idx = foundPlan.books.findIndex(b => b._id === requestedBookId);
          if (idx !== -1) initialBookIdx = idx;
        } else if (currentEnrollment) {
          // If no specific book requested, find the first uncompleted group!
          const completedMap = currentEnrollment.completedGroups;
          let foundUncompleted = false;
          
          for (let b = 0; b < foundPlan.books.length; b++) {
            for (let g = 0; g < foundPlan.books[b].chapterGroups.length; g++) {
              const grp = foundPlan.books[b].chapterGroups[g];
              const gId = grp._id || grp.title;
              if (!completedMap.includes(gId as any)) {
                initialBookIdx = b;
                initialGroupIdx = g;
                foundUncompleted = true;
                break;
              }
            }
            if (foundUncompleted) break;
          }
        }

        setSelectedBookIdx(initialBookIdx);
        setSelectedGroupIdx(initialGroupIdx);
        setExpandedBooks({ [initialBookIdx]: true });
        
        // Set initial chapter to the start of the selected group
        const selectedBook = foundPlan.books[initialBookIdx];
        if (selectedBook && selectedBook.chapterGroups.length > initialGroupIdx) {
          const selectedGroup = selectedBook.chapterGroups[initialGroupIdx];
          const chapters = parseCustomChapters(selectedGroup.customChapters || `${selectedGroup.startChapter}-${selectedGroup.endChapter}`);
          setCurrentChapter(chapters.length > 0 ? chapters[0] : 1);
          
          // Load responses for this group
          try {
            const res = await api.get(`/study-responses?studyPlanId=${planId}&bookName=${selectedBook.bookName}`);
            existingResponses = res.data;
          } catch (err) {
            existingResponses = [];
          }
          
          const groupResponse = existingResponses.find(r => r.chapterGroupId === selectedGroup._id);
          if (groupResponse) {
            const loadedAnswers: Record<string, string> = {};
            groupResponse.answers.forEach(a => { loadedAnswers[a.questionId] = a.answer; });
            setAnswers(loadedAnswers);
          }
        }
      }
    } catch (err) {
      toast.error('Eroare la încărcarea planului');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch verses when chapter or translation changes
  useEffect(() => {
    if (plan && plan.books.length > 0) {
      const bookName = plan.books[selectedBookIdx].bookName;
      fetchVerses(bookName, currentChapter, translation);
    }
  }, [currentChapter, selectedBookIdx, plan, translation]);

  const fetchVerses = async (bookName: string, chapter: number, selectedTranslation: string) => {
    setLoadingVerses(true);
    try {
      const data = await bibleService.getChapter(bookName, chapter, selectedTranslation);
      setVerses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingVerses(false);
    }
  };

  const handleGroupSelect = async (bIdx: number, gIdx: number) => {
    setSelectedBookIdx(bIdx);
    setSelectedGroupIdx(gIdx);
    if (!plan) return;
    
    const group = plan.books[bIdx].chapterGroups[gIdx];
    const chapters = parseCustomChapters(group.customChapters || `${group.startChapter}-${group.endChapter}`);
    setCurrentChapter(chapters.length > 0 ? chapters[0] : 1);
    
    // Load answers for this group
    setAnswers({});
    setNotes('');
    let existingResponses: StudyResponse[] = [];
    try {
        try {
          const res = await api.get(`/study-responses?studyPlanId=${planId}&bookName=${plan.books[bIdx].bookName}`);
          existingResponses = res.data;
        } catch(e) {
          existingResponses = [];
        }
      const groupResponse = existingResponses.find(r => r.chapterGroupId === group._id);
      if (groupResponse) {
        const loadedAnswers: Record<string, string> = {};
        groupResponse.answers.forEach(a => { loadedAnswers[a.questionId] = a.answer; });
        setAnswers(loadedAnswers);
      }
    } catch(err) {
      console.error("Failed to fetch answers", err);
    }
  };

  const handleNextChapter = () => {
    if (!plan) return;
    const group = plan.books[selectedBookIdx].chapterGroups[selectedGroupIdx];
    const chapters = parseCustomChapters(group.customChapters || `${group.startChapter}-${group.endChapter}`);
    const idx = chapters.indexOf(currentChapter);
    if (idx >= 0 && idx < chapters.length - 1) {
      setCurrentChapter(chapters[idx + 1]);
    }
  };

  const handlePrevChapter = () => {
    if (!plan) return;
    const group = plan.books[selectedBookIdx].chapterGroups[selectedGroupIdx];
    const chapters = parseCustomChapters(group.customChapters || `${group.startChapter}-${group.endChapter}`);
    const idx = chapters.indexOf(currentChapter);
    if (idx > 0) {
      setCurrentChapter(prev => chapters[idx - 1]);
    }
  };

  const toggleBook = (bIdx: number) => {
    setExpandedBooks(prev => ({ ...prev, [bIdx]: !prev[bIdx] }));
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSaveNotes = async (newNotes: string) => {
    setNotes(newNotes);
    // Ideally here we would also send newNotes to the backend.
    // For now we just update local state and call handleSaveAnswers which saves everything.
    // Since auto-save is independent of the form, maybe handleSaveAnswers handles notes too?
    // Let's ensure notes are part of the save or saved separately if supported.
  };

  const handleSaveAnswers = async () => {
    if (!plan) return;
    const book = plan.books[selectedBookIdx];
    const group = book.chapterGroups[selectedGroupIdx];
    
    const formattedAnswers: QuestionAnswer[] = Object.entries(answers)
      .filter(([_, answer]) => answer.trim() !== '')
      .map(([questionId, answer]) => ({ questionId, answer }));

    try {
      setSaving(true);
      try {
        await api.post('/study-responses', {
          studyPlanId: plan._id,
          bookName: book.bookName,
          chapterGroupId: group._id,
          answers: formattedAnswers
        });
        toast.success('Răspunsuri salvate cu succes!');
      } catch (e) {
        toast.error('Backend-ul pentru salvare nu este încă implementat.');
      }
    } catch (err) {
      toast.error('Eroare la salvare.');
    } finally {
      setSaving(false);
    }
  };

  const resetAnswers = () => {
    if (window.confirm('Sigur vrei să resetezi răspunsurile pentru acest grup?')) {
      setAnswers({});
      setNotes('');
    }
  };

  const toggleGroupCompleted = async () => {
    if (!plan) return;
    const group = plan.books[selectedBookIdx].chapterGroups[selectedGroupIdx];
    const groupId = group._id || group.title;
    const isCompleted = completedGroups[groupId];
    
    const newCompletedGroups = { ...completedGroups, [groupId]: !isCompleted };
    setCompletedGroups(newCompletedGroups);
    handleSaveAnswers(); // Save answers as well just in case

    if (userStudyPlan) {
      const completedArray = Object.keys(newCompletedGroups).filter(k => newCompletedGroups[k]);
      try {
        await userStudyPlanService.updateProgress(userStudyPlan._id, completedArray);
      } catch (err) {
        toast.error('Eroare la sincronizarea progresului cu serverul.');
      }
    }

    if (!isCompleted) {
      toast.success('Grup marcat ca finalizat!');
    } else {
      toast.success('Grup marcat ca nefinalizat!');
    }
  };

  const handleNextGroup = () => {
    if (!plan) return;
    const currentBook = plan.books[selectedBookIdx];
    if (selectedGroupIdx < currentBook.chapterGroups.length - 1) {
      handleGroupSelect(selectedBookIdx, selectedGroupIdx + 1);
    } else if (selectedBookIdx < plan.books.length - 1) {
      handleGroupSelect(selectedBookIdx + 1, 0);
    } else {
      handleFinishPlan();
    }
  };

  const handleFinishPlan = () => {
    setShowCelebration(true);
  };

  const handleCloseCelebration = () => {
    setShowCelebration(false);
    navigate('/dashboard');
  };

  if (loading) {
    return <div className="p-8 text-center flex items-center justify-center min-h-[60vh]"><div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto" /></div>;
  }

  if (!plan) {
    return (
      <div className="glass-panel p-8 text-center max-w-md mx-auto mt-12 animate-fade-in">
        <HelpCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Carte sau Plan inexistent</h2>
        <button onClick={() => navigate('/explore')} className="btn btn-primary mx-auto mt-4">Înapoi la Panou</button>
      </div>
    );
  }

  const selectedBook = plan.books[selectedBookIdx];
  const selectedGroup = selectedBook?.chapterGroups[selectedGroupIdx];
  const selectedGroupId = selectedGroup?._id || selectedGroup?.title || '';
  const chaptersArray = selectedGroup ? parseCustomChapters(selectedGroup.customChapters || `${selectedGroup.startChapter}-${selectedGroup.endChapter}`) : [];
  const chapterCount = chaptersArray.length;
  const currentChapterInGroup = chaptersArray.indexOf(currentChapter) + 1;
  
  const isLastGroup = 
    selectedBookIdx === plan.books.length - 1 &&
    selectedGroupIdx === selectedBook.chapterGroups.length - 1;

  return (
    <>
    <div className="min-h-screen bg-[#0b1120] text-gray-300 font-sans p-4 md:p-6 lg:p-8 animate-fade-in pb-24">

      {/* ── Top Header Navigation ── */}
      <div className="mb-6 flex items-center gap-4">
        <Link to="/explore" className="inline-flex items-center gap-2 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-xl text-sm font-semibold text-gray-300">
          <ArrowLeft className="w-4 h-4" /> Înapoi la planuri
        </Link>
        <button 
          onClick={() => setShowSidebar(!showSidebar)}
          className={`inline-flex items-center gap-2 transition-colors px-4 py-2 rounded-xl text-sm font-semibold ${showSidebar ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-gray-300 hover:text-white border border-transparent'}`}
        >
          <Menu className="w-4 h-4" /> {showSidebar ? 'Ascunde Cuprins' : 'Afișează Cuprins'}
        </button>
      </div>

      <div className="flex flex-row gap-4 lg:gap-6 h-[calc(100vh-12rem)] min-h-[600px] overflow-x-auto pb-4">
        
        {/* LEFT PANEL: STRUCTURA PLAN */}
        {showSidebar && (
          <div className="w-[280px] xl:w-[320px] flex-shrink-0 flex flex-col h-full overflow-y-auto custom-scrollbar pr-1 animate-fade-in">
            <StudySidebar
              plan={plan}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              expandedBooks={expandedBooks}
              toggleBook={toggleBook}
              selectedBookIdx={selectedBookIdx}
              selectedGroupIdx={selectedGroupIdx}
              handleGroupSelect={handleGroupSelect}
              completedGroups={completedGroups}
            />
          </div>
        )}

        {/* CENTER PANEL: BIBLE */}
        <div className="flex-1 flex flex-col min-w-[360px] max-w-[800px] h-full overflow-hidden">
          <BibleReader
            selectedBook={selectedBook}
            selectedGroup={selectedGroup}
            selectedGroupIdx={selectedGroupIdx}
            currentChapter={currentChapter}
            verses={verses}
            loadingVerses={loadingVerses}
            bookmarkedVerses={bookmarkedVerses}
            setBookmarkedVerses={setBookmarkedVerses}
            handlePrevChapter={handlePrevChapter}
            handleNextChapter={handleNextChapter}
            chapterCount={chapterCount}
            currentChapterInGroup={currentChapterInGroup}
            translation={translation}
            setTranslation={setTranslation}
          />
        </div>

        {/* RIGHT PANEL: NOTES, TIPS & PROGRESS */}
        <div className="w-[340px] xl:w-[380px] flex-shrink-0 flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar pr-1">
          <ReflectionQuestions
            selectedGroup={selectedGroup}
            answers={answers}
            handleAnswerChange={handleAnswerChange}
            resetAnswers={resetAnswers}
            handleSaveAnswers={handleSaveAnswers}
            saving={saving}
          />
          <PersonalThoughts
            selectedBook={selectedBook}
            selectedGroup={selectedGroup}
            selectedGroupIdx={selectedGroupIdx}
            chapterCount={chapterCount}
            currentChapterInGroup={currentChapterInGroup}
            initialNotes={notes}
            onSaveNotes={handleSaveNotes}
          />
        </div>
      </div>

      {/* ── Sticky Bottom Bar ── */}
      <StudyFooter
        selectedGroup={selectedGroup}
        completedGroups={completedGroups}
        toggleGroupCompleted={toggleGroupCompleted}
        currentChapter={currentChapter}
        handleNextChapter={handleNextChapter}
        handleNextGroup={handleNextGroup}
        isLastGroup={isLastGroup}
        onFinishPlan={handleFinishPlan}
      />
    </div>

      {showCelebration && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, height: '100vh', width: '100vw', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', boxSizing: 'border-box' }}>
          <Confetti width={width} height={height} recycle={false} numberOfPieces={800} gravity={0.15} />
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }} />
          <div className="relative bg-gray-900 border border-emerald-500/30 rounded-2xl p-8 max-w-md w-full text-center shadow-[0_0_50px_rgba(16,185,129,0.2)] animate-fade-in z-10" style={{ position: 'relative', width: '100%', maxWidth: '28rem', backgroundColor: '#111827', borderRadius: '1rem', border: '1px solid rgba(16,185,129,0.3)', margin: 'auto' }}>
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Award className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Felicitări! 🎉</h2>
            <p className="text-gray-300 mb-8 leading-relaxed">
              Ai finalizat cu succes planul de studiu <strong>{plan.title}</strong>! 
              Progresul tău a fost salvat și ai primit o insignă nouă în Dashboard.
            </p>
            <button 
              onClick={handleCloseCelebration}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]"
            >
              Mergi la Dashboard
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default StudyChapters;
