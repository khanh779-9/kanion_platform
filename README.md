<div align="center">
   <h1>🔐 Kanion Secure Space</h1>
   <b>Full-stack platform for secure notes, password vault & encrypted data management</b>
   <br />
   <br />
   <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT">
   <img src="https://img.shields.io/badge/Frontend-React_18-61dafb.svg" alt="React 18">
   <img src="https://img.shields.io/badge/Backend-Node.js-339933.svg" alt="Node.js">
   <img src="https://img.shields.io/badge/Database-PostgreSQL-336791.svg" alt="PostgreSQL">
   <img src="https://img.shields.io/badge/Encryption-AES--256--GCM-green.svg" alt="AES-256-GCM">
</div>

---

## � Overview

**Kanion Secure Space** is an open-source password manager and encrypted notes platform with military-grade encryption. Built with React 18, Node.js, and PostgreSQL for secure storage of passwords, TOTP secrets, notes, and personal data.

**Features:**
- 🔒 AES-256-GCM encryption for all sensitive data
- 🔐 6-digit TOTP support with live countdown
- 📝 Encrypted notes with custom colors
- 🌗 Dark/Light/Auto theme
- 🌍 Multi-language (English, Vietnamese)
- 🎯 Responsive mobile-first design
- 🪪 JWT authentication with audit logs

---

## 🛠 Tech Stack

**Frontend:** React 18 • Vite • TailwindCSS • Lucide React • Axios • React Router

**Backend:** Node.js (v20+) • Express.js • PostgreSQL • Bcrypt • crypto (AES-256-GCM)

**Tools:** pnpm • Docker • Docker Compose

---

## 📁 Project Structure

```
Kanion_Platform/              # Monorepo
├── apps/
│   ├── backend/             # Express API (Port: 3000)
│   │   ├── src/
│   │   │   ├── routes/      # auth, vault, notes, user
│   │   │   ├── middleware/  # auth, rateLimit
│   │   │   ├── db/          # pool, migrate
│   │   │   └── utils/       # encryption, auditLog
│   │   └── sql/001_init.sql # Database schema
│   └── frontend/            # React app (Port: 5173)
│       └── src/
│           ├── pages/       # Login, Vault, Notes, etc
│           ├── components/  # NavBar, Theme, Toast
│           ├── api/         # client, notifications
│           └── locales/     # en.json, vi.json
├── pnpm-workspace.yaml
└── README.md
```

---

## � Quick Start

### Prerequisites
- Node.js 20+ (LTS)
- PostgreSQL 12+
- pnpm (or npm)

### 1. Database Setup
```bash
createdb kanion_db
psql -U postgres -d kanion_db -f apps/backend/sql/001_init.sql
```

### 2. Backend
```bash
cd apps/backend
cp .env.example .env        # Edit with your config
pnpm install
pnpm run dev                # Dev mode
# pnpm start               # Production
```

### 3. Frontend
```bash
cd apps/frontend
cp .env.example .env        # Edit API URL
pnpm install
pnpm run dev                # Dev server: http://localhost:5173
```

### Access
- Frontend: http://localhost:5173
- API: http://localhost:3000

---

## � Security Features

- **Encryption:** AES-256-GCM for all sensitive data
- **Authentication:** JWT tokens (7-day expiration)
- **Password Security:** Bcrypt hashing (12 rounds)
- **Rate Limiting:** 10 requests/15 minutes per IP
- **Audit Trail:** Login logs, device tracking, security events
- **Headers:** CORS, CSP, X-Frame-Options security headers

---

## 📦 Building for Production

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
# Output: dist/ → Deploy to Vercel, Netlify, etc.
```

---

## 🚀 Deployment (Render)

### Prerequisites
- Node.js v20 LTS (avoid v25.x)
- PostgreSQL database
- pnpm-workspace.yaml in root (already created)

### Backend Service
```bash
# Build: pnpm install
# Start: cd apps/backend && npm start
```

### Frontend Service
```bash
# Build: cd apps/frontend && pnpm install && npm run build
# Publish Directory: apps/frontend/dist
```

### Environment Variables (Backend)
```env
PORT=3000
NODE_ENV=production
DATABASE_URL=your_postgresql_url
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key
FRONTEND_URL=https://your-frontend-url.com
```

**Troubleshooting:**
- Error: "Cannot find package 'express'" → Ensure pnpm-lock.yaml is committed
- Error: "ERR_INVALID_THIS" → Update Node.js to v20 LTS
- For full deployment guide, see [DEPLOYMENT.md](docs/DEPLOYMENT.md)

---

## 📖 API Endpoints

**Auth:** `POST /auth/register`, `POST /auth/login`, `GET /auth/logout`

**Vault:** `GET/POST /vault/items`, `GET/PUT/DELETE /vault/items/:id`

**Notes:** `GET/POST /notes`, `PUT/DELETE /notes/:id`

**User:** `GET/PUT /user/profile`, `GET/PUT /user/appearance-settings`

---

## 🎨 Customization

- **Languages:** Add translations in `frontend/src/locales/[lang].json`
- **Themes:** Edit `frontend/src/themeColors.js`
- **Vault Types:** Update database enum in `001_init.sql`

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file

---

## 📞 Support

- 🐛 [Report Bugs](https://github.com/your-repo/issues)
- 💬 [Discussions](https://github.com/your-repo/discussions)
- 📚 [Documentation](docs/)

---

**Status:** Active Development 🚀  
**Last Updated:** February 14, 2026
**Maintainer**: Kanion Team
**Status**: Active Development 🚀
