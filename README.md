# 🔐 Kanion Secure Space

A modern, privacy-first secure vault and note-taking application with military-grade encryption.

## Overview

Kanion Secure Space is a full-stack web platform for managing accounts, passwords (vault), and encrypted notes using PostgreSQL, Node.js, and React.

**Key Features:**
- AES-256-GCM encryption for all sensitive data
- Bcrypt password hashing with 12 salt rounds
- Rate limiting to prevent brute force attacks
- Complete audit trail of all sensitive actions
- JWT authentication with 7-day expiration
- Responsive design with dark mode
- Open source and fully transparent

## Project Structure

```
kanion-platform/
├── backend/          # Express API server
│   ├── src/
│   │   ├── index.js              # Main server
│   │   ├── config.js             # Environment config
│   │   ├── routes/               # API routes
│   │   │   ├── auth.js          # Register/Login
│   │   │   ├── vault.js         # Password vault CRUD
│   │   │   └── notes.js         # Notes CRUD & sharing
│   │   ├── middleware/           # JWT auth middleware
│   │   └── db/                   # Database pool & migrations
│   ├── sql/                      # Database migrations
│   ├── docker-compose.yml        # PostgreSQL dev setup
│   ├── .env                      # Environment variables (copy from .env.example)
│   └── package.json
├── frontend/         # React + Vite app
│   ├── src/
│   │   ├── main.jsx              # Entry point
│   │   ├── App.jsx               # Main app with routing
│   │   ├── api/
│   │   │   └── client.js        # Axios API client
│   │   ├── pages/                # Page components
│   │   │   ├── Home.jsx         # Landing page
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Vault.jsx        # Password manager
│   │   │   └── Notes.jsx        # Encrypted notes
│   │   ├── components/
│   │   │   └── NavBar.jsx       # Navigation
│   │   └── index.css            # Tailwind styles
│   ├── index.html                # Root HTML
│   ├── vite.config.js            # Vite config with API proxy
│   ├── tailwind.config.js
│   ├── .env                      # Environment variables (optional)
│   └── package.json
├── db_template/      # Original SQL dump reference
├── package.json      # Root workspace config
└── README.md         # This file
```

## Setup Instructions

### 1. Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment
Create/update `.env` at project root with your PostgreSQL credentials:
```env
DATABASE_URL=postgres://user:password@host:5432/kanion_database
PORT=3000
JWT_SECRET=your-secure-random-string-here
NODE_ENV=development
ENCRYPTION_KEY=your-encryption-key-here
FRONTEND_URL=http://localhost:5173
```

### 3. Run Services

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Starts on http://localhost:3000
# Automatically runs migrations on startup
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Starts on http://localhost:5173
# Proxies /api to backend via vite.config.js
```

### 4. Test Database Connection
```bash
cd backend
node test-db.js
```

This will verify:
- Environment variables are loaded
- Database connection works
- Required tables exist

- **User Authentication**: JWT-based register/login
- **Vault**: Manage passwords, usernames, OTP secrets
- **Notes**: Create, edit, share encrypted notes
- **Responsive UI**: Works on mobile, tablet, desktop (Tailwind CSS)
- **API Proxy**: Frontend proxies `/api/*` to backend during dev

## Tech Stack

### Backend
- **Node.js** + **Express** - REST API server
- **PostgreSQL** - Database with schemas: account, vault, note, notification
- **JWT** - Stateless auth
- **bcryptjs** - Password hashing
- **pg** - PostgreSQL driver
- **Zod** - Input validation

### Frontend
- **React 18** - UI library
- **React Router** - Client-side routing
- **Vite** - Fast bundler
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client

## Quick Start

### 1. Install Dependencies (Root Level)

```powershell
cd d:\Data\Tailieu\Projects\PHP\Kanion_Platform
npm install
```

### 2. Set Up Database

**Option A: Docker Compose (Recommended)**

```powershell
npm run docker:db
# Wait for postgres to start (takes ~10-15 seconds)
npm run migrate
```

**Option B: Use Existing PostgreSQL**

Edit `backend/.env` with your database credentials, then:

```powershell
npm run migrate
```

### 3. Start Dev Servers

Run both backend (`:4000`) and frontend (`:5173`) together:

```powershell
npm run dev
```

Or start them separately:

```powershell
npm run dev:backend   # Terminal 1
npm run dev:frontend  # Terminal 2
```

### 4. Open in Browser

Frontend will be at: **http://localhost:5173**

Test API health: **http://localhost:4000/api/health**

## Database Setup

### Schemas

The database is split into schemas for better organization:

- **account**: users, profiles, sessions, devices, statuses
- **vault**: password items, OTP secrets
- **note**: notes, share tokens, view tracking
- **notification**: user notifications

### Running Migrations

```powershell
npm run migrate
```

Seeds default account statuses: `active`, `inactive`, `suspended`

### Docker Control

```powershell
npm run docker:db   # Start PostgreSQL in Docker
npm run stop:db     # Stop and remove containers
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Get JWT token

### Vault (Protected)
- `GET /api/vault/items` - List vault items
- `POST /api/vault/items` - Add item
- `PUT /api/vault/items/:id` - Update item
- `DELETE /api/vault/items/:id` - Delete item

### Notes (Protected)
- `GET /api/notes` - List notes
- `POST /api/notes` - Create note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note
- `POST /api/notes/:id/share` - Create share link
- `GET /api/notes/share/:token` - View shared note
- `POST /api/notes/share/:token/verify` - Verify share password

## Environment Variables

### Backend (.env)

```
PORT=4000
DATABASE_URL=postgres://dev:dev@localhost:5432/kanion
JWT_SECRET=devsecret
NODE_ENV=development
```

### Frontend (.env) - Optional

```
VITE_API_URL=http://localhost:4000
```

## Development Tips

- **Hot Reload**: Both Vite (frontend) and nodemon (backend) support file watching
- **API Testing**: Use `curl`, Postman, or VS Code REST Client
- **Database**: Connect with `psql`, DBeaver, or pgAdmin to view/debug data
- **Console Logs**: Check terminal output for backend/frontend errors

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running (via Docker: `npm run docker:db`)
- Check `DATABASE_URL` in `backend/.env`
- Verify Postgres credentials match your setup

### API Not Responding
- Confirm backend running: `npm run dev:backend`
- Check port 4000 is not in use
- Look for errors in backend terminal

### Frontend Build Errors
- Clear browser cache (Ctrl+Shift+Delete)
- Ensure Vite plugin for React is installed
- Check all imports use correct paths (e.g., `@/` alias)

### Migrations Not Running
- Confirm database exists and is accessible
- Check `backend/sql/001_init.sql` syntax
- Ensure pgcrypto extension is installed: `CREATE EXTENSION pgcrypto;`

## Production Build

### Frontend
```powershell
npm run build --prefix frontend
```

Output in `frontend/dist/` - ready for static hosting.

### Backend
Set `NODE_ENV=production` and adjust database/JWT secrets in `.env`.

## License

ISC
