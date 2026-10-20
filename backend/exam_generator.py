"""Exam Generator Engine for HSA Qualitative (Verbal) Section.
Strictly implements the VNU-HN 50-question matrix:
- Nhóm 1 (51-65): 15 TV questions (5 TV1 + 5 TV2 + 5 TV3)
- Nhóm 2 (66-75): 10 Short Reading questions (R1)
- Nhóm 3 (76-100): 25 Passage-based Group questions (5 clusters x 5 child questions)
Constraints:
- ONLY pulls questions where status = 'verified'.
- Preserves whole passages and all child questions when selecting reading clusters.
"""
import random, uuid
from database import get_db

def generate_random_exam(student_name="Thí sinh"):
    conn = get_db()
    c = conn.cursor()
    
    # 1. Nhóm 1: 15 TV (5 TV1 + 5 TV2 + 5 TV3)
    tv1_rows = c.execute("""
        SELECT q.id, q.content, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, q.explanation, q.category, NULL as passage_id, NULL as passage_title, NULL as passage_content
        FROM questions q
        WHERE q.category = 'TV1' AND q.status = 'verified'
    """).fetchall()
    
    tv2_rows = c.execute("""
        SELECT q.id, q.content, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, q.explanation, q.category, NULL as passage_id, NULL as passage_title, NULL as passage_content
        FROM questions q
        WHERE q.category = 'TV2' AND q.status = 'verified'
    """).fetchall()

    tv3_rows = c.execute("""
        SELECT q.id, q.content, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, q.explanation, q.category, NULL as passage_id, NULL as passage_title, NULL as passage_content
        FROM questions q
        WHERE q.category = 'TV3' AND q.status = 'verified'
    """).fetchall()

    sel_tv1 = random.sample(tv1_rows, min(5, len(tv1_rows)))
    sel_tv2 = random.sample(tv2_rows, min(5, len(tv2_rows)))
    sel_tv3 = random.sample(tv3_rows, min(5, len(tv3_rows)))
    group1 = [dict(r) for r in sel_tv1 + sel_tv2 + sel_tv3]

    # 2. Nhóm 2: 10 Short Reading questions (R1)
    r1_rows = c.execute("""
        SELECT q.id, q.content, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, q.explanation, q.category, q.passage_id, p.title as passage_title, p.content as passage_content
        FROM questions q
        LEFT JOIN passages p ON q.passage_id = p.id
        WHERE q.category = 'R1' AND q.status = 'verified'
    """).fetchall()
    sel_r1 = random.sample(r1_rows, min(10, len(r1_rows)))
    group2 = [dict(r) for r in sel_r1]

    # 3. Nhóm 3: 25 Cluster Reading questions (5 distinct clusters x 5 child questions)
    # Find all passages that have at least 5 verified questions
    passage_candidates = c.execute("""
        SELECT p.id, p.title, p.content, count(q.id) as q_cnt
        FROM passages p
        JOIN questions q ON q.passage_id = p.id
        WHERE q.status = 'verified'
        GROUP BY p.id
        HAVING q_cnt >= 5
    """).fetchall()

    sel_passages = random.sample(passage_candidates, min(5, len(passage_candidates)))
    group3 = []
    
    for p_row in sel_passages:
        p_id = p_row["id"]
        p_title = p_row["title"]
        p_content = p_row["content"]
        
        child_qs = c.execute("""
            SELECT q.id, q.content, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, q.explanation, q.category, ? as passage_id, ? as passage_title, ? as passage_content
            FROM questions q
            WHERE q.passage_id = ? AND q.status = 'verified'
            ORDER BY q.source_q_num ASC
            LIMIT 5
        """, (p_id, p_title, p_content, p_id)).fetchall()
        
        group3.extend([dict(q) for q in child_qs])

    conn.close()

    # Combine into 50-question exam
    all_questions = group1 + group2 + group3
    
    # Assign exam order numbers 51 to 100
    for idx, q in enumerate(all_questions):
        q["order_num"] = 51 + idx

    exam_id = str(uuid.uuid4())
    return {
        "exam_id": exam_id,
        "title": f"Đề thi ĐGNL Chuẩn hóa Ma trận HSA 2026 (Mã đề: {exam_id[:8].upper()})",
        "total_questions": len(all_questions),
        "duration_minutes": 60,
        "questions": all_questions
    }

def get_template_exam(template_id):
    conn = get_db()
    c = conn.cursor()
    
    tpl = c.execute("SELECT * FROM exam_templates WHERE id = ?", (template_id,)).fetchone()
    if not tpl:
        conn.close()
        return None
        
    qs = c.execute("""
        SELECT q.id, q.content, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, q.explanation, q.category,
               q.passage_id, p.title as passage_title, p.content as passage_content, eq.order_num
        FROM exam_template_questions eq
        JOIN questions q ON eq.question_id = q.id
        LEFT JOIN passages p ON q.passage_id = p.id
        WHERE eq.template_id = ?
        ORDER BY eq.order_num ASC
    """, (template_id,)).fetchall()
    
    conn.close()
    return {
        "exam_id": tpl["id"],
        "title": tpl["title"],
        "total_questions": len(qs),
        "duration_minutes": 60,
        "questions": [dict(r) for r in qs]
    }
