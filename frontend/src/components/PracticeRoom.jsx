import React, { useState, useEffect } from 'react';
import { BookOpen, Check, X, Eye, EyeOff, Bot, ChevronLeft, ChevronRight, Sparkles, RefreshCw, PenTool, SearchCheck, Layers, FileText } from 'lucide-react';
import { getPracticeCategories, getPracticeQuestions } from '../services/dataService';

export default function PracticeRoom({ onOpenAiChat }) {
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState('TV1');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showExplanation, setShowExplanation] = useState({});

  // Reading tools
  const [fontSize, setFontSize] = useState('text-sm');
  const [passageTheme, setPassageTheme] = useState('cream');

  // Load categories
  useEffect(() => {
    getPracticeCategories()
      .then((data) => {
        setCategories(data || []);
        if (data && data.length > 0) {
          setSelectedCat(data[0].category);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // Load questions when category changes
  const loadQuestions = () => {
    if (!selectedCat) return;
    setLoading(true);
    getPracticeQuestions(selectedCat, 20)
      .then((data) => {
        setQuestions(data || []);
        setCurrentIdx(0);
        setUserAnswers({});
        setShowExplanation({});
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadQuestions();
  }, [selectedCat]);

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
      order_num: currentIdx + 1,
      user_answer: userAnswers[curQ.id]
    });
  };

  // Category Icon & Color Mapping
  const getCatStyle = (cat) => {
    switch (cat) {
      case 'TV1':
        return { icon: Sparkles, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
      case 'TV2':
        return { icon: PenTool, color: 'from-blue-600 to-indigo-600', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
      case 'TV3':
        return { icon: SearchCheck, color: 'from-rose-500 to-pink-500', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
      case 'R1':
        return { icon: FileText, color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
      case 'RC':
        return { icon: Layers, color: 'from-violet-600 to-purple-600', bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' };
      default:
        return { icon: BookOpen, color: 'from-slate-600 to-slate-800', bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
    }
  };

  const themeClasses = {
    cream: 'bg-[#FFFDF5] text-slate-800 border-[#F3EED9]',
    white: 'bg-white text-slate-800 border-slate-200',
    slate: 'bg-slate-100 text-slate-900 border-slate-300',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
      {/* Title */}
      <div className="mb-6">
        <span className="text-xs font-black uppercase text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
          Chế độ Tự Luyện Tập
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5 flex items-center gap-2.5">
          <BookOpen className="w-7 h-7 text-indigo-600" />
          <span>Luyện Chuyên Sâu Từng Dạng Bài HSA</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Học theo từng chuyên đề, không áp lực thời gian, đối chiếu đáp án và có Gia sư AI đồng hành.
        </p>
      </div>

      {/* Bento Grid Category Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-8">
        {categories.map((c) => {
          const isSelected = selectedCat === c.category;
          const style = getCatStyle(c.category);
          const Icon = style.icon;

          return (
            <div
              key={c.category}
              onClick={() => setSelectedCat(c.category)}
              className={`p-4 rounded-3xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between select-none ${
                isSelected
                  ? 'bg-white border-indigo-600 shadow-lg shadow-indigo-500/15 -translate-y-1'
                  : 'bg-white border-slate-200/80 hover:border-slate-300 hover:-translate-y-0.5'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${style.color} flex items-center justify-center text-white shadow-sm`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${style.bg} ${style.text} border ${style.border}`}>
                  {c.category}
                </span>
              </div>

              <div>
                <h4 className={`text-xs font-bold line-clamp-2 ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                  {c.title.split('(')[0]}
                </h4>
                <div className="text-[11px] font-extrabold text-slate-400 mt-1">
                  {c.count} câu hỏi
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-16 text-center shadow-soft">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700">Đang chuẩn bị câu hỏi chuyên sâu...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-12 text-center text-slate-500">
          Chưa có câu hỏi nào thuộc dạng bài này.
        </div>
      ) : (
        /* Question Workspace */
        <div>
          {curQ.passage_content ? (
            /* Split Screen for Reading Cluster */
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 bg-white rounded-3xl border-2 border-slate-200/80 shadow-soft p-5 sm:p-7 min-h-[580px]">
              {/* Left: Book Reading Pane */}
              <div className={`md:col-span-6 rounded-2xl border-2 p-5 flex flex-col max-h-[620px] shadow-inner ${themeClasses[passageTheme]}`}>
                <div className="flex items-center justify-between pb-3 border-b border-current/15 mb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                    {curQ.passage_title || 'Ngữ liệu Văn bản'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setFontSize(fontSize === 'text-lg' ? 'text-base' : fontSize === 'text-base' ? 'text-sm' : 'text-sm')}
                      className="w-6 h-6 rounded bg-white/70 border border-slate-300 flex items-center justify-center text-xs font-bold"
                    >
                      A-
                    </button>
                    <button
                      onClick={() => setFontSize(fontSize === 'text-sm' ? 'text-base' : fontSize === 'text-base' ? 'text-lg' : 'text-lg')}
                      className="w-6 h-6 rounded bg-white/70 border border-slate-300 flex items-center justify-center text-xs font-bold"
                    >
                      A+
                    </button>
                  </div>
                </div>

                <div 
                  className={`flex-1 overflow-y-auto pr-2 font-serif leading-relaxed whitespace-pre-line select-text ${fontSize}`}
                  dangerouslySetInnerHTML={{ __html: curQ.passage_content }}
                />
              </div>

              {/* Right: Question, Options & AI Button */}
              <div className="md:col-span-6 flex flex-col justify-between pl-0 md:pl-2">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 rounded-xl bg-indigo-100 text-indigo-900 font-black text-xs border border-indigo-200">
                      Câu {currentIdx + 1}/{questions.length}
                    </span>

                    {/* Pop AI Button */}
                    <button
                      onClick={handleAskAi}
                      className="btn-3d flex items-center gap-1.5 text-xs font-black px-4 py-1.5 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white shadow-glow-violet transition border-2 border-violet-500 border-b-4"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                      <span>✨ Hỏi Gia sư AI câu này</span>
                    </button>
                  </div>

                  <div 
                    className="text-sm font-bold text-slate-900 mb-4 leading-relaxed whitespace-pre-line"
                    dangerouslySetInnerHTML={{ __html: curQ.content }}
                  />

                  {/* 3D Options */}
                  <div className="space-y-2.5">
                    {['A', 'B', 'C', 'D'].map((optKey) => {
                      const optText = curQ[`option_${optKey.toLowerCase()}`];
                      if (!optText) return null;
                      const isSelected = userAnswers[curQ.id] === optKey;
                      const isCorrect = curQ.correct_answer === optKey;
                      const hasAnswered = !!userAnswers[curQ.id];

                      let btnStyle = 'bg-white border-slate-200 hover:border-slate-300';
                      if (hasAnswered && isCorrect) {
                        btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold border-b-emerald-600';
                      } else if (hasAnswered && isSelected && !isCorrect) {
                        btnStyle = 'bg-rose-50 border-rose-500 text-rose-950 border-b-rose-600';
                      } else if (isSelected) {
                        btnStyle = 'bg-indigo-50 border-indigo-600 border-b-indigo-700';
                      }

                      return (
                        <div
                          key={optKey}
                          onClick={() => handleSelectOption(optKey)}
                          className={`btn-3d flex items-start gap-3 p-3.5 rounded-2xl border-2 border-b-4 cursor-pointer transition select-none ${btnStyle}`}
                        >
                          <div
                            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 font-black text-xs ${
                              isSelected
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-700 border border-slate-300'
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

                  {/* Solution Toggle */}
                  {userAnswers[curQ.id] && (
                    <div className="mt-4">
                      <button
                        onClick={() => toggleSolution(curQ.id)}
                        className="btn-3d flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-900 transition"
                      >
                        {showExplanation[curQ.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        <span>{showExplanation[curQ.id] ? 'Ẩn lời giải chi tiết' : 'Xem lời giải chi tiết'}</span>
                      </button>

                      {showExplanation[curQ.id] && (
                        <div className="mt-3 p-4 rounded-2xl bg-amber-50/80 border-2 border-amber-200 text-xs sm:text-sm text-slate-800 leading-relaxed shadow-xs">
                          <div className="font-black text-emerald-800 mb-1">
                            ✓ Đáp án đúng: {curQ.correct_answer}
                          </div>
                          <p className="whitespace-pre-line text-slate-700">
                            {curQ.explanation || 'Chưa có lời giải chi tiết.'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Navigation */}
                <div className="flex items-center justify-between pt-5 border-t border-slate-100 mt-6">
                  <button
                    disabled={currentIdx === 0}
                    onClick={() => setCurrentIdx((prev) => prev - 1)}
                    className="btn-3d flex items-center gap-1 px-4 py-2 rounded-xl border-2 border-slate-200 border-b-4 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Câu trước</span>
                  </button>
                  <button
                    disabled={currentIdx === questions.length - 1}
                    onClick={() => setCurrentIdx((prev) => prev + 1)}
                    className="btn-3d flex items-center gap-1 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold border-2 border-indigo-700 border-b-4 disabled:opacity-30 disabled:pointer-events-none shadow-sm"
                  >
                    <span>Câu tiếp theo</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Single Question Focused Card */
            <div className="bg-white rounded-3xl border-2 border-slate-200/80 shadow-soft p-6 sm:p-9 flex flex-col justify-between min-h-[500px]">
              <div>
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="px-3.5 py-1 rounded-xl bg-indigo-100 text-indigo-900 font-black text-xs border border-indigo-200">
                      Câu {currentIdx + 1}/{questions.length}
                    </span>
                    <span className="text-xs text-slate-400 font-bold">[{selectedCat}]</span>
                  </div>

                  {/* Pop AI Button */}
                  <button
                    onClick={handleAskAi}
                    className="btn-3d flex items-center gap-1.5 text-xs font-black px-4 py-1.5 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white shadow-glow-violet transition border-2 border-violet-500 border-b-4"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                    <span>✨ Hỏi Gia sư AI câu này</span>
                  </button>
                </div>

                <div 
                  className="text-base sm:text-lg font-bold text-slate-900 mb-6 leading-relaxed whitespace-pre-line"
                  dangerouslySetInnerHTML={{ __html: curQ.content }}
                />

                {/* 3D Tactile Options */}
                <div className="space-y-3.5">
                  {['A', 'B', 'C', 'D'].map((optKey) => {
                    const optText = curQ[`option_${optKey.toLowerCase()}`];
                    if (!optText) return null;
                    const isSelected = userAnswers[curQ.id] === optKey;
                    const isCorrect = curQ.correct_answer === optKey;
                    const hasAnswered = !!userAnswers[curQ.id];

                    let btnStyle = 'bg-white border-slate-200 hover:border-slate-300';
                    if (hasAnswered && isCorrect) {
                      btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold border-b-emerald-600';
                    } else if (hasAnswered && isSelected && !isCorrect) {
                      btnStyle = 'bg-rose-50 border-rose-500 text-rose-950 border-b-rose-600';
                    } else if (isSelected) {
                      btnStyle = 'bg-indigo-50 border-indigo-600 border-b-indigo-700';
                    }

                    return (
                      <div
                        key={optKey}
                        onClick={() => handleSelectOption(optKey)}
                        className={`btn-3d flex items-start gap-3.5 p-4 rounded-2xl border-2 border-b-4 cursor-pointer transition select-none ${btnStyle}`}
                      >
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 font-black text-xs ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 border border-slate-300'
                          }`}
                        >
                          {optKey}
                        </div>
                        <span className="text-sm sm:text-base leading-relaxed flex-1">
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
                      className="btn-3d flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-900 transition"
                    >
                      {showExplanation[curQ.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      <span>{showExplanation[curQ.id] ? 'Ẩn lời giải chi tiết' : 'Xem lời giải chi tiết'}</span>
                    </button>

                    {showExplanation[curQ.id] && (
                      <div className="mt-3 p-4 rounded-2xl bg-amber-50/80 border-2 border-amber-200 text-xs sm:text-sm text-slate-800 leading-relaxed shadow-xs">
                        <div className="font-black text-emerald-800 mb-1">
                          ✓ Đáp án đúng: {curQ.correct_answer}
                        </div>
                        <p className="whitespace-pre-line text-slate-700">
                          {curQ.explanation || 'Chưa có lời giải chi tiết.'}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Navigation Footer */}
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
                  className="btn-3d flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold border-2 border-indigo-700 border-b-4 disabled:opacity-30 disabled:pointer-events-none shadow-sm"
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
