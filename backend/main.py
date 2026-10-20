"""FastAPI Backend for HSA Qualitative Exam Web App."""
import sqlite3, uuid, os, sys
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from database import get_db, init_tables
from exam_generator import generate_random_exam, get_template_exam
from ai_tutor import generate_ai_tutor_response

init_tables()

app = FastAPI(title="HSA Exam Master API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Models -----------------
class ExamSubmitRequest(BaseModel):
    student_name: str
    student_id: Optional[str] = "HS01"
    exam_title: str
    time_spent_seconds: int
    answers: Dict[str, str] # question_id -> chosen_option (A/B/C/D)
    exam_id: Optional[str] = None

class AIChatRequest(BaseModel):
    message: str
    mode: str = "practice" # "mock_exam" | "practice" | "result"
    question_context: Optional[Dict[str, Any]] = None

class AdminVerifyRequest(BaseModel):
    question_id: str
    correct_answer: str
    explanation: Optional[str] = None
    status: str = "verified"

# ----------------- Endpoints -----------------

@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "HSA Exam Master Backend"}

# 1. Exam Templates & Generator
@app.get("/api/templates")
def list_exam_templates():
    conn = get_db()
    c = conn.cursor()
    rows = c.execute("""
        SELECT id, exam_num, title, teacher_info, source_file, total_questions
        FROM exam_templates
        ORDER BY exam_num ASC
    """).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.get("/api/templates/{template_id}")
def get_template(template_id: str):
    exam = get_template_exam(template_id)
    if not exam:
        raise HTTPException(status_code=404, detail="Template not found")
    return exam

@app.post("/api/exam/generate")
def generate_mock_exam(student_name: str = Query("Thí sinh")):
    return generate_random_exam(student_name)

# 2. Exam Submission & Scoring
@app.post("/api/exam/submit")
def submit_exam(req: ExamSubmitRequest):
    conn = get_db()
    c = conn.cursor()
    
    q_ids = list(req.answers.keys())
    if not q_ids:
        conn.close()
        return {"score": 0, "total": 50, "results": []}

    placeholders = ",".join("?" for _ in q_ids)
    rows = c.execute(f"""
        SELECT q.id, q.content, q.option_a, q.option_b, q.option_c, q.option_d,
               q.correct_answer, q.explanation, q.category, p.content as passage_content
        FROM questions q
        LEFT JOIN passages p ON q.passage_id = p.id
        WHERE q.id IN ({placeholders})
    """, q_ids).fetchall()

    q_map = {r["id"]: dict(r) for r in rows}
    
    score = 0
    detailed_results = []
    
    for q_id, user_choice in req.answers.items():
        q_data = q_map.get(q_id, {})
        correct = q_data.get("correct_answer", "").strip().upper()
        is_correct = (user_choice.strip().upper() == correct) if correct else False
        if is_correct:
            score += 1
            
        detailed_results.append({
            "question_id": q_id,
            "content": q_data.get("content", ""),
            "category": q_data.get("category", ""),
            "passage_content": q_data.get("passage_content", ""),
            "option_a": q_data.get("option_a", ""),
            "option_b": q_data.get("option_b", ""),
            "option_c": q_data.get("option_c", ""),
            "option_d": q_data.get("option_d", ""),
            "user_choice": user_choice,
            "correct_answer": correct,
            "is_correct": is_correct,
            "explanation": q_data.get("explanation", "")
        })

    # Save to exam_submissions
    sub_id = str(uuid.uuid4())
    c.execute("""
        INSERT INTO exam_submissions (id, student_name, student_id, exam_title, score, total_questions, time_spent_seconds)
        VALUES (?, ?, ?, ?, ?, ?, ?);
    """, (sub_id, req.student_name, req.student_id, req.exam_title, score, len(req.answers), req.time_spent_seconds))

    # Update student_stats
    c.execute("""
        INSERT INTO student_stats (student_name, total_correct, total_attempts)
        VALUES (?, ?, 1)
        ON CONFLICT(student_name) DO UPDATE SET
            total_correct = total_correct + ?,
            total_attempts = total_attempts + 1,
            updated_at = CURRENT_TIMESTAMP;
    """, (req.student_name, score, score))

    conn.commit()
    conn.close()

    return {
        "submission_id": sub_id,
        "score": score,
        "total_questions": len(req.answers),
        "time_spent_seconds": req.time_spent_seconds,
        "results": detailed_results
    }

# 3. Practice Mode Endpoints
@app.get("/api/practice/categories")
def get_practice_categories():
    conn = get_db()
    c = conn.cursor()
    rows = c.execute("""
        SELECT category, count(*) as count
        FROM questions
        WHERE status = 'verified'
        GROUP BY category
    """).fetchall()
    conn.close()
    
    desc_map = {
        "TV1": "Từ không cùng nhóm (Phân tích trường nghĩa, từ loại)",
        "TV2": "Điền từ vào chỗ trống (Quan hệ từ, ngữ cảnh)",
        "TV3": "Xác định lỗi sai (Ngữ pháp, ngữ nghĩa, phong cách)",
        "R1": "Đọc hiểu câu đơn (Ngữ liệu ngắn, phương thức nghệ thuật)",
        "RC": "Đọc hiểu chùm (Cụm 5 câu gắn với văn bản dài)"
    }
    
    return [
        {
            "category": r["category"],
            "count": r["count"],
            "title": desc_map.get(r["category"], r["category"])
        }
        for r in rows
    ]

@app.get("/api/practice/questions")
def get_practice_questions(category: str = Query(...), limit: int = 10, offset: int = 0):
    conn = get_db()
    c = conn.cursor()
    
    if category == "RC":
        # Pull distinct passages for RC
        passages = c.execute("""
            SELECT p.id, p.title, p.content
            FROM passages p
            JOIN questions q ON q.passage_id = p.id
            WHERE q.category = 'RC' AND q.status = 'verified'
            GROUP BY p.id
            ORDER BY p.id
            LIMIT 1 OFFSET ?
        """, (offset // 5,)).fetchall()
        
        if not passages:
            conn.close()
            return {"questions": [], "has_more": False}
            
        p = passages[0]
        qs = c.execute("""
            SELECT q.id, q.content, q.option_a, q.option_b, q.option_c, q.option_d,
                   q.correct_answer, q.explanation, q.category,
                   ? as passage_id, ? as passage_title, ? as passage_content
            FROM questions q
            WHERE q.passage_id = ? AND q.status = 'verified'
            ORDER BY q.source_q_num ASC
        """, (p["id"], p["title"], p["content"], p["id"])).fetchall()
        
        conn.close()
        return {"questions": [dict(r) for r in qs], "has_more": True}
    else:
        qs = c.execute("""
            SELECT q.id, q.content, q.option_a, q.option_b, q.option_c, q.option_d,
                   q.correct_answer, q.explanation, q.category,
                   p.title as passage_title, p.content as passage_content
            FROM questions q
            LEFT JOIN passages p ON q.passage_id = p.id
            WHERE q.category = ? AND q.status = 'verified'
            ORDER BY q.id
            LIMIT ? OFFSET ?
        """, (category, limit, offset)).fetchall()
        
        total = c.execute("SELECT count(*) FROM questions WHERE category = ? AND status = 'verified'", (category,)).fetchone()[0]
        conn.close()
        return {
            "questions": [dict(r) for r in qs],
            "total": total,
            "has_more": (offset + limit < total)
        }

# 4. Leaderboard Endpoints
@app.get("/api/leaderboard")
def get_leaderboard(tab: str = Query("mock"), timeframe: str = Query("all")):
    conn = get_db()
    c = conn.cursor()

    if tab == "mock":
        # Thủ khoa đề thi: Highest score, then shortest time
        rows = c.execute("""
            SELECT student_name, score, total_questions, time_spent_seconds, exam_title, submitted_at
            FROM exam_submissions
            ORDER BY score DESC, time_spent_seconds ASC, submitted_at DESC
            LIMIT 20
        """).fetchall()
        res = [dict(r) for r in rows]
    else:
        # Chăm chỉ tích luỹ: Most correct answers
        rows = c.execute("""
            SELECT student_name, total_correct, total_attempts, updated_at
            FROM student_stats
            ORDER BY total_correct DESC, total_attempts DESC
            LIMIT 20
        """).fetchall()
        res = [dict(r) for r in rows]

    conn.close()
    return {"tab": tab, "leaderboard": res}

# 5. Context-Aware AI Tutor Chat
@app.post("/api/ai/chat")
def ai_chat_endpoint(req: AIChatRequest):
    # Anti-cheat check: strictly lock AI tutor during mock exam
    if req.mode == "mock_exam":
        return {
            "reply": "🔒 **Tính năng Gia sư AI đang tạm khoá trong thời gian làm bài Thi thử 60 phút** nhằm đảm bảo tính công bằng và nghiêm túc tuyệt đối của phòng thi. Bạn có thể trao đổi với AI ngay sau khi nộp bài hoặc trong chế độ Luyện tập nhé!"
        }
    
    reply = generate_ai_tutor_response(req.message, req.question_context)
    return {"reply": reply}

# 6. Admin Endpoints
@app.get("/api/admin/questions")
def admin_get_questions(
    status: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
):
    conn = get_db()
    c = conn.cursor()
    
    query = "SELECT q.*, p.title as passage_title FROM questions q LEFT JOIN passages p ON q.passage_id = p.id WHERE 1=1"
    params = []
    
    if status:
        query += " AND q.status = ?"
        params.append(status)
    if category:
        query += " AND q.category = ?"
        params.append(category)
    if search:
        query += " AND (q.content LIKE ? OR q.source_file LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%"])
        
    query += " ORDER BY q.source_file, q.source_q_num LIMIT ? OFFSET ?"
    params.extend([limit, offset])
    
    rows = c.execute(query, params).fetchall()
    
    total = c.execute("SELECT count(*) FROM questions").fetchone()[0]
    total_verified = c.execute("SELECT count(*) FROM questions WHERE status = 'verified'").fetchone()[0]
    total_pending = c.execute("SELECT count(*) FROM questions WHERE status = 'pending_review'").fetchone()[0]
    
    conn.close()
    return {
        "questions": [dict(r) for r in rows],
        "stats": {
            "total": total,
            "verified": total_verified,
            "pending": total_pending
        }
    }

@app.post("/api/admin/verify")
def admin_verify_question(req: AdminVerifyRequest):
    conn = get_db()
    c = conn.cursor()
    c.execute("""
        UPDATE questions
        SET correct_answer = ?,
            explanation = COALESCE(?, explanation),
            status = ?,
            answer_source = 'ai_resolved'
        WHERE id = ?;
    """, (req.correct_answer.upper(), req.explanation, req.status, req.question_id))
    conn.commit()
    conn.close()
    return {"status": "success", "question_id": req.question_id}

# Mount static frontend build
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
if os.path.exists(frontend_dist):
    from fastapi.staticfiles import StaticFiles
    from starlette.responses import FileResponse
    
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        if full_path.startswith("api"):
            raise HTTPException(status_code=404, detail="API route not found")
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
