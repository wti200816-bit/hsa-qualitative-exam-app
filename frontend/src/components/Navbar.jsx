import React, { useState } from 'react';
import { BookOpen, Award, CheckCircle2, ShieldCheck, User, Sparkles, Menu, X, Flame, QrCode, Share2, BarChart3, Smartphone, Download } from 'lucide-react';
import ShareModal from './ShareModal';
import InstallAppModal from './InstallAppModal';

export default function Navbar({ activeTab, setActiveTab, studentName, setStudentName, onUpdateStudentName, isExamActive, onOpenInstallModal }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [installModalOpenInternal, setInstallModalOpenInternal] = useState(false);
  const [editName, setEditName] = useState(studentName || 'Thí sinh HSA');
  const [savedToast, setSavedToast] = useState(false);

  React.useEffect(() => {
    if (studentName) setEditName(studentName);
  }, [studentName]);

  const handleSaveName = () => {
    const val = editName.trim() || 'Thí sinh HSA';
    if (onUpdateStudentName) {
      onUpdateStudentName(val);
    } else if (setStudentName) {
      setStudentName(val);
    }
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(studentName || 'HSA')}&backgroundColor=e0e7ff,c7d2fe`;

  const handleOpenInstall = () => {
    if (onOpenInstallModal) {
      onOpenInstallModal();
    } else {
      setInstallModalOpenInternal(true);
    }
  };

  const navItems = [
    { id: 'mock', label: 'Thi thử (50 câu)', icon: CheckCircle2, badge: 'HSA 2026' },
    { id: 'practice', label: 'Luyện theo Dạng', icon: BookOpen, badge: 'Kho 4.128 câu' },
    { id: 'leaderboard', label: 'Bảng Vinh Danh', icon: Award, badge: 'Top 100' },
    { id: 'analytics', label: 'Thống kê & Tác động', icon: BarChart3 },
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

          {/* Student Profile Avatar, Streak, Share & Install App */}
          <div className="hidden sm:flex items-center gap-2.5">
            <button
              onClick={handleOpenInstall}
              className="btn-3d flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
              title="Cài đặt App HSA Master về điện thoại"
            >
              <Smartphone className="w-4 h-4" />
              <span>📲 Cài App</span>
            </button>

            <button
              onClick={() => setShareModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-indigo-50/80 hover:bg-indigo-100/90 text-indigo-700 font-bold text-xs border border-indigo-200 shadow-2xs hover:scale-105 active:scale-95 transition-all"
              title="Chia sẻ nhanh & Mã QR Lớp học"
            >
              <QrCode className="w-4 h-4 text-indigo-600" />
              <span>Chia sẻ / QR</span>
            </button>

            <div className="flex items-center gap-2 bg-white pl-2.5 pr-2 py-1.5 rounded-2xl border-2 border-slate-200 shadow-2xs hover:border-indigo-300 transition">
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-8 h-8 rounded-xl bg-indigo-50 p-0.5 border border-indigo-200 shadow-2xs shrink-0"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] uppercase font-black text-indigo-600 leading-none">Thí sinh</span>
                  {savedToast && (
                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1 rounded animate-pulse">
                      ✓ Đã lưu BXH
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  disabled={isExamActive}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={handleSaveName}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  className="bg-transparent text-xs font-black text-slate-800 w-28 sm:w-36 focus:outline-none focus:bg-slate-50 focus:rounded px-1 truncate"
                  placeholder="Gõ tên để vinh danh..."
                  title="Gõ tên bạn và nhấn Lưu để xếp hạng Bảng Vinh Danh"
                />
              </div>
              <button
                onClick={handleSaveName}
                disabled={isExamActive}
                className="px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[11px] shadow-xs active:scale-95 transition shrink-0"
                title="Lưu tên vào Bảng Vinh Danh"
              >
                {savedToast ? '✓' : 'Lưu'}
              </button>
            </div>
          </div>

          {/* Mobile Menu & Quick Install Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={handleOpenInstall}
              className="btn-3d flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-[11px] shadow-xs active:scale-95"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Cài App</span>
            </button>
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
            {/* Mobile Student Profile Input */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-indigo-50/70 border border-indigo-200">
              <div className="flex items-center gap-2.5">
                <img src={avatarUrl} alt="Avatar" className="w-8 h-8 rounded-xl bg-white border border-indigo-200 p-0.5" />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-black text-indigo-700">Tên Thí Sinh Vinh Danh</span>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                    className="text-xs font-black text-slate-900 bg-white px-2 py-1 rounded-lg border border-slate-200 w-40"
                    placeholder="Gõ tên để vinh danh..."
                  />
                </div>
              </div>
              <button
                onClick={handleSaveName}
                className="btn-3d px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-black shrink-0"
              >
                {savedToast ? '✓ Đã lưu' : 'Lưu tên'}
              </button>
            </div>
            <button
              onClick={() => {
                handleOpenInstall();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-black bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition"
            >
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>📲 Cài đặt App về Điện thoại</span>
            </button>

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

      {/* Install App Modal */}
      <InstallAppModal isOpen={installModalOpenInternal} onClose={() => setInstallModalOpenInternal(false)} />
    </header>
  );
}
