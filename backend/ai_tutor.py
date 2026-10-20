"""Context-Aware AI Tutor for HSA Master (VNU-HN Qualitative / Verbal).
Adheres to strict pedagogical rules, Anti-Cheat, and LLM API integrations (Gemini / OpenAI) with local fallback.
"""
import os, json, urllib.request, urllib.error, pathlib

# Load .env file
ENV_PATH = pathlib.Path(__file__).parent / ".env"
if ENV_PATH.exists():
    for line in ENV_PATH.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip())

def call_gemini_api(system_prompt: str, user_prompt: str, api_key: str) -> str:
    """Call Google Gemini 2.5-flash / 1.5-flash API."""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    payload = {
        "system_instruction": {
            "parts": [{"text": system_prompt}]
        },
        "contents": [
            {
                "role": "user",
                "parts": [{"text": user_prompt}]
            }
        ],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 1000
        }
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=12) as res:
        data = json.loads(res.read().decode("utf-8"))
        candidates = data.get("candidates", [])
        if candidates:
            parts = candidates[0].get("content", {}).get("parts", [])
            if parts:
                return parts[0].get("text", "")
    return ""

def call_openai_api(system_prompt: str, user_prompt: str, api_key: str) -> str:
    """Call OpenAI Chat Completions API."""
    url = "https://api.openai.com/v1/chat/completions"
    payload = {
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.3,
        "max_tokens": 1000
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
    )
    with urllib.request.urlopen(req, timeout=12) as res:
        data = json.loads(res.read().decode("utf-8"))
        choices = data.get("choices", [])
        if choices:
            return choices[0].get("message", {}).get("content", "")
    return ""

def generate_local_fallback(user_message: str, question_context: dict) -> str:
    """High-quality local pedagogical explanation when external LLM key is absent."""
    category = question_context.get("category", "")
    user_ans = question_context.get("user_answer", "")
    correct_ans = question_context.get("correct_answer", "")
    explanation = question_context.get("explanation", "")
    passage = question_context.get("passage_content", "")
    content = question_context.get("content", "")

    lines = []
    lines.append(f"### 🎓 Phân tích của Gia sư AI về Câu hỏi [{category}]")
    
    if user_ans and user_ans != correct_ans:
        lines.append(f"❌ **Bạn đã chọn:** Phương án **{user_ans}** (Chưa chính xác).")
        lines.append(f"✅ **Đáp án đúng chuẩn của hệ thống:** Phương án **{correct_ans}**.\n")
    elif user_ans and user_ans == correct_ans:
        lines.append(f"🎉 **Chính xác!** Bạn đã chọn phương án **{correct_ans}** là phương án hoàn toàn đúng.\n")
    else:
        lines.append(f"✅ **Đáp án chuẩn của hệ thống:** Phương án **{correct_ans}**.\n")

    lines.append("📌 **Cơ sở bản chất và Dẫn chứng:**")
    if explanation:
        lines.append(f"> *{explanation}*")
    elif passage:
        lines.append(f"> Căn cứ vào dữ liệu trong ngữ liệu văn bản: *\"{passage[:200]}...\"*")

    lines.append("\n💡 **Lời khuyên tư duy định tính HSA:**")
    if category == "TV1":
        lines.append("- *Dạng từ không cùng nhóm:* Hãy xét lần lượt theo 3 bước: (1) Từ loại, (2) Cấu tạo từ ghép/láy, (3) Trường nghĩa chi tiết.")
    elif category == "TV2":
        lines.append("- *Dạng điền từ:* Chú ý mối quan hệ ngữ pháp (nguyên nhân - kết quả, tăng tiến, tương phản) và văn cảnh trích dẫn.")
    elif category == "TV3":
        lines.append("- *Dạng tìm lỗi sai:* Lỗi thường nằm ở kết hợp từ thiếu logic, sai phong cách (khẩu ngữ trong văn viết), hoặc câu thiếu thành phần nòng cốt.")
    else:
        lines.append("- *Dạng đọc hiểu:* Luôn bám sát từ khóa then chốt trong câu hỏi và định vị đoạn văn tương ứng, tránh suy diễn chủ quan.")

    lines.append("\n*(Ghi chú: Để kích hoạt trợ lý AI thông minh qua Gemini API, bạn chỉ cần điền GEMINI_API_KEY vào file `backend/.env`)*")
    return "\n".join(lines)

def generate_ai_tutor_response(user_message: str, question_context: dict = None) -> str:
    """Generate intelligent context-aware tutoring response."""
    if not question_context:
        return (
            "Chào bạn! Tôi là Trợ lý Gia sư AI môn Ngôn ngữ & Văn học HSA (ĐHQGHN). "
            "Bạn hãy bấm nút **'✨ Hỏi Gia sư AI câu này'** ở bất kỳ câu hỏi nào trong phần Luyện tập "
            "hoặc màn hình Xem lại kết quả để tôi hỗ trợ phân tích chi tiết nhé!"
        )

    # Format question context
    ctx_str = (
        f"- Dạng bài: {question_context.get('category', 'Chung')}\n"
        f"- Ngữ liệu văn bản: {question_context.get('passage_content') or 'Không có'}\n"
        f"- Câu hỏi: {question_context.get('content', '')}\n"
        f"- Lựa chọn A: {question_context.get('option_a', '')}\n"
        f"- Lựa chọn B: {question_context.get('option_b', '')}\n"
        f"- Lựa chọn C: {question_context.get('option_c', '')}\n"
        f"- Lựa chọn D: {question_context.get('option_d', '')}\n"
        f"- Đáp án học sinh đã chọn: {question_context.get('user_answer') or 'Chưa chọn'}\n"
        f"- Đáp án đúng của hệ thống: {question_context.get('correct_answer', '')}\n"
        f"- Lời giải chi tiết trong Database: {question_context.get('explanation') or 'Chưa có lời giải'}\n"
    )

    system_prompt = (
        "Bạn là Gia sư AI của hệ thống HSA Master, chuyên gia luyện thi Đánh giá năng lực ĐHQGHN phần Tư duy Định tính (Ngôn ngữ - Văn học).\n"
        f"Dưới đây là toàn bộ thông tin câu hỏi học sinh đang thắc mắc:\n{ctx_str}\n\n"
        "Nhiệm vụ của bạn:\n"
        "1. Bám sát tuyệt đối vào ngữ liệu văn bản, đáp án đúng và lời giải gốc của hệ thống để giải thích cho học sinh. Tuyệt đối không đưa ra đáp án trái ngược với đáp án chuẩn của hệ thống.\n"
        "2. Giải thích rõ ràng, mạch lạc vì sao phương án đúng lại đúng (chỉ rõ từ khóa, bằng chứng trong đoạn văn bản) và vì sao các phương án nhiễu (đặc biệt là phương án học sinh chọn sai) lại không chính xác.\n"
        "3. Giọng văn thân thiện, khích lệ, ngắn gọn, gạch đầu dòng dễ nhìn, đi thẳng vào trọng tâm tư duy định tính của kỳ thi HSA."
    )

    # 1. Try Gemini API
    gemini_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if gemini_key:
        try:
            ans = call_gemini_api(system_prompt, user_message, gemini_key)
            if ans:
                return ans
        except Exception as e:
            print("Gemini API error:", e)

    # 2. Try OpenAI API
    openai_key = os.environ.get("OPENAI_API_KEY", "").strip()
    if openai_key:
        try:
            ans = call_openai_api(system_prompt, user_message, openai_key)
            if ans:
                return ans
        except Exception as e:
            print("OpenAI API error:", e)

    # 3. Fallback to Local Pedagogical Engine
    return generate_local_fallback(user_message, question_context)
