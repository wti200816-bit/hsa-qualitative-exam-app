import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, Sparkles, BookOpen, CheckCircle, HelpCircle, MessageSquare, Key, Settings } from 'lucide-react';
import { askAiTutor } from '../services/dataService';

export default function AiChatDrawer({ isOpen, onClose, questionContext }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => localStorage.getItem('hsa_gemini_api_key') || '');
  const messagesEndRef = useRef(null);

  // Initialize or reset chat when opening a new question context
  useEffect(() => {
    if (questionContext) {
      const qNum = questionContext.order_num || questionContext.source_q_num || 'này';
      setMessages([
        {
          role: 'ai',
          text: `Chào bạn! Mình là Gia sư AI HSA Master. Mình đã nhận được toàn bộ dữ liệu của **Câu số ${qNum}** (${questionContext.category || 'Tư duy định tính'}).\nBạn có thể chọn một trong các câu hỏi gợi ý nhanh bên dưới hoặc gõ câu hỏi để mình hỗ trợ phân tích chi tiết nhé!`
        }
      ]);
    }
  }, [questionContext]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  const qNum = questionContext ? (questionContext.order_num || questionContext.source_q_num || '') : '';

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg = { role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const reply = await askAiTutor(text, questionContext);
      setMessages((prev) => [...prev, { role: 'ai', text: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: 'Có lỗi xảy ra khi phân tích: ' + (err.message || 'Vui lòng thử lại.') }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApiKey = () => {
    localStorage.setItem('hsa_gemini_api_key', apiKeyInput.trim());
    setApiKeyModalOpen(false);
    alert('Đã lưu cấu hình Gemini API Key thành công!');
  };

  const quickPrompts = [
    'Giải thích chi tiết vì sao chọn đáp án đúng?',
    'Tại sao đáp án mình chọn lại sai?',
    'Phân tích kỹ hơn ngữ liệu / biện pháp tu từ trong câu này'
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Top Header - Blue Palette #1E3A8A */}
        <div className="p-4 bg-gradient-to-r from-brand-900 via-brand-850 to-brand-800 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10 shadow-inner">
              <Bot className="w-5 h-5 text-brand-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm tracking-tight text-white">
                  Gia sư AI HSA Master
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-brand-500/30 text-brand-200 font-bold border border-brand-400/30">
                  {qNum ? `Câu số ${qNum}` : 'Tư vấn trực tiếp'}
                </span>
              </div>
              <p className="text-[11px] text-brand-200/90 font-medium">
                {qNum ? `Đang hỗ trợ giải đáp: Câu số ${qNum}` : 'Chuyên sâu Ngôn ngữ & Văn học'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setApiKeyModalOpen(true)}
              className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
              title="Cài đặt Gemini API Key"
            >
              <Key className="w-4 h-4 text-amber-300" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
              title="Đóng cửa sổ chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Question Context Preview Banner */}
        {questionContext && (
          <div className="bg-brand-50/80 border-b border-brand-100 p-3 text-xs">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5 text-brand-900 font-bold">
                <BookOpen className="w-3.5 h-3.5 text-brand-700" />
                <span>Nội dung câu hỏi đang hỏi:</span>
              </div>
              <span className="text-[10px] font-extrabold text-brand-800 bg-white px-2 py-0.5 rounded-md border border-brand-200">
                {questionContext.category}
              </span>
            </div>

            <p className="text-slate-800 line-clamp-2 italic mb-2 font-medium">
              "{questionContext.content}"
            </p>

            <div className="flex flex-wrap gap-2 text-[11px]">
              {questionContext.user_answer && (
                <span className={`px-2 py-0.5 rounded-md font-semibold border ${
                  questionContext.user_answer === questionContext.correct_answer
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  Bạn chọn: <strong>{questionContext.user_answer}</strong>
                </span>
              )}
              {questionContext.correct_answer && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-bold border border-emerald-300">
                  Đáp án chuẩn: {questionContext.correct_answer}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs sm:text-sm">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'ai' && (
                <div className="w-7 h-7 rounded-xl bg-brand-100 text-brand-900 flex items-center justify-center shrink-0 mt-0.5 font-bold shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-brand-600 text-white rounded-br-none font-medium'
                    : 'bg-slate-50 text-slate-800 rounded-bl-none border border-slate-200'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-slate-500 text-xs pl-9 animate-pulse">
              <Sparkles className="w-4 h-4 text-brand-600 animate-spin" />
              <span>Gia sư AI đang đối chiếu ngữ liệu và phân tích đáp án...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 3 Quick Prompt Chips */}
        <div className="px-3 pt-2 pb-1 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-1.5">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-1">
            Gợi ý câu hỏi nhanh:
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                disabled={loading}
                onClick={() => handleSend(p)}
                className="text-[11px] whitespace-nowrap px-3 py-1.5 rounded-full bg-white hover:bg-brand-50 text-slate-700 hover:text-brand-900 font-medium transition border border-slate-200 hover:border-brand-300 shadow-2xs"
              >
                ✨ {p}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Input */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Hỏi bất kỳ điều gì về câu hỏi này..."
            className="flex-1 px-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-brand-900 hover:bg-brand-800 text-white disabled:opacity-40 transition shadow-sm"
            title="Gửi câu hỏi"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* API Key Settings Modal */}
        {apiKeyModalOpen && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-slate-100 animate-in zoom-in-95">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-500" />
                  <h4 className="font-bold text-sm text-slate-900">Cấu hình Google Gemini API Key</h4>
                </div>
                <button
                  onClick={() => setApiKeyModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                Nhập Gemini API Key miễn phí từ Google AI Studio (aistudio.google.com) để kích hoạt mô hình Gemini 2.5 Flash trả lời phân tích chuyên sâu không giới hạn.
              </p>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setApiKeyModalOpen(false)}
                  className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Đóng
                </button>
                <button
                  onClick={handleSaveApiKey}
                  className="flex-1 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                >
                  Lưu cấu hình
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
