# 🚀 AI Cover Letter Generator (Full-Stack SaaS)

A full-stack AI-powered web application that generates tailored, professional cover letters from job descriptions in seconds.

Built to simulate a real-world SaaS product, this project includes authentication, payments, AI integration, and user history — demonstrating strong backend engineering and system design skills.

---

## ✨ Features

- 🔐 **JWT Authentication**
  - Secure user registration & login
  - Protected routes using middleware

- 🤖 **AI-Powered Cover Letter Generation**
  - Users paste a job description
  - AI generates a concise, tailored cover letter
  - Integrated with Hugging Face Inference API

- 💳 **Stripe Payment Integration**
  - Credit-based system for AI usage
  - Webhook handling for secure credit updates

- 📜 **User History with Pagination**
  - Stores past AI requests
  - Paginated API with validation (Zod)
  - Optimized database queries

- ⚠️ **Robust Error Handling**
  - Centralized error handling middleware
  - Custom error responses for consistent API behavior
  - Graceful handling of external API failures

- ⚡ **Modern UI**
  - Chat-style interface (prompt + response)
  - Clean, minimal, responsive design

---

## 🛠 Tech Stack

### Backend
- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- Zod (validation)

### Frontend
- React
- Axios

### External Services
- Hugging Face (AI inference)
- Stripe (payments & webhooks)

---

## 🧠 Architecture Highlights

- Modular backend structure with controllers, middleware, and services:
    - **Routes** → Define API endpoints
    - **Middleware** → Authentication, validation, error handling
    - **Services** → Business logic (AI generation, payments, etc.)
    - **Config** → Environment and external service configuration
- Reusable authentication middleware using JWT
- Robust validation layer using Zod
- Secure webhook handling for Stripe events
- Separation of concerns between AI service and business logic
- Pagination implemented at database level for performance

---

## 🔐 Authentication Flow

1. User logs in → receives JWT
2. JWT stored on frontend
3. Sent via `Authorization: Bearer <token>`
4. Backend middleware verifies token
5. User ID attached to request context

---

## 💳 Payment Flow

1. User initiates payment via Stripe
2. Stripe sends webhook event
3. Backend verifies signature
4. Credits updated securely in database

---

## 🤖 AI Flow

1. User submits job description
2. Backend formats structured prompt
3. Request sent to Hugging Face API
4. Response parsed and returned to frontend
5. Stored in database as user history

---

## 📦 API Endpoints (Sample)

- `POST /auth/signup`
- `POST /auth/login`
- `GET /user/me`
- `POST /ai/generate`
- `GET /ai/history?page=1&limit=10`
- `GET /ai/history:id`
- `POST /stripe/webhook`

---

## ⚙️ Environment Variables

Create a `.env` file in the backend:

```env
DATABASE_URL=
JWT_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
HF_API_KEY=
FOLDER_PATH=