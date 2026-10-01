# 🎓 Smart Online College Admission Management System

A full-stack, production-ready College Admission Management Platform that digitizes the complete admission process from student registration to final admission confirmation.

The platform supports three roles:

- 👨‍🎓 Student
- 👨‍🏫 Faculty
- 👨‍💼 Admin

Students can discover programs, submit applications, upload documents, track admission progress, and receive real-time notifications. Faculty members can review applications and verify documents, while Admins manage users, programs, admissions, and analytics.

---

## 🌐 Live Demo

### Frontend (Vercel)

https://college-admission-platform.vercel.app

### Backend API (Render)

https://college-admission-platform-fo2s.onrender.com/api/v1

### Health Check

https://college-admission-platform-fo2s.onrender.com/api/v1/health

---

## 🏗️ System Architecture

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- React Hook Form
- Zod
- Axios
- Framer Motion

### Backend

- Node.js
- Express.js
- TypeScript
- JWT Authentication
- Winston Logging
- Rate Limiting
- Helmet Security Middleware

### Database

- MongoDB Atlas

### File Storage

- Cloudinary

### Email Service

- Brevo Transactional Email API

### Deployment

- Vercel (Frontend)
- Render (Backend)
- MongoDB Atlas (Database)
- Cloudinary (File Storage)

---

## 📂 Project Structure

```bash
college-admission-platform/
├── backend/     Node.js + Express + TypeScript API
└── frontend/    React + TypeScript + Vite
```

---

## ✨ Key Features

### 👨‍🎓 Student Features

- Student registration and login
- Forgot password and password reset
- Profile management
- Browse available programs
- Submit admission applications
- Upload admission documents
- Track application status
- View notifications
- Receive email updates
- Withdraw applications

### 👨‍🏫 Faculty Features

- Faculty authentication
- Assigned application review queue
- Claim unassigned applications
- Verify student documents
- Approve or reject applications
- Request corrections
- Internal review notes
- Student communication

### 👨‍💼 Admin Features

- Dashboard analytics
- Program management (CRUD)
- User management
- Faculty account creation
- Admin account creation
- Application assignment
- Admission approval and rejection
- Notification broadcasting
- Document management

---

## 🔐 Authentication & Security

- JWT Access Tokens
- Refresh Tokens
- Password Hashing with bcrypt
- Helmet Security Middleware
- Mongo Sanitization
- HPP Protection
- Rate Limiting
- Centralized Error Handling
- Audit Logging
- Structured Winston Logs

---

## 🔄 Admission Workflow

```text
DRAFT
   ↓
SUBMITTED
   ↓
UNDER_REVIEW
   ↓
DOCUMENTS_PENDING (optional)
   ↓
FACULTY_APPROVED / FACULTY_REJECTED
   ↓
ADMIN_APPROVED / ADMIN_REJECTED
   ↓
ADMISSION_CONFIRMED
```

Students can withdraw applications before the final admission decision.

Every status change is recorded in the application history and triggers notifications.

---

## 📧 Email Notifications

The application uses Brevo Transactional Email API.

Supported email notifications:

- Password Reset
- Application Submitted
- Faculty Approved
- Faculty Rejected
- Correction Requested
- Admin Approved
- Admin Rejected

Brevo is integrated through HTTPS API calls, making it compatible with Render free-tier deployments.

---

## 📄 Required Student Documents

Students must upload:

- Aadhaar Card
- 10th Marksheet
- 12th Marksheet
- Transfer Certificate

Optional uploads:

- Passport Photo
- Community Certificate
- Income Certificate
- Signature

Applications cannot be submitted until all mandatory documents are uploaded.

---

## 🚀 Local Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env

npm run seed:programs
npm run seed:admin

npm run dev
```

Backend runs at:

```bash
http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```bash
http://localhost:5173
```

---

## ⚙️ Environment Variables

### Backend

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

BREVO_API_KEY=your_brevo_api_key
EMAIL_FROM=your_verified_email@example.com
```

---

## 👨‍💼 Creating First Admin Account

A fresh database contains no Admin accounts.

Create the first Admin:

```bash
SEED_ADMIN_EMAIL=admin@example.com SEED_ADMIN_PASSWORD=ChangeMe123 npm run seed:admin
```

Then log in through:

```text
/admin/login
```

After logging in, create additional Admin and Faculty accounts through the dashboard.

---

## 📡 API Overview

| Module | Endpoint |
|----------|----------|
| Auth | /api/v1/auth |
| Students | /api/v1/students |
| Programs | /api/v1/programs |
| Applications | /api/v1/applications |
| Documents | /api/v1/documents |
| Notifications | /api/v1/notifications |
| Faculty | /api/v1/faculty |
| Admin | /api/v1/admin |
| Health | /api/v1/health |

---

## 📊 Database

MongoDB Atlas stores:

- Users
- Student Profiles
- Faculty Profiles
- Programs
- Applications
- Reviews
- Documents
- Notifications
- Audit Logs

---

## 🖼️ Screenshots

### Landing Page

_Add screenshot here_

### Student Dashboard

_Add screenshot here_

### Faculty Dashboard

_Add screenshot here_

### Admin Dashboard

_Add screenshot here_

---

## ✅ Production Deployment

### Frontend

- Hosted on Vercel

### Backend

- Hosted on Render

### Database

- MongoDB Atlas

### File Storage

- Cloudinary

### Email Service

- Brevo Transactional Email API

---

## 👨‍💻 Author

**Hari Rathnam S**

- GitHub: https://github.com/HariRathnam-hub

---

## 📜 License

This project is intended for educational and portfolio purposes.