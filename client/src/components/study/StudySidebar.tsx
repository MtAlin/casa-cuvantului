import React from 'react';
import { Search, Filter, BookOpen, ChevronRight, ChevronDown, CheckCircle, Circle, Book, ArrowRight } from 'lucide-react';
import { StudyPlan } from '../../types';
import { formatChapterGroup } from '../../utils/chapters';

interface StudySidebarProps {
  plan: StudyPlan;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  expandedBooks: Record<number, boolean>;
  toggleBook: (bIdx: number) => void;
  selectedBookIdx: number;
  selectedGroupIdx: number;
  handleGroupSelect: (bIdx: number, gIdx: number) => void;
  completedGroups: Record<string, boolean>;
}

export const StudySidebar: React.FC<StudySidebarProps> = ({
  plan,
  searchQuery,
  setSearchQuery,
  expandedBooks,
  toggleBook,
  selectedBookIdx,
  selectedGroupIdx,
  handleGroupSelect,
  completedGroups
}) => {
  // Simple progress calculation
  const totalGroups = plan.books.reduce((sum, b) => sum + b.chapterGroups.length, 0);
  const completedCount = Object.keys(completedGroups).length;
  const progressPercent = totalGroups > 0 ? Math.round((completedCount / totalGroups) * 100) : 0;

  const oldTestamentBooks = ['Geneza', 'Exodul', 'Leviticul', 'Numeri', 'Deuteronom', 'Iosua', 'Judecători', 'Rut', '1 Samuel', '2 Samuel', '1 Împărați', '2 Împărați', '1 Cronici', '2 Cronici', 'Ezra', 'Neemia', 'Estera', 'Iov', 'Psalmi', 'Proverbe', 'Eclesiastul', 'Cântarea Cântărilor', 'Isaia', 'Ieremia', 'Plângerile lui Ieremia', 'Ezechiel', 'Daniel', 'Osea', 'Ioel', 'Amos', 'Obadia', 'Iona', 'Mica', 'Naum', 'Habacuc', 'Țefania', 'Hagai', 'Zaharia', 'Maleahi'];

  const grouped = [
    { name: 'Vechiul Testament', books: plan.books.map((b, i) => ({ ...b, idx: i })).filter(b => oldTestamentBooks.includes(b.bookName)) },
    { name: 'Noul Testament', books: plan.books.map((b, i) => ({ ...b, idx: i })).filter(b => !oldTestamentBooks.includes(b.bookName)) }
  ];

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Plan Info Card */}
      <div className="bg-[#111827] border border-white/5 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white">{plan.title}</h1>
          <span className="text-[0.65rem] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-full">
            Plan Activ
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Progres plan</span>
            <span className="text-gray-300 font-semibold">{progressPercent}%</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      {/* Tree Navigation */}
      <div className="bg-[#111827] border border-white/5 rounded-2xl flex-1 shadow-xl flex flex-col overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <h2 className="text-sm font-bold text-gray-300 mb-4">Structura Plan</h2>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="text" 
                placeholder="Caută în plan..." 
                className="w-full bg-[#0b1120] border border-white/5 rounded-lg py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-emerald-500/50 text-gray-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="p-2 bg-[#0b1120] border border-white/5 rounded-lg text-gray-400 hover:text-white">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
          {grouped.map(group => {
            if (group.books.length === 0) return null;
            return (
              <div key={group.name} className="flex flex-col space-y-1">
                <div className="flex items-center justify-between px-2 py-1 mb-1">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-300">
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                    <Book className="w-4 h-4 text-gray-500" />
                    {group.name}
                  </div>
                  <span className="text-xs text-gray-500 font-semibold">{group.books.length}</span>
                </div>
                
                <div className="pl-2 flex flex-col space-y-1 border-l border-white/5 ml-3">
                  {group.books.map(book => {
                    const bIdx = book.idx;
                    const isExpanded = expandedBooks[bIdx];
                    return (
                      <div key={bIdx} className="flex flex-col">
                        <button 
                          onClick={() => toggleBook(bIdx)}
                          className="w-full flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors text-sm"
                        >
                          <div className="flex items-center gap-2 text-gray-200 font-semibold">
                            {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                            <BookOpen className="w-4 h-4 text-emerald-500/70" />
                            {book.bookName}
                          </div>
                          <span className="text-xs text-gray-500 font-semibold bg-white/5 px-2 py-0.5 rounded-md">
                            {book.chapterGroups.length}
                          </span>
                        </button>
                        
                        {isExpanded && (
                          <div className="mt-1 ml-3 pl-3 border-l border-white/5 space-y-1">
                            {book.chapterGroups.map((g, gIdx) => {
                              const isSelected = selectedBookIdx === bIdx && selectedGroupIdx === gIdx;
                              const isCompleted = completedGroups[g._id || g.title];
                              return (
                                <button 
                                  key={g._id}
                                  onClick={() => handleGroupSelect(bIdx, gIdx)}
                                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                                    isSelected 
                                      ? 'bg-emerald-500/10 border border-emerald-500/20 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]' 
                                      : 'hover:bg-white/5 border border-transparent'
                                  }`}
                                >
                                  <div className="flex items-center gap-3 text-left">
                                    <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-emerald-400 shadow-[0_0_5px_#34d399]' : 'bg-transparent'}`} />
                                    <div>
                                      <div className={`text-xs font-bold ${isSelected ? 'text-emerald-400' : 'text-gray-300'}`}>
                                        Grup {gIdx + 1}: {book.bookName} {formatChapterGroup(g)}
                                      </div>
                                      <div className="text-[0.65rem] text-gray-500 mt-0.5">
                                        Capitole: {formatChapterGroup(g)}
                                      </div>
                                    </div>
                                  </div>
                                  {isCompleted ? (
                                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                                  ) : (
                                    <Circle className="w-4 h-4 text-gray-600" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom block */}
        <div className="p-4 border-t border-white/5 bg-gradient-to-t from-black/20 to-transparent">
          <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-gray-200">Deschide Biblia</div>
                <div className="text-[0.65rem] text-gray-500">Citește și studiază pasajele</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
};
