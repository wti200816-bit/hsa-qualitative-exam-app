import sys, urllib.request, json
sys.stdout.reconfigure(encoding="utf-8")

def get_json(url):
    res = urllib.request.urlopen(url)
    return json.loads(res.read().decode("utf-8"))

def post_json(url, data):
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    res = urllib.request.urlopen(req)
    return json.loads(res.read().decode("utf-8"))

print("=== 1. Test Exam Templates Count ===")
templates = get_json("http://127.0.0.1:8000/api/templates")
print(f"Total Exam Templates: {len(templates)}")
assert len(templates) == 50, f"Expected 50 templates, got {len(templates)}"
print(f"Latest 3 templates: #{templates[47]['exam_num']} ({templates[47]['title']}), #{templates[48]['exam_num']} ({templates[48]['title']}), #{templates[49]['exam_num']} ({templates[49]['title']})")

print("\n=== 2. Test Questions Count in Database ===")
admin_stats = get_json("http://127.0.0.1:8000/api/admin/questions?limit=1")
print("Stats in DB:", admin_stats["stats"])

print("\n=== 3. Test AI Tutor Chat Endpoint ===")
# Anti-cheat test
lock_test = post_json("http://127.0.0.1:8000/api/ai-tutor/chat", {
    "message": "Cho em hỏi đáp án câu này",
    "mode": "mock_exam"
})
print("Anti-cheat response:", lock_test["reply"][:60], "...")
assert "tạm khoá" in lock_test["reply"], "Anti-cheat failed!"

# Question context test
tutor_test = post_json("http://127.0.0.1:8000/api/ai-tutor/chat", {
    "message": "Giải thích chi tiết vì sao chọn đáp án đúng?",
    "mode": "practice",
    "question_context": {
        "order_num": 51,
        "category": "TV1",
        "content": "Chọn từ/cụm từ mà nghĩa của nó KHÔNG cùng nhóm với các từ/cụm từ còn lại: A. Mưa rào, B. Nắng gắt, C. Gió nhẹ, D. Lụt lội",
        "option_a": "Mưa rào",
        "option_b": "Nắng gắt",
        "option_c": "Gió nhẹ",
        "option_d": "Lụt lội",
        "user_answer": "B",
        "correct_answer": "D",
        "explanation": "Lụt lội là thảm họa/hậu quả thiên tai, còn lại là hiện tượng thời tiết thông thường."
    }
})
print("AI Tutor response:\n", tutor_test["reply"][:300], "...")
assert "D" in tutor_test["reply"], "AI Tutor response missing correct answer D"

print("\nALL UPGRADE VERIFICATIONS PASSED 100%!")
