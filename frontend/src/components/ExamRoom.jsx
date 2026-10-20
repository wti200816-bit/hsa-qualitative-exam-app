import React, { useState, useEffect } from 'react';
import { Timer, AlertTriangle, ChevronLeft, ChevronRight, Flag, CheckCircle, HelpCircle, Send, ZoomIn, ZoomOut, Sun, Moon, BookOpen } from 'lucide-react';

export default function ExamRoom({ examData, onSubmitExam, onCancel }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // question_id -> chosen_option
  const [flagged, setFlagged] = useState({}); // question_id -> bool
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 minutes
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Smart Reading Tools State
  const [fontSize, setFontSize] = useState('text-sm'); // 'text-sm' | 'text-base' | 'text-lg'
  const [passageTheme, setPassageTheme] = useState('cream'); // 'cream' | 'white' | 'slate'

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

  // Theme styling for passage book
  const themeClasses = {
    cream: 'bg-[#FFFDF5] text-slate-800 border-[#F3EED9]',
    white: 'bg-white text-slate-800 border-slate-200',
    slate: 'bg-slate-100 text-slate-900 border-slate-300',
  };

  return (
    <div className="min-h-screen bg-page flex flex-col pb-12">
      {/* Top Fixed Room Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-sm">
              HSA
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                  Phòng thi chính thức
                </span>
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">• Thang điểm 50</span>
              </div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 line-clamp-1 mt-0.5">
                {examData.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* 60-Min Timer with Pulse */}
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl font-mono text-xs sm:text-sm font-extrabold shadow-sm transition-all ${
                isLowTime
                  ? 'bg-rose-50 text-rose-700 border-2 border-rose-400 animate-pulse'
                  : 'bg-indigo-50 text-indigo-900 border-2 border-indigo-200'
              }`}
            >
              <Timer className={`w-4 h-4 ${isLowTime ? 'text-rose-600' : 'text-indigo-600'}`} />
              <span>{formatTime(timeLeft)}</span>
            </div>

            {/* Duolingo-style Submit Button */}
            <button
              onClick={() => setShowSubmitModal(true)}
              className="btn-3d flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs sm:text-sm border-2 border-emerald-600 border-b-4 active:border-b-2 shadow-md shadow-emerald-500/20"
            >
              <Send className="w-4 h-4" />
              <span>Nộp bài ({answeredCount}/50)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column / Split Screen */}
        <div className="lg:col-span-9 flex flex-col space-y-4">
          {curQ.passage_content ? (
            /* Split-Screen Layout for Passage Questions */
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 bg-white rounded-3xl border-2 border-slate-200/80 shadow-soft p-5 sm:p-7 min-h-[600px]">
              {/* Left: Book Reading Pane with Smart Tools */}
              <div className={`md:col-span-6 rounded-2xl border-2 p-5 flex flex-col max-h-[640px] shadow-inner transition-colors duration-200 ${themeClasses[passageTheme]}`}>
                {/* Reading Toolbar */}
                <div className="flex items-center justify-between pb-3 border-b border-current/15 mb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                      Ngữ liệu đọc hiểu
                    </span>
                  </div>

                  {/* Font Size & Theme Tools */}
                  <div className="flex items-center gap-1.5">
                    {/* Font Size Controls */}
                    <button
                      onClick={() => setFontSize(fontSize === 'text-lg' ? 'text-base' : fontSize === 'text-base' ? 'text-sm' : 'text-sm')}
                      className="w-7 h-7 rounded-lg bg-white/70 border border-slate-300 flex items-center justify-center text-xs font-bold hover:bg-white text-slate-700 transition"
                      title="Giảm cỡ chữ"
                    >
                      A-
                    </button>
                    <button
                      onClick={() => setFontSize(fontSize === 'text-sm' ? 'text-base' : fontSize === 'text-base' ? 'text-lg' : 'text-lg')}
                      className="w-7 h-7 rounded-lg bg-white/70 border border-slate-300 flex items-center justify-center text-xs font-bold hover:bg-white text-slate-700 transition"
                      title="Tăng cỡ chữ"
                    >
                      A+
                    </button>

                    {/* Color Themes */}
                    <div className="flex items-center ml-1 pl-1 border-l border-slate-300 gap-1">
                      <button
                        onClick={() => setPassageTheme('cream')}
                        className={`w-6 h-6 rounded-md bg-[#FFFDF5] border-2 ${passageTheme === 'cream' ? 'border-indigo-600 ring-1 ring-indigo-400' : 'border-slate-300'}`}
                        title="Nền vàng kem dịu mắt"
                      />
                      <button
                        onClick={() => setPassageTheme('white')}
                        className={`w-6 h-6 rounded-md bg-white border-2 ${passageTheme === 'white' ? 'border-indigo-600 ring-1 ring-indigo-400' : 'border-slate-300'}`}
                        title="Nền trắng sáng"
                      />
                      <button
                        onClick={() => setPassageTheme('slate')}
                        className={`w-6 h-6 rounded-md bg-slate-200 border-2 ${passageTheme === 'slate' ? 'border-indigo-600 ring-1 ring-indigo-400' : 'border-slate-300'}`}
                        title="Nền xám dịu"
                      />
                    </div>
                  </div>
                </div>

                {/* Text Body with Lora Serif */}
                <div className={`flex-1 overflow-y-auto pr-2 font-serif leading-relaxed whitespace-pre-line select-text ${fontSize}`}>
                  {curQ.passage_content}
                </div>

                <div className="pt-2.5 mt-2 border-t border-current/10 text-[11px] text-slate-500 flex justify-between items-center">
                  <span>📖 {curQ.passage_content.split(/\s+/).length} từ</span>
                  <span className="italic">Chùm 5 câu hỏi</span>
                </div>
              </div>

              {/* Right: Question & Duolingo-style 3D Options */}
              <div className="md:col-span-6 flex flex-col justify-between pl-0 md:pl-2">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 rounded-xl bg-indigo-100 text-indigo-900 font-black text-xs border border-indigo-200">
                      Câu {curQ.order_num || currentIdx + 51}
                    </span>
                    <button
                      onClick={() => toggleFlag(curQ.id)}
                      className={`btn-3d flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl font-bold transition ${
                        flagged[curQ.id]
                          ? 'bg-rose-50 text-rose-700 border-2 border-rose-300 border-b-4'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-2 border-slate-200 border-b-4'
                      }`}
                    >
                      <Flag className={`w-3.5 h-3.5 ${flagged[curQ.id] ? 'fill-rose-600 text-rose-600' : ''}`} />
                      <span>{flagged[curQ.id] ? 'Đã đánh dấu' : 'Đánh dấu'}</span>
                    </button>
                  </div>

                  <p className="text-sm font-bold text-slate-900 mb-5 leading-relaxed whitespace-pre-line font-sans">
                    {curQ.content}
                  </p>

                  {/* 3D Tactile Options A, B, C, D */}
                  <div className="space-y-3">
                    {['A', 'B', 'C', 'D'].map((optKey) => {
                      const optText = curQ[`option_${optKey.toLowerCase()}`];
                      if (!optText) return null;
                      const isSelected = answers[curQ.id] === optKey;
                      return (
                        <div
                          key={optKey}
                          onClick={() => handleSelectOption(curQ.id, optKey)}
                          className={`btn-3d flex items-start gap-3.5 p-3.5 rounded-2xl border-2 border-b-4 cursor-pointer transition select-none ${
                            isSelected
                              ? 'bg-indigo-50 border-indigo-600 border-b-indigo-700 shadow-md shadow-indigo-500/10'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 font-black text-xs transition ${
                              isSelected
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-700 border border-slate-300'
                            }`}
                          >
                            {optKey}
                          </div>
                          <span className={`text-xs sm:text-sm leading-relaxed ${isSelected ? 'font-bold text-indigo-950' : 'text-slate-700 font-medium'}`}>
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
                    className="btn-3d flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 border-slate-200 border-b-4 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Câu trước</span>
                  </button>
                  <button
                    disabled={currentIdx === questions.length - 1}
                    onClick={() => setCurrentIdx((prev) => prev + 1)}
                    className="btn-3d flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold border-2 border-indigo-700 border-b-4 disabled:opacity-30 disabled:pointer-events-none shadow-md shadow-indigo-600/20"
                  >
                    <span>Câu tiếp theo</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Single Question Focused Card */
            <div className="bg-white rounded-3xl border-2 border-slate-200/80 shadow-soft p-6 sm:p-9 flex flex-col justify-between min-h-[520px]">
              <div>
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="px-3 py-1 rounded-xl bg-indigo-100 text-indigo-900 font-black text-xs border border-indigo-200">
                      Câu {curQ.order_num || currentIdx + 51}
                    </span>
                    <span className="text-xs text-slate-400 font-bold">
                      [{curQ.category || 'Tư duy định tính'}]
                    </span>
                  </div>
                  <button
                    onClick={() => toggleFlag(curQ.id)}
                    className={`btn-3d flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-xl font-bold transition ${
                      flagged[curQ.id]
                        ? 'bg-rose-50 text-rose-700 border-2 border-rose-300 border-b-4'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-2 border-slate-200 border-b-4'
                    }`}
                  >
                    <Flag className={`w-3.5 h-3.5 ${flagged[curQ.id] ? 'fill-rose-600 text-rose-600' : ''}`} />
                    <span>{flagged[curQ.id] ? 'Đã đánh dấu' : 'Đánh dấu'}</span>
                  </button>
                </div>

                <p className="text-base sm:text-lg font-bold text-slate-900 mb-7 leading-relaxed whitespace-pre-line">
                  {curQ.content}
                </p>

                {/* 3D Tactile Options */}
                <div className="space-y-3.5">
                  {['A', 'B', 'C', 'D'].map((optKey) => {
                    const optText = curQ[`option_${optKey.toLowerCase()}`];
                    if (!optText) return null;
                    const isSelected = answers[curQ.id] === optKey;
                    return (
                      <div
                        key={optKey}
                        onClick={() => handleSelectOption(curQ.id, optKey)}
                        className={`btn-3d flex items-start gap-4 p-4 rounded-2xl border-2 border-b-4 cursor-pointer transition select-none ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-600 border-b-indigo-700 shadow-md shadow-indigo-500/10'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-black text-xs transition ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-700 border border-slate-300'
                          }`}
                        >
                          {optKey}
                        </div>
                        <span className={`text-sm sm:text-base leading-relaxed ${isSelected ? 'font-bold text-indigo-950' : 'text-slate-700 font-medium'}`}>
                          {optText}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Navigation */}
              <div className="flex items-center justify-between pt-7 border-t border-slate-100 mt-8">
                <button
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx((prev) => prev - 1)}
                  className="btn-3d flex items-center gap-1.5 px-5 py-2.5 rounded-xl border-2 border-slate-200 border-b-4 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Câu trước</span>
                </button>
                <button
                  disabled={currentIdx === questions.length - 1}
                  onClick={() => setCurrentIdx((prev) => prev + 1)}
                  className="btn-3d flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold border-2 border-indigo-700 border-b-4 disabled:opacity-30 disabled:pointer-events-none shadow-md shadow-indigo-600/20"
                >
                  <span>Câu tiếp theo</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Bento-styled Palette Grid */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-3xl border-2 border-slate-200/80 shadow-soft p-5 sticky top-22">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-3.5">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900">
                Tiến độ làm bài ({answeredCount}/50)
              </h3>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 h-2.5 rounded-full mb-4 overflow-hidden p-0.5 border border-slate-200">
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${(answeredCount / 50) * 100}%` }}
              />
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-bold mb-4 pb-3.5 border-b border-slate-100 text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-indigo-600 shrink-0"></span>
                <span>Đã làm ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-rose-500 shrink-0"></span>
                <span>Đánh dấu ({Object.values(flagged).filter(Boolean).length})</span>
              </div>
            </div>

            {/* Palette Buttons 51 to 100 */}
            <div className="grid grid-cols-5 gap-2 max-h-[380px] overflow-y-auto pr-1">
              {questions.map((q, idx) => {
                const isAnswered = !!answers[q.id];
                const isCurrent = currentIdx === idx;
                const isFlagged = !!flagged[q.id];
                const order = q.order_num || idx + 51;

                let btnClass = 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-white';
                if (isCurrent) {
                  btnClass = 'ring-3 ring-amber-400 font-black bg-amber-50 border-amber-500 text-amber-900 scale-105 z-10';
                } else if (isFlagged) {
                  btnClass = 'bg-rose-50 border-rose-400 text-rose-800 font-bold';
                } else if (isAnswered) {
                  btnClass = 'bg-indigo-600 text-white border-indigo-700 font-bold shadow-2xs';
                }

                return (
                  <button
                    key={q.id || idx}
                    onClick={() => setCurrentIdx(idx)}
                    className={`h-9 rounded-xl border text-xs font-bold flex items-center justify-center transition relative ${btnClass}`}
                  >
                    <span>{order}</span>
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white"></span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Anti-cheat badge */}
            <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-ping"></span>
              <span className="font-semibold text-slate-600">Phòng thi được bảo mật tuyệt đối</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal before Submit */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-7 shadow-2xl border-2 border-slate-200">
            <h3 className="font-black text-xl text-slate-900 mb-2">
              Xác nhận nộp bài thi?
            </h3>
            <p className="text-sm text-slate-600 mb-5 leading-relaxed">
              Bạn đã hoàn thành <strong className="text-indigo-600 font-black">{answeredCount}/50</strong> câu hỏi.
              {unansweredCount > 0 && (
                <span className="block text-rose-600 font-bold mt-2 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                  ⚠️ Còn {unansweredCount} câu bạn chưa chọn đáp án!
                </span>
              )}
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="btn-3d px-5 py-2.5 rounded-2xl text-slate-700 hover:bg-slate-100 text-sm font-bold transition border-2 border-slate-200"
              >
                Tiếp tục làm bài
              </button>
              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  handleFinalSubmit();
                }}
                className="btn-3d px-6 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-black border-2 border-emerald-600 border-b-4 shadow-lg shadow-emerald-500/25 transition"
              >
                Nộp bài ngay 🎯
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
