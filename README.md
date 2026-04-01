# CAOS — powered by RW (Phase 1)

CAOS (Cognitive × AI Operating System) is a training product that teaches users to think before using AI, specify clearly, and verify outputs critically.

## Phase 1 Scope

This MVP ships:
- Public landing + mission discovery pages
- Auth (STUDENT / ADMIN)
- Student dashboard and profile
- Outcome Pod listing and detail pages
- Pod Run workspace enforcing CAOS sequence
- Lightweight scoring + badge awards
- Seeded admin-lite dataset and preview runs

It intentionally omits advanced RW orchestration, agent pipelines, design/video engines, and enterprise admin systems.

## Stack

- Next.js App Router + TypeScript (strict)
- Tailwind CSS + reusable UI primitives
- Prisma ORM + PostgreSQL
- NextAuth (Credentials)
- Zod validation

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy env values:
   ```bash
   cp .env.example .env
   ```
3. Create and apply migrations:
   ```bash
   npx prisma migrate dev --name init
   ```
4. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```
5. Seed demo data:
   ```bash
   npm run prisma:seed
   ```
6. Start app:
   ```bash
   npm run dev
   ```

## Auth Notes

Credentials provider is used in Phase 1 to keep setup simple.

## Demo Credentials

- Admin: `admin@caos.local` / `Admin123!`
- Student: `student@caos.local` / `Student123!`

## Core CAOS Run Rules

1. Attempt is required before AI.
2. Goal + constraints + definition of done are required before AI.
3. Verification decision (Accept/Modify/Reject) is mandatory.
4. Verification explanation is mandatory.
5. Pod progress is not complete until verification is submitted.

## Deploy Notes (Vercel)


- Set `AUTH_SECRET` (or `NEXTAUTH_SECRET` alias) to a long random value for NextAuth session encryption.
- Provision Postgres-compatible database.
- Configure env vars from `.env.example`.
- Run Prisma migrate and seed in deployment workflow.
