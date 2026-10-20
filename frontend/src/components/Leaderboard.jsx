import React, { useState, useEffect } from 'react';
import { Award, Trophy, Medal, Zap, Clock, UserCheck, Flame, ArrowUpRight, Crown, Sparkles, Share2, Check } from 'lucide-react';
import { getLeaderboard } from '../services/dataService';

export default function Leaderboard({ studentName }) {
  const [tab, setTab] = useState('mock'); // 'mock' | 'stats'
  const [timeframe, setTimeframe] = useState('all'); // 'week' | 'month' | 'all'
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [challengeCopied, setChallengeCopied] = useState(false);

  const handleShareChallenge = async () => {
    const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const shareText = myRecord 
      ? `🏆 Mình đang giữ Top ${myRank} Bảng Vinh Danh HSA Master với ${tab === 'mock' ? myRecord.score + '/50 điểm' : myRecord.total_correct + ' câu đúng'}! Đố bạn vượt qua được mình tại: ${currentUrl}`
      : `🔥 Hãy vào so tài giải đề ĐGNL HSA cùng mình trên HSA Master tại: ${currentUrl}`;
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
      setTimeout(() => setChallengeCopied(false), 3000);
    } catch (err) {
      console.error(err);
      prompt('Sao chép lời thách đấu:', shareText);
    }
  };

  useEffect(() => {
    setLoading(true);
    try {
      const data = getLeaderboard(tab, timeframe);
      setLeaderboard(data.leaderboard || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [tab, timeframe]);

  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];

  // Current student rank
  const myRankIdx = leaderboard.findIndex(
    (item) => item.student_name && item.student_name.toLowerCase() === studentName.toLowerCase()
  );
  const myRank = myRankIdx >= 0 ? myRankIdx + 1 : '--';
  const myRecord = myRankIdx >= 0 ? leaderboard[myRankIdx] : null;

  const getAvatar = (name) => `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name || 'HSA')}&backgroundColor=e0e7ff,c7d2fe`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
      {/* Title & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
        <div>
          <span className="text-xs font-black uppercase text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Đấu Trường Tri Thức HSA
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1 flex items-center gap-2.5">
            <Trophy className="w-7 h-7 text-amber-500" />
            <span>Bảng Vinh Danh Toàn Quốc</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Xếp hạng những sĩ tử có điểm thi cao nhất và tích lũy số câu đúng nhiều nhất
          </p>
        </div>

        {/* 2 Tabs */}
        <div className="flex items-center gap-2 bg-slate-200/70 p-1.5 rounded-2xl border border-slate-300/60">
          <button
            onClick={() => setTab('mock')}
            className={`btn-3d flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition ${
              tab === 'mock'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-300" />
            <span>Thủ khoa Đề thi</span>
          </button>
          <button
            onClick={() => setTab('stats')}
            className={`btn-3d flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition ${
              tab === 'stats'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Flame className="w-4 h-4 text-rose-400" />
            <span>Chăm chỉ Tích luỹ</span>
          </button>
        </div>
      </div>

      {/* Rực Rỡ: Podium Top 1, 2, 3 */}
      {leaderboard.length >= 1 && (
        <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-12 items-end max-w-3xl mx-auto pt-8">
          {/* Top 2: Silver */}
          <div className="flex flex-col items-center">
            {top2 ? (
              <>
                <div className="relative mb-2">
                  <img
                    src={getAvatar(top2.student_name)}
                    alt={top2.student_name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-slate-100 border-4 border-slate-300 shadow-md p-1"
                  />
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-slate-500 text-white font-black text-xs shadow-sm">
                    🥈 #2
                  </span>
                </div>
                <div className="text-center mt-2">
                  <span className="text-[10px] font-black uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                    Cao thủ Ngôn từ ⚡
                  </span>
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 mt-1 line-clamp-1">{top2.student_name}</h4>
                  <p className="text-xs font-black text-indigo-700 mt-0.5">
                    {tab === 'mock' ? `${top2.score}/50 điểm` : `${top2.total_correct} câu đúng`}
                  </p>
                </div>
                <div className="w-full bg-gradient-to-t from-slate-200 via-slate-100 to-white h-24 rounded-t-3xl mt-3 flex items-center justify-center border-t-2 border-slate-300 shadow-sm">
                  <Medal className="w-8 h-8 text-slate-400" />
                </div>
              </>
            ) : null}
          </div>

          {/* Top 1: Gold Crown */}
          <div className="flex flex-col items-center -mt-6">
            {top1 ? (
              <>
                <div className="relative mb-2">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-2xl animate-bounce">
                    👑
                  </div>
                  <img
                    src={getAvatar(top1.student_name)}
                    alt={top1.student_name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-amber-50 border-4 border-amber-400 shadow-xl ring-4 ring-amber-400/30 p-1"
                  />
                  <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black text-xs shadow-md">
                    🥇 #1
                  </span>
                </div>
                <div className="text-center mt-2.5">
                  <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                    Chiến thần Đọc hiểu 👑
                  </span>
                  <h4 className="font-black text-sm sm:text-base text-slate-900 mt-1 line-clamp-1">{top1.student_name}</h4>
                  <p className="text-sm font-black text-amber-600 mt-0.5">
                    {tab === 'mock' ? `${top1.score}/50 điểm` : `${top1.total_correct} câu đúng`}
                  </p>
                </div>
                <div className="w-full bg-gradient-to-t from-amber-200 via-amber-100 to-amber-50 h-32 rounded-t-3xl mt-3 flex items-center justify-center border-t-2 border-amber-400 shadow-md">
                  <Trophy className="w-10 h-10 text-amber-500" />
                </div>
              </>
            ) : null}
          </div>

          {/* Top 3: Bronze */}
          <div className="flex flex-col items-center">
            {top3 ? (
              <>
                <div className="relative mb-2">
                  <img
                    src={getAvatar(top3.student_name)}
                    alt={top3.student_name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-amber-50 border-4 border-amber-700/50 shadow-md p-1"
                  />
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-amber-700 text-white font-black text-xs shadow-sm">
                    🥉 #3
                  </span>
                </div>
                <div className="text-center mt-2">
                  <span className="text-[10px] font-black uppercase text-amber-900 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    Bậc thầy Ngữ pháp 🎯
                  </span>
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 mt-1 line-clamp-1">{top3.student_name}</h4>
                  <p className="text-xs font-black text-indigo-700 mt-0.5">
                    {tab === 'mock' ? `${top3.score}/50 điểm` : `${top3.total_correct} câu đúng`}
                  </p>
                </div>
                <div className="w-full bg-gradient-to-t from-orange-100 via-amber-50 to-white h-20 rounded-t-3xl mt-3 flex items-center justify-center border-t-2 border-amber-600/40 shadow-sm">
                  <Medal className="w-8 h-8 text-amber-700/60" />
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* Top 20 Table */}
      <div className="bg-white rounded-3xl border-2 border-slate-200/80 shadow-soft overflow-hidden">
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <span>Bảng Xếp Hạng Top 20</span>
          </h3>
          <span className="text-xs font-bold text-slate-400">Tự động cập nhật tức thì</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-extrabold border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4 text-center w-16">Hạng</th>
                <th className="py-3.5 px-4">Thí sinh</th>
                {tab === 'mock' ? (
                  <>
                    <th className="py-3.5 px-4 text-center">Điểm số</th>
                    <th className="py-3.5 px-4 text-center">Thời gian làm bài</th>
                    <th className="py-3.5 px-4 text-right">Bài thi</th>
                  </>
                ) : (
                  <>
                    <th className="py-3.5 px-4 text-center">Tổng câu đúng</th>
                    <th className="py-3.5 px-4 text-center">Số bài đã luyện</th>
                    <th className="py-3.5 px-4 text-right">Lần cập nhật cuối</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-bold">
                    Chưa có lượt nộp bài nào. Hãy là người đầu tiên chinh phục bảng vàng!
                  </td>
                </tr>
              ) : (
                leaderboard.map((item, idx) => {
                  const isMe =
                    item.student_name && item.student_name.toLowerCase() === studentName.toLowerCase();
                  return (
                    <tr
                      key={idx}
                      className={`hover:bg-indigo-50/40 transition duration-150 ${
                        isMe ? 'bg-indigo-50/80 font-black' : ''
                      }`}
                    >
                      <td className="py-4 px-4 text-center font-extrabold">
                        {idx === 0 ? (
                          <span className="text-amber-500 font-black text-sm">🥇 1</span>
                        ) : idx === 1 ? (
                          <span className="text-slate-400 font-black text-sm">🥈 2</span>
                        ) : idx === 2 ? (
                          <span className="text-amber-700 font-black text-sm">🥉 3</span>
                        ) : (
                          <span className="text-slate-500">#{idx + 1}</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={getAvatar(item.student_name)}
                            alt=""
                            className="w-7 h-7 rounded-lg bg-indigo-50 p-0.5 border border-indigo-200 shrink-0"
                          />
                          <span className="text-slate-900 font-bold">{item.student_name}</span>
                          {isMe && (
                            <span className="text-[9px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-black">
                              BẠN
                            </span>
                          )}
                        </div>
                      </td>

                      {tab === 'mock' ? (
                        <>
                          <td className="py-4 px-4 text-center font-black text-indigo-700">
                            {item.score}/50
                          </td>
                          <td className="py-4 px-4 text-center text-slate-600 font-medium">
                            {Math.floor(item.time_spent_seconds / 60)}m {item.time_spent_seconds % 60}s
                          </td>
                          <td className="py-4 px-4 text-right text-slate-400 text-xs truncate max-w-[200px]">
                            {item.exam_title}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-4 px-4 text-center font-black text-indigo-700">
                            {item.total_correct} câu
                          </td>
                          <td className="py-4 px-4 text-center text-slate-600 font-medium">
                            {item.total_attempts} đề
                          </td>
                          <td className="py-4 px-4 text-right text-slate-400 text-xs">
                            {item.updated_at ? item.updated_at.split(' ')[0] : 'Hôm nay'}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sticky Bottom Bar for Logged-In Student */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t-2 border-slate-200/80 shadow-2xl py-3.5 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={getAvatar(studentName)}
              alt="Avatar"
              className="w-10 h-10 rounded-2xl bg-indigo-50 border-2 border-indigo-300 p-0.5 shadow-sm"
            />
            <div>
              <div className="text-[10px] font-black uppercase text-slate-400 leading-none">Thí sinh đang đăng nhập</div>
              <div className="text-sm font-black text-slate-900 mt-0.5">{studentName}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={handleShareChallenge}
              className="btn-3d hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-900 font-extrabold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition"
            >
              {challengeCopied ? <Check className="w-3.5 h-3.5 text-emerald-950" /> : <Trophy className="w-3.5 h-3.5 text-slate-900" />}
              <span>{challengeCopied ? 'Đã chép thách đấu!' : 'Thách đấu bạn bè'}</span>
            </button>

            <div className="text-right">
              <div className="text-[11px] text-slate-400 font-bold">Thứ hạng hiện tại</div>
              <div className="text-sm font-black text-indigo-600">
                {myRank !== '--' ? `#${myRank}` : 'Chưa xếp hạng'}
              </div>
            </div>

            {myRecord && (
              <div className="text-right pl-4 sm:pl-5 border-l border-slate-200">
                <div className="text-[11px] text-slate-400 font-bold">
                  {tab === 'mock' ? 'Điểm cao nhất' : 'Tổng tích lũy'}
                </div>
                <div className="text-sm font-black text-emerald-600">
                  {tab === 'mock' ? `${myRecord.score}/50 điểm` : `${myRecord.total_correct} câu`}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
