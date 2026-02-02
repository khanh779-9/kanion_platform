<div align="center">
   <h1>Kanion Secure Space</h1>
   <!-- Add your project logo below -->
   <!-- <img src="docs/logo.png" alt="Kanion Logo" width="120" /> -->
   <br />
   <b>Full-stack platform for secure notes & password management</b>
   <br />
   <br />
   <!-- Badges example: -->
   <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT">
   <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome">
</div>

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Project Structure](#project-structure)
- [Database Setup](#database-setup)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Kanion Secure Space is a full-stack web platform for managing accounts, passwords (vault), and encrypted notes using PostgreSQL, Node.js, and React.

---

## Key Features

- 🔒 **AES-256-GCM encryption** for all sensitive data
- 🔑 **Bcrypt password hashing** with 12 salt rounds
- 🚫 **Rate limiting** to prevent brute force attacks
- 📝 **Complete audit trail** of sensitive actions
- 🪪 **JWT authentication** with 7-day expiration
- 🌗 **Responsive UI with dark mode**
- 🌍 **Multi-language UI** (Vietnamese / English)
- 🎨 **Custom note colors** with quick palette
- 🔗 **Quick share action** (copy note content)
- 💡 **Open source and fully transparent**

---

## Project Structure

- **Backend/**: Node.js REST API server, authentication, notes, user, and vault logic, database scripts, and utilities.
- **Frontend/**: React + Vite + Tailwind CSS app, UI components, pages, i18n, and API client.
- **db_template/**: SQL template for initializing the database.

---

## Database Setup

> **Note:** You need PostgreSQL installed and running.

1. Create a new PostgreSQL database (e.g., `kanion_db`).
2. Run the SQL schema script to set up tables:

   ```bash
   psql -U your_username -d kanion_db -f backend/sql/001_init.sql
   ```

   Or use the template in `db_template/templatedb.sql` for sample data.
3. Update your database connection settings in `backend/src/config.js` if needed.

---

## Installation

### Backend

```bash
cd backend
npm install
npm start
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Usage

1. Open your browser and go to: [http://localhost:5173](http://localhost:5173)
2. The backend API runs at [http://localhost:3000](http://localhost:3000) (or as configured).
3. Register a new user, log in, and start managing your notes and vault items.
4. Use Settings → Appearance to change language and theme.

<!--
## Screenshots
Add screenshots here for a better first impression:
![Screenshot](docs/screenshot.png)
-->

---

## Contributing

Contributions are welcome! Please fork the repository, create a new branch, and submit a pull request.
For major changes, open an issue first to discuss what you would like to change.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

*Last updated: February 2, 2026*
