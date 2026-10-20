import sqlite3, json, os, sys
sys.stdout.reconfigure(encoding='utf-8')

DB_PATH = r"E:\AI\DGNL_CHUAN_HOA\hsa_exam.db"
OUTPUT_DIR = r"E:\AI\frontend\public\data"
os.makedirs(OUTPUT_DIR, exist_ok=True)

conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row
c = conn.cursor()

print("1. Đang trích xuất Ngữ liệu Đọc hiểu (Passages)...")
passages = {}
for r in c.execute("SELECT id, title, content FROM passages").fetchall():
    passages[r["id"]] = {
        "id": r["id"],
        "title": r["title"] or "",
        "content": r["content"] or ""
    }
print(f"   => Đã nạp {len(passages)} văn bản đọc hiểu.")

print("2. Đang trích xuất 50 Đề thi chuẩn hóa (Templates)...")
template_questions = {}
for tq in c.execute("SELECT template_id, question_id, order_num FROM exam_template_questions ORDER BY template_id, order_num ASC").fetchall():
    template_questions.setdefault(tq["template_id"], []).append(tq["question_id"])

templates = []
for t in c.execute("SELECT id, exam_num, title, source_file, total_questions FROM exam_templates ORDER BY exam_num ASC").fetchall():
    templates.append({
        "id": t["id"],
        "exam_num": t["exam_num"],
        "title": t["title"],
        "source_file": t["source_file"],
        "total_questions": t["total_questions"] or 50,
        "question_ids": template_questions.get(t["id"], [])
    })
print(f"   => Đã nạp {len(templates)} đề thi mẫu chuẩn hóa.")

print("3. Đang trích xuất Ngân hàng câu hỏi (Questions)...")
questions = {}
# Include all questions, flagging verified
for q in c.execute("""
    SELECT id, passage_id, category, content, option_a, option_b, option_c, option_d,
           correct_answer, explanation, status, source_file, source_q_num
    FROM questions
""").fetchall():
    questions[q["id"]] = {
        "id": q["id"],
        "passage_id": q["passage_id"],
        "category": q["category"],
        "content": q["content"],
        "option_a": q["option_a"],
        "option_b": q["option_b"],
        "option_c": q["option_c"],
        "option_d": q["option_d"],
        "correct_answer": q["correct_answer"],
        "explanation": q["explanation"] or "",
        "status": q["status"],
        "source_file": q["source_file"],
        "source_q_num": q["source_q_num"]
    }
print(f"   => Đã nạp {len(questions)} câu hỏi.")

conn.close()

data = {
    "passages": passages,
    "templates": templates,
    "questions": questions
}

# Write JSON
json_path = os.path.join(OUTPUT_DIR, "hsa_data.json")
with open(json_path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False)
print(f"   => Đã ghi {json_path} ({os.path.getsize(json_path) / (1024*1024):.2f} MB)")

# Write JS file (window.HSA_DATA) for 100% offline & file:// compatibility
js_path = os.path.join(OUTPUT_DIR, "hsa_data.js")
with open(js_path, "w", encoding="utf-8") as f:
    f.write("window.HSA_DATA = ")
    json.dump(data, f, ensure_ascii=False)
    f.write(";\n")
print(f"   => Đã ghi {js_path} ({os.path.getsize(js_path) / (1024*1024):.2f} MB)")

print("\nHoàn tất xuất dữ liệu tĩnh!")
