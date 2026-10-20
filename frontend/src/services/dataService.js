/**
 * Client-Side Static Data Engine & State Store for HSA Master.
 * Runs 100% in the browser without any backend server.
 */

// Seed Top Students for Leaderboard
const SEED_LEADERBOARD = [
  { student_name: "Nguyễn Minh Châu", score: 48, total_questions: 50, time_spent_seconds: 2450, exam_title: "Đề thi ĐGNL Chuẩn hóa Ma trận HSA 2026 (Mã đề: 01A)" },
  { student_name: "Trần Bảo Long", score: 47, total_questions: 50, time_spent_seconds: 2510, exam_title: "Đề thi ĐGNL Chuẩn hóa Ma trận HSA 2026 (Mã đề: 05C)" },
  { student_name: "Lê Hoàng Yến Nhi", score: 46, total_questions: 50, time_spent_seconds: 2600, exam_title: "Đề thi ĐGNL Chuẩn hóa Ma trận HSA 2026 (Mã đề: 12B)" },
  { student_name: "Phạm Đức Anh", score: 45, total_questions: 50, time_spent_seconds: 2680, exam_title: "Đề thi ĐGNL Chuẩn hóa Ma trận HSA 2026 (Mã đề: 08F)" },
  { student_name: "Vũ Phương Linh", score: 45, total_questions: 50, time_spent_seconds: 2750, exam_title: "Đề thi ĐGNL Chuẩn hóa Ma trận HSA 2026 (Mã đề: 02A)" },
  { student_name: "Hoàng Gia Bảo", score: 44, total_questions: 50, time_spent_seconds: 2800, exam_title: "Đề thi ĐGNL Chuẩn hóa Ma trận HSA 2026 (Mã đề: 10D)" },
  { student_name: "Đặng Thị Thảo My", score: 43, total_questions: 50, time_spent_seconds: 2890, exam_title: "Đề thi ĐGNL Chuẩn hóa Ma trận HSA 2026 (Mã đề: 03A)" },
  { student_name: "Bùi Tuấn Kiệt", score: 42, total_questions: 50, time_spent_seconds: 2940, exam_title: "Đề thi ĐGNL Chuẩn hóa Ma trận HSA 2026 (Mã đề: 15E)" },
  { student_name: "Ngô Khánh An", score: 41, total_questions: 50, time_spent_seconds: 3010, exam_title: "Đề thi ĐGNL Chuẩn hóa Ma trận HSA 2026 (Mã đề: 07A)" },
  { student_name: "Trịnh Đình Khang", score: 40, total_questions: 50, time_spent_seconds: 3120, exam_title: "Đề thi ĐGNL Chuẩn hóa Ma trận HSA 2026 (Mã đề: 09B)" },
];

const SEED_STATS = [
  { student_name: "Nguyễn Minh Châu", total_correct: 385, total_attempts: 9 },
  { student_name: "Trần Bảo Long", total_correct: 342, total_attempts: 8 },
  { student_name: "Lê Hoàng Yến Nhi", total_correct: 310, total_attempts: 7 },
  { student_name: "Phạm Đức Anh", total_correct: 280, total_attempts: 7 },
  { student_name: "Vũ Phương Linh", total_correct: 255, total_attempts: 6 },
  { student_name: "Hoàng Gia Bảo", total_correct: 220, total_attempts: 5 },
  { student_name: "Đặng Thị Thảo My", total_correct: 195, total_attempts: 5 },
  { student_name: "Bùi Tuấn Kiệt", total_correct: 180, total_attempts: 5 },
  { student_name: "Ngô Khánh An", total_correct: 165, total_attempts: 4 },
  { student_name: "Trịnh Đình Khang", total_correct: 150, total_attempts: 4 },
];

let cachedData = null;

// Helper to shuffle arrays
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// 1. Load Data
export async function loadHsaData() {
  if (cachedData) return cachedData;

  // Check if preloaded in window.HSA_DATA
  if (typeof window !== 'undefined' && window.HSA_DATA) {
    cachedData = window.HSA_DATA;
    applyOverrides(cachedData);
    return cachedData;
  }

  // Fallback to fetch json
  try {
    const res = await fetch('./data/hsa_data.json');
    if (res.ok) {
      cachedData = await res.json();
      applyOverrides(cachedData);
      return cachedData;
    }
  } catch (err) {
    console.warn('Could not fetch ./data/hsa_data.json, trying /data/hsa_data.json:', err);
    try {
      const res2 = await fetch('/data/hsa_data.json');
      if (res2.ok) {
        cachedData = await res2.json();
        applyOverrides(cachedData);
        return cachedData;
      }
    } catch (e) {
      console.error('Failed to load HSA data:', e);
    }
  }

  return { passages: {}, templates: [], questions: {} };
}

// Apply local edits made in Admin
function applyOverrides(data) {
  try {
    const raw = localStorage.getItem('hsa_question_overrides');
    if (raw) {
      const overrides = JSON.parse(raw);
      for (const qId in overrides) {
        if (data.questions[qId]) {
          Object.assign(data.questions[qId], overrides[qId]);
        }
      }
    }
  } catch (e) {
    console.error('Error applying overrides:', e);
  }
}

// 2. Templates
export async function getTemplates() {
  const data = await loadHsaData();
  return (data.templates || []).map(t => ({
    id: t.id,
    exam_num: t.exam_num,
    title: t.title,
    source_file: t.source_file,
    total_questions: t.total_questions || 50
  }));
}

export async function getTemplateExam(templateId) {
  const data = await loadHsaData();
  const tpl = (data.templates || []).find(t => t.id === templateId);
  if (!tpl) throw new Error('Không tìm thấy đề thi mẫu: ' + templateId);

  const questions = [];
  (tpl.question_ids || []).forEach((qId, idx) => {
    const q = data.questions[qId];
    if (q) {
      const passage = q.passage_id ? data.passages[q.passage_id] : null;
      questions.push({
        ...q,
        order_num: 51 + idx,
        passage_title: passage ? passage.title : null,
        passage_content: passage ? passage.content : null
      });
    }
  });

  return {
    exam_id: tpl.id,
    title: tpl.title,
    total_questions: questions.length,
    duration_minutes: 60,
    questions: questions
  };
}

// 3. Generate Random Mock Exam (Standard 50 Questions HSA 2026 Matrix)
export async function generateRandomExam(studentName = "Thí sinh") {
  const data = await loadHsaData();
  const allQs = Object.values(data.questions).filter(q => q.status === 'verified');

  // Nhóm 1: 15 TV (5 TV1 + 5 TV2 + 5 TV3)
  const tv1 = shuffle(allQs.filter(q => q.category === 'TV1')).slice(0, 5);
  const tv2 = shuffle(allQs.filter(q => q.category === 'TV2')).slice(0, 5);
  const tv3 = shuffle(allQs.filter(q => q.category === 'TV3')).slice(0, 5);
  const group1 = [...tv1, ...tv2, ...tv3].map(q => ({
    ...q,
    passage_id: null,
    passage_title: null,
    passage_content: null
  }));

  // Nhóm 2: 10 Short Reading questions (R1)
  const r1List = allQs.filter(q => q.category === 'R1');
  const group2 = shuffle(r1List).slice(0, 10).map(q => {
    const passage = q.passage_id ? data.passages[q.passage_id] : null;
    return {
      ...q,
      passage_title: passage ? passage.title : null,
      passage_content: passage ? passage.content : null
    };
  });

  // Nhóm 3: 25 Cluster Reading questions (5 distinct clusters x 5 child questions)
  // Group verified questions by passage_id
  const passageMap = {};
  allQs.forEach(q => {
    if (q.passage_id && (q.category === 'R2' || q.category.startsWith('R'))) {
      if (!passageMap[q.passage_id]) passageMap[q.passage_id] = [];
      passageMap[q.passage_id].push(q);
    }
  });

  // Candidate passages with at least 5 questions
  const candidatePassageIds = Object.keys(passageMap).filter(pId => passageMap[pId].length >= 5);
  const selectedPassageIds = shuffle(candidatePassageIds).slice(0, 5);

  const group3 = [];
  selectedPassageIds.forEach(pId => {
    const passage = data.passages[pId];
    const childQs = passageMap[pId]
      .sort((a, b) => (a.source_q_num || 0) - (b.source_q_num || 0))
      .slice(0, 5);

    childQs.forEach(q => {
      group3.push({
        ...q,
        passage_id: pId,
        passage_title: passage ? passage.title : null,
        passage_content: passage ? passage.content : null
      });
    });
  });

  // Combine
  const fullQuestions = [...group1, ...group2, ...group3];
  fullQuestions.forEach((q, idx) => {
    q.order_num = 51 + idx;
  });

  const randId = Math.random().toString(36).substring(2, 10).toUpperCase();
  return {
    exam_id: `MOCK-${randId}`,
    title: `Đề thi ĐGNL Chuẩn hóa Ma trận HSA 2026 (Mã đề: ${randId})`,
    total_questions: fullQuestions.length,
    duration_minutes: 60,
    questions: fullQuestions
  };
}

// 4. Submit Exam
export async function submitExam({ student_name, exam_title, time_spent_seconds, answers, exam_id }) {
  const data = await loadHsaData();
  let score = 0;
  const results = [];

  for (const qId in answers) {
    const chosen = answers[qId];
    const q = data.questions[qId];
    if (q) {
      const isCorrect = chosen && q.correct_answer && chosen.toUpperCase() === q.correct_answer.toUpperCase();
      if (isCorrect) score += 1;
      
      const passage = q.passage_id ? data.passages[q.passage_id] : null;
      results.push({
        question_id: q.id,
        category: q.category,
        content: q.content,
        chosen_option: chosen,
        correct_answer: q.correct_answer,
        is_correct: !!isCorrect,
        explanation: q.explanation,
        passage_title: passage ? passage.title : null,
        passage_content: passage ? passage.content : null,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d
      });
    }
  }

  const submission = {
    id: `SUB-${Date.now()}`,
    student_name: student_name || "Thí sinh",
    exam_title: exam_title || "Đề thi ĐGNL HSA",
    score: score,
    total_questions: Object.keys(answers).length || 50,
    time_spent_seconds: time_spent_seconds || 0,
    submitted_at: new Date().toISOString()
  };

  // Save to localStorage
  try {
    const existing = JSON.parse(localStorage.getItem('hsa_submissions') || '[]');
    existing.unshift(submission);
    localStorage.setItem('hsa_submissions', JSON.stringify(existing.slice(0, 100)));

    // Update stats
    const statsMap = JSON.parse(localStorage.getItem('hsa_student_stats') || '{}');
    const sName = submission.student_name;
    if (!statsMap[sName]) {
      statsMap[sName] = { student_name: sName, total_correct: 0, total_attempts: 0 };
    }
    statsMap[sName].total_correct += score;
    statsMap[sName].total_attempts += 1;
    statsMap[sName].updated_at = new Date().toISOString();
    localStorage.setItem('hsa_student_stats', JSON.stringify(statsMap));
  } catch (e) {
    console.error('Failed to save submission locally:', e);
  }

  return {
    submission_id: submission.id,
    student_name: submission.student_name,
    exam_title: submission.exam_title,
    score: score,
    total_questions: submission.total_questions,
    time_spent_seconds: submission.time_spent_seconds,
    percentage: Math.round((score / submission.total_questions) * 100),
    results: results
  };
}

// 5. Leaderboard
export function getLeaderboard(tab = 'mock', timeframe = 'all') {
  let localSubs = [];
  let localStats = {};

  try {
    localSubs = JSON.parse(localStorage.getItem('hsa_submissions') || '[]');
    localStats = JSON.parse(localStorage.getItem('hsa_student_stats') || '{}');
  } catch (e) {
    console.error(e);
  }

  if (tab === 'mock') {
    // Combine seed with local submissions
    const combined = [...localSubs, ...SEED_LEADERBOARD];
    combined.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (a.time_spent_seconds || 3600) - (b.time_spent_seconds || 3600);
    });
    return { leaderboard: combined.slice(0, 50) };
  } else {
    // Stats: "Chăm chỉ tích luỹ"
    const statsMap = {};
    SEED_STATS.forEach(s => {
      statsMap[s.student_name] = { ...s };
    });
    for (const name in localStats) {
      if (statsMap[name]) {
        statsMap[name].total_correct += localStats[name].total_correct;
        statsMap[name].total_attempts += localStats[name].total_attempts;
      } else {
        statsMap[name] = { ...localStats[name] };
      }
    }
    const list = Object.values(statsMap);
    list.sort((a, b) => b.total_correct - a.total_correct);
    return { leaderboard: list.slice(0, 50) };
  }
}

// 6. Practice Room Categories & Questions
export async function getPracticeCategories() {
  const data = await loadHsaData();
  const allQs = Object.values(data.questions).filter(q => q.status === 'verified');

  const meta = {
    'TV1': { title: 'Chọn từ không cùng nhóm', desc: 'Từ loại, cấu tạo từ ghép/láy, trường nghĩa' },
    'TV2': { title: 'Điền từ vào chỗ trống', desc: 'Ngữ pháp, liên kết câu, văn cảnh' },
    'TV3': { title: 'Xác định từ/câu dùng sai', desc: 'Lỗi logic, chính tả, phong cách văn bản' },
    'R1': { title: 'Đọc hiểu ngữ liệu ngắn', desc: 'Thơ, danh ngôn, câu đối thoại, thành ngữ' },
    'R2': { title: 'Đọc hiểu văn bản chùm', desc: 'Văn bản văn học, nghị luận, khoa học (5 câu/cụm)' }
  };

  const counts = {};
  allQs.forEach(q => {
    const cat = q.category || 'OTHER';
    counts[cat] = (counts[cat] || 0) + 1;
  });

  return Object.keys(meta).map(cat => ({
    category: cat,
    title: meta[cat].title,
    description: meta[cat].desc,
    question_count: counts[cat] || 0
  }));
}

export async function getPracticeQuestions(category, limit = 20) {
  const data = await loadHsaData();
  let list = Object.values(data.questions).filter(q => q.status === 'verified');
  if (category) {
    list = list.filter(q => q.category === category);
  }

  const selected = shuffle(list).slice(0, limit);
  return selected.map(q => {
    const passage = q.passage_id ? data.passages[q.passage_id] : null;
    return {
      ...q,
      passage_title: passage ? passage.title : null,
      passage_content: passage ? passage.content : null
    };
  });
}

// 7. Admin Questions
export async function getAdminQuestions({ limit = 50, offset = 0, category = '', status = '', search = '' } = {}) {
  const data = await loadHsaData();
  let list = Object.values(data.questions);

  if (category) list = list.filter(q => q.category === category);
  if (status) list = list.filter(q => q.status === status);
  if (search) {
    const s = search.toLowerCase();
    list = list.filter(q => (q.content && q.content.toLowerCase().includes(s)) || (q.id && q.id.includes(s)));
  }

  const total = Object.keys(data.questions).length;
  const totalVerified = Object.values(data.questions).filter(q => q.status === 'verified').length;
  const totalPending = total - totalVerified;

  return {
    questions: list.slice(offset, offset + limit),
    stats: {
      total,
      verified: totalVerified,
      pending: totalPending
    }
  };
}

export async function adminVerifyQuestion({ question_id, correct_answer, explanation, status = 'verified' }) {
  const data = await loadHsaData();
  if (data.questions[question_id]) {
    data.questions[question_id].correct_answer = correct_answer.toUpperCase();
    if (explanation) data.questions[question_id].explanation = explanation;
    data.questions[question_id].status = status;

    // Save override to localStorage
    try {
      const overrides = JSON.parse(localStorage.getItem('hsa_question_overrides') || '{}');
      overrides[question_id] = {
        correct_answer: correct_answer.toUpperCase(),
        explanation: explanation || data.questions[question_id].explanation,
        status: status
      };
      localStorage.setItem('hsa_question_overrides', JSON.stringify(overrides));
    } catch (e) {
      console.error(e);
    }
  }
  return { status: 'success', question_id };
}

// 8. AI Tutor (Client-Side Gemini API + Fallback)
export async function askAiTutor(message, questionContext) {
  if (!questionContext) {
    return (
      "Chào bạn! Tôi là Trợ lý Gia sư AI môn Ngôn ngữ & Văn học HSA (ĐHQGHN). " +
      "Bạn hãy bấm nút **'✨ Hỏi Gia sư AI câu này'** ở bất kỳ câu hỏi nào trong phần Luyện tập " +
      "hoặc màn hình Xem lại kết quả để tôi hỗ trợ phân tích chi tiết nhé!"
    );
  }

  const apiKey = localStorage.getItem('hsa_gemini_api_key') || '';

  if (apiKey) {
    try {
      const systemPrompt = `Bạn là Trợ lý Gia sư AI chuyên sâu về môn Ngôn ngữ và Văn học (Phần Tư duy Định tính) trong kỳ thi Đánh giá Năng lực (HSA) của Đại học Quốc gia Hà Nội (ĐHQGHN).
Nhiệm vụ: Phân tích câu hỏi, chỉ rõ bản chất ngôn ngữ/văn học, giải thích lý do vì sao đáp án đúng là chính xác và vì sao các phương án khác sai.
Văn phong: Sư phạm, mạch lạc, tích cực, truyền cảm hứng học tập cho học sinh ôn thi HSA 2026.`;

      const userPrompt = `Ngữ cảnh câu hỏi:
- Dạng câu hỏi: [${questionContext.category || 'HSA'}]
- Ngữ liệu đọc hiểu (nếu có): ${questionContext.passage_content || 'Không có'}
- Nội dung câu hỏi: ${questionContext.content || ''}
- Các phương án:
  A: ${questionContext.option_a || ''}
  B: ${questionContext.option_b || ''}
  C: ${questionContext.option_c || ''}
  D: ${questionContext.option_d || ''}
- Phương án học sinh đã chọn: ${questionContext.user_answer || 'Chưa chọn'}
- Đáp án đúng của đề thi: ${questionContext.correct_answer || ''}
- Lời giải tham khảo: ${questionContext.explanation || 'Chưa có'}

Câu hỏi của học sinh: ${message || 'Hãy giải thích cặn kẽ câu này giúp em.'}`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 1000 }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to local explainer:', err);
    }
  }

  // High-quality local pedagogical explanation fallback
  const category = questionContext.category || '';
  const userAns = questionContext.user_answer || '';
  const correctAns = questionContext.correct_answer || '';
  const explanation = questionContext.explanation || '';
  const passage = questionContext.passage_content || '';

  const lines = [];
  lines.push(`### 🎓 Phân tích của Gia sư AI về Câu hỏi [${category}]`);

  if (userAns && userAns !== correctAns) {
    lines.push(`❌ **Bạn đã chọn:** Phương án **${userAns}** (Chưa chính xác).`);
    lines.push(`✅ **Đáp án đúng chuẩn của hệ thống:** Phương án **${correctAns}**.\n`);
  } else if (userAns && userAns === correctAns) {
    lines.push(`🎉 **Chính xác!** Bạn đã chọn phương án **${correctAns}** là phương án hoàn toàn đúng.\n`);
  } else {
    lines.push(`✅ **Đáp án chuẩn của hệ thống:** Phương án **${correctAns}**.\n`);
  }

  lines.push("📌 **Cơ sở bản chất và Dẫn chứng:**");
  if (explanation) {
    lines.push(`> *${explanation}*`);
  } else if (passage) {
    lines.push(`> Căn cứ vào dữ liệu trong ngữ liệu văn bản: *" ${passage.substring(0, 250)}... "*`);
  }

  lines.push("\n💡 **Lời khuyên tư duy định tính HSA:**");
  if (category === "TV1") {
    lines.push("- *Dạng từ không cùng nhóm:* Hãy xét lần lượt theo 3 bước: (1) Từ loại (danh/động/tính từ), (2) Cấu tạo từ ghép đẳng lập/chính phụ hoặc từ láy, (3) Phân tích trường nghĩa chi tiết.");
  } else if (category === "TV2") {
    lines.push("- *Dạng điền từ:* Chú ý mối quan hệ ngữ pháp (nguyên nhân - kết quả, tăng tiến, tương phản) và văn cảnh trích dẫn.");
  } else if (category === "TV3") {
    lines.push("- *Dạng tìm lỗi sai:* Lỗi thường nằm ở kết hợp từ thiếu logic, sai phong cách (khẩu ngữ trong văn viết), hoặc câu thiếu thành phần nòng cốt.");
  } else {
    lines.push("- *Dạng đọc hiểu:* Luôn bám sát từ khóa then chốt trong câu hỏi và định vị đoạn văn tương ứng, tránh suy diễn chủ quan.");
  }

  lines.push("\n*(Mẹo: Bạn có thể cài đặt **Google Gemini API Key** riêng trong mục cài đặt để AI giải thích tự do mở rộng hơn)*");
  return lines.join("\n");
}
