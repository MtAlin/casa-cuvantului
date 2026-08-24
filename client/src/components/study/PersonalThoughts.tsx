import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, TrendingUp } from 'lucide-react';
import { StudyBook, ChapterGroup } from '../../types';
import { formatChapterGroup } from '../../utils/chapters';

interface PersonalThoughtsProps {
  selectedBook: StudyBook | undefined;
  selectedGroup: ChapterGroup | undefined;
  selectedGroupIdx: number;
  chapterCount: number;
  currentChapterInGroup: number;
  initialNotes: string;
  onSaveNotes: (notes: string) => void;
}

export const PersonalThoughts: React.FC<PersonalThoughtsProps> = ({
  selectedBook,
  selectedGroup,
  selectedGroupIdx,
  chapterCount,
  currentChapterInGroup,
  initialNotes,
  onSaveNotes
}) => {
  const [localNotes, setLocalNotes] = useState(initialNotes);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update local notes if initialNotes changes from outside (e.g., loading new group)
  useEffect(() => {
    setLocalNotes(initialNotes);
  }, [initialNotes]);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setLocalNotes(val);
    setSaveStatus('saving');

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsSaving(true);
      onSaveNotes(val);
      setSaveStatus('saved');
      setIsSaving(false);
      
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    }, 1000); // 1 second debounce
  };

  if (!selectedGroup || !selectedBook) return null;

  return (
    <div className="flex-shrink-0 flex flex-col gap-6">
      
      {/* Notes */}
      <div className="bg-[#111827] border border-white/5 rounded-2xl shadow-xl flex flex-col relative">
        <div className="p-5 flex justify-between items-start">
          <div>
            <h3 className="font-bold text-white mb-1">Gândurile mele</h3>
            <p className="text-[0.65rem] text-gray-500">Notează aici aplicațiile personale, reflecții și gândurile tale.</p>
          </div>
        </div>
        <div className="p-5 pt-0">
          <textarea
            value={localNotes}
            onChange={handleNotesChange}
            placeholder="Scrie gândurile tale aici..."
            className="w-full bg-[#0b1120] border border-white/5 rounded-xl p-4 min-h-[120px] text-sm text-gray-300 placeholder-gray-600 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all resize-y custom-scrollbar"
          />
          <div className="mt-1 flex justify-between items-center text-[0.65rem] text-gray-600 font-semibold px-2">
            <span>{localNotes.length} / 3000 caractere</span>
            {saveStatus === 'saving' && <span className="text-emerald-500/70 animate-pulse">Se salvează...</span>}
            {saveStatus === 'saved' && <span className="text-emerald-500">Salvat</span>}
          </div>
        </div>
      </div>
      
      {/* Key Verse Box */}
      <div className="bg-[#111827] border border-white/5 rounded-2xl shadow-xl p-6 relative overflow-hidden">
        <h3 className="font-bold text-white mb-3 flex items-center gap-2">
          Verset cheie
        </h3>
        <p className="text-sm font-medium italic text-gray-300 leading-relaxed">
          „Ferice de cel ce citește și de cei ce aud cuvintele acestei prorociri și păzesc lucrurile scrise în ea...”
        </p>
        <div className="mt-4 text-xs font-bold text-emerald-400">
          Apocalipsa 1:3
        </div>
      </div>

      {/* Study Tips */}
      <div className="bg-[#111827] border border-white/5 rounded-2xl shadow-xl p-6">
        <h3 className="font-bold text-white mb-4">Sfaturi de studiu</h3>
        <ul className="space-y-3 text-[0.8rem] font-medium text-gray-300">
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Citește capitolele în Biblia ta</li>
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Răspunde la întrebări cu atenție</li>
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Notează aplicațiile personale</li>
          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Roagă-te pentru înțelegere</li>
        </ul>
      </div>

      {/* Current Session */}
      <div className="bg-[#111827] border border-white/5 rounded-2xl shadow-xl p-6">
        <h4 className="text-sm font-bold text-white mb-1">Sesiunea curentă</h4>
        <div className="text-xs text-gray-400 mb-4">
          Grup {selectedGroupIdx + 1}: {selectedBook.bookName} {formatChapterGroup(selectedGroup)}
        </div>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-500" 
              style={{ width: `${(currentChapterInGroup / chapterCount) * 100}%` }}
            />
          </div>
          <div className="text-[0.65rem] text-gray-500 whitespace-nowrap">
            Capitolul {currentChapterInGroup} din {chapterCount}
          </div>
        </div>
        
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-1">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <div className="text-sm font-bold text-white mb-0.5">Continuă studiul!</div>
            <div className="text-xs text-gray-400 leading-relaxed">Rămâi consecvent în căutarea Cuvântului!</div>
          </div>
        </div>
      </div>

    </div>
  );
};
