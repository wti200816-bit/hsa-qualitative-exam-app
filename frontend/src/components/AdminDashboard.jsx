import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, Sparkles, Upload, Search, Filter, Edit3, Save } from 'lucide-react';

export default function AdminDashboard({ apiBase }) {
  const [questions, setQuestions] = useState([]);
  const [stats, setStats] = useState({ total: 0, verified: 0, pending: 0 });
  const [filterCat, setFilterCat] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editAnswer, setEditAnswer] = useState('');
  const [editExplanation, setEditExplanation] = useState('');

  const loadData = () => {
    setLoading(true);
    let url = `${apiBase}/api/admin/questions?limit=50`;
    if (filterCat) url += `&category=${filterCat}`;
    if (filterStatus) url += `&status=${filterStatus}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data.questions || []);
        if (data.stats) setStats(data.stats);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [filterCat, filterStatus, apiBase]);

  const handleVerify = async (qId, answer, explanation) => {
    try {
      await fetch(`${apiBase}/api/admin/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: qId,
          correct_answer: answer,
          explanation: explanation,
          status: 'verified'
        })
      });
      setEditingId(null);
      loadData();
    } catch (err) {
      alert('Có lỗi xảy ra khi lưu: ' + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title */}
      <div className="mb-6">
        <span className="text-xs uppercase tracking-wider font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md border border-brand-200">
          Trung Tâm Quản Trị Hệ Thống
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-brand-700" />
          <span>Quản lý & Duyệt Ngân Hàng Đề Thi HSA</span>
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng số câu trong kho</div>
          <div className="text-3xl font-extrabold text-slate-900 mt-1">{stats.total}</div>
          <div className="text-xs text-brand-700 mt-1 font-medium">Trích xuất từ 79 tài liệu gốc</div>
        </div>

        <div className="bg-white rounded-2xl border border-emerald-200 p-5 shadow-sm bg-gradient-to-br from-white to-emerald-50/40">
          <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Đã duyệt (Verified)</span>
          </div>
          <div className="text-3xl font-extrabold text-emerald-700 mt-1">{stats.verified}</div>
          <div className="text-xs text-emerald-600 mt-1 font-medium">Bảo vệ phòng thi chuẩn xác 100%</div>
        </div>

        <div className="bg-white rounded-2xl border border-amber-200 p-5 shadow-sm bg-gradient-to-br from-white to-amber-50/40">
          <div className="text-xs font-semibold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Cần duyệt (Pending)</span>
          </div>
          <div className="text-3xl font-extrabold text-amber-700 mt-1">{stats.pending}</div>
          <div className="text-xs text-amber-600 mt-1 font-medium">Không đưa vào phòng thi đến khi duyệt</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadData()}
              placeholder="Tìm theo nội dung hoặc tên file..."
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="px-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">Tất cả các dạng bài</option>
            <option value="TV1">TV1: Từ không cùng nhóm</option>
            <option value="TV2">TV2: Điền từ</option>
            <option value="TV3">TV3: Tìm lỗi sai</option>
            <option value="R1">R1: Đọc hiểu ngắn</option>
            <option value="RC">RC: Đọc hiểu chùm</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="verified">Đã duyệt (verified)</option>
            <option value="pending_review">Chờ duyệt (pending_review)</option>
          </select>

          <button
            onClick={loadData}
            className="px-4 py-1.5 bg-brand-900 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-brand-800 transition"
          >
            Tìm kiếm
          </button>
        </div>
      </div>

      {/* Questions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-28">Nguồn / Câu</th>
                <th className="py-3 px-4 w-20">Dạng</th>
                <th className="py-3 px-4">Nội dung câu hỏi & Các lựa chọn</th>
                <th className="py-3 px-4 w-28 text-center">Đáp án</th>
                <th className="py-3 px-4 w-28 text-center">Trạng thái</th>
                <th className="py-3 px-4 w-32 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Đang tải dữ liệu câu hỏi...
                  </td>
                </tr>
              ) : questions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Không tìm thấy câu hỏi nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                questions.map((q) => {
                  const isEditing = editingId === q.id;
                  const isPending = q.status === 'pending_review';

                  return (
                    <tr key={q.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 align-top">
                        <div className="font-bold text-slate-900">Câu {q.source_q_num}</div>
                        <div className="text-[10px] text-slate-400 line-clamp-1">{q.source_file}</div>
                      </td>

                      <td className="py-3.5 px-4 align-top">
                        <span className="px-2 py-0.5 rounded bg-brand-50 text-brand-800 font-bold text-[11px] border border-brand-200">
                          {q.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 align-top">
                        <p className="text-slate-900 font-semibold text-xs leading-relaxed mb-2 line-clamp-2">
                          {q.content}
                        </p>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-slate-600">
                          <div><strong className="text-slate-800">A.</strong> {q.option_a}</div>
                          <div><strong className="text-slate-800">B.</strong> {q.option_b}</div>
                          <div><strong className="text-slate-800">C.</strong> {q.option_c}</div>
                          <div><strong className="text-slate-800">D.</strong> {q.option_d}</div>
                        </div>

                        {q.explanation && (
                          <div className="mt-2 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 line-clamp-2">
                            💡 <em>{q.explanation}</em>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center align-top">
                        {isEditing ? (
                          <input
                            type="text"
                            maxLength={1}
                            value={editAnswer}
                            onChange={(e) => setEditAnswer(e.target.value.toUpperCase())}
                            className="w-10 text-center font-bold uppercase border-2 border-brand-500 rounded-lg p-1 text-sm"
                          />
                        ) : (
                          <span className="font-black text-base text-brand-700 bg-brand-50 border border-brand-200 px-2.5 py-1 rounded-lg">
                            {q.correct_answer || q.ai_suggested_answer || '?'}
                          </span>
                        )}
                        {q.answer_source === 'ai_resolved' && (
                          <div className="text-[10px] text-brand-600 mt-1 font-semibold flex items-center justify-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>AI Đề xuất</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center align-top">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Chờ duyệt
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Đã duyệt</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center align-top">
                        {isEditing ? (
                          <button
                            onClick={() => handleVerify(q.id, editAnswer, editExplanation || q.explanation)}
                            className="flex items-center justify-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm w-full"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Lưu</span>
                          </button>
                        ) : (
                          <div className="flex flex-col gap-1.5">
                            {isPending && (
                              <button
                                onClick={() => handleVerify(q.id, q.ai_suggested_answer || 'A', q.ai_suggested_explanation || q.explanation)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition"
                              >
                                Duyệt ngay
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setEditingId(q.id);
                                setEditAnswer(q.correct_answer || q.ai_suggested_answer || '');
                                setEditExplanation(q.explanation || q.ai_suggested_explanation || '');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
                            >
                              Sửa đáp án
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
