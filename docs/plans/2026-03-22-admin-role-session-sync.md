# Admin Role Session Sync Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ensure admin users who sign in through Google receive their real database role in session/JWT data so `/admin/dashboard` does not redirect them to `/error`.

**Architecture:** Keep the existing NextAuth setup and credentials flow intact. Remove reliance on the provider-level hardcoded Google role and normalize the role from the `User` table inside the JWT callback, where both credentials and OAuth sign-ins converge.

**Tech Stack:** Next.js 14, NextAuth, Prisma, PostgreSQL, Node.js

---

### Task 1: Add a failing regression check

**Files:**
- Create: `scripts/check-auth-role-sync.js`
- Modify: none
- Test: `scripts/check-auth-role-sync.js`

**Step 1: Write the failing test**

Create a script that fails if:
- `GoogleProvider.profile()` still hardcodes `role: "USER"`
- the JWT callback does not read the database user role

**Step 2: Run test to verify it fails**

Run: `node scripts/check-auth-role-sync.js`
Expected: FAIL because the current Google profile hardcodes `USER`

### Task 2: Fix role normalization in NextAuth

**Files:**
- Modify: `lib/authOptions.ts`
- Test: `scripts/check-auth-role-sync.js`

**Step 1: Write minimal implementation**

- Remove the hardcoded `role` field from the Google `profile()` return value
- In the JWT callback, look up the database user by email and prefer the database role when available
- Preserve the existing credentials login flow and session field shape

**Step 2: Run test to verify it passes**

Run: `node scripts/check-auth-role-sync.js`
Expected: PASS

### Task 3: Verify no obvious route wiring regression

**Files:**
- Read: `lib/authOptions.ts`
- Read: `app/(frontend)/login/page.tsx`
- Read: `app/(office)/admin/dashboard/page.tsx`

**Step 1: Confirm role-based redirect assumptions still hold**

Check that:
- login still routes `ADMIN` to `/admin/dashboard`
- admin dashboard still checks `session.user.role`
- no other auth provider flow was changed unintentionally
