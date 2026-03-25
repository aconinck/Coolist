# Coolist

Coolist is an experimental, AI-first family coordination ecosystem developed for both Mobile and Desktop. This project explores the integration of Large Language Models (LLMs) to automate household logistics — transforming the traditional "to-do list" into an intelligent, proactive family assistant.

## Features

- **Magic Input** — type anything in plain language; AI parses it and routes it to the right module
- **Smart Checklist** — groceries & household tasks with real-time sync across devices
- **Family Wishlist** — wants grouped by family member, with priority badges and URL-to-product AI summarization
- **Quick Calendar** — upcoming events with urgency highlighting for events within 2 days

## Tech Stack

- [Next.js 14](https://nextjs.org) (App Router, TypeScript)
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase](https://supabase.com) — database, real-time sync, Row Level Security
- [OpenAI GPT-4o-mini](https://platform.openai.com) — natural language parsing & URL summarization

## Getting Started

### 1. Set up Supabase

Create a project at [supabase.com](https://supabase.com), then run the SQL in `supabase/migrations/001_initial_schema.sql` in the Supabase SQL Editor.

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

### 3. Install dependencies and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Deploy

The recommended way to deploy is [Vercel](https://vercel.com). Connect the GitHub repo, add the three environment variables above in the Vercel project settings, and deploy.
