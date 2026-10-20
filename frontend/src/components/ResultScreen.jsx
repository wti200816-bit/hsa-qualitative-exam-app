import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, CheckCircle2, XCircle, Timer, RotateCcw, Bot, BookOpen, Filter } from 'lucide-react';

export default function ResultScreen({ resultData, onRetakeExam, onViewLeaderboard, onOpenAiChat }) {
  const [filter, setFilter] = useState('all'); // 'all' | 'correct' | 'incorrect'

  const score = resultData.score || 0;
  const total = resultData.total_questions || 50;
  const percentage = Math.round((score / total) * 100);
  const timeSpent = resultData.time_spent_seconds || 0;
  const results = resultData.results || [];

  const m = Math.floor(timeSpent / 60);
  const s = timeSpent % 60;
  const formattedTime = `${m} phút ${s} giây`;

  useEffect(() => {
    if (percentage >= 70) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [percentage]);

  const filteredResults = results.filter((r) => {
    if (filter === 'correct') return r.is_correct;
    if (filter === 'incorrect') return !r.is_correct;
    return true;
  });

  const correctCount = results.filter((r) => r.is_correct).length;
  const incorrectCount = results.length - correctCount;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Score Summary Card */}
      <div className="bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-brand-900/10 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none blur-2xl"></div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
          <div className="text-center sm:text-left">
            <span className="text-xs uppercase tracking-wider font-bold bg-white/10 px-3 py-1 rounded-full text-brand-200 border border-white/10">
              Kết quả Bài thi Chuẩn hóa HSA
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">
              {percentage >= 80 ? 'Xuất sắc! Thủ khoa tương lai 🎉' : percentage >= 50 ? 'Làm bài rất tốt! Tiếp tục cố gắng 💪' : 'Cần rèn luyện thêm về lý thuyết 📚'}
            </h1>
            <p className="text-xs sm:text-sm text-brand-200 mt-1 flex items-center justify-center sm:justify-start gap-3">
              <span className="flex items-center gap-1">
                <Timer className="w-4 h-4" /> Thời gian: {formattedTime}
              </span>
              <span>•</span>
              <span>Độ chính xác: {percentage}%</span>
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0">
            <div className="text-center px-3">
              <div className="text-3xl sm:text-4xl font-extrabold text-amber-300">
                {score}
                <span className="text-lg font-medium text-white/70">/{total}</span>
              </div>
              <div className="text-[11px] text-brand-200 font-semibold uppercase tracking-wider mt-0.5">
                Điểm Đạt Được
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap items-center justify-center sm:justify-start gap-3">
          <button
            onClick={onRetakeExam}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-brand-900 hover:bg-brand-50 font-bold text-xs sm:text-sm shadow-md transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Làm đề thi thử mới</span>
          </button>
          <button
            onClick={onViewLeaderboard}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600/60 hover:bg-brand-600 border border-white/20 text-white font-bold text-xs sm:text-sm transition"
          >
            <Award className="w-4 h-4" />
            <span>Xem Bảng Vinh Danh</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-brand-700" />
          <span>Chi tiết Lời giải & Đáp án</span>
        </h2>
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả ({results.length})
          </button>
          <button
            onClick={() => setFilter('correct')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition ${
              filter === 'correct' ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Đúng ({correctCount})</span>
          </button>
          <button
            onClick={() => setFilter('incorrect')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition ${
              filter === 'incorrect' ? 'bg-rose-600 text-white shadow-sm' : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Sai ({incorrectCount})</span>
          </button>
        </div>
      </div>

      {/* Questions Review List */}
      <div className="space-y-4">
        {filteredResults.map((r, idx) => (
          <div
            key={r.question_id || idx}
            className={`bg-white rounded-2xl border p-5 sm:p-6 shadow-sm transition ${
              r.is_correct ? 'border-emerald-200' : 'border-rose-200'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    r.is_correct ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  Câu {idx + 1}
                </span>
                <span className="text-xs text-slate-500 font-medium">[{r.category}]</span>
              </div>
              <button
                onClick={() =>
                  onOpenAiChat({
                    ...r,
                    user_answer: r.user_choice
                  })
                }
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-800 border border-brand-200 transition"
              >
                <Bot className="w-3.5 h-3.5 text-brand-600" />
                <span>Hỏi AI câu này</span>
              </button>
            </div>

            {/* Passage quote if present */}
            {r.passage_content && (
              <div className="mb-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 italic font-serif line-clamp-3">
                "{r.passage_content}"
              </div>
            )}

            <p className="text-sm font-semibold text-slate-900 mb-4 whitespace-pre-line leading-relaxed">
              {r.content}
            </p>

            {/* 4 Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4 text-xs sm:text-sm">
              {['A', 'B', 'C', 'D'].map((optKey) => {
                const optText = r[`option_${optKey.toLowerCase()}`];
                if (!optText) return null;
                const isSelected = r.user_choice === optKey;
                const isCorrect = r.correct_answer === optKey;

                let badgeClass = 'bg-slate-50 border-slate-200 text-slate-700';
                if (isCorrect) {
                  badgeClass = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold ring-1 ring-emerald-500';
                } else if (isSelected && !isCorrect) {
                  badgeClass = 'bg-rose-50 border-rose-500 text-rose-950 line-through';
                }

                return (
                  <div key={optKey} className={`flex items-start gap-2.5 p-2.5 rounded-xl border ${badgeClass}`}>
                    <span className="font-bold">{optKey}.</span>
                    <span>{optText}</span>
                  </div>
                );
              })}
            </div>

            {/* Explanation box */}
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs sm:text-sm text-slate-800 leading-relaxed">
              <div className="font-bold text-emerald-800 mb-1">
                ✓ Đáp án đúng: {r.correct_answer}
                {r.user_choice && r.user_choice !== r.correct_answer && (
                  <span className="text-rose-700 font-normal ml-2">
                    (Bạn đã chọn nhầm {r.user_choice})
                  </span>
                )}
              </div>
              <p className="text-slate-700 whitespace-pre-line">
                {r.explanation || 'Chưa có lời giải chi tiết.'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
