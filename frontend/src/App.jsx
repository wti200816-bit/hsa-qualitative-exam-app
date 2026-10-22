import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ExamRoom from './components/ExamRoom';
import PracticeRoom from './components/PracticeRoom';
import ResultScreen from './components/ResultScreen';
import Leaderboard from './components/Leaderboard';
import AdminDashboard from './components/AdminDashboard';
import AiChatDrawer from './components/AiChatDrawer';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import InstallAppModal from './components/InstallAppModal';
import { Play, Sparkles, BookOpen, Clock, Award, ShieldCheck, ChevronRight, CheckCircle2, Flame, Target, Layers, Smartphone, Download, Video, X } from 'lucide-react';
import { getTemplates, getTemplateExam, generateRandomExam, submitExam } from './services/dataService';

export default function App() {
  const [activeTab, setActiveTab] = useState('mock'); // 'mock' | 'practice' | 'result' | 'leaderboard' | 'analytics' | 'admin'
  const [studentName, setStudentName] = useState('Thí sinh HSA');
  const [templates, setTemplates] = useState([]);
  const [loadingExam, setLoadingExam] = useState(false);
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  
  // Active Exam state
  const [activeExam, setActiveExam] = useState(null);
  const [examResult, setExamResult] = useState(null);

  // AI Chat state
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [chatQuestionContext, setChatQuestionContext] = useState(null);

  // Load standardized exam templates
  useEffect(() => {
    getTemplates()
      .then((data) => setTemplates(data || []))
      .catch((err) => console.error('Error fetching templates:', err));
  }, []);

  // Start Randomized 50-Question Mock Exam
  const handleStartRandomExam = async () => {
    setLoadingExam(true);
    try {
      const data = await generateRandomExam(studentName);
      setActiveExam(data);
      setActiveTab('mock');
    } catch (err) {
      alert('Không thể khởi tạo bài thi: ' + err.message);
    } finally {
      setLoadingExam(false);
    }
  };

  // Start Specific Template Exam
  const handleStartTemplateExam = async (templateId) => {
    setLoadingExam(true);
    try {
      const data = await getTemplateExam(templateId);
      setActiveExam(data);
      setActiveTab('mock');
    } catch (err) {
      alert('Không thể mở đề thi: ' + err.message);
    } finally {
      setLoadingExam(false);
    }
  };

  // Submit Exam
  const handleSubmitExam = async (submissionPayload) => {
    try {
      const result = await submitExam({
        student_name: studentName,
        ...submissionPayload
      });
      setActiveExam(null);
      setExamResult(result);
      setActiveTab('result');
    } catch (err) {
      alert('Có lỗi khi nộp bài: ' + err.message);
    }
  };

  // Open Context-Aware AI Chat
  const handleOpenAiChat = (qContext) => {
    setChatQuestionContext(qContext);
    setAiChatOpen(true);
  };

  return (
    <div className="min-h-screen bg-page flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        studentName={studentName}
        setStudentName={setStudentName}
        isExamActive={!!activeExam}
        onOpenInstallModal={() => setInstallModalOpen(true)}
      />

      <main className="flex-1">
        {/* TAB 1: MOCK EXAM */}
        {activeTab === 'mock' && (
          activeExam ? (
            <ExamRoom
              examData={activeExam}
              onSubmitExam={handleSubmitExam}
              onCancel={() => setActiveExam(null)}
            />
          ) : (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
              {/* Bento Hero Section */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-10">
                {/* Hero Main Card */}
                <div className="lg:col-span-8 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white rounded-3xl p-7 sm:p-10 shadow-xl shadow-indigo-600/20 relative overflow-hidden flex flex-col justify-between min-h-[280px]">
                  <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-white/10 pointer-events-none blur-3xl"></div>

                  <div className="relative z-10 max-w-xl">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-white/20 text-white border border-white/20 uppercase tracking-wider mb-3 backdrop-blur-sm">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                      Quy Chuẩn Đề Mẫu ĐHQGHN 2026
                    </span>
                    <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                      Luyện Thi ĐGNL HSA
                    </h1>
                    <p className="text-xs sm:text-sm text-indigo-100 mt-2.5 leading-relaxed font-medium">
                      Phần thi Tư duy Định tính (Ngôn ngữ & Văn học): <strong>50 câu / 60 phút</strong>.
                      Ma trận chuẩn xác 100% gồm 15 câu Tiếng Việt, 10 câu Đọc hiểu ngắn và 25 câu Đọc hiểu chùm.
                    </p>
                  </div>

                  <div className="mt-8 relative z-10 flex flex-wrap items-center gap-3.5">
                    <button
                      onClick={handleStartRandomExam}
                      disabled={loadingExam}
                      className="btn-3d flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-sm border-2 border-amber-500 border-b-4 shadow-lg shadow-amber-400/30"
                    >
                      <Play className="w-4 h-4 fill-slate-950" />
                      <span>{loadingExam ? 'Đang tạo đề thi...' : 'Vào Thi Thử Đề Ngẫu Nhiên 🎯'}</span>
                    </button>
                    <button
                      onClick={() => setVideoModalOpen(true)}
                      className="btn-3d flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-extrabold text-xs sm:text-sm border-2 border-white/30 border-b-4 backdrop-blur-sm transition"
                    >
                      <Video className="w-4 h-4 text-amber-300" />
                      <span>🎬 Xem Video Hướng Dẫn</span>
                    </button>
                    <div className="text-xs text-indigo-200 font-bold flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-300" /> 60 phút • 50 câu • Tự động chấm điểm
                    </div>
                  </div>
                </div>

                {/* Bento Side Stats Cards */}
                <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                  {/* Stat Card 1 */}
                  <div className="bg-white rounded-3xl border-2 border-slate-200/80 p-5 shadow-soft flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                        Hệ thống Đề thi
                      </span>
                      <div className="text-3xl font-black text-slate-900 mt-1">50 Đề</div>
                      <p className="text-xs text-slate-500 font-medium">Chuẩn hóa ma trận HSA 2026</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-200 shrink-0">
                      <BookOpen className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Stat Card 2 */}
                  <div className="bg-white rounded-3xl border-2 border-slate-200/80 p-5 shadow-soft flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Ngân hàng Câu hỏi
                      </span>
                      <div className="text-3xl font-black text-slate-900 mt-1">4.128 Câu</div>
                      <p className="text-xs text-slate-500 font-medium">100% có đáp án & lời giải</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-200 shrink-0">
                      <Target className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile App Download & Install CTA Banner */}
              <div className="mb-8 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border-2 border-emerald-200/80 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <span>Tải App "HSA Master" Về Điện Thoại</span>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">Cài đặt 1 chạm</span>
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Cài trực tiếp vào iPhone & Android để làm bài toàn màn hình, mượt mà và không tốn bộ nhớ máy.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setInstallModalOpen(true)}
                  className="btn-3d flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-md shadow-emerald-500/25 active:scale-95 transition whitespace-nowrap self-stretch sm:self-auto justify-center"
                >
                  <Download className="w-4 h-4" />
                  <span>📲 Cài đặt App ngay</span>
                </button>
              </div>

              {/* Standardized Exam Templates Header */}
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-indigo-600" />
                    <span>Bộ 50 Đề Thi Chuẩn Hóa HSA</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Chọn bất kỳ đề nào bên dưới để vào làm bài thi thử bấm giờ 60 phút
                  </p>
                </div>
                <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200 self-start sm:self-auto">
                  50 / 50 Đề Hoàn Chỉnh
                </span>
              </div>

              {/* Bento Grid 50 Templates */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="bg-white rounded-3xl border-2 border-slate-200/80 p-5 shadow-soft hover:shadow-lg hover:border-indigo-400 transition-all duration-200 flex flex-col justify-between group hover:-translate-y-1"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-800 text-xs font-black border border-indigo-200">
                          MÃ ĐỀ {tpl.exam_num < 10 ? `0${tpl.exam_num}` : tpl.exam_num}
                        </span>
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-indigo-500" /> 60 phút
                        </span>
                      </div>

                      <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-indigo-600 transition line-clamp-1 mb-2">
                        {tpl.title}
                      </h3>

                      <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/60 mb-4">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>50 câu hỏi đúng ma trận 15-10-25</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartTemplateExam(tpl.id)}
                      disabled={loadingExam}
                      className="btn-3d w-full flex items-center justify-center gap-1.5 py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-600 text-indigo-800 hover:text-white font-extrabold text-xs transition border-2 border-indigo-200 hover:border-indigo-600 border-b-4 shadow-2xs"
                    >
                      <span>Vào làm đề này</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )
        )}

        {/* TAB 2: PRACTICE */}
        {activeTab === 'practice' && (
          <PracticeRoom onOpenAiChat={handleOpenAiChat} />
        )}

        {/* TAB 3: RESULT SCREEN */}
        {activeTab === 'result' && examResult && (
          <ResultScreen
            resultData={examResult}
            onRetakeExam={() => {
              setExamResult(null);
              handleStartRandomExam();
            }}
            onViewLeaderboard={() => setActiveTab('leaderboard')}
            onViewAnalytics={() => setActiveTab('analytics')}
            onOpenAiChat={handleOpenAiChat}
          />
        )}

        {/* TAB 4: LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <Leaderboard studentName={studentName} />
        )}

        {/* TAB 5: ANALYTICS & IMPACT REPORT */}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard studentName={studentName} />
        )}

        {/* TAB 6: ADMIN DASHBOARD */}
        {activeTab === 'admin' && (
          <AdminDashboard />
        )}
      </main>

      {/* AI Chat Drawer Component */}
      <AiChatDrawer
        isOpen={aiChatOpen}
        onClose={() => setAiChatOpen(false)}
        questionContext={chatQuestionContext}
      />

      {/* Install Mobile App Modal */}
      <InstallAppModal
        isOpen={installModalOpen}
        onClose={() => setInstallModalOpen(false)}
      />

      {/* Video Tutorial Modal */}
      {videoModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setVideoModalOpen(false)}
        >
          <div
            className="bg-slate-900 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border-2 border-indigo-500/40"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Video className="w-5 h-5 text-amber-300" />
                <h3 className="font-extrabold text-sm sm:text-base">
                  🎬 Video Hướng Dẫn Sử Dụng HSA Master AI (Full HD)
                </h3>
              </div>
              <button
                onClick={() => setVideoModalOpen(false)}
                className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 sm:p-5 bg-slate-950">
              <video
                src="./Huong_Dan_Su_Dung_HSA_Master_AI.mp4"
                controls
                autoPlay
                className="w-full rounded-2xl shadow-lg aspect-video bg-black"
              >
                Trình duyệt của bạn không hỗ trợ phát video trực tiếp.
              </video>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
