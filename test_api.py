import sys, urllib.request, urllib.parse, json
sys.stdout.reconfigure(encoding="utf-8")

def post_json(url, data):
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    res = urllib.request.urlopen(req)
    return json.loads(res.read().decode("utf-8"))

def get_json(url):
    res = urllib.request.urlopen(url)
    return json.loads(res.read().decode("utf-8"))

print("=== 1. Test Exam Generator ===")
student_q = urllib.parse.quote("Nguyễn Văn A")
exam = post_json(f"http://127.0.0.1:8000/api/exam/generate?student_name={student_q}", {})
print(f"Title: {exam['title']}")
print(f"Total questions: {exam['total_questions']}")
print(f"Order numbers: {exam['questions'][0]['order_num']} -> {exam['questions'][-1]['order_num']}")

# Verify question distribution
tv_cnt = sum(1 for q in exam["questions"] if q["category"] in ("TV1", "TV2", "TV3"))
r1_cnt = sum(1 for q in exam["questions"] if q["category"] == "R1")
rc_cnt = sum(1 for q in exam["questions"] if q["category"] == "RC")
print(f"Distribution: {tv_cnt} TV + {r1_cnt} R1 + {rc_cnt} RC = {len(exam['questions'])} total")
assert tv_cnt == 15, f"Expected 15 TV, got {tv_cnt}"
assert r1_cnt == 10, f"Expected 10 R1, got {r1_cnt}"
assert rc_cnt == 25, f"Expected 25 RC, got {rc_cnt}"
print("Matrix verification passed 100%!")

print("\n=== 2. Test Exam Submit ===")
answers = {}
for q in exam["questions"]:
    answers[q["id"]] = q.get("correct_answer") or "A"

submit_res = post_json("http://127.0.0.1:8000/api/exam/submit", {
    "student_name": "Nguyễn Văn A",
    "exam_title": exam["title"],
    "time_spent_seconds": 2450,
    "answers": answers
})
print(f"Score: {submit_res['score']}/{submit_res['total_questions']}")
assert submit_res["score"] == 50, f"Expected score 50, got {submit_res['score']}"
print("Submission and grading verified!")

print("\n=== 3. Test Leaderboard ===")
lb_mock = get_json("http://127.0.0.1:8000/api/leaderboard?tab=mock")
print(f"Mock Leaderboard top 1: {lb_mock['leaderboard'][0]['student_name']} - {lb_mock['leaderboard'][0]['score']}/50")

lb_stats = get_json("http://127.0.0.1:8000/api/leaderboard?tab=stats")
print(f"Stats Leaderboard top 1: {lb_stats['leaderboard'][0]['student_name']} - {lb_stats['leaderboard'][0]['total_correct']} câu đúng")

print("\n=== 4. Test Context-Aware AI Tutor ===")
# Test anti-cheat during mock exam
chat_mock = post_json("http://127.0.0.1:8000/api/ai/chat", {
    "message": "Cho em hỏi câu này",
    "mode": "mock_exam"
})
print("AI Chat during mock exam:", chat_mock["reply"][:60], "...")
assert "tạm khoá" in chat_mock["reply"], "Anti-cheat failed to lock during mock exam!"

# Test tutor in practice mode
sample_q = exam["questions"][0]
chat_practice = post_json("http://127.0.0.1:8000/api/ai/chat", {
    "message": "Tại sao đáp án này đúng và phân tích cho em?",
    "mode": "practice",
    "question_context": {
        "content": sample_q["content"],
        "category": sample_q["category"],
        "option_a": sample_q["option_a"],
        "option_b": sample_q["option_b"],
        "option_c": sample_q["option_c"],
        "option_d": sample_q["option_d"],
        "correct_answer": sample_q["correct_answer"],
        "user_answer": "B",
        "explanation": sample_q["explanation"]
    }
})
print("AI Chat in practice mode:\n", chat_practice["reply"][:250], "...")

print("\n=== 5. Test Admin Endpoints ===")
admin_qs = get_json("http://127.0.0.1:8000/api/admin/questions?limit=5")
print(f"Admin questions returned: {len(admin_qs['questions'])}, stats: {admin_qs['stats']}")

print("\nALL SYSTEM TESTS PASSED SUCCESSFULLY!")
