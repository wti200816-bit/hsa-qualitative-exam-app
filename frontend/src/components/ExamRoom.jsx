import React, { useState, useEffect } from 'react';
import { Timer, AlertTriangle, ChevronLeft, ChevronRight, Bookmark, CheckCircle, HelpCircle, Send } from 'lucide-react';

export default function ExamRoom({ examData, onSubmitExam, onCancel }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // question_id -> chosen_option
  const [flagged, setFlagged] = useState({}); // question_id -> bool
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 minutes
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const questions = examData.questions || [];
  const curQ = questions[currentIdx] || {};

  // 60-Minute Countdown Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      handleFinalSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (qId, option) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: option
    }));
  };

  const toggleFlag = (qId) => {
    setFlagged((prev) => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  const handleFinalSubmit = () => {
    const timeSpent = 60 * 60 - timeLeft;
    onSubmitExam({
      exam_id: examData.exam_id,
      exam_title: examData.title,
      time_spent_seconds: timeSpent,
      answers: answers
    });
  };

  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;

  const isLowTime = timeLeft <= 5 * 60; // < 5 mins

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Fixed Room Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-brand-700 uppercase tracking-wider bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
              Phòng thi HSA Chính Thức
            </span>
            <h2 className="text-base font-bold text-slate-900 line-clamp-1 mt-0.5">
              {examData.title}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Countdown Timer */}
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-sm font-bold shadow-sm transition ${
                isLowTime
                  ? 'bg-rose-50 text-rose-700 border border-rose-300 animate-pulse'
                  : 'bg-brand-50 text-brand-900 border border-brand-200'
              }`}
            >
              <Timer className={`w-4 h-4 ${isLowTime ? 'text-rose-600' : 'text-brand-600'}`} />
              <span>{formatTime(timeLeft)}</span>
            </div>

            {/* Submit Button */}
            <button
              onClick={() => setShowSubmitModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold text-xs sm:text-sm shadow-md shadow-emerald-700/20 transition"
            >
              <Send className="w-4 h-4" />
              <span>Nộp bài ({answeredCount}/50)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Middle: Question or Split Screen */}
        <div className="lg:col-span-9 flex flex-col space-y-4">
          {curQ.passage_content ? (
            /* Split-Screen Layout for Passage Questions */
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 min-h-[580px]">
              {/* Left Column: Pinned Passage */}
              <div className="md:col-span-6 bg-slate-50/70 border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col max-h-[640px]">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                  <span className="text-xs font-bold text-brand-800 uppercase tracking-wide">
                    {curQ.passage_title || 'Ngữ liệu Văn bản'}
                  </span>
                  <span className="text-[11px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {curQ.passage_content.split(/\s+/).length} từ
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto pr-2 text-slate-700 text-sm leading-relaxed whitespace-pre-line select-text font-serif">
                  {curQ.passage_content}
                </div>
              </div>

              {/* Right Column: Question Content & Options */}
              <div className="md:col-span-6 flex flex-col justify-between pl-0 md:pl-2 pt-2 md:pt-0">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-lg bg-brand-100 text-brand-900 font-bold text-xs">
                      Câu {curQ.order_num || currentIdx + 51}
                    </span>
                    <button
                      onClick={() => toggleFlag(curQ.id)}
                      className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium transition ${
                        flagged[curQ.id]
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${flagged[curQ.id] ? 'fill-amber-600 text-amber-600' : ''}`} />
                      <span>{flagged[curQ.id] ? 'Đã đánh dấu' : 'Đánh dấu'}</span>
                    </button>
                  </div>

                  <p className="text-sm font-semibold text-slate-900 mb-4 leading-relaxed whitespace-pre-line">
                    {curQ.content}
                  </p>

                  {/* Options A, B, C, D */}
                  <div className="space-y-2.5">
                    {['A', 'B', 'C', 'D'].map((optKey) => {
                      const optText = curQ[`option_${optKey.toLowerCase()}`];
                      if (!optText) return null;
                      const isSelected = answers[curQ.id] === optKey;
                      return (
                        <div
                          key={optKey}
                          onClick={() => handleSelectOption(curQ.id, optKey)}
                          className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                            isSelected
                              ? 'bg-brand-50 border-brand-500 shadow-sm'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-xs mt-0.5 ${
                              isSelected
                                ? 'bg-brand-600 text-white'
                                : 'bg-slate-100 text-slate-600 border border-slate-300'
                            }`}
                          >
                            {optKey}
                          </div>
                          <span className={`text-xs sm:text-sm leading-relaxed ${isSelected ? 'font-medium text-brand-950' : 'text-slate-700'}`}>
                            {optText}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Navigation */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6">
                  <button
                    disabled={currentIdx === 0}
                    onClick={() => setCurrentIdx((prev) => prev - 1)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Câu trước</span>
                  </button>
                  <button
                    disabled={currentIdx === questions.length - 1}
                    onClick={() => setCurrentIdx((prev) => prev + 1)}
                    className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-brand-900 text-white text-xs font-semibold hover:bg-brand-800 disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <span>Câu tiếp theo</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Single Question Focused Academic Card */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col justify-between min-h-[500px]">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-lg bg-brand-100 text-brand-900 font-bold text-xs">
                      Câu {curQ.order_num || currentIdx + 51}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      [{curQ.category || 'Tư duy định tính'}]
                    </span>
                  </div>
                  <button
                    onClick={() => toggleFlag(curQ.id)}
                    className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium transition ${
                      flagged[curQ.id]
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${flagged[curQ.id] ? 'fill-amber-600 text-amber-600' : ''}`} />
                    <span>{flagged[curQ.id] ? 'Đã đánh dấu' : 'Đánh dấu'}</span>
                  </button>
                </div>

                <p className="text-base font-semibold text-slate-900 mb-6 leading-relaxed whitespace-pre-line">
                  {curQ.content}
                </p>

                {/* Options A, B, C, D */}
                <div className="space-y-3">
                  {['A', 'B', 'C', 'D'].map((optKey) => {
                    const optText = curQ[`option_${optKey.toLowerCase()}`];
                    if (!optText) return null;
                    const isSelected = answers[curQ.id] === optKey;
                    return (
                      <div
                        key={optKey}
                        onClick={() => handleSelectOption(curQ.id, optKey)}
                        className={`flex items-start gap-3.5 p-3.5 rounded-xl border cursor-pointer transition ${
                          isSelected
                            ? 'bg-brand-50 border-brand-500 shadow-sm ring-1 ring-brand-500'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-bold text-xs mt-0.5 ${
                            isSelected
                              ? 'bg-brand-600 text-white'
                              : 'bg-slate-100 text-slate-600 border border-slate-300'
                          }`}
                        >
                          {optKey}
                        </div>
                        <span className={`text-sm leading-relaxed ${isSelected ? 'font-medium text-brand-950' : 'text-slate-700'}`}>
                          {optText}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Navigation */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-8">
                <button
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx((prev) => prev - 1)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Câu trước</span>
                </button>
                <button
                  disabled={currentIdx === questions.length - 1}
                  onClick={() => setCurrentIdx((prev) => prev + 1)}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-brand-900 text-white text-xs font-semibold hover:bg-brand-800 disabled:opacity-30 disabled:pointer-events-none shadow-sm"
                >
                  <span>Câu tiếp theo</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Palette Grid of 50 Questions */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sticky top-20">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                Bảng câu hỏi ({answeredCount}/50)
              </h3>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] mb-3 pb-3 border-b border-slate-100 text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-brand-600 shrink-0"></span>
                <span>Đã trả lời ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-400 shrink-0"></span>
                <span>Đánh dấu ({Object.values(flagged).filter(Boolean).length})</span>
              </div>
            </div>

            {/* Palette Buttons 51 to 100 */}
            <div className="grid grid-cols-5 gap-2 max-h-[400px] overflow-y-auto pr-1">
              {questions.map((q, idx) => {
                const isAnswered = !!answers[q.id];
                const isCurrent = currentIdx === idx;
                const isFlagged = !!flagged[q.id];
                const order = q.order_num || idx + 51;

                let btnClass = 'bg-white border-slate-200 text-slate-700 hover:border-slate-300';
                if (isCurrent) {
                  btnClass = 'ring-2 ring-brand-900 font-bold bg-brand-50 border-brand-900 text-brand-900';
                } else if (isFlagged) {
                  btnClass = 'bg-amber-100 border-amber-300 text-amber-900 font-semibold';
                } else if (isAnswered) {
                  btnClass = 'bg-brand-600 text-white border-transparent font-medium';
                }

                return (
                  <button
                    key={q.id || idx}
                    onClick={() => setCurrentIdx(idx)}
                    className={`h-8 rounded-lg border text-xs flex items-center justify-center transition relative ${btnClass}`}
                  >
                    <span>{order}</span>
                    {isFlagged && !isAnswered && (
                      <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Anti-cheat badge */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-ping"></span>
              <span>Hệ thống giám sát phòng thi đang bật (AI Tutor bị khóa)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal before Submit */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-lg text-slate-900 mb-2">
              Xác nhận nộp bài thi?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed">
              Bạn đã trả lời <strong className="text-brand-700">{answeredCount}/50</strong> câu hỏi.
              {unansweredCount > 0 && (
                <span className="block text-amber-600 font-medium mt-1">
                  ⚠️ Còn {unansweredCount} câu bạn chưa chọn đáp án!
                </span>
              )}
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs sm:text-sm font-semibold transition"
              >
                Tiếp tục làm bài
              </button>
              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  handleFinalSubmit();
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-700/20 transition"
              >
                Nộp bài ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
