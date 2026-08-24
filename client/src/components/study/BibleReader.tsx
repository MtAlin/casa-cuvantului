import React from 'react';
import { ChevronRight, Settings, BookOpen, Bookmark, ArrowLeft, ArrowRight } from 'lucide-react';
import { StudyBook, ChapterGroup } from '../../types';
import { BibleVerse } from '../../services/api';
import { formatChapterGroup } from '../../utils/chapters';

interface BibleReaderProps {
  selectedBook: StudyBook | undefined;
  selectedGroup: ChapterGroup | undefined;
  selectedGroupIdx: number;
  currentChapter: number;
  verses: BibleVerse[];
  loadingVerses: boolean;
  bookmarkedVerses: Record<number, boolean>;
  setBookmarkedVerses: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
  handlePrevChapter: () => void;
  handleNextChapter: () => void;
  chapterCount: number;
  currentChapterInGroup: number;
  translation: string;
  setTranslation: (t: string) => void;
}

export const BibleReader: React.FC<BibleReaderProps> = ({
  selectedBook,
  selectedGroup,
  selectedGroupIdx,
  currentChapter,
  verses,
  loadingVerses,
  bookmarkedVerses,
  setBookmarkedVerses,
  handlePrevChapter,
  handleNextChapter,
  chapterCount,
  currentChapterInGroup,
  translation,
  setTranslation
}) => {
  if (!selectedGroup || !selectedBook) return null;

  return (
    <div className="bg-[#111827] border border-white/5 rounded-2xl shadow-xl flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-0 flex flex-col gap-4">
        <div className="text-xs text-gray-500 font-semibold flex items-center gap-2">
          <span>{selectedBook.bookName}</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-400">
            Grup {selectedGroupIdx + 1}: {selectedBook.bookName} {formatChapterGroup(selectedGroup)}
          </span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            {selectedBook.bookName} {currentChapter}
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#0b1120] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-300">
              <span>Versiune:</span>
              <select 
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
                className="bg-transparent font-bold text-white focus:outline-none cursor-pointer"
              >
                <option value="rccv">VDC (Română)</option>
                <option value="web">WEB (English)</option>
                <option value="kjv">KJV (English)</option>
                <option value="asv">ASV (English)</option>
              </select>
            </div>
            <button className="p-2 bg-[#0b1120] border border-white/10 rounded-lg text-gray-400 hover:text-white">
              <BookOpen className="w-4 h-4" />
            </button>
            <button className="p-2 bg-[#0b1120] border border-white/10 rounded-lg text-gray-400 hover:text-white">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-white/5 mt-2">
          <button className="pb-3 border-b-2 border-emerald-500 text-emerald-400 font-bold text-sm">Text Biblic</button>
          <button className="pb-3 border-b-2 border-transparent text-gray-400 hover:text-gray-300 font-bold text-sm transition-colors">Privire generală</button>
          <div className="ml-auto pb-3 flex items-center gap-3 text-sm text-gray-400 font-semibold">
            <span>Font</span>
            <button className="hover:text-white w-6 text-center">-</button>
            <span className="text-gray-300">16</span>
            <button className="hover:text-white w-6 text-center">+</button>
          </div>
        </div>
      </div>

      {/* Verses Content */}
      <div className="p-4 md:p-6 flex-1 overflow-y-auto custom-scrollbar text-[0.95rem] relative">
        {loadingVerses ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {verses.map((v) => {
              const isBookmarked = bookmarkedVerses[v.verse];
              return (
                <div 
                  key={v.verse} 
                  className={`flex gap-2 px-2 py-1 -mx-2 rounded-lg transition-colors group cursor-pointer items-center ${
                    isBookmarked ? 'bg-emerald-500/10' : 'hover:bg-white/5'
                  }`}
                >
                  <div className={`font-bold text-[0.7rem] w-6 flex-shrink-0 text-right ${isBookmarked ? 'text-emerald-500' : 'text-gray-500 group-hover:text-gray-400'}`}>
                    {v.verse}
                  </div>
                  <p className={`${isBookmarked ? 'text-emerald-50 font-medium' : 'text-gray-300'} flex-1 leading-snug`}>
                    {v.text}
                  </p>
                  <button 
                    onClick={() => setBookmarkedVerses(p => ({ ...p, [v.verse]: !p[v.verse] }))}
                    className={`p-1 h-fit rounded-md flex-shrink-0 transition-all ${isBookmarked ? 'opacity-100 text-emerald-500 bg-emerald-500/20' : 'opacity-0 group-hover:opacity-100 text-gray-500 hover:text-white hover:bg-white/10'}`}
                  >
                    <Bookmark className="w-3.5 h-3.5" fill={isBookmarked ? "currentColor" : "none"} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reader Footer Navigation */}
      <div className="p-4 border-t border-white/5 flex items-center justify-between bg-black/20">
        <button 
          onClick={handlePrevChapter}
          disabled={currentChapter <= selectedGroup.startChapter}
          className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg transition-colors text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" /> Capitol anterior
        </button>
        <div className="text-xs text-gray-500 font-semibold hidden sm:block">
          {selectedBook.bookName} {currentChapterInGroup} din {chapterCount}
        </div>
        <button 
          onClick={handleNextChapter}
          disabled={currentChapter >= selectedGroup.endChapter}
          className="flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-lg transition-colors bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          Capitol următor <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
