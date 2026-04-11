# Waggingtails Platform Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a B2C platform where users upload a pet photo, go through a 5-step wizard, pay via Stripe, and receive an AI-generated children's storybook PDF featuring their pet.

**Architecture:** Next.js App Router with Supabase (auth, DB, storage), Stripe for payments, OpenAI for story/image generation (with mock fallback), Resend for emails (with mock fallback), and jsPDF for PDF rendering. i18n via next-intl with EN/ES/FR/IT. RBAC via Supabase RLS + custom claims. All server-side logic in Route Handlers and Server Actions.

**Tech Stack:** Next.js 14 (App Router), Supabase JS v2, Stripe.js + @stripe/stripe-js, next-intl, Tailwind CSS, jsPDF, OpenAI SDK, Resend SDK, Playwright

---

## Phase 1: Project Scaffold & Infrastructure

### Task 1: Initialize Next.js Project

**Files:**
- Create: `package.json`, `next.config.js`, `tailwind.config.ts`, `tsconfig.json`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`
- Create: `.env.local.example`
- Create: `.gitignore`

**Step 1: Scaffold the project**

```bash
cd /Users/sk/CascadeProjects/windsurf-project-5
npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git
```

**Step 2: Initialize git**

```bash
git init
git add -A
git commit -m "chore: scaffold Next.js 14 project with TypeScript and Tailwind"
```

**Step 3: Create `.env.local.example`**

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# OpenAI (optional - mocks used if absent)
OPENAI_API_KEY=

# Resend (optional - mocks used if absent)
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Step 4: Create `.env.local` with provided keys**

```env
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ABh1iCxJ9KFBaXwEPWXQoA_P9MoxWj9
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51T6cD5RX0qJbOsexuYA5QNevCqaHR3mqDwsnHxLXvVpIuGVP0f4XxvuAcA4wTsMgpqqhYib2o29YSbYwlx8iYnQK00zq0o4H4U
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Step 5: Commit**

```bash
git add .env.local.example
git commit -m "chore: add environment variable template"
```

---

### Task 2: Install Core Dependencies

**Step 1: Install production dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr @stripe/stripe-js stripe next-intl openai resend jspdf uuid
npm install -D @types/uuid
```

**Step 2: Install dev/test dependencies**

```bash
npm install -D @playwright/test
npx playwright install chromium
```

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install core dependencies"
```

---

### Task 3: Design System & Theme Variables

**Files:**
- Create: `src/lib/theme.ts`
- Modify: `tailwind.config.ts`
- Create: `src/app/globals.css` (modify existing)

**Step 1: Define theme constants**

```typescript
// src/lib/theme.ts
export const theme = {
  colors: {
    primary: '#6C63FF',
    primaryHover: '#5A52D5',
    secondary: '#FF6584',
    secondaryHover: '#E55A75',
    accent: '#43E97B',
    background: '#FAFBFC',
    surface: '#FFFFFF',
    text: '#1A1A2E',
    textMuted: '#6B7280',
    border: '#E5E7EB',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
  },
  logo: {
    name: 'Waggingtails',
    emoji: '🐾',
  },
} as const;
```

**Step 2: Extend Tailwind config with CSS variables**

Update `tailwind.config.ts` to use CSS custom properties for primary/secondary/accent so reskinning only requires changing variables.

**Step 3: Update `globals.css` with CSS variables**

```css
:root {
  --color-primary: 108 99 255;
  --color-secondary: 255 101 132;
  --color-accent: 67 233 123;
  /* etc. */
}
```

**Step 4: Commit**

```bash
git add src/lib/theme.ts tailwind.config.ts src/app/globals.css
git commit -m "feat: add design system with reskinnable theme variables"
```

---

### Task 4: Supabase Client Setup

**Files:**
- Create: `src/lib/supabase/client.ts` (browser client)
- Create: `src/lib/supabase/server.ts` (server client)
- Create: `src/lib/supabase/middleware.ts`
- Create: `src/middleware.ts`
- Create: `src/lib/supabase/types.ts` (database types)

**Step 1: Create browser Supabase client**

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**Step 2: Create server Supabase client**

Using `@supabase/ssr` with cookie handling for Next.js App Router.

**Step 3: Create middleware for session refresh**

```typescript
// src/middleware.ts
// Refresh Supabase auth tokens on every request
```

**Step 4: Define database types**

```typescript
// src/lib/supabase/types.ts
export type UserRole = 'user' | 'admin';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  has_paid: boolean;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface StoryProject {
  id: string;
  user_id: string;
  pet_name: string;
  pet_personality: string;
  pet_image_url: string;
  has_human: boolean;
  human_is_minor: boolean | null;
  human_description: string | null;
  human_image_url: string | null;
  human_terms_accepted: boolean;
  theme: string;
  art_style: string;
  language: string;
  status: 'draft' | 'generating' | 'complete' | 'failed';
  story_text: string | null;
  pdf_url: string | null;
  created_at: string;
}
```

**Step 5: Commit**

```bash
git add src/lib/supabase/ src/middleware.ts
git commit -m "feat: set up Supabase client (browser + server + middleware)"
```

---

### Task 5: Supabase Database Schema (SQL migrations)

**Files:**
- Create: `supabase/migrations/001_profiles.sql`
- Create: `supabase/migrations/002_story_projects.sql`
- Create: `supabase/migrations/003_rls_policies.sql`

**Step 1: Profiles table**

```sql
-- 001_profiles.sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  has_paid BOOLEAN NOT NULL DEFAULT FALSE,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**Step 2: Story projects table**

```sql
-- 002_story_projects.sql
CREATE TABLE public.story_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pet_name TEXT NOT NULL,
  pet_personality TEXT,
  pet_image_url TEXT,
  has_human BOOLEAN NOT NULL DEFAULT FALSE,
  human_is_minor BOOLEAN,
  human_description TEXT,
  human_image_url TEXT,
  human_terms_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  theme TEXT,
  art_style TEXT,
  language TEXT NOT NULL DEFAULT 'en',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','generating','complete','failed')),
  story_text TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Step 3: Row Level Security policies**

```sql
-- 003_rls_policies.sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_projects ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile (non-role fields)
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- Admins can read all profiles
CREATE POLICY "Admins read all profiles" ON public.profiles
  FOR SELECT USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Admins can update all profiles
CREATE POLICY "Admins update all profiles" ON public.profiles
  FOR UPDATE USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Admins can delete profiles
CREATE POLICY "Admins delete profiles" ON public.profiles
  FOR DELETE USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Story projects: users CRUD own
CREATE POLICY "Users CRUD own projects" ON public.story_projects
  FOR ALL USING (auth.uid() = user_id);
```

**Step 4: Create a Supabase storage bucket for uploads**

This will be done via the Supabase dashboard or API init script.

**Step 5: Commit**

```bash
git add supabase/
git commit -m "feat: add Supabase database schema with RLS policies"
```

---

## Phase 2: Authentication & RBAC

### Task 6: Auth UI Components

**Files:**
- Create: `src/components/auth/login-form.tsx`
- Create: `src/components/auth/register-form.tsx`
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(auth)/register/page.tsx`
- Create: `src/app/(auth)/layout.tsx`

**Step 1: Build login form component**

Client component with email/password fields, error handling, redirect on success.

**Step 2: Build register form component**

Client component with email/password/confirm-password, calls Supabase `signUp`.

**Step 3: Create route pages**

Wrap forms in a centered auth layout.

**Step 4: Commit**

```bash
git add src/components/auth/ src/app/\(auth\)/
git commit -m "feat: add login and registration pages"
```

---

### Task 7: Auth Callback & Session Management

**Files:**
- Create: `src/app/auth/callback/route.ts`
- Create: `src/lib/auth/helpers.ts`
- Create: `src/components/auth/user-menu.tsx`

**Step 1: Auth callback route handler**

Exchange code for session after email verification.

**Step 2: Auth helpers**

```typescript
// src/lib/auth/helpers.ts
export async function getCurrentUser() { ... }
export async function requireAuth() { ... }
export async function requireAdmin() { ... }
```

**Step 3: User menu component**

Shows user email + logout button in navbar.

**Step 4: Commit**

---

### Task 8: RBAC Middleware & Route Protection

**Files:**
- Modify: `src/middleware.ts`
- Create: `src/app/(protected)/layout.tsx`
- Create: `src/app/(protected)/admin/layout.tsx`

**Step 1: Enhance middleware**

Add route protection logic:
- `/admin/*` routes: require admin role
- `/dashboard/*` routes: require authenticated user
- `/wizard/*` routes: require authenticated + paid user

**Step 2: Protected layout**

Fetch profile, check role, redirect if unauthorized.

**Step 3: Admin layout**

Additional admin role check.

**Step 4: Commit**

---

### Task 9: Admin Dashboard

**Files:**
- Create: `src/app/(protected)/admin/page.tsx`
- Create: `src/app/(protected)/admin/users/page.tsx`
- Create: `src/components/admin/user-table.tsx`
- Create: `src/app/api/admin/users/route.ts`
- Create: `src/app/api/admin/users/[id]/route.ts`

**Step 1: Admin users API routes**

- `GET /api/admin/users` — list all users (admin only)
- `PATCH /api/admin/users/[id]` — toggle has_paid, change role
- `DELETE /api/admin/users/[id]` — delete user

All routes verify admin role via service role key.

**Step 2: User table component**

Displays users with actions: toggle paid status, delete user.

**Step 3: Admin dashboard page**

Stats overview + user management.

**Step 4: Commit**

---

### Task 10: Playwright Tests — Auth & RBAC

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/auth.spec.ts`
- Create: `e2e/admin.spec.ts`

**Step 1: Configure Playwright**

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './e2e',
  use: { baseURL: 'http://localhost:3000' },
  webServer: { command: 'npm run dev', port: 3000 },
});
```

**Step 2: Write auth tests**

- Registration form renders
- Login form renders
- Login with invalid creds shows error
- Protected routes redirect to login

**Step 3: Write admin tests**

- Non-admin cannot access /admin
- Admin can see user table

**Step 4: Run tests**

```bash
npx playwright test
```

**Step 5: Commit**

---

## Phase 3: Localization (i18n)

### Task 11: next-intl Setup

**Files:**
- Create: `src/i18n/request.ts`
- Create: `src/i18n/routing.ts`
- Create: `src/messages/en.json`
- Create: `src/messages/es.json`
- Create: `src/messages/fr.json`
- Create: `src/messages/it.json`
- Modify: `next.config.js`
- Modify: `src/middleware.ts`

**Step 1: Create message files**

Structured JSON for all UI strings in EN/ES/FR/IT. Keys organized by feature area:
```json
{
  "common": { "login": "Log in", "register": "Sign up", ... },
  "wizard": { "step1Title": "Pet Details", ... },
  "admin": { "title": "Admin Dashboard", ... }
}
```

**Step 2: Configure next-intl**

Set up the plugin in next.config.js, configure routing with locale prefix.

**Step 3: Language toggle component**

```typescript
// src/components/language-toggle.tsx
// Dropdown button that switches locale + persists preference
```

**Step 4: Integrate into layout**

Add `NextIntlClientProvider` to root layout, language toggle in navbar.

**Step 5: Commit**

---

## Phase 4: Payment (Stripe)

### Task 12: Stripe Checkout Integration

**Files:**
- Create: `src/lib/stripe/client.ts`
- Create: `src/app/api/stripe/checkout/route.ts`
- Create: `src/app/api/stripe/webhook/route.ts`
- Create: `src/app/(protected)/dashboard/upgrade/page.tsx`

**Step 1: Stripe server client**

```typescript
// src/lib/stripe/client.ts
import Stripe from 'stripe';
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});
```

**Step 2: Checkout session API**

`POST /api/stripe/checkout` — creates a Stripe checkout session for the story generation product. Redirects to Stripe-hosted checkout.

**Step 3: Webhook handler**

`POST /api/stripe/webhook` — listens for `checkout.session.completed`, updates `profiles.has_paid = true` in Supabase using service role key.

**Step 4: Success/cancel pages**

- `/dashboard/upgrade` — shows pricing + "Pay" button
- `/dashboard/upgrade/success` — confirms payment, shows CTA to start wizard

**Step 5: Commit**

---

### Task 13: Playwright Tests — Stripe

**Files:**
- Create: `e2e/stripe.spec.ts`

**Step 1: Test payment flow UI**

- Upgrade page renders with price
- Pay button creates checkout session (mock/intercept Stripe redirect)
- Success page renders after callback

**Step 2: Run tests**

**Step 3: Commit**

---

## Phase 5: The 5-Step Story Wizard

### Task 14: Wizard Shell & State Management

**Files:**
- Create: `src/components/wizard/wizard-shell.tsx`
- Create: `src/components/wizard/wizard-progress.tsx`
- Create: `src/lib/wizard/store.ts`
- Create: `src/app/(protected)/wizard/page.tsx`

**Step 1: Wizard state store**

Use React context + useReducer for wizard state. Persist to localStorage on each step change so progress survives page refresh.

```typescript
interface WizardState {
  currentStep: 1 | 2 | 3 | 4 | 5;
  petName: string;
  petPersonality: string;
  petImage: File | null;
  petImagePreview: string | null;
  hasHuman: boolean;
  humanIsMinor: boolean | null;
  humanDescription: string | null;
  humanImage: File | null;
  humanImagePreview: string | null;
  humanTermsAccepted: boolean;
  theme: string;
  artStyle: string;
}
```

**Step 2: Wizard shell component**

Renders step indicator + current step component + nav buttons.

**Step 3: Progress bar component**

5-step visual progress indicator.

**Step 4: Commit**

---

### Task 15: Step 1 — Pet Details & Image Upload

**Files:**
- Create: `src/components/wizard/steps/step-pet.tsx`

**Step 1: Build step component**

- Pet name input (required)
- Pet personality textarea
- Image upload with drag-and-drop + preview
- Client-side image validation (max 5MB, image types only)

**Step 2: Commit**

---

### Task 16: Step 2 — Human Sidekick (Critical Logic)

**Files:**
- Create: `src/components/wizard/steps/step-human.tsx`

**Step 1: Build step component with branching logic**

- Toggle: "Add a human buddy?" (yes/no)
- If yes → "Is the human under 18?"
  - If under 18: Show text-only fields (hair color, clothes, personality). Image upload is **hidden/disabled** with explanatory text about privacy.
  - If 18+: Show terms & conditions checkbox. Image upload is **disabled until checkbox is checked**. After accepting, show upload field.
- If no → skip to next step

**Step 2: Commit**

---

### Task 17: Step 3 — Story Theme & Art Style

**Files:**
- Create: `src/components/wizard/steps/step-theme.tsx`

**Step 1: Build step component**

- Theme picker (card grid): "Space Adventure", "Underwater Kingdom", "Enchanted Forest", "Pirate Treasure", "Dinosaur Land"
- Art style picker: "Watercolor", "Cartoon", "Pixel Art", "Storybook Classic"

**Step 2: Commit**

---

### Task 18: Step 4 — Review & Submit

**Files:**
- Create: `src/components/wizard/steps/step-review.tsx`

**Step 1: Build review component**

- Display all collected data in a summary card
- Show pet image preview
- Show human details (respecting under-18 restrictions — no image shown)
- Show selected theme + art style
- "Edit" buttons to go back to specific steps
- "Generate My Story" submit button

**Step 2: Commit**

---

### Task 19: Step 5 — Generation & PDF Download

**Files:**
- Create: `src/components/wizard/steps/step-generate.tsx`
- Create: `src/app/api/stories/generate/route.ts`
- Create: `src/lib/ai/story-engine.ts`
- Create: `src/lib/ai/mock-engine.ts`
- Create: `src/lib/pdf/generator.ts`

**Step 1: AI story engine**

```typescript
// src/lib/ai/story-engine.ts
// If OPENAI_API_KEY is set: call OpenAI GPT-4 for story text, DALL-E 3 for images
// If not: fall back to mock engine that returns sample story + placeholder images
// Accepts language parameter to inject into system prompt
```

**Step 2: Mock engine**

Returns a pre-written 5-page story with placeholder images. Story text adapts to selected language.

**Step 3: PDF generator**

Using jsPDF to create a multi-page PDF:
- Cover page with title + pet image
- 4-5 story pages with alternating text + generated images
- Back cover

**Step 4: Generation API route**

`POST /api/stories/generate`
1. Save wizard data to Supabase `story_projects`
2. Upload pet image to Supabase Storage
3. Call AI engine
4. Generate PDF
5. Upload PDF to Supabase Storage
6. Update story_projects with pdf_url
7. Return download URL

**Step 5: Generation UI**

- Loading animation with fun messages ("Teaching your pet to read...", "Mixing paint colors...")
- Progress indicator
- Download button when complete
- Error state with retry

**Step 6: Commit**

---

### Task 20: Playwright Tests — Wizard

**Files:**
- Create: `e2e/wizard.spec.ts`

**Step 1: Test wizard flow**

- Step 1: Fill pet details, upload image, proceed
- Step 2a: Add human under 18, verify no image upload, verify text fields
- Step 2b: Add human over 18, verify terms required before upload
- Step 2c: No human, skip step
- Step 3: Select theme and art style
- Step 4: Review shows correct data
- Step 5: Generation starts, loading shown

**Step 2: Run tests**

**Step 3: Commit**

---

## Phase 6: Email Integration

### Task 21: Resend Email Service

**Files:**
- Create: `src/lib/email/client.ts`
- Create: `src/lib/email/templates.ts`

**Step 1: Email client with mock fallback**

```typescript
// If RESEND_API_KEY is set: use Resend
// If not: log email to console
```

**Step 2: Email templates**

- Welcome email (after registration)
- Payment confirmation
- Story ready (with PDF download link)

**Step 3: Wire into auth callback and story completion**

**Step 4: Commit**

---

## Phase 7: Landing Page & Navigation

### Task 22: Landing Page & App Shell

**Files:**
- Create: `src/components/layout/navbar.tsx`
- Create: `src/components/layout/footer.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/layout.tsx`
- Create: `src/app/(protected)/dashboard/page.tsx`

**Step 1: Navbar**

Logo + nav links + language toggle + auth status (login/register or user menu).

**Step 2: Landing page**

Hero section, how-it-works (3 steps visual), pricing, CTA.

**Step 3: User dashboard**

Shows past stories, payment status, link to wizard.

**Step 4: Footer**

Links, copyright.

**Step 5: Commit**

---

## Phase 8: Final Integration & E2E Tests

### Task 23: Full E2E Test Suite

**Files:**
- Create: `e2e/full-flow.spec.ts`
- Create: `e2e/i18n.spec.ts`

**Step 1: Full flow test**

Register → Pay → Wizard → Generate → Download PDF

**Step 2: i18n test**

- Language toggle changes UI text
- All 4 languages render correctly
- Language persists across navigation

**Step 3: Run all tests**

```bash
npx playwright test
```

**Step 4: Commit**

---

### Task 24: Vercel Deployment Config

**Files:**
- Create: `vercel.json`
- Verify: `next.config.js` is Vercel-compatible

**Step 1: Verify build**

```bash
npm run build
```

**Step 2: Create vercel.json if needed**

**Step 3: Final commit**

```bash
git add -A
git commit -m "chore: finalize for Vercel deployment"
```

---

## Execution Order Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| 1 | 1-5 | Project scaffold, deps, theme, Supabase setup |
| 2 | 6-10 | Auth, RBAC, admin dashboard, auth tests |
| 3 | 11 | i18n with next-intl, 4 languages |
| 4 | 12-13 | Stripe checkout + webhook, payment tests |
| 5 | 14-20 | 5-step wizard (core feature), wizard tests |
| 6 | 21 | Email service with Resend |
| 7 | 22 | Landing page, navbar, dashboard |
| 8 | 23-24 | Full E2E tests, Vercel config |

**Total: 24 tasks across 8 phases**

Each phase is independently testable. Playwright tests are written after each major feature block (Auth, Stripe, Wizard).
