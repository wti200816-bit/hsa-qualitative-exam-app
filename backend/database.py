import sqlite3, pathlib

DB_PATH = pathlib.Path(r"E:\AI\DGNL_CHUAN_HOA\hsa_exam.db")

def get_db():
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_tables():
    conn = get_db()
    c = conn.cursor()
    
    # Leaderboard table for mock exam submissions
    c.execute("""
    CREATE TABLE IF NOT EXISTS exam_submissions (
        id TEXT PRIMARY KEY,
        student_name TEXT NOT NULL,
        student_id TEXT,
        exam_title TEXT NOT NULL,
        score INTEGER NOT NULL,
        total_questions INTEGER DEFAULT 50,
        time_spent_seconds INTEGER NOT NULL,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    
    # Student stats table for "Chăm chỉ tích luỹ"
    c.execute("""
    CREATE TABLE IF NOT EXISTS student_stats (
        student_name TEXT PRIMARY KEY,
        total_correct INTEGER DEFAULT 0,
        total_attempts INTEGER DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_tables()
    print("Database tables initialized successfully!")
