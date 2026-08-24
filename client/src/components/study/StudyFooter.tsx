import React from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { ChapterGroup } from '../../types';

interface StudyFooterProps {
  selectedGroup: ChapterGroup | undefined;
  completedGroups: Record<string, boolean>;
  toggleGroupCompleted: () => void;
  currentChapter: number;
  handleNextChapter: () => void;
  handleNextGroup: () => void;
  isLastGroup?: boolean;
  onFinishPlan?: () => void;
}

export const StudyFooter: React.FC<StudyFooterProps> = ({
  selectedGroup,
  completedGroups,
  toggleGroupCompleted,
  currentChapter,
  handleNextChapter,
  handleNextGroup,
  isLastGroup = false,
  onFinishPlan
}) => {
  const isCompleted = completedGroups[selectedGroup?._id || selectedGroup?.title || ''] || false;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0b1120] border-t border-white/5 z-50 p-4">
      <div className="max-w-[1800px] mx-auto flex items-center justify-end gap-6">
        {isCompleted && !isLastGroup && (
          <span className="text-sm font-semibold text-emerald-400 animate-fade-in mr-auto pl-4">
            Ai terminat acest grup! Vrei să continui cu următorul?
          </span>
        )}
        <label className="flex items-center gap-2 cursor-pointer group">
          <span className="text-sm font-semibold text-gray-300 select-none">Marchează ca finalizat</span>
          <input 
            type="checkbox" 
            className="hidden" 
            checked={isCompleted}
            onChange={toggleGroupCompleted}
          />
          <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
            isCompleted 
              ? 'bg-emerald-500 border-emerald-500 text-white' 
              : 'border-gray-600 text-transparent group-hover:border-gray-400'
          }`}>
            <Check className="w-3.5 h-3.5" />
          </div>
        </label>
        {isCompleted ? (
          isLastGroup ? (
            <button 
              onClick={onFinishPlan || handleNextGroup}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-6 py-2.5 text-sm shadow-[0_0_15px_rgba(255,255,255,0.05)] rounded-lg font-bold text-white transition-colors border border-emerald-500/30"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
              Ai terminat tot planul!
            </button>
          ) : (
            <button 
              onClick={handleNextGroup}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 px-6 py-2.5 text-sm shadow-[0_0_15px_rgba(16,185,129,0.2)] rounded-lg font-bold text-white transition-colors"
            >
              Următorul grup <ArrowRight className="w-4 h-4" />
            </button>
          )
        ) : (
          <button 
            onClick={handleNextChapter}
            disabled={currentChapter >= (selectedGroup?.endChapter || 1)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 px-6 py-2.5 disabled:opacity-50 text-sm shadow-[0_0_15px_rgba(16,185,129,0.2)] rounded-lg font-bold text-white transition-colors"
          >
            Următorul capitol <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
