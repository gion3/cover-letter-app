# CoverLetterAI

A full-stack AI-powered cover letter generator built with Next.js 14, MongoDB Atlas, and the OpenAI API.

## Description

CoverLetterAI allows users to create an account, upload their CV (PDF), paste a job description, and configure parameters (tone, length, language, emphasis) to generate a tailored cover letter using Gemini 2.5 Flash. All data is persisted in MongoDB Atlas.

---

## How to Run Locally

### Prerequisites

- Node.js 18+
- A MongoDB Atlas cluster
- A Google AI Studio API key

### Steps

1. **Clone the repository**

```bash
git clone <repo-url>
cd cover-letter-app
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Fill in the values of the .env:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/cover-letter-app
OPENAI_API_KEY=sk-...
NEXTAUTH_SECRET=some-random-secret-string
NEXTAUTH_URL=http://localhost:3000
```

4. **Start the development server**

```bash
npm run dev
```


---

## Problem Description

Job hunting today is a very cumbersome task. This tool helps you write tailored cover letters for every application in 3 easy steps:
- Upload your CV
- Provide a job description
- Select your desired parameters (tone, length, language, and emphasis preferences)

And you have a tailored cover letter ready to send out.

---

## Data Flow

```
User fills form (/generate)
     │
     ▼
POST /api/generate
     │
     ├── Authenticate session (NextAuth JWT)
     │
     ├── Fetch CV text from MongoDB Atlas
     │
     ├── Build prompt (CV text + job description + parameters)
     │
     ├── POST to OpenAI REST API (gpt-4o-mini)
     │        └── Returns generated cover letter text
     │
     ├── Save result to MongoDB Atlas (CoverLetter collection)
     │
     └── Return letterId → redirect to /letters/:id
```
---

## Authentication

Authentication uses **NextAuth.js v4** with the **Credentials Provider**:

- Users register via `POST /api/auth/register` — password is hashed with **bcryptjs** (12 salt rounds)
- Login via `POST /api/auth/[...nextauth]` — credentials are verified against MongoDB
- Sessions are managed as **JWT tokens** (stored in HTTP-only cookies)
- The `session.user.id` field is populated via a JWT callback and used to scope all database queries to the authenticated user
- Protected routes (`/dashboard`, `/cv/upload`, `/generate`, `/letters/:id`) redirect to `/login` if no valid session exists

---

## Screenshots

- Landing page
- Registration & login
- Dashboard (CVs + letters list)
- CV upload form
- Cover letter generator form
- Generated letter view

---

## Deployment

The app was deployed on **Vercel**. A `vercel.json` is included.