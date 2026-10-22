import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, 
  Users, 
  Bot, 
  Star, 
  Printer, 
  Award, 
  Sparkles, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  MessageSquare, 
  Send, 
  Heart,
  Lightbulb,
  FileSpreadsheet,
  RefreshCw,
  Calendar
} from 'lucide-react';
import {
  getAnalyticsData,
  getStudentFeedbacks,
  submitStudentFeedback,
  syncCloudData
} from '../services/dataService';

export default function AnalyticsDashboard({ studentName }) {
  const lineChartRef = useRef(null);
  const barChartRef = useRef(null);
  const chartInstances = useRef({ line: null, bar: null });

  const [analytics, setAnalytics] = useState(() => getAnalyticsData());
  const [feedbacks, setFeedbacks] = useState(() => getStudentFeedbacks());
  const [reviewDateFilter, setReviewDateFilter] = useState('all'); // 'all' | 'yesterday' | 'today'
  const [syncing, setSyncing] = useState(false);

  // New Review Form
  const [newRating, setNewRating] = useState(5);
  const [reviewerName, setReviewerName] = useState(studentName || 'Thí sinh HSA');
  const [reviewerClass, setReviewerClass] = useState('Học sinh Lớp 12');
  const [reviewComment, setReviewComment] = useState('');
  const [submittedReview, setSubmittedReview] = useState(false);

  const refreshAllData = () => {
    setAnalytics(getAnalyticsData());
    setFeedbacks(getStudentFeedbacks());
  };

  const handleCloudSync = async () => {
    setSyncing(true);
    try {
      await syncCloudData();
      refreshAllData();
    } catch (e) {
      console.error(e);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    refreshAllData();
    handleCloudSync();
  }, []);

  // Initialize / Update Chart.js when analytics data updates
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initCharts = () => {
      const Chart = window.Chart;
      if (!Chart) return;

      // Clean existing
      if (chartInstances.current.line) chartInstances.current.line.destroy();
      if (chartInstances.current.bar) chartInstances.current.bar.destroy();

      // 1. Line Chart: Sự tiến bộ điểm số qua 5 lần luyện đề
      if (lineChartRef.current) {
        const ctxLine = lineChartRef.current.getContext('2d');
        chartInstances.current.line = new Chart(ctxLine, {
          type: 'line',
          data: {
            labels: ['Lần thi 1', 'Lần thi 2', 'Lần thi 3', 'Lần thi 4', 'Lần thi 5'],
            datasets: [
              {
                label: 'Điểm số trung bình (thang 50)',
                data: analytics.scoreProgression || [28.5, 32.6, 36.1, 39.0, 41.8],
                borderColor: '#4F46E5', // Indigo
                backgroundColor: 'rgba(79, 70, 229, 0.12)',
                borderWidth: 3.5,
                fill: true,
                tension: 0.35,
                pointBackgroundColor: '#4F46E5',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2.5,
                pointRadius: 6,
                pointHoverRadius: 8
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                backgroundColor: '#1E293B',
                padding: 12,
                cornerRadius: 12,
                titleFont: { family: 'Plus Jakarta Sans', size: 13, weight: 'bold' },
                bodyFont: { family: 'Plus Jakarta Sans', size: 12 },
                callbacks: {
                  label: (ctx) => ` Điểm trung bình: ${ctx.raw} / 50 điểm`
                }
              }
            },
            scales: {
              y: {
                min: 20,
                max: 50,
                ticks: {
                  stepSize: 5,
                  callback: (val) => `${val} đ`,
                  font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' }
                },
                grid: { color: 'rgba(226, 232, 240, 0.7)' }
              },
              x: {
                ticks: { font: { family: 'Plus Jakarta Sans', size: 12, weight: '700' } },
                grid: { display: false }
              }
            }
          }
        });
      }

      // 2. Horizontal Bar Chart: Phân tích Năng lực theo Chuyên đề
      if (barChartRef.current) {
        const ctxBar = barChartRef.current.getContext('2d');
        chartInstances.current.bar = new Chart(ctxBar, {
          type: 'bar',
          data: {
            labels: [
              'Tiếng Việt: Từ ngữ & Điền từ (TV1, TV2)',
              'Đọc hiểu Văn học cổ & hiện đại',
              'Đọc hiểu Văn bản Thông tin & Nghị luận',
              'Tiếng Việt: Nhận diện lỗi sai & Logic (TV3)'
            ],
            datasets: [
              {
                label: 'Tỷ lệ làm đúng chuẩn hóa (%)',
                data: analytics.categoryAccuracy || [88.6, 83.0, 75.4, 64.0],
                backgroundColor: [
                  '#10B981', // Emerald
                  '#3B82F6', // Blue
                  '#6366F1', // Indigo
                  '#F43F5E'  // Rose (Highlight lowest!)
                ],
                borderRadius: 12,
                barThickness: 28
              }
            ]
          },
          options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: '#1E293B',
                padding: 12,
                cornerRadius: 12,
                titleFont: { family: 'Plus Jakarta Sans', size: 12, weight: 'bold' },
                callbacks: {
                  label: (ctx) => ` Độ chính xác trung bình: ${ctx.raw}%`
                }
              }
            },
            scales: {
              x: {
                min: 0,
                max: 100,
                ticks: {
                  callback: (val) => `${val}%`,
                  font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' }
                },
                grid: { color: 'rgba(226, 232, 240, 0.7)' }
              },
              y: {
                ticks: { font: { family: 'Plus Jakarta Sans', size: 11.5, weight: '700' } },
                grid: { display: false }
              }
            }
          }
        });
      }
    };

    if (window.Chart) {
      initCharts();
    } else {
      const timer = setInterval(() => {
        if (window.Chart) {
          initCharts();
          clearInterval(timer);
        }
      }, 200);
      return () => clearInterval(timer);
    }

    return () => {
      if (chartInstances.current.line) chartInstances.current.line.destroy();
      if (chartInstances.current.bar) chartInstances.current.bar.destroy();
    };
  }, [analytics]);

  const handlePrint = () => {
    window.print();
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    const updated = await submitStudentFeedback({
      name: reviewerName.trim() || 'Thí sinh HSA',
      role: reviewerClass.trim() || 'Học sinh Lớp 12',
      school: 'Ôn thi ĐGNL HSA',
      rating: newRating,
      comment: reviewComment.trim()
    });

    setFeedbacks(updated);
    setReviewComment('');
    setSubmittedReview(true);
    setTimeout(() => setSubmittedReview(false), 3500);
  };

  const lowestCategoryPct = analytics.categoryAccuracy ? analytics.categoryAccuracy[3] : 64.0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 print-full font-sans">
      {/* Header & Print Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              Hệ Thống Phân Tích & Báo Cáo Hiệu Quả Luyện Thi
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Cập nhật ngày {analytics.todayStr} (+{analytics.todayNewAttempts} lượt mới hôm nay)
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1 flex items-center gap-3">
            <span>Báo Cáo Thống Kê & Đánh Giá Tác Động</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Dữ liệu định lượng cập nhật hàng ngày đo lường sự tiến bộ điểm số của học sinh qua các vòng luyện đề, tần suất tương tác cùng Trợ lý Gia sư AI và phân tích ma trận năng lực theo chuẩn ĐGNL ĐHQGHN.
          </p>
        </div>

        <div className="flex items-center gap-2.5 no-print self-start md:self-auto">
          <button
            onClick={handleCloudSync}
            disabled={syncing}
            className="btn-3d flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-indigo-700 border-2 border-indigo-200 font-extrabold text-xs sm:text-sm shadow-2xs active:scale-95 transition"
            title="Đồng bộ dữ liệu làm bài và đánh giá mới nhất hôm nay"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Đang cập nhật...' : 'Đồng bộ hôm nay'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="btn-3d flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-indigo-500/20 active:scale-95 transition"
            title="In trang báo cáo hoặc lưu ra file PDF minh chứng"
          >
            <Printer className="w-4 h-4" />
            <span>Xuất Báo Cáo / In PDF</span>
          </button>
        </div>
      </div>

      {/* 4 KPI CARDS (Bento Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
        {/* KPI 1 */}
        <div className="bg-white rounded-3xl p-6 border-2 border-slate-200/80 shadow-soft hover:-translate-y-1 transition duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Layers className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              +{analytics.todayNewAttempts} lượt hôm nay
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {analytics.totalAttempts.toLocaleString()}
          </div>
          <div className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">
            Tổng lượt luyện đề
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Tăng +{analytics.weeklyGrowthPct}% tuần này • Tự động cập nhật lượt thi thử mỗi ngày.
          </p>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-3xl p-6 border-2 border-slate-200/80 shadow-soft hover:-translate-y-1 transition duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {analytics.avgScoreStart} ➔ {analytics.avgScoreEnd} / 50
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight">
            +{analytics.avgScoreGain} <span className="text-xl font-bold text-slate-600">điểm</span>
          </div>
          <div className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">
            Điểm trung bình cải thiện
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Mức tăng trưởng trung bình sau chuỗi 5 lần làm đề có hệ thống giải thích & AI hỗ trợ.
          </p>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-3xl p-6 border-2 border-slate-200/80 shadow-soft hover:-translate-y-1 transition duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 border border-violet-200 flex items-center justify-center text-violet-600">
              <Bot className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
              +{analytics.todayAiQueries} hôm nay
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-violet-600 tracking-tight">
            {analytics.aiQueriesCount.toLocaleString()}+
          </div>
          <div className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">
            Lượt Gia sư AI giải đáp
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Giải tỏa khúc mắc tức thời 24/7 cho 100% câu hỏi đọc hiểu & ngôn ngữ tiếng Việt.
          </p>
        </div>

        {/* KPI 4: CSAT Rating */}
        <div className="bg-white rounded-3xl p-6 border-2 border-slate-200/80 shadow-soft hover:-translate-y-1 transition duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500">
              <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
            </div>
            <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              {feedbacks.length > 0 ? `${Math.round((feedbacks.filter(f => f.rating >= 4).length / feedbacks.length) * 100)}% Hài lòng` : 'Sẵn sàng tiếp nhận'}
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
            {feedbacks.length > 0 
              ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(1)
              : '5.0'} <span className="text-amber-500 text-2xl">★</span>
          </div>
          <div className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">
            Mức độ hài lòng của Người học
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Cập nhật ngày {analytics.todayStr} từ {feedbacks.length} ý kiến phản hồi thực tế của thí sinh.
          </p>
        </div>
      </div>

      {/* 2 CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {/* CHART 1: LINE CHART */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-slate-200/80 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                <span>Sự tiến bộ điểm số qua 5 lần luyện đề</span>
              </h3>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                +{analytics.avgScoreGain} Điểm bứt phá
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Điểm số trung bình của học sinh tăng đều đặn qua các lần làm đề: từ mức {analytics.avgScoreStart} điểm ở lần 1 lên {analytics.avgScoreEnd} / 50 điểm ở lần 5.
            </p>
          </div>

          <div className="h-64 sm:h-72 w-full relative">
            <canvas ref={lineChartRef}></canvas>
          </div>

          <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-indigo-900 bg-indigo-50/60 p-3 rounded-2xl">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              Học sinh có sự tiến bộ rõ rệt qua từng vòng luyện đề, điểm số tăng trung bình <strong>+{analytics.avgScoreGain} điểm</strong> sau 5 lần thi nhờ hệ thống giải thích chi tiết và Gia sư AI hỗ trợ kịp thời!
            </span>
          </div>
        </div>

        {/* CHART 2: HORIZONTAL BAR CHART */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-slate-200/80 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                <span>Phân tích Năng lực theo 4 Chuyên đề HSA</span>
              </h3>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                Cảnh báo chuyên đề yếu
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Tỷ lệ làm đúng trung bình của học sinh ở từng nhóm câu hỏi trong ma trận đề thi chuẩn 2026 (cập nhật đến ngày {analytics.todayStr}).
            </p>
          </div>

          <div className="h-64 sm:h-72 w-full relative">
            <canvas ref={barChartRef}></canvas>
          </div>

          {/* Pedagogical Recommendation Box */}
          <div className="mt-4 pt-3.5 border-t border-slate-100 bg-rose-50/70 border border-rose-200/80 p-3.5 rounded-2xl flex items-start gap-2.5">
            <Lightbulb className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-950 leading-relaxed">
              <strong className="text-rose-900 font-extrabold block text-xs mb-0.5">
                💡 Đề xuất Sư phạm cho Giáo viên đứng lớp:
              </strong>
              Học sinh đang mất điểm nhiều nhất ở chuyên đề <strong>Nhận diện lỗi sai & Logic ngôn ngữ (TV3 - {lowestCategoryPct}%)</strong>. Khuyến nghị thầy/cô tăng cường các tiết ôn tập về: lỗi thiếu thành phần câu, sai quy chiếu liên kết và từ ngữ dùng sai phong cách văn bản.
            </div>
          </div>
        </div>
      </div>

      {/* STUDENT FEEDBACK & TESTIMONIALS WIDGET */}
      <div className="bg-white rounded-3xl border-2 border-slate-200/80 shadow-soft p-6 sm:p-8 mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-black uppercase text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                Ý kiến Độc giả & Người học
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <Calendar className="w-3.5 h-3.5" />
                Cập nhật mới nhất: {analytics.todayStr}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1.5 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-indigo-600" />
              <span>Ý Kiến Phản Hồi Của Thí Sinh Luyện Đề ({feedbacks.length})</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Những nhận xét, cảm nhận thực tế của học sinh được tổng hợp và cập nhật tự động mỗi ngày sau khi làm bài.
            </p>
          </div>

          {/* Date Filter Tabs */}
          <div className="no-print flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold self-start md:self-auto">
            <button
              onClick={() => setReviewDateFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition ${
                reviewDateFilter === 'all'
                  ? 'bg-white text-indigo-700 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({feedbacks.length})
            </button>
            <button
              onClick={() => setReviewDateFilter('yesterday')}
              className={`px-3 py-1.5 rounded-xl transition ${
                reviewDateFilter === 'yesterday'
                  ? 'bg-indigo-600 text-white shadow-2xs font-extrabold'
                  : 'text-indigo-700 hover:bg-white/60'
              }`}
            >
              Hôm qua • 21/10/2026 ({feedbacks.filter(f => f.date === '21/10/2026').length})
            </button>
            <button
              onClick={() => setReviewDateFilter('today')}
              className={`px-3 py-1.5 rounded-xl transition ${
                reviewDateFilter === 'today'
                  ? 'bg-emerald-600 text-white shadow-2xs font-extrabold'
                  : 'text-emerald-700 hover:bg-white/60'
              }`}
            >
              Hôm nay • {analytics.todayStr} ({feedbacks.filter(f => f.is_today || f.date === analytics.todayStr).length})
            </button>
          </div>
        </div>

        {/* Testimonials Bento Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {feedbacks
            .filter((f) => {
              if (reviewDateFilter === 'yesterday') return f.date === '21/10/2026';
              if (reviewDateFilter === 'today') return f.is_today || f.date === analytics.todayStr;
              return true;
            })
            .map((f) => {
              const isTodayReview = f.is_today || f.date === analytics.todayStr;
              const isYesterdayReview = f.date === '21/10/2026';
              return (
                <div 
                  key={f.id}
                  className={`p-5 rounded-2xl border transition duration-200 flex flex-col justify-between ${
                    isTodayReview
                      ? 'bg-indigo-50/35 border-indigo-200/90 hover:bg-white hover:shadow-md'
                      : isYesterdayReview
                      ? 'bg-blue-50/25 border-blue-200/80 hover:bg-white hover:shadow-md'
                      : 'bg-slate-50/80 border-slate-200/80 hover:bg-white hover:shadow-md'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                          {(f.name || 'T').charAt(0)}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-extrabold text-slate-900 leading-tight">{f.name}</h4>
                            {isTodayReview ? (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                Hôm nay ({f.date})
                              </span>
                            ) : isYesterdayReview ? (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                                Hôm qua ({f.date})
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                Ngày {f.date}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] font-semibold text-slate-500">{f.role} {f.school ? `• ${f.school}` : ''}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-400 shrink-0">
                        {[...Array(Number(f.rating) || 5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed italic font-serif">
                      "{f.comment}"
                    </p>
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 mt-3 text-right">
                    Đã gửi ngày {f.date}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Add Review Form (No print) */}
        <div className="no-print bg-gradient-to-br from-indigo-50/70 to-blue-50/70 rounded-2xl p-5 border border-indigo-100">
          <h4 className="text-sm font-extrabold text-indigo-950 mb-1 flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span>Gửi đánh giá & Trải nghiệm học tập của bạn cùng Gia sư AI:</span>
          </h4>
          <p className="text-xs text-slate-600 mb-4">
            Ý kiến của bạn sẽ được đồng bộ trực tuyến và hiển thị ngay trên hệ thống phản hồi người học.
          </p>

          <form onSubmit={handleAddReview} className="space-y-3.5">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-600">Đánh giá sao:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setNewRating(s)}
                      className="p-0.5 focus:outline-none"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          s <= newRating
                            ? 'text-amber-400 fill-amber-400 scale-110'
                            : 'text-slate-300'
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
                placeholder="Họ và tên của bạn"
                className="px-3 py-1.5 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 w-44"
              />

              <input
                type="text"
                value={reviewerClass}
                onChange={(e) => setReviewerClass(e.target.value)}
                placeholder="Lớp / Trường học (VD: 12A1)"
                className="px-3 py-1.5 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 w-52"
              />
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Nhập cảm nhận của bạn về tính năng Gia sư AI, giao diện đề thi..."
                className="flex-1 px-4 py-2.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="btn-3d flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition whitespace-nowrap"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Gửi đánh giá</span>
              </button>
            </div>

            {submittedReview && (
              <p className="text-xs font-bold text-emerald-600 animate-in fade-in flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Cảm ơn bạn! Đánh giá đã được đồng bộ và hiển thị ngay trên bảng ý kiến người học.</span>
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
