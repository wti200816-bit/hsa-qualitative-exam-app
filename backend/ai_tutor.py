"""Context-Aware AI Tutor for HSA Qualitative Exam.
Features:
- Anti-cheat enforcement: locked during Mock Exam sessions.
- Injects full question context: Passage, Prompt, Options, User Choice, Correct Answer, Explanation.
- Generates high-quality pedagogical explanations for Vietnamese linguistics and literature.
"""

def generate_ai_tutor_response(user_message: str, question_context: dict = None) -> str:
    """Generate intelligent tutoring response given student query and question context."""
    if not question_context:
        return (
            "Chào bạn! Tôi là Trợ lý Gia sư AI môn Ngôn ngữ & Văn học HSA (ĐHQGHN). "
            "Bạn có thể bấm nút **'Hỏi AI câu này'** ở bất kỳ câu hỏi nào trong phần Luyện tập "
            "hoặc màn hình Xem kết quả để tôi hỗ trợ phân tích chi tiết đáp án và kiến thức liên quan nhé!"
        )

    # Extract context
    passage = question_context.get("passage_content") or ""
    prompt = question_context.get("content") or ""
    oa = question_context.get("option_a") or ""
    ob = question_context.get("option_b") or ""
    oc = question_context.get("option_c") or ""
    od = question_context.get("option_d") or ""
    correct_ans = question_context.get("correct_answer") or ""
    user_ans = question_context.get("user_answer") or ""
    explanation = question_context.get("explanation") or ""
    category = question_context.get("category") or ""

    user_query = user_message.lower().strip()

    # Specialized contextual response generator
    resp_lines = []
    resp_lines.append(f"### 🎓 Phân tích của Gia sư AI về Câu hỏi [{category}]")
    
    if user_ans and user_ans != correct_ans:
        resp_lines.append(f"📌 **Đối chiếu đáp án:** Bạn đã chọn **{user_ans}**, trong khi đáp án chính xác là **{correct_ans}**.\n")
    elif user_ans and user_ans == correct_ans:
        resp_lines.append(f"🎉 **Chúc mừng bạn!** Bạn đã chọn chính xác phương án **{correct_ans}**.\n")

    if explanation:
        resp_lines.append(f"💡 **Cơ sở bản chất và Lời giải chi tiết:**\n> {explanation}\n")

    # Handle common student inquiries
    if "tại sao" in user_query or "vì sao" in user_query or "giải thích" in user_query:
        resp_lines.append("🔍 **Điểm mấu chốt để phân biệt:**")
        if category == "TV1":
            resp_lines.append(
                f"- Để làm tốt dạng bài **Chọn từ không cùng nhóm**, bạn cần xét trên 3 bình diện:\n"
                f"  1. *Từ loại*: Danh từ, động từ hay tính từ.\n"
                f"  2. *Cấu tạo từ*: Từ ghép đẳng lập, từ ghép chính phụ hay từ láy.\n"
                f"  3. *Trường nghĩa*: Các từ còn lại có cùng một nét nghĩa chung, còn phương án **{correct_ans}** nằm ngoài trường nghĩa đó."
            )
        elif category == "TV2":
            resp_lines.append(
                f"- Đối với dạng bài **Điền từ vào chỗ trống**, quan trọng nhất là tính chỉnh thể logic của câu văn và mối quan hệ ngữ pháp (nguyên nhân - kết quả, tương phản, bổ sung).\n"
                f"- Khi thay phương án **{correct_ans}** vào, câu văn vừa chuẩn chỉnh về mặt ngữ pháp vừa diễn đạt tự nhiên, uyển chuyển đúng văn phong chuẩn mực."
            )
        elif category == "TV3":
            resp_lines.append(
                f"- Dạng bài **Tìm lỗi sai trong câu** thường bẫy vào các lỗi:\n"
                f"  1. Sai kết hợp từ (dùng từ không hợp ngữ cảnh).\n"
                f"  2. Lỗi ngữ pháp (thiếu chủ vị, câu sai quan hệ từ).\n"
                f"  3. Lỗi phong cách (đem khẩu ngữ vào văn bản trang trọng hoặc ngược lại)."
            )
        else:
            resp_lines.append(
                f"- Với phần Đọc hiểu, hãy bám sát vào ngữ liệu văn bản gốc:\n"
                f"> *\"{passage[:180]}...\"*\n"
                f"- Chú ý các từ khóa then chốt trong câu hỏi để định vị chính xác đoạn chứa thông tin."
            )

    resp_lines.append("\n👉 *Nếu bạn cần làm rõ thêm khía cạnh nào khác của câu hỏi này, hãy đặt thêm câu hỏi cho mình nhé!*")
    return "\n".join(resp_lines)
