# 🎓 HSA Master - Web App Luyện Thi ĐGNL ĐHQGHN (Tư Duy Định Tính)

Hệ thống web app luyện thi toàn diện phần **Tư duy định tính (Ngôn ngữ & Văn học)** cho Kỳ thi Đánh giá Năng lực (HSA) Đại học Quốc gia Hà Nội theo chuẩn cấu trúc đề mẫu năm 2026.

![Theme](https://img.shields.io/badge/Theme-Blue%20Academic-1E3A8A?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20FastAPI%20%7C%20SQLite%20%7C%20TailwindCSS-2563EB?style=for-the-badge)
![License](https://img.shields.io/badge/Data%20Grounding-100%25%20Original-10B981?style=for-the-badge)

---

## 🌟 Tính Năng Nổi Bật

### 1. Ma trận Đề Thi Chuẩn Hóa 2026 (50 Câu / 60 Phút)
- **Nhóm 1 (Câu 51 - 65):** 15 câu Tiếng Việt
  - *Dạng 1 (51 - 55):* Chọn từ/cụm từ không cùng nhóm nghĩa / từ loại / trường nghĩa.
  - *Dạng 2 (56 - 60):* Điền từ/cặp từ thích hợp vào chỗ trống.
  - *Dạng 3 (61 - 65):* Xác định từ/cụm từ dùng sai (ngữ pháp, ngữ nghĩa, phong cách, chính tả).
- **Nhóm 2 (Câu 66 - 75):** 10 câu Đọc hiểu ngắn độc lập.
- **Nhóm 3 (Câu 76 - 100):** 25 câu Đọc hiểu chùm (5 văn bản x 5 câu hỏi con). **Ràng buộc tuyệt đối:** Giữ nguyên cả cụm văn bản và toàn bộ câu hỏi đi kèm, không xé lẻ.

### 2. Hai Chế Độ Học Tập
- **Thi thử (Mock Exam):** 50 câu theo ma trận chuẩn, đồng hồ đếm ngược 60 phút, tự động nộp bài khi hết giờ, bảng chuyển câu (Palette Grid 1-50) hỗ trợ đánh dấu câu hỏi cần xem lại.
- **Luyện tập (Practice Mode):** Luyện theo từng dạng chuyên sâu, không giới hạn thời gian, hỗ trợ tra cứu lời giải tức thì.

### 3. Giao Diện Chia Đôi Màn Hình (Split-Screen Layout)
- **Cột trái:** Ghim văn bản ngữ liệu (thơ, truyện ngắn, nghị luận xã hội, khoa học) với thanh cuộn độc lập và bộ đếm số từ.
- **Cột phải:** Danh sách câu hỏi con và các lựa chọn A, B, C, D để học sinh dễ dàng đối chiếu trực tiếp.

### 4. Bảng Vinh Danh (Leaderboard)
- **Podium Vinh danh:** Bục vinh quang Top 1, Top 2, Top 3 kèm huy chương và avatar.
- **Top 20 Thí sinh:** Xếp hạng theo *Thủ khoa Đề thi* (Điểm cao nhất / Thời gian ngắn nhất) và *Chăm chỉ Tích lũy* (Tổng câu đúng).
- **Thanh ghim cố định (Sticky bar):** Theo dõi thứ hạng và thành tích của thí sinh đang làm bài theo thời gian thực.

### 5. Trợ Lý Gia Sư AI (Context-Aware AI Tutor)
- **Cơ chế Chống gian lận (Anti-cheat):** Tự động khóa và ẩn AI trong 60 phút làm bài Thi thử để bảo đảm tính trung thực của phòng thi.
- **Tự động truyền ngữ cảnh:** Khi bấm **"Hỏi AI câu này"**, hệ thống tự động nạp ngầm toàn bộ dữ liệu (Ngữ liệu văn bản, Câu hỏi, 4 đáp án, Đáp án thí sinh chọn, Đáp án đúng, Lời giải) vào khung chat để gia sư AI phân tích sâu sắc.

### 6. Trang Quản Trị & Kiểm Toán Đề (Admin Dashboard)
- Quản lý kho 3.399 câu hỏi chuẩn hóa và 304 văn bản đọc hiểu.
- Kiểm duyệt và duyệt 1-click các câu hỏi có đáp án AI đề xuất (`answer_source: 'ai_resolved'`).

---

## 🛠️ Cấu Trúc Mã Nguồn

```
hsa-qualitative-exam-app/
├── backend/
│   ├── main.py              # FastAPI server, endpoints & static routing
│   ├── database.py          # SQLite connection & schema management
│   ├── exam_generator.py    # Thuật toán trộn đề 50 câu theo ma trận chuẩn
│   └── ai_tutor.py          # Context-Aware AI Chatbot & Anti-cheat
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Thanh điều hướng & Profile thí sinh
│   │   │   ├── ExamRoom.jsx         # Phòng thi Split-Screen & Countdown
│   │   │   ├── PracticeRoom.jsx     # Luyện tập theo từng dạng bài
│   │   │   ├── ResultScreen.jsx     # Màn hình kết quả & Lời giải chi tiết
│   │   │   ├── Leaderboard.jsx      # Bảng vinh danh Podium & Top 20
│   │   │   ├── AdminDashboard.jsx   # Trang Admin duyệt đề & Upload
│   │   │   └── AiChatDrawer.jsx     # Khung chat Gia sư AI Context-Aware
│   │   ├── App.jsx                  # Root App Component
│   │   └── main.jsx                 # React Entry Point
│   ├── index.html                   # Blue Theme & Font Be Vietnam Pro
│   ├── vite.config.js               # Vite 5 Configuration
│   └── package.json                 # Dependencies (React 19, Lucide, Confetti)
└── README.md
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Ứng Dụng

### Yêu cầu hệ thống:
- Python 3.10+ (hoặc `uv`)
- Node.js v18+ & npm

### 1. Khởi động Backend (FastAPI)
```bash
# Cài đặt thư viện và chạy uvicorn
uv run --with fastapi --with uvicorn --with python-multipart uvicorn main:app --host 127.0.0.1 --port 8000 --app-dir backend
```

### 2. Khởi động Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
# Mở trình duyệt tại: http://localhost:5173
```
*Hoặc truy cập trực tiếp `http://localhost:8000` nếu đã build static bundle (`npm run build`).*

---

## 📜 Quy Chuẩn Đề & Bản Quyền
- Dữ liệu câu hỏi được trích xuất và bảo toàn nguyên bản từ các tài liệu đề thi HSA chính thức.
- Đáp án và lời giải đã được chuẩn hóa và kiểm chứng phục vụ mục đích học tập và ôn luyện phi thương mại.
