import React, { useState, useEffect } from 'react';
import { Award, Trophy, Medal, Zap, Clock, UserCheck, Flame, ArrowUpRight } from 'lucide-react';

export default function Leaderboard({ apiBase, studentName }) {
  const [tab, setTab] = useState('mock'); // 'mock' | 'stats'
  const [timeframe, setTimeframe] = useState('all'); // 'week' | 'month' | 'all'
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${apiBase}/api/leaderboard?tab=${tab}&timeframe=${timeframe}`)
      .then((res) => res.json())
      .then((data) => {
        setLeaderboard(data.leaderboard || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [tab, timeframe, apiBase]);

  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];

  // Current student rank
  const myRankIdx = leaderboard.findIndex(
    (item) => item.student_name && item.student_name.toLowerCase() === studentName.toLowerCase()
  );
  const myRank = myRankIdx >= 0 ? myRankIdx + 1 : '--';
  const myRecord = myRankIdx >= 0 ? leaderboard[myRankIdx] : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28">
      {/* Title & Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md border border-brand-200">
            Bảng Vinh Danh Quốc Gia
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            <span>Đấu Trường Đánh Giá Năng Lực HSA</span>
          </h1>
        </div>

        {/* 2 Tabs */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => setTab('mock')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
              tab === 'mock'
                ? 'bg-brand-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Thủ khoa Đề thi (50 câu)</span>
          </button>
          <button
            onClick={() => setTab('stats')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
              tab === 'stats'
                ? 'bg-brand-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Flame className="w-4 h-4 text-rose-500" />
            <span>Chăm chỉ Tích luỹ</span>
          </button>
        </div>
      </div>

      {/* Podium for Top 1, 2, 3 */}
      {leaderboard.length >= 1 && (
        <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-10 items-end max-w-3xl mx-auto pt-6">
          {/* Top 2 */}
          <div className="flex flex-col items-center">
            {top2 ? (
              <>
                <div className="relative mb-2">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-200 border-4 border-slate-300 flex items-center justify-center font-bold text-slate-700 text-base shadow-md">
                    {top2.student_name ? top2.student_name[0].toUpperCase() : '2'}
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-400 text-white flex items-center justify-center font-extrabold text-xs shadow-sm">
                    2
                  </span>
                </div>
                <div className="text-center">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">{top2.student_name}</h4>
                  <p className="text-[11px] font-extrabold text-brand-700 mt-0.5">
                    {tab === 'mock' ? `${top2.score}/50 điểm` : `${top2.total_correct} câu đúng`}
                  </p>
                </div>
                <div className="w-full bg-gradient-to-t from-slate-200 to-slate-100 h-24 rounded-t-2xl mt-3 flex items-center justify-center border-t border-slate-300">
                  <Medal className="w-6 h-6 text-slate-400" />
                </div>
              </>
            ) : null}
          </div>

          {/* Top 1 */}
          <div className="flex flex-col items-center">
            {top1 ? (
              <>
                <div className="relative mb-2">
                  <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-amber-100 border-4 border-amber-400 flex items-center justify-center font-extrabold text-amber-800 text-xl shadow-lg ring-4 ring-amber-400/20">
                    {top1.student_name ? top1.student_name[0].toUpperCase() : '1'}
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center font-extrabold text-xs shadow-sm">
                    👑
                  </span>
                </div>
                <div className="text-center">
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900 line-clamp-1">{top1.student_name}</h4>
                  <p className="text-xs font-black text-amber-600 mt-0.5">
                    {tab === 'mock' ? `${top1.score}/50 điểm` : `${top1.total_correct} câu đúng`}
                  </p>
                </div>
                <div className="w-full bg-gradient-to-t from-amber-200 via-amber-100 to-amber-50 h-32 rounded-t-2xl mt-3 flex items-center justify-center border-t border-amber-300 shadow-sm">
                  <Trophy className="w-8 h-8 text-amber-500" />
                </div>
              </>
            ) : null}
          </div>

          {/* Top 3 */}
          <div className="flex flex-col items-center">
            {top3 ? (
              <>
                <div className="relative mb-2">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-amber-50 border-4 border-amber-700/40 flex items-center justify-center font-bold text-amber-900 text-base shadow-md">
                    {top3.student_name ? top3.student_name[0].toUpperCase() : '3'}
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-700 text-white flex items-center justify-center font-extrabold text-xs shadow-sm">
                    3
                  </span>
                </div>
                <div className="text-center">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">{top3.student_name}</h4>
                  <p className="text-[11px] font-extrabold text-brand-700 mt-0.5">
                    {tab === 'mock' ? `${top3.score}/50 điểm` : `${top3.total_correct} câu đúng`}
                  </p>
                </div>
                <div className="w-full bg-gradient-to-t from-amber-100/60 to-orange-50 h-20 rounded-t-2xl mt-3 flex items-center justify-center border-t border-amber-600/30">
                  <Medal className="w-6 h-6 text-amber-700/60" />
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* Top 20 Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wide">
            Bảng Xếp Hạng Top 20 Thí Sinh
          </h3>
          <span className="text-xs text-slate-500">Cập nhật theo thời gian thực</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4 text-center w-14">Hạng</th>
                <th className="py-3 px-4">Thí sinh</th>
                {tab === 'mock' ? (
                  <>
                    <th className="py-3 px-4 text-center">Điểm số</th>
                    <th className="py-3 px-4 text-center">Thời gian làm bài</th>
                    <th className="py-3 px-4 text-right">Bài thi</th>
                  </>
                ) : (
                  <>
                    <th className="py-3 px-4 text-center">Tổng câu đúng</th>
                    <th className="py-3 px-4 text-center">Số lượt làm</th>
                    <th className="py-3 px-4 text-right">Lần cập nhật cuối</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Chưa có lượt nộp bài nào trên hệ thống. Hãy làm bài để là người đầu tiên lên bảng vàng!
                  </td>
                </tr>
              ) : (
                leaderboard.map((item, idx) => {
                  const isMe =
                    item.student_name && item.student_name.toLowerCase() === studentName.toLowerCase();
                  return (
                    <tr
                      key={idx}
                      className={`hover:bg-slate-50/80 transition ${
                        isMe ? 'bg-brand-50/80 font-bold' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center font-bold">
                        {idx === 0 ? (
                          <span className="text-amber-500 font-extrabold">🥇 1</span>
                        ) : idx === 1 ? (
                          <span className="text-slate-400 font-extrabold">🥈 2</span>
                        ) : idx === 2 ? (
                          <span className="text-amber-700 font-extrabold">🥉 3</span>
                        ) : (
                          <span className="text-slate-600">{idx + 1}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-900">{item.student_name}</span>
                          {isMe && (
                            <span className="text-[10px] bg-brand-200 text-brand-900 px-1.5 py-0.2 rounded font-extrabold">
                              BẠN
                            </span>
                          )}
                        </div>
                      </td>

                      {tab === 'mock' ? (
                        <>
                          <td className="py-3.5 px-4 text-center font-extrabold text-brand-700">
                            {item.score}/50
                          </td>
                          <td className="py-3.5 px-4 text-center text-slate-600">
                            {Math.floor(item.time_spent_seconds / 60)}m {item.time_spent_seconds % 60}s
                          </td>
                          <td className="py-3.5 px-4 text-right text-slate-500 text-xs line-clamp-1">
                            {item.exam_title}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-3.5 px-4 text-center font-extrabold text-brand-700">
                            {item.total_correct} câu
                          </td>
                          <td className="py-3.5 px-4 text-center text-slate-600">
                            {item.total_attempts} đề
                          </td>
                          <td className="py-3.5 px-4 text-right text-slate-500 text-xs">
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

      {/* Sticky Bottom Bar for Current Student */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl py-3 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-900 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {studentName[0].toUpperCase()}
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500">Thí sinh đang đăng nhập</div>
              <div className="text-sm font-bold text-slate-900">{studentName}</div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center sm:text-right">
              <div className="text-xs text-slate-500">Thứ hạng hiện tại</div>
              <div className="text-sm font-extrabold text-brand-700">
                {myRank !== '--' ? `Hạng #${myRank}` : 'Chưa xếp hạng'}
              </div>
            </div>

            {myRecord && (
              <div className="text-center sm:text-right pl-4 border-l border-slate-200">
                <div className="text-xs text-slate-500">
                  {tab === 'mock' ? 'Điểm cao nhất' : 'Tổng tích lũy'}
                </div>
                <div className="text-sm font-extrabold text-emerald-600">
                  {tab === 'mock' ? `${myRecord.score}/50 điểm` : `${myRecord.total_correct} câu đúng`}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
