import React, { useState, useEffect } from 'react';
import { BookOpen, Check, X, Eye, EyeOff, Bot, ChevronLeft, ChevronRight, Sparkles, RefreshCw } from 'lucide-react';

export default function PracticeRoom({ apiBase, onOpenAiChat }) {
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState('TV1');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showExplanation, setShowExplanation] = useState({});

  // Load categories
  useEffect(() => {
    fetch(`${apiBase}/api/practice/categories`)
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        if (data.length > 0) {
          setSelectedCat(data[0].category);
        }
      })
      .catch((err) => console.error(err));
  }, [apiBase]);

  // Load questions when category changes
  useEffect(() => {
    if (!selectedCat) return;
    setLoading(true);
    fetch(`${apiBase}/api/practice/questions?category=${selectedCat}&limit=15`)
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data.questions || []);
        setCurrentIdx(0);
        setUserAnswers({});
        setShowExplanation({});
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedCat, apiBase]);

  const curQ = questions[currentIdx] || {};

  const handleSelectOption = (opt) => {
    setUserAnswers((prev) => ({
      ...prev,
      [curQ.id]: opt
    }));
  };

  const toggleSolution = (qId) => {
    setShowExplanation((prev) => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  const handleAskAi = () => {
    if (!curQ.id) return;
    onOpenAiChat({
      ...curQ,
      user_answer: userAnswers[curQ.id]
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Category Pills Header */}
      <div className="mb-6">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mb-3 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-brand-700" />
          <span>Luyện tập theo Dạng bài HSA</span>
        </h2>
        <div className="flex flex-wrap gap-2.5">
          {categories.map((c) => {
            const isSelected = selectedCat === c.category;
            return (
              <button
                key={c.category}
                onClick={() => setSelectedCat(c.category)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                  isSelected
                    ? 'bg-brand-900 text-white shadow-md shadow-brand-900/20'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-brand-50 hover:border-brand-300'
                }`}
              >
                <span>{c.title}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {c.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
          <RefreshCw className="w-8 h-8 animate-spin text-brand-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-600">Đang tải ngân hàng câu hỏi chuẩn hóa...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          Chưa có câu hỏi nào thuộc dạng bài này.
        </div>
      ) : (
        <div className="space-y-4">
          {/* Main Question Workspace */}
          {curQ.passage_content ? (
            /* Split Screen for Reading Cluster */
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 min-h-[580px]">
              {/* Left: Passage */}
              <div className="md:col-span-6 bg-slate-50/70 border border-slate-200 rounded-xl p-5 flex flex-col max-h-[640px]">
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

              {/* Right: Question, Options & Solution */}
              <div className="md:col-span-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-lg bg-brand-100 text-brand-900 font-bold text-xs">
                      Câu hỏi {currentIdx + 1}/{questions.length}
                    </span>
                    <button
                      onClick={handleAskAi}
                      className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-800 to-brand-900 hover:from-brand-900 hover:to-brand-950 text-white shadow-sm transition"
                    >
                      <Bot className="w-3.5 h-3.5 text-brand-300" />
                      <span>✨ Hỏi Gia sư AI câu này</span>
                    </button>
                  </div>

                  <p className="text-sm font-semibold text-slate-900 mb-4 leading-relaxed whitespace-pre-line">
                    {curQ.content}
                  </p>

                  {/* Options */}
                  <div className="space-y-2.5">
                    {['A', 'B', 'C', 'D'].map((optKey) => {
                      const optText = curQ[`option_${optKey.toLowerCase()}`];
                      if (!optText) return null;
                      const isSelected = userAnswers[curQ.id] === optKey;
                      const isCorrect = curQ.correct_answer === optKey;
                      const hasAnswered = !!userAnswers[curQ.id];

                      let itemClass = 'bg-white border-slate-200 hover:border-slate-300';
                      if (hasAnswered && isCorrect) {
                        itemClass = 'bg-emerald-50 border-emerald-500 text-emerald-950';
                      } else if (hasAnswered && isSelected && !isCorrect) {
                        itemClass = 'bg-rose-50 border-rose-500 text-rose-950';
                      } else if (isSelected) {
                        itemClass = 'bg-brand-50 border-brand-500';
                      }

                      return (
                        <div
                          key={optKey}
                          onClick={() => handleSelectOption(optKey)}
                          className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${itemClass}`}
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
                          <span className="text-xs sm:text-sm leading-relaxed flex-1">
                            {optText}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Show Solution Section */}
                  {userAnswers[curQ.id] && (
                    <div className="mt-4">
                      <button
                        onClick={() => toggleSolution(curQ.id)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-900 transition"
                      >
                        {showExplanation[curQ.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{showExplanation[curQ.id] ? 'Ẩn lời giải chi tiết' : 'Xem lời giải chi tiết'}</span>
                      </button>

                      {showExplanation[curQ.id] && (
                        <div className="mt-2.5 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs sm:text-sm text-slate-800 leading-relaxed">
                          <div className="font-bold text-emerald-800 mb-1">
                            ✓ Đáp án đúng: {curQ.correct_answer}
                          </div>
                          <p className="whitespace-pre-line text-slate-700">
                            {curQ.explanation || 'Chưa có lời giải chi tiết cho câu hỏi này.'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Navigation */}
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
            /* Single Question Practice Card */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col justify-between min-h-[500px]">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-lg bg-brand-100 text-brand-900 font-bold text-xs">
                      Câu {currentIdx + 1}/{questions.length}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      [{selectedCat}]
                    </span>
                  </div>
                  <button
                    onClick={handleAskAi}
                    className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-800 to-brand-900 hover:from-brand-900 hover:to-brand-950 text-white shadow-sm transition"
                  >
                    <Bot className="w-3.5 h-3.5 text-brand-300" />
                    <span>✨ Hỏi Gia sư AI câu này</span>
                  </button>
                </div>

                <p className="text-base font-semibold text-slate-900 mb-6 leading-relaxed whitespace-pre-line">
                  {curQ.content}
                </p>

                {/* Options */}
                <div className="space-y-3">
                  {['A', 'B', 'C', 'D'].map((optKey) => {
                    const optText = curQ[`option_${optKey.toLowerCase()}`];
                    if (!optText) return null;
                    const isSelected = userAnswers[curQ.id] === optKey;
                    const isCorrect = curQ.correct_answer === optKey;
                    const hasAnswered = !!userAnswers[curQ.id];

                    let itemClass = 'bg-white border-slate-200 hover:border-slate-300';
                    if (hasAnswered && isCorrect) {
                      itemClass = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-medium';
                    } else if (hasAnswered && isSelected && !isCorrect) {
                      itemClass = 'bg-rose-50 border-rose-500 text-rose-950';
                    } else if (isSelected) {
                      itemClass = 'bg-brand-50 border-brand-500';
                    }

                    return (
                      <div
                        key={optKey}
                        onClick={() => handleSelectOption(optKey)}
                        className={`flex items-start gap-3.5 p-3.5 rounded-xl border cursor-pointer transition ${itemClass}`}
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
                        <span className="text-sm leading-relaxed flex-1">
                          {optText}
                        </span>
                        {hasAnswered && isCorrect && (
                          <Check className="w-5 h-5 text-emerald-600 shrink-0 self-center" />
                        )}
                        {hasAnswered && isSelected && !isCorrect && (
                          <X className="w-5 h-5 text-rose-600 shrink-0 self-center" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Solution Toggle */}
                {userAnswers[curQ.id] && (
                  <div className="mt-5">
                    <button
                      onClick={() => toggleSolution(curQ.id)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-900 transition"
                    >
                      {showExplanation[curQ.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showExplanation[curQ.id] ? 'Ẩn lời giải chi tiết' : 'Xem lời giải chi tiết'}</span>
                    </button>

                    {showExplanation[curQ.id] && (
                      <div className="mt-3 p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-sm text-slate-800 leading-relaxed">
                        <div className="font-bold text-emerald-800 mb-1">
                          ✓ Đáp án đúng: {curQ.correct_answer}
                        </div>
                        <p className="whitespace-pre-line text-slate-700">
                          {curQ.explanation || 'Chưa có lời giải chi tiết cho câu hỏi này.'}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Navigation Footer */}
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
      )}
    </div>
  );
}
