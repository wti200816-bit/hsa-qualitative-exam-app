import React from 'react';
import { BookOpen, Award, CheckCircle2, ShieldCheck, User } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, studentName, setStudentName, isExamActive }) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => !isExamActive && setActiveTab('mock')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <span className="font-extrabold text-lg tracking-wider">HSA</span>
            </div>
            <div>
              <div className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>HSA Master</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">2026</span>
              </div>
              <p className="text-xs text-slate-500">Luyện thi ĐGNL ĐHQGHN • Ngôn ngữ & Văn học</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              disabled={isExamActive && activeTab === 'mock'}
              onClick={() => setActiveTab('mock')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'mock'
                  ? 'bg-brand-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-brand-700 hover:bg-brand-50'
              } ${isExamActive ? 'opacity-80' : ''}`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Thi thử (50 câu)</span>
            </button>

            <button
              disabled={isExamActive}
              onClick={() => setActiveTab('practice')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'practice'
                  ? 'bg-brand-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-brand-700 hover:bg-brand-50'
              } ${isExamActive ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Luyện tập theo Dạng</span>
            </button>

            <button
              disabled={isExamActive}
              onClick={() => setActiveTab('leaderboard')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'leaderboard'
                  ? 'bg-brand-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-brand-700 hover:bg-brand-50'
              } ${isExamActive ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <Award className="w-4 h-4" />
              <span>Bảng Vinh Danh</span>
            </button>

            <button
              disabled={isExamActive}
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'admin'
                  ? 'bg-brand-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-brand-700 hover:bg-brand-50'
              } ${isExamActive ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Quản trị & Duyệt đề</span>
            </button>
          </nav>

          {/* Student Profile */}
          <div className="flex items-center pl-3 border-l border-slate-200">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
              <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-800 flex items-center justify-center font-bold text-xs">
                <User className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                disabled={isExamActive}
                value={studentName}
                onChange={(e) => setStudentName(e.target.value || 'Thí sinh')}
                className="bg-transparent text-xs font-semibold text-slate-700 w-24 sm:w-28 focus:outline-none focus:ring-0"
                placeholder="Tên thí sinh"
                title="Nhập tên của bạn"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
