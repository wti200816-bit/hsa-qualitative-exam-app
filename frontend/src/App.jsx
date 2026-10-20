import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ExamRoom from './components/ExamRoom';
import PracticeRoom from './components/PracticeRoom';
import ResultScreen from './components/ResultScreen';
import Leaderboard from './components/Leaderboard';
import AdminDashboard from './components/AdminDashboard';
import AiChatDrawer from './components/AiChatDrawer';
import { Play, Sparkles, BookOpen, Clock, Award, ShieldCheck, ChevronRight, CheckCircle2 } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

export default function App() {
  const [activeTab, setActiveTab] = useState('mock'); // 'mock' | 'practice' | 'result' | 'leaderboard' | 'admin'
  const [studentName, setStudentName] = useState('Thí sinh HSA');
  const [templates, setTemplates] = useState([]);
  const [loadingExam, setLoadingExam] = useState(false);
  
  // Active Exam state
  const [activeExam, setActiveExam] = useState(null);
  const [examResult, setExamResult] = useState(null);

  // AI Chat state
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [chatQuestionContext, setChatQuestionContext] = useState(null);

  // Load standardized exam templates
  useEffect(() => {
    fetch(`${API_BASE}/api/templates`)
      .then((res) => res.json())
      .then((data) => setTemplates(data || []))
      .catch((err) => console.error('Error fetching templates:', err));
  }, []);

  // Start Randomized 50-Question Mock Exam
  const handleStartRandomExam = async () => {
    setLoadingExam(true);
    try {
      const res = await fetch(`${API_BASE}/api/exam/generate?student_name=${encodeURIComponent(studentName)}`, {
        method: 'POST'
      });
      const data = await res.json();
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
      const res = await fetch(`${API_BASE}/api/templates/${templateId}`);
      const data = await res.json();
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
      const res = await fetch(`${API_BASE}/api/exam/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_name: studentName,
          ...submissionPayload
        })
      });
      const result = await res.json();
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        studentName={studentName}
        setStudentName={setStudentName}
        isExamActive={!!activeExam}
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Hero Banner */}
              <div className="bg-gradient-to-r from-brand-950 via-brand-900 to-brand-800 text-white rounded-3xl p-6 sm:p-10 shadow-xl shadow-brand-950/10 mb-10 relative overflow-hidden">
                <div className="max-w-2xl relative z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-500/30 text-brand-200 border border-brand-400/30 uppercase tracking-wider mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    Định Dạng Đề Mẫu ĐHQGHN 2026
                  </span>
                  <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                    Luyện Thi Đánh Giá Năng Lực HSA
                  </h1>
                  <p className="text-sm sm:text-base text-brand-200 mt-2 leading-relaxed">
                    Phần thi Tư duy Định tính (Ngôn ngữ & Văn học): 50 câu trắc nghiệm / 60 phút.
                    Ma trận chuẩn xác 100% với 15 câu Tiếng Việt, 10 câu Đọc hiểu độc lập và 25 câu Đọc hiểu chùm.
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-4">
                    <button
                      onClick={handleStartRandomExam}
                      disabled={loadingExam}
                      className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold text-sm shadow-lg shadow-brand-500/30 transition transform hover:-translate-y-0.5"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>{loadingExam ? 'Đang tạo đề thi...' : 'Vào Thi Thử Đề Ngẫu Nhiên'}</span>
                    </button>
                    <div className="text-xs text-brand-300 flex items-center gap-2">
                      <Clock className="w-4 h-4" /> 60 phút • 50 câu • Chấm điểm tức thì
                    </div>
                  </div>
                </div>
              </div>

              {/* Standardized Exam Templates Section */}
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-brand-700" />
                    <span>Bộ 47 Đề Thi Chuẩn Hóa Có Sẵn</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Được biên soạn công phu và chuẩn hóa theo đúng cấu trúc đề mẫu ĐGNL ĐHQGHN
                  </p>
                </div>
                <span className="text-xs font-bold text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
                  {templates.length} Đề thi hoàn chỉnh
                </span>
              </div>

              {/* Templates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-brand-300 transition flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="px-2.5 py-0.5 rounded-md bg-brand-50 text-brand-800 text-[11px] font-extrabold border border-brand-200">
                          MÃ ĐỀ {tpl.exam_num < 10 ? `0${tpl.exam_num}` : tpl.exam_num}
                        </span>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> 60 phút
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-brand-700 transition line-clamp-1 mb-1">
                        {tpl.title}
                      </h3>

                      {tpl.teacher_info && (
                        <p className="text-xs text-slate-500 line-clamp-1 mb-3 italic">
                          Biên soạn: {tpl.teacher_info}
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Đầy đủ 50 câu + Lời giải chi tiết</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartTemplateExam(tpl.id)}
                      disabled={loadingExam}
                      className="mt-4 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-100 hover:bg-brand-900 text-slate-700 hover:text-white font-bold text-xs transition"
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
          <PracticeRoom apiBase={API_BASE} onOpenAiChat={handleOpenAiChat} />
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
            onOpenAiChat={handleOpenAiChat}
          />
        )}

        {/* TAB 4: LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <Leaderboard apiBase={API_BASE} studentName={studentName} />
        )}

        {/* TAB 5: ADMIN DASHBOARD */}
        {activeTab === 'admin' && (
          <AdminDashboard apiBase={API_BASE} />
        )}
      </main>

      {/* AI Chat Drawer Component */}
      <AiChatDrawer
        isOpen={aiChatOpen}
        onClose={() => setAiChatOpen(false)}
        questionContext={chatQuestionContext}
        apiBase={API_BASE}
      />
    </div>
  );
}
