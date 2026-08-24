import React, { useState, useEffect } from 'react';
import { studyPlanService } from '../services/api';
import { StudyPlan, StudyBook, ChapterGroup, StudyQuestion } from '../types';
import { Book, PlusCircle, Trash2, ArrowRight, CheckCircle, Search, Save, Edit2, Bookmark, MessageSquare, AlertCircle, ChevronDown, ChevronRight, X, Layers, ArrowLeft, Calendar, Eye, MoreHorizontal, Circle } from 'lucide-react';
import { formatChapterGroup } from '../utils/chapters';
import toast from 'react-hot-toast';

// ── Bible books data with chapter counts ──
const BIBLE_BOOKS = [
  // Old Testament
  { name: 'Geneza', chapters: 50, testament: 'VT' },
  { name: 'Exodul', chapters: 40, testament: 'VT' },
  { name: 'Leviticul', chapters: 27, testament: 'VT' },
  { name: 'Numeri', chapters: 36, testament: 'VT' },
  { name: 'Deuteronom', chapters: 34, testament: 'VT' },
  { name: 'Iosua', chapters: 24, testament: 'VT' },
  { name: 'Judecători', chapters: 21, testament: 'VT' },
  { name: 'Rut', chapters: 4, testament: 'VT' },
  { name: '1 Samuel', chapters: 31, testament: 'VT' },
  { name: '2 Samuel', chapters: 24, testament: 'VT' },
  { name: '1 Împărați', chapters: 22, testament: 'VT' },
  { name: '2 Împărați', chapters: 25, testament: 'VT' },
  { name: '1 Cronici', chapters: 29, testament: 'VT' },
  { name: '2 Cronici', chapters: 36, testament: 'VT' },
  { name: 'Ezra', chapters: 10, testament: 'VT' },
  { name: 'Neemia', chapters: 13, testament: 'VT' },
  { name: 'Estera', chapters: 10, testament: 'VT' },
  { name: 'Iov', chapters: 42, testament: 'VT' },
  { name: 'Psalmi', chapters: 150, testament: 'VT' },
  { name: 'Proverbe', chapters: 31, testament: 'VT' },
  { name: 'Eclesiastul', chapters: 12, testament: 'VT' },
  { name: 'Cântarea Cântărilor', chapters: 8, testament: 'VT' },
  { name: 'Isaia', chapters: 66, testament: 'VT' },
  { name: 'Ieremia', chapters: 52, testament: 'VT' },
  { name: 'Plângerile lui Ieremia', chapters: 5, testament: 'VT' },
  { name: 'Ezechiel', chapters: 48, testament: 'VT' },
  { name: 'Daniel', chapters: 12, testament: 'VT' },
  { name: 'Osea', chapters: 14, testament: 'VT' },
  { name: 'Ioel', chapters: 3, testament: 'VT' },
  { name: 'Amos', chapters: 9, testament: 'VT' },
  { name: 'Obadia', chapters: 1, testament: 'VT' },
  { name: 'Iona', chapters: 4, testament: 'VT' },
  { name: 'Mica', chapters: 7, testament: 'VT' },
  { name: 'Naum', chapters: 3, testament: 'VT' },
  { name: 'Habacuc', chapters: 3, testament: 'VT' },
  { name: 'Țefania', chapters: 3, testament: 'VT' },
  { name: 'Hagai', chapters: 2, testament: 'VT' },
  { name: 'Zaharia', chapters: 14, testament: 'VT' },
  { name: 'Maleahi', chapters: 4, testament: 'VT' },
  // New Testament
  { name: 'Matei', chapters: 28, testament: 'NT' },
  { name: 'Marcu', chapters: 16, testament: 'NT' },
  { name: 'Luca', chapters: 24, testament: 'NT' },
  { name: 'Ioan', chapters: 21, testament: 'NT' },
  { name: 'Faptele Apostolilor', chapters: 28, testament: 'NT' },
  { name: 'Romani', chapters: 16, testament: 'NT' },
  { name: '1 Corinteni', chapters: 16, testament: 'NT' },
  { name: '2 Corinteni', chapters: 13, testament: 'NT' },
  { name: 'Galateni', chapters: 6, testament: 'NT' },
  { name: 'Efeseni', chapters: 6, testament: 'NT' },
  { name: 'Filipeni', chapters: 4, testament: 'NT' },
  { name: 'Coloseni', chapters: 4, testament: 'NT' },
  { name: '1 Tesaloniceni', chapters: 5, testament: 'NT' },
  { name: '2 Tesaloniceni', chapters: 3, testament: 'NT' },
  { name: '1 Timotei', chapters: 6, testament: 'NT' },
  { name: '2 Timotei', chapters: 4, testament: 'NT' },
  { name: 'Tit', chapters: 3, testament: 'NT' },
  { name: 'Filimon', chapters: 1, testament: 'NT' },
  { name: 'Evrei', chapters: 13, testament: 'NT' },
  { name: 'Iacov', chapters: 5, testament: 'NT' },
  { name: '1 Petru', chapters: 5, testament: 'NT' },
  { name: '2 Petru', chapters: 3, testament: 'NT' },
  { name: '1 Ioan', chapters: 5, testament: 'NT' },
  { name: '2 Ioan', chapters: 1, testament: 'NT' },
  { name: '3 Ioan', chapters: 1, testament: 'NT' },
  { name: 'Iuda', chapters: 1, testament: 'NT' },
  { name: 'Apocalipsa', chapters: 22, testament: 'NT' },
];

const QUESTION_TYPES = [
  { value: 'reflection', label: 'Reflecție' },
  { value: 'application', label: 'Aplicare' },
  { value: 'observation', label: 'Observație' },
  { value: 'interpretation', label: 'Interpretare' },
  { value: 'memorization', label: 'Memorare' },
];

// ── Types ──
type PageMode = 'list' | 'wizard';

export const AdminPanel: React.FC = () => {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [editingPlan, setEditingPlan] = useState<StudyPlan | null>(null);
  const [pageMode, setPageMode] = useState<PageMode>('list');
  const [wizardStep, setWizardStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isNewPlan, setIsNewPlan] = useState(false);

  // Step 1 form state
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formYear, setFormYear] = useState(new Date().getFullYear());
  const [formStartDate, setFormStartDate] = useState('');
  const [formIsActive, setFormIsActive] = useState(false);

  // Step 2 state
  const [showBookPicker, setShowBookPicker] = useState(false);
  const [bookFilter, setBookFilter] = useState<'all' | 'VT' | 'NT'>('all');
  const [expandedBooks, setExpandedBooks] = useState<Set<number>>(new Set());

  // Step 3 state
  const [selectedBookIndex, setSelectedBookIndex] = useState<number | null>(null);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const data = await studyPlanService.getAll();
      setPlans(data);
    } catch (err) {
      toast.error('Eroare la încărcarea planurilor de studiu');
    } finally {
      setLoading(false);
    }
  };

  // ── Open wizard for NEW plan ──
  const handleNewPlan = () => {
    setFormTitle('');
    setFormDescription('');
    setFormYear(new Date().getFullYear());
    setFormStartDate(`${new Date().getFullYear()}-01-01`);
    setFormIsActive(false);
    setEditingPlan(null);
    setIsNewPlan(true);
    setWizardStep(1);
    setPageMode('wizard');
    setSelectedBookIndex(null);
    setSelectedGroupIndex(null);
    setExpandedBooks(new Set());
  };

  // ── Open wizard for EXISTING plan ──
  const handleEditPlan = (plan: StudyPlan, step: number = 1) => {
    const planCopy = JSON.parse(JSON.stringify(plan));
    setEditingPlan(planCopy);
    setFormTitle(planCopy.title);
    setFormDescription(planCopy.description || '');
    setFormYear(planCopy.year);
    setFormStartDate(planCopy.startDate ? planCopy.startDate.substring(0, 10) : '');
    setFormIsActive(planCopy.isActive);
    setIsNewPlan(false);
    setWizardStep(step);
    setPageMode('wizard');
    setSelectedBookIndex(null);
    setSelectedGroupIndex(null);
    // Expand all books by default
    const expanded = new Set<number>();
    planCopy.books.forEach((_: any, i: number) => expanded.add(i));
    setExpandedBooks(expanded);
  };

  // ── Close wizard ──
  const handleBackToList = () => {
    setPageMode('list');
    setEditingPlan(null);
    setShowSuccess(false);
    fetchPlans();
  };

  // ── Step 1: Save/Create plan details ──
  const handleSaveStep1 = async (): Promise<boolean> => {
    if (!formTitle.trim()) {
      toast.error('Titlul planului este obligatoriu');
      return false;
    }
    if (!formYear) {
      toast.error('Anul este obligatoriu');
      return false;
    }

    try {
      setSaving(true);
      if (isNewPlan && !editingPlan) {
        // Create new plan
        const created = await studyPlanService.create({
          title: formTitle,
          description: formDescription,
          year: formYear,
          startDate: formStartDate || undefined,
          books: [],
          isActive: formIsActive,
        });
        setEditingPlan(created);
        setPlans([created, ...plans]);
        setIsNewPlan(false);
        toast.success('Plan creat cu succes!');
      } else if (editingPlan) {
        // Update existing plan
        const updated = await studyPlanService.update(editingPlan._id, {
          title: formTitle,
          description: formDescription,
          year: formYear,
          startDate: formStartDate || undefined,
          isActive: formIsActive,
        });
        setEditingPlan({ ...editingPlan, ...updated });
        setPlans(plans.map(p => p._id === updated._id ? updated : p));
        toast.success('Detalii salvate!');
      }
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Eroare la salvarea planului';
      toast.error(msg);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // ── Step 2 & 3: Save full plan (books, groups, questions) ──
  const handleSaveFull = async (): Promise<boolean> => {
    if (!editingPlan) return false;
    try {
      setSaving(true);

      // Clean up temp IDs
      const planToSave = JSON.parse(JSON.stringify(editingPlan));
      planToSave.title = formTitle;
      planToSave.description = formDescription;
      planToSave.year = formYear;
      planToSave.startDate = formStartDate || undefined;
      planToSave.isActive = formIsActive;

      let hasEmptyQuestions = false;

      planToSave.books.forEach((book: any) => {
        if (book._id && String(book._id).startsWith('temp-')) delete book._id;
        book.chapterGroups.forEach((group: any) => {
          if (group._id && String(group._id).startsWith('temp-')) delete group._id;
          group.questions.forEach((q: any) => {
            if (q._id && String(q._id).startsWith('temp-')) delete q._id;
            if (!q.text || !q.text.trim()) {
              hasEmptyQuestions = true;
            }
          });
        });
      });

      if (hasEmptyQuestions) {
        toast.error('Toate întrebările trebuie să aibă un text completat.');
        setSaving(false);
        return false;
      }

      const updated = await studyPlanService.update(editingPlan._id, planToSave);
      setPlans(plans.map(p => p._id === updated._id ? updated : p));
      setEditingPlan(updated);
      toast.success('Planul a fost salvat! ✅');
      return true;
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || 'Eroare la salvarea planului';
      toast.error(msg);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // ── Navigation ──
  const handleNext = async () => {
    if (wizardStep === 1) {
      const success = await handleSaveStep1();
      if (success) setWizardStep(2);
    } else if (wizardStep === 2) {
      const success = await handleSaveFull();
      if (success) setWizardStep(3);
    } else if (wizardStep === 3) {
      const success = await handleSaveFull();
      if (success) setShowSuccess(true);
    }
  };

  const handleBack = () => {
    if (wizardStep > 1) setWizardStep(wizardStep - 1);
  };

  // ── Book management ──
  const handleAddBook = (bookName: string) => {
    if (!editingPlan) return;
    const alreadyAdded = editingPlan.books.some(b => b.bookName === bookName);
    if (alreadyAdded) {
      toast.error(`${bookName} este deja adăugat`);
      return;
    }
    const updatedPlan = {
      ...editingPlan,
      books: [...editingPlan.books, { _id: `temp-${Date.now()}`, bookName, chapterGroups: [] }],
    };
    setEditingPlan(updatedPlan as StudyPlan);
    setShowBookPicker(false);
    // Auto-expand the newly added book
    const newIdx = updatedPlan.books.length - 1;
    setExpandedBooks(prev => new Set([...prev, newIdx]));
    toast.success(`${bookName} adăugat la plan`);
  };

  const handleRemoveBook = (bookIndex: number) => {
    if (!editingPlan) return;
    const updated = { ...editingPlan, books: editingPlan.books.filter((_, i) => i !== bookIndex) };
    setEditingPlan(updated as StudyPlan);
    // Reset expanded state
    const newExpanded = new Set<number>();
    expandedBooks.forEach(i => {
      if (i < bookIndex) newExpanded.add(i);
      else if (i > bookIndex) newExpanded.add(i - 1);
    });
    setExpandedBooks(newExpanded);
  };

  const toggleBookExpand = (idx: number) => {
    setExpandedBooks(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  // ── Chapter group management ──
  const handleAddChapterGroup = (bookIndex: number) => {
    if (!editingPlan) return;
    const book = editingPlan.books[bookIndex];
    const bibleBook = BIBLE_BOOKS.find(b => b.name === book.bookName);
    const maxChapter = bibleBook?.chapters || 1;
    const existingGroups = book.chapterGroups;
    let startChapter = 1;
    if (existingGroups.length > 0) {
      const lastGroup = existingGroups[existingGroups.length - 1];
      startChapter = lastGroup.endChapter + 1;
    }
    const endChapter = Math.min(startChapter + 2, maxChapter);
    if (startChapter > maxChapter) {
      toast.error('Toate capitolele sunt deja grupate');
      return;
    }
    const newGroup: any = {
      _id: `temp-g-${Date.now()}`,
      title: `${book.bookName} ${startChapter}-${endChapter}`,
      startChapter,
      endChapter,
      customChapters: `${startChapter}-${endChapter}`,
      questions: [],
    };
    const updatedBooks = [...editingPlan.books];
    updatedBooks[bookIndex] = {
      ...book,
      chapterGroups: [...book.chapterGroups, newGroup],
    };
    setEditingPlan({ ...editingPlan, books: updatedBooks } as StudyPlan);
  };

  const handleUpdateChapterGroup = (bookIndex: number, groupIndex: number, field: string, value: any) => {
    if (!editingPlan) return;
    const updatedBooks = [...editingPlan.books];
    const updatedGroups = [...updatedBooks[bookIndex].chapterGroups];
    updatedGroups[groupIndex] = { ...updatedGroups[groupIndex], [field]: value };
    if (field === 'startChapter' || field === 'endChapter') {
      const g = updatedGroups[groupIndex];
      const start = field === 'startChapter' ? value : g.startChapter;
      const end = field === 'endChapter' ? value : g.endChapter;
      updatedGroups[groupIndex].title = `${updatedBooks[bookIndex].bookName} ${start}-${end}`;
    } else if (field === 'customChapters') {
      updatedGroups[groupIndex].title = `${updatedBooks[bookIndex].bookName} ${value}`;
    }
    updatedBooks[bookIndex] = { ...updatedBooks[bookIndex], chapterGroups: updatedGroups };
    setEditingPlan({ ...editingPlan, books: updatedBooks } as StudyPlan);
  };

  const handleRemoveChapterGroup = (bookIndex: number, groupIndex: number) => {
    if (!editingPlan) return;
    const updatedBooks = [...editingPlan.books];
    updatedBooks[bookIndex] = {
      ...updatedBooks[bookIndex],
      chapterGroups: updatedBooks[bookIndex].chapterGroups.filter((_, i) => i !== groupIndex),
    };
    setEditingPlan({ ...editingPlan, books: updatedBooks } as StudyPlan);
  };

  // ── Question management ──
  const handleAddQuestion = (bookIndex: number, groupIndex: number) => {
    if (!editingPlan) return;
    const updatedBooks = [...editingPlan.books];
    const updatedGroups = [...updatedBooks[bookIndex].chapterGroups];
    const newQuestion: any = {
      _id: `temp-q-${Date.now()}`,
      text: '',
      expectedAnswer: '',
      type: 'reflection',
      isActive: true,
    };
    const updatedQuestions = [...updatedGroups[groupIndex].questions, newQuestion];
    updatedGroups[groupIndex] = { ...updatedGroups[groupIndex], questions: updatedQuestions };
    updatedBooks[bookIndex] = { ...updatedBooks[bookIndex], chapterGroups: updatedGroups };
    setEditingPlan({ ...editingPlan, books: updatedBooks } as StudyPlan);
  };

  const handleUpdateQuestion = (bookIndex: number, groupIndex: number, qIndex: number, field: string, value: any) => {
    if (!editingPlan) return;
    const updatedBooks = [...editingPlan.books];
    const updatedGroups = [...updatedBooks[bookIndex].chapterGroups];
    const updatedQuestions = [...updatedGroups[groupIndex].questions];
    updatedQuestions[qIndex] = { ...updatedQuestions[qIndex], [field]: value };
    updatedGroups[groupIndex] = { ...updatedGroups[groupIndex], questions: updatedQuestions };
    updatedBooks[bookIndex] = { ...updatedBooks[bookIndex], chapterGroups: updatedGroups };
    setEditingPlan({ ...editingPlan, books: updatedBooks } as StudyPlan);
  };

  const handleRemoveQuestion = (bookIndex: number, groupIndex: number, qIndex: number) => {
    if (!editingPlan) return;
    const updatedBooks = [...editingPlan.books];
    const updatedGroups = [...updatedBooks[bookIndex].chapterGroups];
    const updatedQuestions = updatedGroups[groupIndex].questions.filter((_, i) => i !== qIndex);
    updatedGroups[groupIndex] = { ...updatedGroups[groupIndex], questions: updatedQuestions };
    updatedBooks[bookIndex] = { ...updatedBooks[bookIndex], chapterGroups: updatedGroups };
    setEditingPlan({ ...editingPlan, books: updatedBooks } as StudyPlan);
  };

  // ── Delete plan ──
  const handleDeletePlan = async (id: string) => {
    if (!confirm('Ești sigur că vrei să ștergi acest plan?')) return;
    try {
      await studyPlanService.delete(id);
      setPlans(plans.filter(p => p._id !== id));
      if (editingPlan?._id === id) {
        setEditingPlan(null);
        setPageMode('list');
      }
      toast.success('Plan șters');
    } catch (err) {
      toast.error('Eroare la ștergere');
    }
  };

  // ── Loading ──
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: '2.5rem', height: '2.5rem', border: '3px solid transparent', borderBottom: '3px solid #10b981', borderRadius: '50%' }} className="animate-spin" />
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Se încarcă planurile...</p>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // RENDER: STEP INDICATOR
  // ═══════════════════════════════════════════
  const stepData = [
    { num: 1, title: 'Detalii Plan', sub: 'Creează planul de studiu' },
    { num: 2, title: 'Cărți & Capitole', sub: 'Selectează cărțile și grupează capitolele' },
    { num: 3, title: 'Întrebări', sub: 'Adaugă întrebări pentru fiecare grup' },
  ];

  const progressPercent = Math.round((wizardStep / 3) * 100);

  const renderStepIndicator = () => (
    <div style={{ marginBottom: '0.5rem' }}>
      <div className="wizard-indicator">
        {stepData.map((s, idx) => {
          const isActive = wizardStep === s.num;
          const isCompleted = wizardStep > s.num;
          return (
            <React.Fragment key={s.num}>
              {idx > 0 && (
                <div className="wizard-step-connector">
                  <div
                    className="wizard-step-connector-fill"
                    style={{ width: isCompleted || isActive ? '100%' : '0%' }}
                  />
                </div>
              )}
              <div className="wizard-step-item">
                <div className={`wizard-step-circle ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                  {isCompleted ? <CheckCircle style={{ width: '1.25rem', height: '1.25rem' }} /> : s.num}
                </div>
                <div className="wizard-step-label">
                  <div className={`wizard-step-label-title ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                    {s.title}
                  </div>
                  <div className="wizard-step-label-sub">{s.sub}</div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
      {/* Progress bar */}
      <div className="wizard-progress-container" style={{ marginTop: '1rem' }}>
        <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600 }}>Pasul {wizardStep} din 3</span>
        <div className="wizard-progress-bar">
          <div className="wizard-progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
        <span className="wizard-progress-text">{progressPercent}%</span>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════
  // RENDER: BOTTOM ACTION BAR
  // ═══════════════════════════════════════════
  const renderBottomBar = () => (
    <div className="wizard-bottom-bar">
      <div className="wizard-auto-save">
        <Save style={{ width: '0.875rem', height: '0.875rem' }} />
        <span>Se salvează automat la fiecare pas</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {wizardStep > 1 && (
          <button
            onClick={handleBack}
            className="btn btn-secondary"
            style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}
          >
            <ArrowLeft style={{ width: '1rem', height: '1rem' }} />
            Înapoi
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={saving}
          className="btn btn-primary"
          style={{
            padding: '0.6rem 1.5rem',
            fontSize: '0.85rem',
            background: wizardStep === 3 ? 'linear-gradient(135deg, #10b981, #059669)' : undefined,
          }}
        >
          {saving ? (
            <div style={{ width: '1rem', height: '1rem', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%' }} className="animate-spin" />
          ) : wizardStep === 3 ? (
            <>
              Finalizează Planul
              <CheckCircle style={{ width: '1rem', height: '1rem' }} />
            </>
          ) : (
            <>
              Salvează & Continuă
              <ArrowRight style={{ width: '1rem', height: '1rem' }} />
            </>
          )}
        </button>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════
  // RENDER: STEP 1 — DETALII PLAN
  // ═══════════════════════════════════════════
  const renderStep1 = () => (
    <div className="wizard-content-panel animate-fade-in">
      <div className="wizard-section-title">Informații generale</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '40rem' }}>
        {/* Title */}
        <div className="wizard-question-field">
          <label>Titlu plan <span style={{ color: '#ef4444' }}>*</span></label>
          <input
            type="text"
            value={formTitle}
            onChange={e => setFormTitle(e.target.value)}
            placeholder="ex: Apocalipsa 2026"
            style={{ fontSize: '1rem', fontWeight: 600 }}
          />
        </div>

        {/* Description */}
        <div className="wizard-question-field">
          <label>Descriere</label>
          <textarea
            value={formDescription}
            onChange={e => setFormDescription(e.target.value)}
            placeholder="Studiu sistematic al cărții Apocalipsa, cu întrebări de reflecție și aplicare."
            rows={3}
            style={{ resize: 'vertical', minHeight: '80px' }}
          />
        </div>

        {/* Year + Start Date */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="wizard-question-field">
            <label>An <span style={{ color: '#ef4444' }}>*</span></label>
            <input
              type="number"
              value={formYear}
              onChange={e => setFormYear(parseInt(e.target.value) || new Date().getFullYear())}
            />
          </div>
          <div className="wizard-question-field">
            <label>Data de start <span style={{ color: '#ef4444' }}>*</span></label>
            <input
              type="date"
              value={formStartDate}
              onChange={e => setFormStartDate(e.target.value)}
            />
          </div>
        </div>

        {/* Active toggle */}
        <div style={{ paddingTop: '0.5rem' }}>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={formIsActive}
              onChange={e => setFormIsActive(e.target.checked)}
            />
            <span className="toggle-slider" />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: formIsActive ? '#34d399' : '#9ca3af' }}>
                Plan Activ
              </div>
              <div style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: '0.1rem' }}>
                Planul va fi disponibil pentru utilizatori
              </div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════
  // RENDER: STEP 2 — CĂRȚI & CAPITOLE
  // ═══════════════════════════════════════════
  const renderStep2 = () => {
    if (!editingPlan) return null;

    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Book picker */}
        <div className="wizard-content-panel" style={{ padding: '1.5rem', position: 'relative', zIndex: 50 }}>
          <div className="wizard-section-title">Adaugă carte din Biblie</div>
          <div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <select
                value={bookFilter}
                onChange={e => setBookFilter(e.target.value as any)}
                style={{ width: 'auto', maxWidth: '14rem', cursor: 'pointer' }}
              >
                <option value="all">Toate Cărțile</option>
                <option value="VT">Vechiul Testament</option>
                <option value="NT">Noul Testament</option>
              </select>
              <button
                onClick={() => setShowBookPicker(!showBookPicker)}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
              >
                <ChevronDown style={{ width: '0.875rem', height: '0.875rem', transition: 'transform 0.2s', transform: showBookPicker ? 'rotate(180deg)' : 'none' }} />
                Selectează carte
              </button>
            </div>

            {showBookPicker && (
              <div style={{
                position: 'absolute', zIndex: 50, marginTop: '0.5rem', width: '100%', maxWidth: '36rem',
                background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)', padding: '1rem', maxHeight: '20rem', overflowY: 'auto'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.25rem' }}>
                  {BIBLE_BOOKS
                    .filter(b => bookFilter === 'all' || b.testament === bookFilter)
                    .map(book => {
                      const alreadyAdded = editingPlan.books.some(b => b.bookName === book.name);
                      return (
                        <button
                          key={book.name}
                          onClick={() => !alreadyAdded && handleAddBook(book.name)}
                          disabled={alreadyAdded}
                          style={{
                            textAlign: 'left', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.8rem',
                            transition: 'all 0.15s', cursor: alreadyAdded ? 'not-allowed' : 'pointer',
                            background: alreadyAdded ? 'rgba(16,185,129,0.1)' : 'transparent',
                            color: alreadyAdded ? '#34d399' : '#d1d5db',
                            border: 'none',
                          }}
                          onMouseOver={e => { if (!alreadyAdded) (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; }}
                          onMouseOut={e => { if (!alreadyAdded) (e.target as HTMLElement).style.background = 'transparent'; }}
                        >
                          {alreadyAdded && <CheckCircle style={{ width: '0.75rem', height: '0.75rem', display: 'inline', marginRight: '0.25rem', verticalAlign: 'middle' }} />}
                          {book.name}
                          <span style={{ color: '#4b5563', marginLeft: '0.25rem', fontSize: '0.7rem' }}>({book.chapters})</span>
                        </button>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Selected books */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {editingPlan.books.length > 0 && (
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6b7280' }}>
              Cărți selectate
            </div>
          )}
          {editingPlan.books.map((book, bIndex) => {
            const bibleBook = BIBLE_BOOKS.find(b => b.name === book.bookName);
            const isExpanded = expandedBooks.has(bIndex);
            const totalQuestions = book.chapterGroups.reduce((sum, g) => sum + g.questions.length, 0);

            return (
              <div key={bIndex} className="wizard-book-card">
                {/* Book header */}
                <div className="wizard-book-header" onClick={() => toggleBookExpand(bIndex)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <ChevronRight style={{
                      width: '1rem', height: '1rem', color: '#6b7280',
                      transition: 'transform 0.2s', transform: isExpanded ? 'rotate(90deg)' : 'none'
                    }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem' }}>{book.bookName}</div>
                      <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>
                        {bibleBook?.chapters} capitole · {bibleBook?.testament === 'VT' ? 'Vechiul Testament' : 'Noul Testament'}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      fontSize: '0.68rem', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontWeight: 600,
                      background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)'
                    }}>
                      {book.chapterGroups.length} grupuri
                    </span>
                    {totalQuestions > 0 && (
                      <span style={{
                        fontSize: '0.68rem', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontWeight: 600,
                        background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)'
                      }}>
                        {totalQuestions} întrebări
                      </span>
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); handleRemoveBook(bIndex); }}
                      style={{ padding: '0.35rem', borderRadius: '0.375rem', border: 'none', background: 'rgba(239,68,68,0.1)', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Trash2 style={{ width: '0.875rem', height: '0.875rem' }} />
                    </button>
                  </div>
                </div>

                {/* Chapter groups */}
                {isExpanded && (
                  <div className="wizard-book-groups">
                    {book.chapterGroups.map((group, gIndex) => (
                      <div key={gIndex} className="wizard-group-row">
                        <div className="wizard-group-info">
                          <div className="wizard-group-title">Grup {gIndex + 1}: {group.title}</div>
                          <div className="wizard-group-meta">
                            Capitole: {formatChapterGroup(group)}
                          </div>
                        </div>
                        <div className="wizard-group-actions">
                          <span className="wizard-group-badge" style={{
                            background: group.questions.length > 0 ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)',
                            color: group.questions.length > 0 ? '#34d399' : '#6b7280',
                          }}>
                            {group.questions.length} întrebări
                          </span>
                          {/* Edit custom chapters inline */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <input
                              type="text"
                              value={group.customChapters || (group.startChapter === group.endChapter ? `${group.startChapter}` : `${group.startChapter}-${group.endChapter}`)}
                              onClick={e => e.stopPropagation()}
                              onChange={e => handleUpdateChapterGroup(bIndex, gIndex, 'customChapters', e.target.value)}
                              placeholder="ex: 1-3, 5"
                              style={{ width: '6rem', padding: '0.25rem 0.5rem', fontSize: '0.75rem', textAlign: 'center', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#fff' }}
                            />
                          </div>
                          <button
                            onClick={() => handleRemoveChapterGroup(bIndex, gIndex)}
                            style={{ padding: '0.3rem', border: 'none', background: 'transparent', color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            onMouseOver={e => (e.currentTarget.style.color = '#f87171')}
                            onMouseOut={e => (e.currentTarget.style.color = '#6b7280')}
                          >
                            <Trash2 style={{ width: '0.8rem', height: '0.8rem' }} />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Add group button */}
                    <button
                      onClick={() => handleAddChapterGroup(bIndex)}
                      className="wizard-add-group-btn"
                    >
                      <PlusCircle style={{ width: '0.875rem', height: '0.875rem' }} />
                      Adaugă grup de capitole
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {editingPlan.books.length === 0 && (
            <div className="wizard-content-panel" style={{ padding: '3rem', textAlign: 'center' }}>
              <Book style={{ width: '2.5rem', height: '2.5rem', color: '#4b5563', margin: '0 auto 1rem' }} />
              <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
                Nicio carte adăugată. Selectează o carte din Biblie de mai sus.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════
  // RENDER: STEP 3 — ÎNTREBĂRI
  // ═══════════════════════════════════════════
  const renderStep3 = () => {
    if (!editingPlan) return null;

    const selectedBook = selectedBookIndex !== null ? editingPlan.books[selectedBookIndex] : null;
    const selectedGroup = selectedBook && selectedGroupIndex !== null ? selectedBook.chapterGroups[selectedGroupIndex] : null;

    return (
      <div className="animate-fade-in" style={{ display: 'flex', gap: '1.25rem', minHeight: '28rem' }}>
        {/* LEFT: Tree structure */}
        <div style={{ width: '40%', minWidth: '16rem' }}>
          <div className="wizard-content-panel" style={{ padding: '1.25rem', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div className="wizard-section-title" style={{ margin: 0, padding: 0, border: 'none' }}>Structură plan</div>
            </div>

            <div className="wizard-tree">
              {editingPlan.books.map((book, bIndex) => (
                <div key={bIndex}>
                  <div className="wizard-tree-book">
                    <Book style={{ width: '0.875rem', height: '0.875rem', color: '#34d399' }} />
                    {book.bookName}
                  </div>
                  {book.chapterGroups.map((group, gIndex) => {
                    const isSelected = selectedBookIndex === bIndex && selectedGroupIndex === gIndex;
                    return (
                      <React.Fragment key={gIndex}>
                        <div
                          className={`wizard-tree-group ${isSelected ? 'selected' : ''}`}
                          onClick={() => { setSelectedBookIndex(bIndex); setSelectedGroupIndex(gIndex); }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{
                              width: '0.5rem', height: '0.5rem', borderRadius: '50%',
                              background: group.questions.length > 0 ? '#34d399' : 'rgba(255,255,255,0.15)',
                              flexShrink: 0
                            }} />
                            <span>Grup {gIndex + 1}: {group.title}</span>
                          </div>
                          <span style={{
                            fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '0.2rem',
                            background: group.questions.length > 0 ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
                            color: group.questions.length > 0 ? '#34d399' : '#6b7280'
                          }}>
                            {group.questions.length > 0 ? `${group.questions.length} întrebări` : 'fără întrebări'}
                          </span>
                        </div>
                        {/* Show question items in tree */}
                        {isSelected && group.questions.map((q, qIdx) => (
                          <div key={qIdx} className="wizard-tree-question">
                            <div style={{
                              width: '0.35rem', height: '0.35rem', borderRadius: '50%', background: '#34d399',
                              flexShrink: 0
                            }} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {q.text ? `Întrebarea ${qIdx + 1}` : `Întrebarea ${qIdx + 1} (goală)`}
                            </span>
                          </div>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </div>
              ))}

              {editingPlan.books.length === 0 && (
                <p style={{ fontSize: '0.75rem', color: '#6b7280', fontStyle: 'italic', padding: '0.5rem' }}>
                  Revino la Pasul 2 pentru a adăuga cărți și grupuri.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Question editor */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {selectedGroup && selectedBookIndex !== null && selectedGroupIndex !== null ? (
            <div className="wizard-question-editor animate-fade-in">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div className="wizard-section-title" style={{ margin: 0, padding: 0, border: 'none' }}>
                  Editor Întrebare
                </div>
                <span style={{
                  fontSize: '0.72rem', fontWeight: 600, padding: '0.3rem 0.6rem', borderRadius: '0.25rem',
                  background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)'
                }}>
                  {selectedGroup.questions.length} întrebări
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {selectedGroup.questions.map((q, qIndex) => (
                  <div key={qIndex} style={{
                    padding: '1.25rem', background: 'rgba(0,0,0,0.25)', borderRadius: '0.75rem',
                    border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '1rem',
                    position: 'relative'
                  }}>
                    {/* Question number badge & delete */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                          width: '1.5rem', height: '1.5rem', borderRadius: '50%', background: 'rgba(59,130,246,0.15)',
                          color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.7rem', fontWeight: 700, flexShrink: 0
                        }}>
                          {qIndex + 1}
                        </div>
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>
                          Întrebarea {qIndex + 1}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveQuestion(selectedBookIndex, selectedGroupIndex, qIndex)}
                        style={{ padding: '0.3rem', border: 'none', background: 'transparent', color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        onMouseOver={e => (e.currentTarget.style.color = '#f87171')}
                        onMouseOut={e => (e.currentTarget.style.color = '#6b7280')}
                      >
                        <X style={{ width: '0.875rem', height: '0.875rem' }} />
                      </button>
                    </div>

                    {/* Question text */}
                    <div className="wizard-question-field">
                      <label>Întrebare <span style={{ color: '#ef4444' }}>*</span></label>
                      <textarea
                        value={q.text}
                        onChange={e => handleUpdateQuestion(selectedBookIndex, selectedGroupIndex, qIndex, 'text', e.target.value)}
                        placeholder="Scrie întrebarea aici..."
                        rows={2}
                        style={{ resize: 'vertical', minHeight: '60px' }}
                      />
                    </div>

                    {/* Expected answer */}
                    <div className="wizard-question-field">
                      <label>Răspuns așteptat / Ghid</label>
                      <textarea
                        value={(q as any).expectedAnswer || ''}
                        onChange={e => handleUpdateQuestion(selectedBookIndex, selectedGroupIndex, qIndex, 'expectedAnswer', e.target.value)}
                        placeholder="Ghid de răspuns pentru facilitator..."
                        rows={2}
                        style={{ resize: 'vertical', minHeight: '50px' }}
                      />
                    </div>

                    {/* Type + Active row */}
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', flexWrap: 'wrap' }}>
                      <div className="wizard-question-field" style={{ flex: 1, minWidth: '10rem' }}>
                        <label>Tip Întrebare</label>
                        <select
                          value={(q as any).type || 'reflection'}
                          onChange={e => handleUpdateQuestion(selectedBookIndex, selectedGroupIndex, qIndex, 'type', e.target.value)}
                          style={{ cursor: 'pointer' }}
                        >
                          {QUESTION_TYPES.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </div>
                      <label className="toggle-switch" style={{ paddingBottom: '0.5rem' }}>
                        <input
                          type="checkbox"
                          checked={(q as any).isActive !== false}
                          onChange={e => handleUpdateQuestion(selectedBookIndex, selectedGroupIndex, qIndex, 'isActive', e.target.checked)}
                        />
                        <span className="toggle-slider" style={{ width: '2.25rem', height: '1.25rem' }} />
                        <span style={{ fontSize: '0.78rem', color: (q as any).isActive !== false ? '#34d399' : '#6b7280' }}>
                          Întrebare activă
                        </span>
                      </label>
                    </div>
                  </div>
                ))}

                {/* Add question button */}
                <button
                  onClick={() => handleAddQuestion(selectedBookIndex, selectedGroupIndex)}
                  className="wizard-add-group-btn"
                  style={{ borderColor: 'rgba(59,130,246,0.25)' }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)'; e.currentTarget.style.color = '#60a5fa'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.25)'; e.currentTarget.style.color = '#6b7280'; }}
                >
                  <PlusCircle style={{ width: '0.875rem', height: '0.875rem' }} />
                  Adaugă Întrebare
                </button>
              </div>
            </div>
          ) : (
            <div className="wizard-content-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '1rem' }}>
              <MessageSquare style={{ width: '2.5rem', height: '2.5rem', color: '#4b5563' }} />
              <p style={{ color: '#9ca3af', fontSize: '0.9rem', textAlign: 'center' }}>
                Selectează un grup de capitole din structura din stânga pentru a adăuga sau edita întrebări.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════
  // RENDER: SUCCESS SCREEN
  // ═══════════════════════════════════════════
  const renderSuccess = () => (
    <div className="wizard-success-overlay">
      <div className="wizard-success-backdrop" />
      <div className="wizard-success-card">
        <div className="wizard-success-icon">
          <CheckCircle />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Plan creat cu succes!
        </h2>
        <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
          Planul tău de studiu a fost salvat.
        </p>
        <button
          onClick={handleBackToList}
          className="btn btn-primary"
          style={{ padding: '0.75rem 2rem', fontSize: '0.9rem' }}
        >
          Vezi planurile
        </button>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════
  // RENDER: PLAN LIST
  // ═══════════════════════════════════════════
  const renderPlanList = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers style={{ width: '1.5rem', height: '1.5rem', color: '#34d399' }} />
            Planuri de Studiu
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Creează, editează și gestionează planurile de studiu.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleNewPlan}
            className="btn btn-primary"
            style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}
          >
            <PlusCircle style={{ width: '1rem', height: '1rem' }} />
            Plan Nou
          </button>
        </div>
      </div>

      {/* Plan grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {plans.map(plan => {
          const totalQuestions = plan.books.reduce((acc, b) => acc + b.chapterGroups.reduce((a, g) => a + g.questions.length, 0), 0);
          return (
            <div
              key={plan._id}
              className="glass-card"
              style={{ padding: '1.25rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
              onClick={() => handleEditPlan(plan)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{plan.title}</h3>
                {plan.isActive && (
                  <span style={{ fontSize: '0.68rem', background: 'rgba(16,185,129,0.15)', color: '#34d399', padding: '0.2rem 0.5rem', borderRadius: '999px', fontWeight: 600, flexShrink: 0 }}>
                    Activ
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.8rem', color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {plan.description || 'Fără descriere'}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.72rem', color: '#6b7280' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Book style={{ width: '0.75rem', height: '0.75rem' }} /> {plan.books.length} cărți
                </span>
                <span>An: {plan.year}</span>
                <span>{totalQuestions} întrebări</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button
                  onClick={e => { e.stopPropagation(); handleEditPlan(plan, 1); }}
                  style={{ fontSize: '0.72rem', color: '#60a5fa', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0' }}
                >
                  <Edit2 style={{ width: '0.7rem', height: '0.7rem' }} /> Editează
                </button>
                <button
                  onClick={e => { e.stopPropagation(); handleEditPlan(plan, 3); }}
                  style={{ fontSize: '0.72rem', color: '#34d399', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0' }}
                >
                  <MessageSquare style={{ width: '0.7rem', height: '0.7rem' }} /> Întrebări
                </button>
                <button
                  onClick={e => { e.stopPropagation(); handleDeletePlan(plan._id); }}
                  style={{ fontSize: '0.72rem', color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0', marginLeft: 'auto' }}
                >
                  <Trash2 style={{ width: '0.7rem', height: '0.7rem' }} /> Șterge
                </button>
              </div>
            </div>
          );
        })}

        {plans.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem' }} className="glass-panel">
            <AlertCircle style={{ width: '3rem', height: '3rem', color: '#4b5563', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#9ca3af' }}>Niciun plan de studiu</h3>
            <p style={{ color: '#6b7280', marginTop: '0.5rem', fontSize: '0.85rem' }}>
              Creează primul plan apăsând butonul "Plan Nou" de mai sus.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // ═══════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════
  return (
    <div className="animate-fade-in" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Success overlay */}
      {showSuccess && renderSuccess()}

      {pageMode === 'list' ? (
        renderPlanList()
      ) : (
        <>
          {/* Wizard header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers style={{ width: '1.5rem', height: '1.5rem', color: '#34d399' }} />
                {isNewPlan && !editingPlan ? 'Plan Nou' : formTitle || 'Editare Plan'}
              </h1>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={handleBackToList}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
              >
                <ArrowLeft style={{ width: '0.875rem', height: '0.875rem' }} />
                Înapoi la listă
              </button>
            </div>
          </div>

          {/* Step indicator */}
          {renderStepIndicator()}

          {/* Step content */}
          {wizardStep === 1 && renderStep1()}
          {wizardStep === 2 && renderStep2()}
          {wizardStep === 3 && renderStep3()}

          {/* Bottom bar */}
          {renderBottomBar()}
        </>
      )}
    </div>
  );
};

export default AdminPanel;
