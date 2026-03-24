# Deployment Checklist — Geomate Agro Ventures

Things to do in the Supabase Dashboard and hosting platform that can't be done in code.

---

## 1. Run SQL Migrations (Supabase SQL Editor)

Run these files **in order** in Supabase Dashboard → SQL Editor:

1. `supabase/migrations/fix_cms_rls_and_security.sql` — Fixes CMS permissions + auto-admin signup
2. `supabase/migrations/add_indexes.sql` — Adds performance indexes
3. `supabase/migrations/enable_cron_jobs.sql` — Enables scheduled alerts (**replace `YOUR_SERVICE_ROLE_KEY` first**)

---

## 2. Supabase Dashboard Settings

### Auth → URL Configuration
- Set **Site URL** to your production domain
- Add `https://yourdomain.com/reset-password` to **Redirect URLs**
- Set **Email OTP Expiration** to `600` (10 minutes) for password reset links

### Auth → Rate Limits
- Verify **Rate limit for sending emails** is enabled (default: 2 per 60s — keep or lower)
- Verify **Rate limit for token refresh** is enabled

### Settings → API → CORS
- Change **Allowed Origins** from `*` to your production domain(s)

### Database → Extensions
- Enable `pg_cron` (required for scheduled alerts)
- Enable `pg_net` (required for cron jobs to call edge functions)

### Edge Functions → Secrets
- Set `SITE_URL` to your production domain (used by CORS in all 5 functions)
- Set `RESEND_API_KEY` (for invitation/notification emails)
- Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` (for WhatsApp)

---

## 3. Rate Limiting & Spam Prevention

Supabase handles auth rate limiting automatically. For the **contact form** (public `/contact` page):
- Consider adding Cloudflare Turnstile (free CAPTCHA alternative) to prevent spam submissions
- The `inquiries` table allows public INSERT — a CAPTCHA on the frontend is the best protection

---

## 4. Monitoring & Alerts

### Uptime Monitoring
- Set up [UptimeRobot](https://uptimerobot.com) (free) or [Better Uptime](https://betteruptime.com) for your production URL
- Add alert notifications to your email/phone

### Error Tracking
- Consider adding [Sentry](https://sentry.io) (free tier) for frontend error reporting
- Replace the `// TODO: Send to error reporting service` comments in `ErrorBoundary.tsx` and `main.tsx` with Sentry calls

### Supabase Alerts
- In Supabase Dashboard → Settings → Alerts, enable notifications for:
  - Database disk usage
  - API request limits
  - Edge function errors

---

## 5. Logging

### Current state
- Edge functions log to Supabase Dashboard → Edge Functions → Logs
- `notifications_log` table tracks WhatsApp notification history

### Recommended upgrades
- Enable **Logflare** in Supabase Dashboard → Settings → Logs for centralized logging
- Or connect to [Axiom](https://axiom.co) or [Datadog](https://datadoghq.com) for external log aggregation

---

## 6. Deployment & Rollback

### Frontend Hosting (Recommended: Vercel or Netlify)
- Both platforms keep previous deployments → instant rollback via dashboard
- Connect your GitHub repo for automatic deploys on push to `main`
- Set environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`

### Edge Functions
- Deploy via `supabase functions deploy` — Supabase keeps function history

### Database
- Use `supabase db push` for migrations in production
- Keep migration files versioned in `/supabase/migrations/`
- Before running destructive migrations, always create a **database backup** in Supabase Dashboard → Database → Backups

### CI/CD (Recommended: GitHub Actions)
- Add a workflow that runs `npm run build` on every PR to catch errors before merge
- Optionally add `supabase functions deploy` to your CI pipeline

---

## 7. Environment Security

- [ ] Remove `.env` from the repo (add to `.gitignore` if not already)
- [ ] Use hosting platform's environment variables instead
- [ ] Never commit the Supabase service role key to the repo
