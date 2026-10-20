import React, { useState } from 'react';
import { X, Send, Bot, Sparkles, HelpCircle, BookOpen, MessageSquare } from 'lucide-react';

export default function AiChatDrawer({ isOpen, onClose, questionContext, apiBase }) {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: 'Chào bạn! Mình là Trợ lý Gia sư AI chuyên sâu về Ngôn ngữ & Văn học HSA. Hãy hỏi mình bất kỳ câu hỏi nào về ngữ pháp, trường nghĩa, phong cách hoặc phương pháp đọc hiểu nhé!'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg = { role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${apiBase}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          mode: 'practice',
          question_context: questionContext
        })
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'ai', text: data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: 'Có lỗi xảy ra khi kết nối tới Trợ lý AI. Vui lòng thử lại sau.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'Tại sao đáp án này lại đúng?',
    'Phân tích chi tiết trường nghĩa / từ loại câu này',
    'Chỉ ra mẹo nhận biết nhanh trong phòng thi'
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-brand-900 to-brand-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
              <Bot className="w-5 h-5 text-brand-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                <span>Gia sư AI Ngữ Văn HSA</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-brand-500/30 text-brand-200 font-semibold border border-brand-400/30">
                  Context-Aware
                </span>
              </h3>
              <p className="text-[11px] text-brand-200/80">Giải đáp chuyên sâu & Phân tích ngữ liệu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Context Preview Banner */}
        {questionContext && (
          <div className="bg-brand-50/70 border-b border-brand-100 p-3 text-xs">
            <div className="flex items-center gap-1.5 text-brand-900 font-bold mb-1">
              <BookOpen className="w-3.5 h-3.5 text-brand-600" />
              <span>Ngữ cảnh câu hỏi đang thảo luận:</span>
            </div>
            <p className="text-slate-700 line-clamp-2 italic mb-1.5">
              "{questionContext.content}"
            </p>
            <div className="flex flex-wrap gap-2 text-[11px]">
              {questionContext.user_answer && (
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium">
                  Bạn chọn: <strong className="text-slate-900">{questionContext.user_answer}</strong>
                </span>
              )}
              {questionContext.correct_answer && (
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                  Đáp án đúng: {questionContext.correct_answer}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs sm:text-sm">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'ai' && (
                <div className="w-7 h-7 rounded-lg bg-brand-100 text-brand-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-brand-600 text-white rounded-br-none'
                    : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/60'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-slate-400 text-xs pl-9">
              <Sparkles className="w-4 h-4 animate-spin text-brand-500" />
              <span>Gia sư AI đang suy luận và phân tích ngữ liệu...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-3 pt-2 pb-1 border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              disabled={loading}
              onClick={() => handleSend(p)}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 hover:bg-brand-100 text-slate-600 hover:text-brand-800 transition border border-slate-200"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Chat Input */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Hỏi bất kỳ điều gì về câu hỏi này..."
            className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white disabled:opacity-40 transition shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
