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

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Setup](#database-setup)
- [Installation & Setup](#installation--setup)
- [Usage & Features](#usage--features)
- [API Endpoints](#api-endpoints)
- [Security Features](#security-features)
- [Contributing](#contributing)
- [License](#license)

---

## 📖 Overview

**Kanion Secure Space** is a comprehensive, open-source password manager and encrypted notes platform. It provides military-grade encryption for storing sensitive information including passwords, TOTP secrets, notes, and personal data. Built with React 18, Node.js, and PostgreSQL, the application emphasizes security, privacy, and user experience.

**Perfect for:**
- Personal password management
- Secure note-taking
- Storing sensitive credentials (API keys, tokens, etc.)
- Managing multiple accounts across different platforms

---

## ✨ Key Features

### Security & Encryption
- 🔒 **AES-256-GCM encryption** for all vault items and notes
- 🔑 **Bcrypt password hashing** with 12 salt rounds
- 🔐 **TOTP (RFC 6238) support** with 30-second time window
- 🚫 **Rate limiting** to prevent brute force attacks (10 requests/15 minutes)
- 📊 **Complete audit trail** of security-relevant actions
- 🪪 **JWT authentication** with 7-day token expiration

### Vault Management
- 📦 **6 item types**: Website, Email, Server, Database, Application, Other
- 👁️ **View & Edit modes** - Read-only viewing without modification access
- 🔍 **Advanced filtering** - Search by name, filter by type, date range
- 🔄 **Editable OTP Secrets** - Update TOTP secrets on the fly
- ⏱️ **Live TOTP countdown** - 30-second timer with progress indicator

### Notes Management
- 📝 **Encrypted notes** with custom colors
- 🎨 **7 color options** for note organization
- 🔍 **Search & filter** - Search title/content, date range filtering
- 👁️ **View-only modal** - Read notes without edit capability
- 📋 **Card layout** - Compact, hover-based action buttons

### User Experience
- 🌗 **Dark/Light/Auto theme** with persistent preference
- 🌍 **Multi-language UI** - Vietnamese (VI) & English (EN) with localStorage persistence
- 🎯 **Responsive design** - Mobile-first, works on all devices
- 🔔 **Real-time notifications** - Toast messages for actions (success, error, info)
- 📱 **Browser device detection** - Shows browser, OS, device info in login notifications
- 🎨 **Customizable fonts** - 9 Google Fonts with 5 weight options (300-700)

### Developer-Friendly
- 📖 **Clean, modular code** - Well-organized React components
- 🔧 **Utility functions** - Reusable encryption, TOTP, user-agent parsing
- 🎪 **Theme system** - Comprehensive color/styling utilities
- 🌐 **Localization system** - Easy to add new languages
- 🔗 **REST API** - Well-documented endpoints

---

## 🛠 Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Fast build tool & dev server
- **TailwindCSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Axios** - HTTP client
- **Google Fonts** - Custom typography

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **PostgreSQL** - Relational database
- **Bcrypt** - Password hashing
- **jsonwebtoken** - JWT authentication
- **crypto** - AES-256-GCM encryption

### DevOps
- **Docker** - Containerization (optional)
- **Docker Compose** - Local database setup

---

## 📁 Project Structure

```
Kanion_Platform/
│
├── backend/                          # Node.js/Express server
│   ├── src/
│   │   ├── index.js                 # Server entry point
│   │   ├── config.js                # Database & app config
│   │   ├── db/
│   │   │   ├── pool.js              # PostgreSQL connection pool
│   │   │   └── migrate.js           # Database migrations
│   │   ├── routes/
│   │   │   ├── auth.js              # Authentication endpoints
│   │   │   ├── notes.js             # Notes CRUD endpoints
│   │   │   ├── vault.js             # Vault items CRUD
│   │   │   └── user.js              # User profile endpoints
│   │   ├── middleware/
│   │   │   ├── auth.js              # JWT verification
│   │   │   └── rateLimit.js         # Rate limiting middleware
│   │   └── utils/
│   │       ├── encryption.js        # AES-256-GCM encryption/decryption
│   │       ├── auditLog.js          # Audit logging helper
│   │       ├── mail.js              # Email utilities
│   │       └── userAgent.js         # Browser/OS detection
│   ├── sql/
│   │   └── 001_init.sql             # Database schema
│   ├── docker-compose.yml           # Local PostgreSQL setup
│   ├── package.json
│   └── test-db.js                   # Database connection test
│
├── frontend/                         # React + Vite app
│   ├── src/
│   │   ├── main.jsx                 # App entry point
│   │   ├── App.jsx                  # Main app component
│   │   ├── index.css                # Global styles
│   │   ├── api/
│   │   │   ├── client.js            # Axios instance & helpers
│   │   │   └── notifications.js     # Notification helpers
│   │   ├── components/
│   │   │   ├── NavBar.jsx           # Navigation & notifications
│   │   │   ├── ThemeContext.jsx     # Theme management
│   │   │   ├── Toast.jsx            # Toast notification UI
│   │   │   ├── ToastContext.js      # Toast state management
│   │   │   └── toastService.js      # Toast utility functions
│   │   ├── pages/
│   │   │   ├── Home.jsx             # Landing page
│   │   │   ├── Login.jsx            # Login page
│   │   │   ├── Register.jsx         # Registration page
│   │   │   ├── Profile.jsx          # User profile page
│   │   │   ├── Notes.jsx            # Notes management page
│   │   │   ├── Vault.jsx            # Vault/password manager
│   │   │   └── Settings.jsx         # User preferences (theme, language, fonts)
│   │   ├── utils/
│   │   │   ├── totp.js              # TOTP generation (RFC 6238)
│   │   │   └── (other utilities)
│   │   ├── locales/
│   │   │   ├── index.js             # i18n context & translation hook
│   │   │   ├── en.json              # English translations
│   │   │   └── vi.json              # Vietnamese translations
│   │   ├── themeColors.js           # Theme color utilities
│   │   └── index.html               # HTML template
│   ├── public/                      # Static assets
│   ├── vite.config.js              # Vite configuration
│   ├── tailwind.config.js          # TailwindCSS config
│   ├── postcss.config.js           # PostCSS config
│   └── package.json
│
├── db_template/
│   └── templatedb.sql              # Database template with sample data
│
└── README.md                        # This file
```

---

## 🗄 Database Setup

### Prerequisites
- PostgreSQL 12+ installed and running
- Node.js 16+

### Steps

1. **Create a PostgreSQL database:**
   ```bash
   createdb kanion_db
   # or
   psql -U postgres -c "CREATE DATABASE kanion_db;"
   ```

2. **Initialize the database schema:**
   ```bash
   cd backend
   psql -U postgres -d kanion_db -f sql/001_init.sql
   ```

3. **Update database config** (if needed):
   Edit `backend/src/config.js`:
   ```javascript
   const dbConfig = {
     user: 'postgres',
     password: 'your_password',
     host: 'localhost',
     port: 5432,
     database: 'kanion_db'
   };
   ```

4. **Test connection:**
   ```bash
   npm run test-db
   ```

---

## 🚀 Installation & Setup

### Backend Setup

```bash
cd backend
npm install

# Create .env file (optional)
# PORT=3000
# DB_USER=postgres
# DB_PASSWORD=your_password
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=kanion_db
# JWT_SECRET=your_jwt_secret_key

npm run dev    # Start in development mode
# npm start    # Start in production mode
```

### Frontend Setup

```bash
cd frontend
npm install

# Create .env file (optional)
# VITE_API_BASE_URL=http://localhost:3000

npm run dev    # Start Vite dev server
# npm run build  # Build for production
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

---

## 📖 Usage & Features

### 1. **Authentication**
- Register: Create new account with email & password
- Login: Secure JWT-based authentication
- Session tracking: Browser, device, OS, IP logged for each login
- Logout: Clear tokens and end session

### 2. **Vault Management**
```
Features:
✅ Add items: Website, Email, Server, Database, Application, Custom
✅ View mode: Read-only modal without edit capability
✅ Edit mode: Update any field including OTP secrets
✅ TOTP Support: Generate 6-digit codes with 30-second timer
✅ Search & Filter: By name, type, date range
✅ Copy to clipboard: Password, TOTP, OTP secret
✅ Reveal passwords: Toggle eye icon to show/hide
```

### 3. **Notes Management**
```
Features:
✅ Create encrypted notes with custom colors
✅ 7 color palette for quick selection
✅ View-only modal for reading notes
✅ Full edit capability for modifications
✅ Search: By title or content
✅ Date filtering: Search notes in date range
✅ Copy content: Quick share action
```

### 4. **User Profile**
- Display name, avatar, phone, birthday, bio
- Member since date
- All profile data encrypted in database

### 5. **Settings**
- 🌗 **Theme**: Light, Dark, Auto
- 🌍 **Language**: English, Vietnamese (with localStorage persistence)
- 🎨 **Fonts**: 
  - **Font Family**: 9 Google Fonts (6 Sans-serif, 2 Serif, 1 Monospace)
  - **Font Weight**: 5 options (300-700: Light, Normal, Medium, Semi-Bold, Bold)

---

## 🔌 API Endpoints

### Authentication
```
POST   /auth/register           Register new user
POST   /auth/login              Login user
GET    /auth/logout             Logout user
```

### Vault Items
```
GET    /vault/items             Get all vault items
POST   /vault/items             Create new vault item
GET    /vault/items/:id         Get specific vault item
PUT    /vault/items/:id         Update vault item
DELETE /vault/items/:id         Delete vault item
```

### Notes
```
GET    /notes                   Get all notes
POST   /notes                   Create new note
PUT    /notes/:id               Update note
DELETE /notes/:id               Delete note
```

### User Profile
```
GET    /user/profile            Get user profile
PUT    /user/profile            Update user profile
GET    /user/appearance-settings Get appearance settings
PUT    /user/appearance-settings Update appearance settings
```

---

## 🔐 Security Features

### Encryption
- **AES-256-GCM**: All sensitive data (passwords, notes, emails) encrypted
- **Database**: Encrypted at rest using AES-256
- **Transport**: HTTPS recommended for production

### Authentication & Authorization
- **JWT Tokens**: Stateless, 7-day expiration
- **Bcrypt Hashing**: 12 rounds for password security
- **Rate Limiting**: 10 requests per 15 minutes per IP
- **Protected Routes**: All sensitive endpoints require authentication

### Audit & Logging
- **Login logs**: Browser, device, OS, IP address
- **Audit trail**: All sensitive actions recorded
- **Session tracking**: Multi-device login detection

### Best Practices
- No passwords logged (only hashes)
- Encryption keys never stored with data
- Client-side encryption for sensitive values
- Secure HTTP headers (CORS, CSP, X-Frame-Options)

---

## 🎨 Customization

### Adding New Languages
1. Create `frontend/src/locales/[lang_code].json`
2. Copy structure from `en.json`
3. Update translations
4. Add option to Settings page language select

### Adding New Vault Item Types
1. Update database enum in `001_init.sql`
2. Add type option to form in `Vault.jsx`
3. Add translation keys to locale files

### Theming
Edit `frontend/src/themeColors.js` to customize colors:
```javascript
export const colors = {
  light: { ... },
  dark: { ... }
}
```

---

## 📦 Building for Production

### Backend
```bash
cd backend
npm install --production
npm start
```

### Frontend
```bash
cd frontend
npm run build
# Output: dist/ folder
# Deploy to any static hosting (Vercel, Netlify, AWS S3, etc.)
```

---

## 🤝 Contributing

Contributions are welcome! Here's how to help:

1. **Fork** the repository
2. **Create a branch**: `git checkout -b feature/your-feature`
3. **Make changes** and test thoroughly
4. **Commit**: `git commit -m "Add your feature"`
5. **Push**: `git push origin feature/your-feature`
6. **Open a Pull Request**

### Guidelines
- Follow existing code style
- Add comments for complex logic
- Test on multiple browsers/devices
- Update README if needed

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## 📞 Support

- 📧 Report bugs: Open an issue on GitHub
- 💬 Discussions: Use GitHub Discussions for Q&A
- 🔗 Documentation: See `/docs` folder for more info

---

## 🎯 Roadmap

- [ ] Browser extension for auto-fill
- [ ] Mobile app (React Native)
- [ ] File storage/encryption
- [ ] Secure file sharing
- [ ] Team collaboration features
- [ ] Hardware key support (FIDO2/U2F)
- [ ] Backup & restore functionality

---

**Last updated**: February 2, 2026  
**Maintainer**: Kanion Team  
**Status**: Active Development 🚀
