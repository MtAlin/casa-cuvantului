import React from 'react';
import { RotateCcw, Save } from 'lucide-react';
import { ChapterGroup } from '../../types';

interface ReflectionQuestionsProps {
  selectedGroup: ChapterGroup | undefined;
  answers: Record<string, string>;
  handleAnswerChange: (questionId: string, value: string) => void;
  resetAnswers: () => void;
  handleSaveAnswers: () => void;
  saving: boolean;
}

export const ReflectionQuestions: React.FC<ReflectionQuestionsProps> = ({
  selectedGroup,
  answers,
  handleAnswerChange,
  resetAnswers,
  handleSaveAnswers,
  saving
}) => {
  if (!selectedGroup) return null;

  return (
    <div className="bg-[#111827] border border-white/5 rounded-2xl shadow-xl flex flex-col flex-shrink-0">
      <div className="p-5 border-b border-white/5 flex justify-between items-center">
        <h3 className="font-bold text-white">Întrebări pentru reflecție</h3>
        <span className="text-[0.65rem] font-bold bg-white/10 text-gray-300 px-2.5 py-1 rounded-md">
          {selectedGroup.questions.length} Întrebări
        </span>
      </div>
      
      <div className="p-6 space-y-8">
        {selectedGroup.questions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 italic text-sm">Nu există întrebări pentru acest grup.</div>
        ) : (
          selectedGroup.questions.map((q, qIndex) => (
            <div key={q._id} className="flex flex-col gap-3">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {qIndex + 1}
                </div>
                <p className="text-sm font-medium text-gray-200 pt-0.5 leading-relaxed">{q.text}</p>
              </div>
              <div className="mt-2">
                <textarea
                  value={answers[q._id] || ''}
                  onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                  placeholder="Scrie răspunsul tău aici..."
                  className="w-full bg-[#0b1120] border border-white/5 rounded-xl p-4 min-h-[100px] text-sm text-gray-300 placeholder-gray-600 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all resize-y custom-scrollbar"
                />
                <div className="mt-1 flex justify-between items-center px-2">
                  <span className="text-[0.65rem] text-gray-600 font-semibold">
                    {(answers[q._id] || '').length} / 2000 caractere
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="p-5 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
        <button 
          onClick={resetAnswers}
          className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
        >
          <RotateCcw className="w-4 h-4" /> Resetează răspunsurile
        </button>
        <button 
          onClick={handleSaveAnswers}
          disabled={saving}
          className="flex items-center gap-2 text-xs font-bold bg-[#0b1120] hover:bg-white/5 border border-emerald-500/30 text-emerald-400 px-5 py-2.5 rounded-lg transition-colors disabled:opacity-70"
        >
          {saving ? <div className="animate-spin w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full" /> : <Save className="w-4 h-4" />}
          Salvează răspunsurile
        </button>
      </div>
    </div>
  );
};
