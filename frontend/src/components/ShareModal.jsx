import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Download, QrCode, Smartphone, Share2, Sparkles, ExternalLink } from 'lucide-react';

export default function ShareModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=15&data=${encodeURIComponent(currentUrl || 'http://localhost:8000')}`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(currentUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = currentUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy link:', err);
      prompt('Hãy sao chép liên kết bên dưới:', currentUrl);
    }
  };

  const handleDownloadQR = async () => {
    setDownloading(true);
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'HSA_Master_QRCode.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Failed to download QR image:', err);
      // Fallback: open image in new tab
      window.open(qrImageUrl, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="p-2 rounded-xl bg-white/20 backdrop-blur-md">
              <Share2 className="w-5 h-5" />
            </span>
            <span className="text-xs uppercase font-extrabold tracking-wider bg-white/25 px-2.5 py-0.5 rounded-full">
              Chia sẻ lớp học
            </span>
          </div>
          <h3 className="text-xl font-extrabold tracking-tight">Mã QR & Link Luyện Thi</h3>
          <p className="text-xs text-blue-100 mt-1">
            Chiếu mã QR lên bảng hoặc gửi link vào nhóm Zalo để học sinh vào thi ngay trên điện thoại!
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-100">
              <img
                src={qrImageUrl}
                alt="QR Code HSA Master"
                className="w-48 h-48 object-contain rounded-lg"
              />
            </div>
            <p className="text-[11px] font-semibold text-slate-500 mt-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Mở Camera điện thoại hoặc app Zalo quét mã để vào thi
            </p>
          </div>

          {/* Current URL Display & Copy */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">Đường dẫn trang web:</label>
            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="bg-transparent text-xs font-medium text-slate-700 w-full px-2 outline-none truncate"
              />
              <button
                onClick={handleCopyLink}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  copied
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Đã chép!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép</span>
                  </>
                )}
              </button>
            </div>
            {copied && (
              <p className="text-xs font-bold text-emerald-600 text-center animate-in fade-in">
                🎉 Đã sao chép link gửi cho học sinh!
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={handleDownloadQR}
              disabled={downloading}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border-2 border-slate-200 hover:border-slate-300 font-bold text-xs text-slate-700 bg-white hover:bg-slate-50 transition active:scale-95"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>{downloading ? 'Đang tải...' : 'Tải ảnh QR'}</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition active:scale-95"
            >
              <Copy className="w-4 h-4" />
              <span>{copied ? 'Đã sao chép!' : 'Chép link gửi Zalo'}</span>
            </button>
          </div>

          {/* PWA 1-touch Install Tip */}
          <div className="bg-indigo-50/70 rounded-2xl p-3.5 border border-indigo-100 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-600 shrink-0 mt-0.5">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="text-[11px] leading-relaxed text-indigo-950">
              <span className="font-bold text-indigo-800 block text-xs mb-0.5">
                Cài đặt ứng dụng 1 chạm (PWA):
              </span>
              Học sinh mở link trên Safari (iPhone) hoặc Chrome (Android) → Chọn <strong>"Thêm vào màn hình chính" (Add to Home Screen)</strong> để dùng như app điện thoại toàn màn hình!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
