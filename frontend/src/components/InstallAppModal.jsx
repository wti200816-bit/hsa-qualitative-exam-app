import React, { useState, useEffect } from 'react';
import { 
  X, 
  Smartphone, 
  Download, 
  Sparkles, 
  Apple, 
  CheckCircle2, 
  Share, 
  PlusSquare, 
  Layers, 
  Check, 
  Copy, 
  ExternalLink,
  QrCode,
  Flame,
  ArrowRight
} from 'lucide-react';

export default function InstallAppModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('ios'); // 'ios' | 'android' | 'apk'
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstallNative, setCanInstallNative] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://wti200816-bit.github.io/hsa-qualitative-exam-app/';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(currentUrl)}`;

  useEffect(() => {
    // Detect OS
    if (typeof window !== 'undefined') {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      if (/android/i.test(userAgent)) {
        setActiveTab('android');
      } else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        setActiveTab('ios');
      }
    }

    // Listen for Chrome/Edge PWA install event
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstallNative(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      setInstalledSuccess(true);
      setCanInstallNative(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('Để cài đặt, bạn vui lòng bấm vào nút 3 chấm (⋮) ở góc trên trình duyệt và chọn "Cài đặt ứng dụng" hoặc "Thêm vào màn hình chính" nhé!');
      return;
    }
    setIsInstalling(true);
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstalledSuccess(true);
      }
      setDeferredPrompt(null);
      setCanInstallNative(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-5 sm:p-6 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-13 h-13 rounded-2xl bg-white p-1 shadow-md border-2 border-white/30 shrink-0">
              <img 
                src="./icon-192.png" 
                alt="HSA Master Icon" 
                className="w-full h-full object-cover rounded-xl"
                onError={(e) => { e.target.src = './favicon.svg'; }}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 shadow-xs">
                  Cài đặt 1 chạm
                </span>
                <span className="text-xs text-indigo-100 font-semibold">Dung lượng nhẹ &lt; 2MB</span>
              </div>
              <h3 className="text-xl font-black tracking-tight mt-0.5">Tải HSA Master Về Điện Thoại</h3>
              <p className="text-xs text-blue-100 mt-0.5">
                Chạy toàn màn hình, không quảng cáo, mở là thi ngay không cần App Store / CH Play!
              </p>
            </div>
          </div>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-slate-100 bg-slate-50 p-1.5 gap-1 shrink-0">
          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-2 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition ${
              activeTab === 'ios'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Apple className="w-4 h-4 text-slate-800" />
            <span>iPhone / iPad (iOS)</span>
          </button>

          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-2 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition ${
              activeTab === 'android'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <span>Điện thoại Android</span>
          </button>

          <button
            onClick={() => setActiveTab('apk')}
            className={`py-2 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition ${
              activeTab === 'apk'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Mã QR & Link</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* TAB 1: iOS SAFARI */}
          {activeTab === 'ios' && (
            <div className="space-y-3.5">
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Lưu ý quan trọng cho iPhone:</strong> Apple yêu cầu bạn mở liên kết này bằng trình duyệt <strong>Safari</strong> để có thể cài đặt App vào màn hình chính.
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                  <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div className="text-xs text-slate-700 leading-relaxed">
                    Mở Safari trên iPhone, bấm vào nút <strong>Chia sẻ</strong> (biểu tượng hình vuông có mũi tên chỉ lên <span className="inline-block bg-slate-200 px-1.5 py-0.5 rounded font-mono text-[10px]">⬆️</span> ở thanh dưới đáy màn hình).
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                  <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div className="text-xs text-slate-700 leading-relaxed">
                    Cuộn xuống danh sách tùy chọn và chọn dòng: <br/>
                    <strong className="text-indigo-600 text-sm">➕ Thêm vào Màn hình chính (Add to Home Screen)</strong>.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                  <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div className="text-xs text-slate-700 leading-relaxed">
                    Bấm nút <strong>"Thêm" (Add)</strong> ở góc trên bên phải màn hình. Biểu tượng ứng dụng <strong>HSA Master</strong> sẽ xuất hiện ngay ngoài màn hình chính iPhone!
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ANDROID */}
          {activeTab === 'android' && (
            <div className="space-y-4">
              {canInstallNative ? (
                <div className="text-center p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <p className="text-xs font-bold text-emerald-800 mb-2.5">
                    Trình duyệt của bạn đã sẵn sàng! Bấm nút bên dưới để tải và cài đặt ngay:
                  </p>
                  <button
                    onClick={handleInstallClick}
                    disabled={isInstalling}
                    className="btn-3d w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    <span>{isInstalling ? 'Đang cài đặt...' : '📲 CÀI ĐẶT APP HSA MASTER VÀO ĐIỆN THOẠI'}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                    <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                      1
                    </div>
                    <div className="text-xs text-slate-700 leading-relaxed">
                      Mở web bằng trình duyệt <strong>Google Chrome</strong> hoặc <strong>Cốc Cốc</strong> trên điện thoại Android.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                    <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                      2
                    </div>
                    <div className="text-xs text-slate-700 leading-relaxed">
                      Bấm vào biểu tượng <strong>Dấu 3 chấm (⋮)</strong> ở góc trên cùng bên phải trình duyệt.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                    <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                      3
                    </div>
                    <div className="text-xs text-slate-700 leading-relaxed">
                      Chọn dòng <strong className="text-emerald-700 text-sm">"Cài đặt ứng dụng" (Install app)</strong> hoặc <strong>"Thêm vào Màn hình chính"</strong>.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                    <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                      4
                    </div>
                    <div className="text-xs text-slate-700 leading-relaxed">
                      Bấm xác nhận <strong>"Cài đặt"</strong>. Biểu tượng ứng dụng sẽ nằm trong danh sách ứng dụng điện thoại như tải từ CH Play!
                    </div>
                  </div>
                </div>
              )}

              {installedSuccess && (
                <div className="p-3 bg-emerald-100 rounded-2xl border border-emerald-300 text-xs font-bold text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Ứng dụng đã được cài đặt thành công trên điện thoại của bạn!</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: QR CODE & SHARE */}
          {activeTab === 'apk' && (
            <div className="space-y-4 text-center">
              <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                <img
                  src={qrUrl}
                  alt="QR Code"
                  className="w-40 h-40 object-contain rounded-xl bg-white p-2 shadow-xs border border-slate-100"
                />
                <p className="text-[11px] font-bold text-slate-600 mt-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Quét mã bằng Camera điện thoại hoặc app Zalo để mở và cài App ngay!
                </p>
              </div>

              <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  className="bg-transparent text-xs font-medium text-slate-700 w-full px-2 outline-none truncate"
                />
                <button
                  onClick={handleCopyLink}
                  className="btn-3d flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap shadow-xs"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Đã sao chép!' : 'Chép link'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Features highlight */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/50">
              <div className="text-[10px] font-black uppercase text-indigo-600">Toàn màn hình</div>
              <div className="text-[11px] font-semibold text-slate-600 mt-0.5">Không thanh URL</div>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/50">
              <div className="text-[10px] font-black uppercase text-emerald-600">Siêu nhẹ & mượt</div>
              <div className="text-[11px] font-semibold text-slate-600 mt-0.5">Không tốn RAM</div>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/50">
              <div className="text-[10px] font-black uppercase text-amber-600">Tự cập nhật</div>
              <div className="text-[11px] font-semibold text-slate-600 mt-0.5">Đề mới liên tục</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 font-medium">
            Hỗ trợ 100% dòng máy Android & iPhone
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 font-extrabold text-xs text-slate-700 transition"
          >
            Đóng lại
          </button>
        </div>
      </div>
    </div>
  );
}
