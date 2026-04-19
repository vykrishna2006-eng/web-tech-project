# InternTrack Pro 🚀

A full-stack SaaS web application for students to track job and internship applications with real-time updates, Kanban board, analytics, and subscription management.

## Tech Stack

- **Frontend**: Next.js 14 + TypeScript + shadcn/ui + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL
- **Real-time**: Socket.IO
- **Auth**: JWT
- **Payments**: Razorpay (mock integration)
- **State**: Zustand
- **Charts**: Recharts
- **Drag & Drop**: @dnd-kit

## Modules (7+)

1. **Authentication** – JWT-based login/register with user-specific dashboards
2. **Application Pipeline (Kanban)** – Drag-and-drop board with real-time sync via Socket.IO
3. **Analytics Dashboard** – Conversion rates, application trends, status distribution charts
4. **Resume Manager** – Upload/manage multiple resumes, track usage per application
5. **Interview Logs** – Record rounds, questions, feedback, and outcomes
6. **Notifications** – Real-time push notifications via WebSockets
7. **Subscription/Billing** – Free vs Premium plans with Razorpay payment integration
8. **Admin Panel** – User management, activity logs, revenue tracking

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/interntrack-pro.git
cd interntrack-pro
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 2. Database Setup

```bash
# Create database
createdb interntrack

# Copy env file
cp backend/.env.example backend/.env
# Edit backend/.env with your DATABASE_URL and JWT_SECRET

# Run migrations
cd backend && npm run db:migrate
```

### 3. Environment Variables

**backend/.env**
```
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/interntrack
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
```

**frontend/.env.local**
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### 4. Run Development Servers

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment

### Backend (Railway / Render)
1. Connect GitHub repo
2. Set environment variables
3. Build command: `cd backend && npm install && npm run build`
4. Start command: `cd backend && npm start`

### Frontend (Vercel)
1. Import GitHub repo to Vercel
2. Set root directory to `frontend`
3. Add `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SOCKET_URL` env vars
4. Deploy

## Features

- ✅ Real-time Kanban board with drag-and-drop
- ✅ Live notifications via Socket.IO
- ✅ Analytics with conversion rate tracking
- ✅ Resume upload and management
- ✅ Interview round logging
- ✅ Free/Premium subscription model
- ✅ Admin panel with user management
- ✅ JWT authentication
- ✅ Rate limiting and input validation
- ✅ PostgreSQL with optimized indexes
