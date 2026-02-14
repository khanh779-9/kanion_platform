<div align="center">
   <h1>🔐 Kanion Secure Space</h1>
   <b>Nền tảng quản lý mật khẩu, ghi chú an toàn & quản lý dữ liệu mã hóa</b>
   <br />
   <br />
   <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="Giấy phép: MIT">
   <img src="https://img.shields.io/badge/Frontend-React_18-61dafb.svg" alt="React 18">
   <img src="https://img.shields.io/badge/Backend-Node.js-339933.svg" alt="Node.js">
   <img src="https://img.shields.io/badge/Database-PostgreSQL-336791.svg" alt="PostgreSQL">
   <img src="https://img.shields.io/badge/Encryption-AES--256--GCM-green.svg" alt="AES-256-GCM">
</div>

---

## Tổng Quan

**Kanion Secure Space** là một trình quản lý mật khẩu mã nguồn mở và nền tảng ghi chú mã hóa với mã hóa cấp quân sự. Được xây dựng với React 18, Node.js và PostgreSQL để lưu trữ an toàn mật khẩu, bí mật TOTP, ghi chú và dữ liệu cá nhân.

**Tính năng:**
- 🔒 Mã hóa AES-256-GCM cho tất cả dữ liệu nhạy cảm
- 🔐 Hỗ trợ TOTP 6 chữ số với đếm ngược trực tiếp
- 📝 Ghi chú mã hóa với màu sắc tùy chỉnh
- 🌗 Chủ đề Tối/Sáng/Tự động
- 🌍 Đa ngôn ngữ (Tiếng Anh, Tiếng Việt)
- 🎯 Thiết kế đáp ứng ưu tiên di động
- 🪪 Xác thực JWT với nhật ký kiểm tra

---

## 🛠 Công Nghệ

**Frontend:** React 18 • Vite • TailwindCSS • Lucide React • Axios • React Router

**Backend:** Node.js (v20+) • Express.js • PostgreSQL • Bcrypt • crypto (AES-256-GCM)

**Công cụ:** pnpm • Docker • Docker Compose

---

## 📁 Cấu Trúc Dự Án

```
Kanion_Platform/              # Monorepo
├── apps/
│   ├── backend/             # API Express (Cổng: 3000)
│   │   ├── src/
│   │   │   ├── routes/      # auth, vault, notes, user
│   │   │   ├── middleware/  # auth, rateLimit
│   │   │   ├── db/          # pool, migrate
│   │   │   └── utils/       # encryption, auditLog
│   │   └── sql/001_init.sql # Sơ đồ cơ sở dữ liệu
│   └── frontend/            # Ứng dụng React (Cổng: 5173)
│       └── src/
│           ├── pages/       # Đăng nhập, Vault, Ghi chú, v.v.
│           ├── components/  # NavBar, Theme, Toast
│           ├── api/         # client, notifications
│           └── locales/     # en.json, vi.json
├── pnpm-workspace.yaml
└── README.md
```

---

## ⚡ Bắt Đầu Nhanh

### Điều Kiện

- Node.js 20+ (LTS)
- PostgreSQL 12+
- pnpm (hoặc npm)

### 1. Thiết Lập Cơ Sở Dữ Liệu

```bash
createdb kanion_db
psql -U postgres -d kanion_db -f apps/backend/sql/001_init.sql
```

### 2. Backend

```bash
cd apps/backend
cp .env.example .env        # Chỉnh sửa với cấu hình của bạn
pnpm install
pnpm run dev                # Chế độ phát triển
# pnpm start               # Sản xuất
```

### 3. Frontend

```bash
cd apps/frontend
cp .env.example .env        # Chỉnh sửa URL API
pnpm install
pnpm run dev                # Máy chủ phát triển: http://localhost:5173
```

### Truy Cập

- Frontend: http://localhost:5173
- API: http://localhost:3000

---

## 🔐 Tính Năng Bảo Mật

- **Mã hóa:** AES-256-GCM cho tất cả dữ liệu nhạy cảm
- **Xác thực:** Mã thông báo JWT (hết hạn 7 ngày)
- **Bảo mật mật khẩu:** Bcrypt hashing (12 vòng)
- **Giới hạn tần suất:** 10 yêu cầu/15 phút cho mỗi IP
- **Nhật ký kiểm tra:** Nhật ký đăng nhập, theo dõi thiết bị, sự kiện bảo mật
- **Tiêu đề:** CORS, CSP, X-Frame-Options tiêu đề bảo mật

---

## 📦 Xây Dựng cho Sản Xuất

### Backend

```bash
cd apps/backend
pnpm install --production
pnpm start
```

### Frontend

```bash
cd apps/frontend
pnpm run build
# Đầu ra: dist/ → Triển khai lên Vercel, Netlify, v.v.
```

---

## 🚀 Triển Khai (Render)

### Điều Kiện

- Node.js v20 LTS (tránh v25.x)
- Cơ sở dữ liệu PostgreSQL
- pnpm-workspace.yaml trong thư mục gốc (đã được tạo sẵn)

### Dịch Vụ Backend

```bash
# Xây dựng: pnpm install
# Bắt đầu: cd apps/backend && npm start
```

### Dịch Vụ Frontend

```bash
# Xây dựng: cd apps/frontend && pnpm install && npm run build
# Thư mục xuất bản: apps/frontend/dist
```

### Biến Môi Trường (Backend)

```env
PORT=3000
NODE_ENV=production
DATABASE_URL=your_postgresql_url
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key
FRONTEND_URL=https://your-frontend-url.com
```

**Khắc Phục Sự Cố:**

- Lỗi: "Không tìm thấy gói 'express'" → Đảm bảo pnpm-lock.yaml đã được cam kết
- Lỗi: "ERR_INVALID_THIS" → Cập nhật Node.js lên v20 LTS
- Để biết hướng dẫn triển khai đầy đủ, xem [DEPLOYMENT.md](docs/DEPLOYMENT.md)

---

## 📖 Điểm Cuối API

**Xác thực:** `POST /auth/register`, `POST /auth/login`, `GET /auth/logout`

**Vault:** `GET/POST /vault/items`, `GET/PUT/DELETE /vault/items/:id`

**Ghi chú:** `GET/POST /notes`, `PUT/DELETE /notes/:id`

**Người dùng:** `GET/PUT /user/profile`, `GET/PUT /user/appearance-settings`

---

## 🎨 Tùy Chỉnh

- **Ngôn ngữ:** Thêm bản dịch trong `frontend/src/locales/[lang].json`
- **Chủ đề:** Chỉnh sửa `frontend/src/themeColors.js`
- **Loại Vault:** Cập nhật enum cơ sở dữ liệu trong `001_init.sql`

---

## 📄 Giấy Phép

Giấy phép MIT - Xem tệp [LICENSE](LICENSE)