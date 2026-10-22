import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, CheckCircle2, XCircle, Timer, RotateCcw, Bot, BookOpen, Sparkles, Trophy, ArrowRight, Share2, Copy, Check, BarChart3, MessageSquare, Star, Send } from 'lucide-react';
import { submitStudentFeedback } from '../services/dataService';

export default function ResultScreen({ resultData, onRetakeExam, onViewLeaderboard, onViewAnalytics, onOpenAiChat }) {
  const [filter, setFilter] = useState('all'); // 'all' | 'correct' | 'incorrect'
  const [challengeCopied, setChallengeCopied] = useState(false);

  // Quick Feedback Form State on Result Screen
  const [rating, setRating] = useState(5);
  const [reviewerName, setReviewerName] = useState(resultData.student_name || 'Thí sinh HSA');
  const [reviewerRole, setReviewerRole] = useState('Học sinh Lớp 12');
  const [comment, setComment] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const score = resultData.score || 0;
  const total = resultData.total_questions || 50;
  const percentage = Math.round((score / total) * 100);
  const timeSpent = resultData.time_spent_seconds || 0;
  const results = resultData.results || [];

  const m = Math.floor(timeSpent / 60);
  const s = timeSpent % 60;
  const formattedTime = `${m} phút ${s} giây`;

  const handleQuickFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    await submitStudentFeedback({
      name: reviewerName.trim() || resultData.student_name || 'Thí sinh HSA',
      role: reviewerRole.trim() || 'Học sinh Lớp 12',
      school: `Đạt ${score}/${total} điểm`,
      rating,
      comment: comment.trim()
    });
    setComment('');
    setFeedbackSent(true);
  };

  const handleShareChallenge = async () => {
    const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const shareText = `🎉 Mình vừa đạt ${score}/${total} điểm (${percentage}%) trong ${formattedTime} tại HSA Master (ĐGNL ĐHQGHN)! Đố bạn vượt qua kỷ lục của mình tại: ${currentUrl}`;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareText);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = shareText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setChallengeCopied(true);
      setTimeout(() => setChallengeCopied(false), 3500);
    } catch (err) {
      console.error(err);
      prompt('Sao chép lời thách đấu bên dưới:', shareText);
    }
  };

  // Trigger celebratory confetti if score >= 35
  useEffect(() => {
    if (score >= 35) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#2563EB', '#4F46E5', '#8B5CF6', '#F59E0B', '#10B981']
      });
    }
  }, [score]);

  const filteredResults = results.filter((r) => {
    if (filter === 'correct') return r.is_correct;
    if (filter === 'incorrect') return !r.is_correct;
    return true;
  });

  const correctCount = results.filter((r) => r.is_correct).length;
  const incorrectCount = results.length - correctCount;

  // Title badge
  const getBadgeTitle = () => {
    if (score >= 45) return { title: 'Thủ Khoa Toàn Diện 👑', color: 'from-amber-400 to-amber-600', text: 'Xuất sắc tuyệt đối!' };
    if (score >= 35) return { title: 'Chiến Thần Đọc Hiểu ⚡', color: 'from-indigo-600 to-violet-600', text: 'Đạt chuẩn kỳ thi ĐHQGHN!' };
    return { title: 'Học Viên Tiềm Năng 🚀', color: 'from-blue-600 to-indigo-600', text: 'Cần ôn lại các câu đã sai bên dưới nhé!' };
  };

  const badgeInfo = getBadgeTitle();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
      {/* Gamified Celebratory Banner */}
      <div className="bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-800 text-white rounded-3xl p-6 sm:p-10 shadow-xl shadow-indigo-600/20 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-white/10 pointer-events-none blur-3xl"></div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
          <div className="text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-white/20 text-white border border-white/25 uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              {badgeInfo.title}
            </span>
            <h1 className="text-2xl sm:text-4xl font-black mt-1 tracking-tight">
              {badgeInfo.text}
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100 mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4">
              <span className="flex items-center gap-1.5">
                <Timer className="w-4 h-4 text-indigo-200" /> Thời gian: <strong>{formattedTime}</strong>
              </span>
              <span>•</span>
              <span>Độ chính xác: <strong>{percentage}%</strong></span>
              <span>•</span>
              <span className="text-emerald-300 font-bold">✓ Đã ghi danh lên Bảng Vinh Danh hôm nay</span>
            </p>
          </div>

          {/* Big Score Badge */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-5 rounded-3xl border-2 border-white/20 shrink-0 shadow-lg">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black text-amber-300 tracking-tight">
                {score}
                <span className="text-xl font-bold text-white/70">/{total}</span>
              </div>
              <div className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-100 mt-1">
                Điểm Đạt Được
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 pt-6 border-t border-white/15 flex flex-wrap items-center justify-center sm:justify-start gap-3">
          <button
            onClick={handleShareChallenge}
            className="btn-3d flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:to-amber-400 text-slate-900 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/30 active:scale-95 transition"
          >
            {challengeCopied ? <Check className="w-4 h-4 text-emerald-950" /> : <Trophy className="w-4 h-4 text-slate-900" />}
            <span>{challengeCopied ? 'Đã chép lời thách đấu! 🎉' : '🏆 Khoe thành tích / Thách đấu'}</span>
          </button>
          <button
            onClick={onRetakeExam}
            className="btn-3d flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-indigo-900 hover:bg-slate-50 font-black text-xs sm:text-sm shadow-md"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Làm đề thi thử mới</span>
          </button>
          <button
            onClick={onViewLeaderboard}
            className="btn-3d flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-500/50 hover:bg-indigo-500/70 border-2 border-white/20 text-white font-extrabold text-xs sm:text-sm shadow-md"
          >
            <Trophy className="w-4 h-4 text-amber-300" />
            <span>Xem Bảng Vinh Danh</span>
          </button>
          <button
            onClick={onViewAnalytics}
            className="btn-3d flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600/80 hover:bg-emerald-600 border-2 border-emerald-400/40 text-white font-extrabold text-xs sm:text-sm shadow-md"
          >
            <BarChart3 className="w-4 h-4 text-emerald-200" />
            <span>Xem Báo cáo Thống kê</span>
          </button>
        </div>
        {challengeCopied && (
          <div className="mt-3 text-xs font-bold text-amber-200 flex items-center gap-1.5 animate-in fade-in">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>🔥 Đã copy lời thách đấu kèm link bài thi! Hãy dán vào nhóm Zalo hoặc Facebook để đọ điểm cùng bạn bè nhé!</span>
          </div>
        )}
      </div>

      {/* Direct Student Feedback Form right on Result Screen */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-violet-50 border-2 border-indigo-200/80 rounded-3xl p-5 sm:p-6 mb-8 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-indigo-950 flex items-center gap-2">
                <span>💬 Gửi nhận xét & Đánh giá trải nghiệm sau bài thi</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Cập nhật trực tiếp
                </span>
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Nhận xét của bạn sẽ được ghi nhận ngay vào mục Ý kiến người học trên trang Thống kê.
              </p>
            </div>
          </div>
        </div>

        {feedbackSent ? (
          <div className="bg-white/90 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-emerald-700">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Cảm ơn bạn! Ý kiến phản hồi đã được cập nhật lên trang Thống kê & Tác động.</span>
            </div>
            <button
              onClick={onViewAnalytics}
              className="btn-3d px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold whitespace-nowrap"
            >
              Xem trên trang Thống kê →
            </button>
          </div>
        ) : (
          <form onSubmit={handleQuickFeedbackSubmit} className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-600">Chấm sao:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((starVal) => (
                    <button
                      type="button"
                      key={starVal}
                      onClick={() => setRating(starVal)}
                      className="p-0.5 focus:outline-none"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          starVal <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                        } transition`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="Họ và tên thí sinh"
                className="px-3 py-1.5 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 w-44"
              />

              <input
                type="text"
                value={reviewerRole}
                onChange={(e) => setReviewerRole(e.target.value)}
                placeholder="Lớp / Trường (VD: 12A1)"
                className="px-3 py-1.5 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 w-44"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Chia sẻ cảm nhận của bạn sau khi làm đề (VD: Đề sát cấu trúc, Gia sư AI giải thích dễ hiểu...)"
                className="flex-1 px-4 py-2.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="btn-3d flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs whitespace-nowrap shadow-md shadow-indigo-500/20 active:scale-95 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Gửi ý kiến phản hồi</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Filter Chips Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            <span>Chi tiết Lời giải & Đối chiếu Đáp án</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Xem lại từng câu và bấm <strong className="text-violet-700">Gia sư AI</strong> để giải thích cặn kẽ mọi thắc mắc
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-200/70 p-1.5 rounded-2xl text-xs font-bold self-start sm:self-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả ({results.length})
          </button>
          <button
            onClick={() => setFilter('correct')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition ${
              filter === 'correct' ? 'bg-emerald-500 text-white shadow-sm' : 'text-emerald-700 hover:bg-white/50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Đúng ({correctCount})</span>
          </button>
          <button
            onClick={() => setFilter('incorrect')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition ${
              filter === 'incorrect' ? 'bg-rose-500 text-white shadow-sm' : 'text-rose-700 hover:bg-white/50'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Sai ({incorrectCount})</span>
          </button>
        </div>
      </div>

      {/* Questions Review List */}
      <div className="space-y-5">
        {filteredResults.map((r, idx) => {
          const userChosen = r.user_choice || r.chosen_option;
          return (
            <div
              key={r.question_id || idx}
              className={`bg-white rounded-3xl border-2 p-6 shadow-soft transition ${
                r.is_correct ? 'border-emerald-200' : 'border-rose-300 ring-2 ring-rose-100'
              }`}
            >
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-3.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-black ${
                      r.is_correct ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    Câu {idx + 1}
                  </span>
                  <span className="text-xs text-slate-400 font-bold">[{r.category}]</span>
                </div>

                {/* Pop Violet AI Button */}
                <button
                  onClick={() =>
                    onOpenAiChat({
                      ...r,
                      order_num: idx + 1,
                      user_answer: userChosen
                    })
                  }
                  className={`btn-3d flex items-center gap-1.5 text-xs font-black px-4 py-1.5 rounded-2xl transition border-2 border-b-4 ${
                    !r.is_correct
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-violet-700 shadow-glow-violet'
                      : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border-indigo-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                  <span>✨ Hỏi Gia sư AI câu này</span>
                </button>
              </div>

              {/* Passage quote if present */}
              {r.passage_content && (
                <div 
                  className="mb-4 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 italic font-serif line-clamp-3"
                  dangerouslySetInnerHTML={{ __html: r.passage_content }}
                />
              )}

              <div 
                className="text-sm sm:text-base font-bold text-slate-900 mb-4 whitespace-pre-line leading-relaxed font-sans"
                dangerouslySetInnerHTML={{ __html: r.content }}
              />

              {/* 4 Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-xs sm:text-sm">
                {['A', 'B', 'C', 'D'].map((optKey) => {
                  const optText = r[`option_${optKey.toLowerCase()}`];
                  if (!optText) return null;
                  const isSelected = userChosen === optKey;
                  const isCorrect = r.correct_answer === optKey;

                  let cardStyle = 'bg-slate-50 border-slate-200 text-slate-700';
                  if (isCorrect) {
                    cardStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-400 border-b-emerald-600';
                  } else if (isSelected && !isCorrect) {
                    cardStyle = 'bg-rose-50 border-rose-400 text-rose-950 font-medium line-through border-b-rose-600';
                  }

                  return (
                    <div key={optKey} className={`flex items-start gap-2.5 p-3 rounded-2xl border-2 border-b-4 ${cardStyle}`}>
                      <span className="font-black text-xs px-2 py-0.5 rounded-lg bg-black/5">{optKey}</span>
                      <span className="leading-relaxed flex-1">{optText}</span>
                    </div>
                  );
                })}
              </div>

              {/* Detailed Explanation Box */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border-2 border-amber-200 text-xs sm:text-sm text-slate-800 leading-relaxed shadow-2xs">
                <div className="font-black text-emerald-800 mb-1 flex items-center gap-1.5">
                  <span>✓ Đáp án đúng: {r.correct_answer}</span>
                  {userChosen && userChosen !== r.correct_answer && (
                    <span className="text-rose-700 font-bold ml-2">
                      (Bạn đã chọn nhầm {userChosen})
                    </span>
                  )}
                </div>
                <p className="text-slate-700 whitespace-pre-line">
                  {r.explanation || 'Chưa có lời giải chi tiết cho câu hỏi này.'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
