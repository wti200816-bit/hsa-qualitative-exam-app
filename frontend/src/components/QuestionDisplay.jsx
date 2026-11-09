import React from 'react';
import { HelpCircle, BookOpen, FileText } from 'lucide-react';

/**
 * Helper to format blanks in question texts as 2 sets of 3 dots (......)
 * Clean standard exam style without brackets and without question mark.
 */
function formatBlanksInHtml(text, isFillBlank = false) {
  if (!text) return '';
  if (!isFillBlank) {
    // Non-fill-in-the-blank questions (e.g. TV3 find error, RC reading passages, poetry):
    // Preserve text, do not convert dots or ellipsis to blanks!
    return text;
  }

  // Replace any remaining [...], (...), or sequences of dots (4+), underscores, dashes with 6 dots (......)
  let formatted = text.replace(/\[\s*\.\.\.\s*\]|\(\s*\.\.\.\s*\)|\[\s*\.\.\.\s*\?\s*\.\.\.\s*\]|[\u2026]{2,}|\.{4,}|_{2,}|-{2,}/g, () => {
    return `<span class="font-bold tracking-wider text-indigo-700 font-mono">......</span>`;
  });

  // Also style any existing 6 dots '......' cleanly
  formatted = formatted.replace(/(?<!\.)(\.{6})(?!\.)/g, () => {
    return `<span class="font-bold tracking-wider text-indigo-700 font-mono">......</span>`;
  });

  return formatted;
}

/**
 * QuestionDisplay: Renders question content with distinct separation between
 * "Phần hỏi" (Prompt/Question requirement) and "Phần đề" (Context/Sentence/Quote to analyze).
 */
export default function QuestionDisplay({ content, category = '' }) {
  if (!content) return null;

  const isFillBlank = category === 'TV2' || 
                      content.toLowerCase().includes('điền vào chỗ trống') || 
                      content.toLowerCase().includes('chỗ trống');

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
    const formattedContext = formatBlanksInHtml(contextText, isFillBlank);

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
  const formattedContent = formatBlanksInHtml(content, isFillBlank);
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
