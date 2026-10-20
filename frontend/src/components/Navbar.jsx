import React, { useState } from 'react';
import { BookOpen, Award, CheckCircle2, ShieldCheck, User, Sparkles, Menu, X, Flame, QrCode, Share2, BarChart3 } from 'lucide-react';
import ShareModal from './ShareModal';

export default function Navbar({ activeTab, setActiveTab, studentName, setStudentName, isExamActive }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(studentName || 'HSA')}&backgroundColor=e0e7ff,c7d2fe`;

  const navItems = [
    { id: 'mock', label: 'Thi thử (50 câu)', icon: CheckCircle2, badge: 'HSA 2026' },
    { id: 'practice', label: 'Luyện theo Dạng', icon: BookOpen, badge: 'Kho 4.028 câu' },
    { id: 'leaderboard', label: 'Bảng Vinh Danh', icon: Award, badge: 'Top 100' },
    { id: 'analytics', label: 'Thống kê & Tác động', icon: BarChart3, badge: 'Dự thi AI' },
    { id: 'admin', label: 'Quản trị Đề', icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Brand */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => !isExamActive && setActiveTab('mock')}
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-glow-blue group-hover:scale-105 transition-transform duration-200">
              <span className="font-extrabold text-xl tracking-wider font-sans">HSA</span>
            </div>
            <div>
              <div className="font-extrabold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>HSA Master</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/70 shadow-2xs">
                  2026 PRO
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-500">Tư duy Định tính • Ngôn ngữ & Văn học</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1.5 bg-slate-100/70 p-1.5 rounded-2xl border border-slate-200/60">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  disabled={isExamActive && item.id !== 'mock'}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 relative ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                  } ${isExamActive && item.id !== 'mock' ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                  {item.badge && !isActive && (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-indigo-100/70 text-indigo-700">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Student Profile Avatar, Streak & Share */}
          <div className="hidden sm:flex items-center gap-2.5">
            <button
              onClick={() => setShareModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-indigo-50/80 hover:bg-indigo-100/90 text-indigo-700 font-bold text-xs border border-indigo-200 shadow-2xs hover:scale-105 active:scale-95 transition-all"
              title="Chia sẻ nhanh & Mã QR Lớp học"
            >
              <QrCode className="w-4 h-4 text-indigo-600" />
              <span>Chia sẻ / QR</span>
            </button>

            <div className="flex items-center gap-2.5 bg-white pl-2 pr-3 py-1.5 rounded-2xl border-2 border-slate-200 shadow-2xs hover:border-indigo-300 transition">
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-8 h-8 rounded-xl bg-indigo-50 p-0.5 border border-indigo-200 shadow-2xs"
              />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-400 leading-none">Thí sinh</span>
                <input
                  type="text"
                  disabled={isExamActive}
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value || 'Thí sinh')}
                  className="bg-transparent text-xs font-extrabold text-slate-800 w-24 sm:w-28 focus:outline-none focus:ring-0 truncate"
                  placeholder="Tên của bạn"
                  title="Nhập tên thí sinh để lưu thành tích"
                />
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-100 flex flex-col space-y-2 animate-in slide-in-from-top-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  disabled={isExamActive && item.id !== 'mock'}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold transition ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-current">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <button
              onClick={() => {
                setShareModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition"
            >
              <QrCode className="w-4 h-4 text-indigo-600" />
              <span>🔗 Chia sẻ Web / Mã QR Lớp học</span>
            </button>
          </div>
        )}
      </div>

      {/* Share & QR Code Modal */}
      <ShareModal isOpen={shareModalOpen} onClose={() => setShareModalOpen(false)} />
    </header>
  );
}
