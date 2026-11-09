import React from 'react';
import { HelpCircle, BookOpen, FileText } from 'lucide-react';

/**
 * Helper to highlight blanks [...] or long spaces cleanly in question texts
 */
function formatBlanksInHtml(text) {
  if (!text) return '';
  // First, clean any accidental double/nested brackets like [ [...] ] or [[...]]
  let cleaned = text.replace(/\[\s*\[\s*\.\.\.\s*\]\s*\]/g, '[...]')
                    .replace(/\[\s*\[\.\.\.\]\s*\]/g, '[...]');

  // Replace [...], (...), unicode ellipsis (…), dots (....), underscores (___), hyphens (--), or multiple spaces (>=3 spaces)
  let formatted = cleaned.replace(/\[\s*\.\.\.\s*\]|\(\s*\.\.\.\s*\)|[\u2026]{1,}|\.{3,}|_{2,}|-{2,}|[ \t]{3,}/g, () => {
    return `<span class="inline-flex items-center justify-center px-3.5 py-1 mx-1.5 border-2 border-dashed border-indigo-600 bg-indigo-100 text-indigo-950 font-mono text-xs sm:text-sm font-black rounded-xl shadow-xs select-none tracking-wider">[ &nbsp;... ? ...&nbsp; ]</span>`;
  });
  return formatted;
}

/**
 * QuestionDisplay: Renders question content with distinct separation between
 * "Phần hỏi" (Prompt/Question requirement) and "Phần đề" (Context/Sentence/Quote to analyze).
 */
export default function QuestionDisplay({ content, category = '' }) {
  if (!content) return null;

  // Split content by lines
  let lines = content.split('\n').map(l => l.trim()).filter(Boolean);

  // If only 1 line but belongs to TV3 / TV2, intelligently provide prompt
  let promptText = '';
  let contextText = '';

  if (lines.length >= 2) {
    promptText = lines[0];
    contextText = lines.slice(1).join('\n');
  } else if (category === 'TV3' && lines.length === 1) {
    promptText = 'Xác định một từ/cụm từ SAI về ngữ pháp, ngữ nghĩa, logic hoặc phong cách trong câu sau:';
    contextText = lines[0];
  } else if (category === 'TV2' && lines.length === 1) {
    promptText = 'Chọn cặp từ/ cụm từ thích hợp nhất điền vào chỗ trống:';
    contextText = lines[0];
  }

  if (promptText && contextText) {
    const formattedContext = formatBlanksInHtml(contextText);

    return (
      <div className="space-y-3.5 mb-5">
        {/* PHẦN HỎI (YÊU CẦU CÂU HỎI) */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/90 border-2 border-indigo-200/80 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase text-indigo-700 tracking-wider mb-1.5">
            <span className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center text-[10px]">
              ❓
            </span>
            <span>PHẦN HỎI (Yêu cầu câu hỏi)</span>
          </div>
          <div className="text-sm sm:text-base font-extrabold text-indigo-950 leading-relaxed font-sans">
            {promptText}
          </div>
        </div>

        {/* PHẦN ĐỀ (NGỮ LIỆU / CÂU VĂN ĐỀ BÀI) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border-2 border-amber-200/90 text-slate-900 shadow-2xs font-serif leading-relaxed">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase text-amber-800 tracking-wider mb-2 font-sans">
            <span className="w-5 h-5 rounded-md bg-amber-500 text-white flex items-center justify-center text-[10px]">
              📖
            </span>
            <span>PHẦN ĐỀ (Ngữ liệu / Đề bài)</span>
          </div>
          <div 
            className="text-sm sm:text-base font-medium text-slate-900 leading-relaxed italic border-l-4 border-amber-400 pl-3.5 whitespace-pre-line"
            dangerouslySetInnerHTML={{ __html: formattedContext }}
          />
        </div>
      </div>
    );
  }

  // Single line content without auto-split: Highlight as "PHẦN HỎI"
  const formattedContent = formatBlanksInHtml(content);
  return (
    <div className="mb-5">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-black uppercase tracking-wider mb-2">
        <span className="w-4 h-4 rounded-md bg-indigo-600 text-white flex items-center justify-center text-[9px]">
          ❓
        </span>
        <span>PHẦN HỎI</span>
      </div>
      <div 
        className="text-base sm:text-lg font-black text-slate-900 leading-relaxed whitespace-pre-line font-sans"
        dangerouslySetInnerHTML={{ __html: formattedContent }}
      />
    </div>
  );
}
