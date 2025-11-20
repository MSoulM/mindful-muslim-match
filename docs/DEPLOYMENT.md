# Deployment Guide - MuslimSoulmate.ai

## 🎯 Overview

This guide covers deploying MuslimSoulmate.ai built on Lovable.ai platform. Lovable handles build optimization, hosting, and deployment automatically.

## ⚙️ Pre-Deployment Checklist

### 1. Code Quality ✅
- [ ] No console errors in preview
- [ ] No TypeScript errors
- [ ] All prompts executed successfully
- [ ] Manual testing completed (see TESTING.md)
- [ ] Responsive design verified (320px - 1920px)
- [ ] Cross-browser tested in preview

### 2. Performance ✅
- [ ] Lazy loading implemented for routes
- [ ] Component memoization applied
- [ ] Images compressed and optimized
- [ ] Bundle size reasonable (<500KB target)
- [ ] No unnecessary re-renders

### 3. Accessibility ✅
- [ ] Screen reader tested (basic)
- [ ] Keyboard navigation works
- [ ] Color contrast meets WCAG 2.1 AA
- [ ] ARIA labels present
- [ ] Reduced motion respected

### 4. Security ✅
- [ ] No API keys in client code
- [ ] Input validation comprehensive
- [ ] XSS prevention in place
- [ ] Rate limiting configured
- [ ] Error messages user-friendly (no sensitive data)

### 5. Backend (Lovable Cloud) ✅
- [ ] Database tables created
- [ ] RLS policies configured
- [ ] Edge functions deployed and tested
- [ ] Secrets configured (ANTHROPIC_API_KEY)
- [ ] Storage buckets configured (if using file upload)

## 🚀 Lovable Deployment Process

### Understanding Lovable Deployment

Lovable has **two deployment systems**:

1. **Frontend (Manual)**
   - UI components, pages, styles
   - Requires clicking "Publish" → "Update"
   - Preview first, then publish

2. **Backend (Automatic)**
   - Edge functions
   - Database migrations
   - RLS policies
   - Deploys immediately on code change

### Step-by-Step Deployment

#### 1. Verify Preview
```
1. Check preview window for errors
2. Test all major user flows:
   - Profile completion dashboard
   - Content upload modal
   - ChaiChat eligibility tracker
   - Topic suggestions
3. Test on mobile viewport (click phone icon)
4. Test on tablet viewport (click tablet icon)
```

#### 2. Publish Frontend

**Desktop:**
1. Click **"Publish"** button (top-right corner)
2. Review changes summary
3. Click **"Update"** to deploy
4. Wait for deployment confirmation

**Mobile:**
1. Switch to Preview mode (eye icon)
2. Click **"Publish"** button (bottom-right corner)
3. Review changes
4. Click **"Update"**

#### 3. Verify Backend (Auto-deployed)

Edge functions and database changes deploy automatically:

1. Navigate to **Cloud** tab
2. Check **Edge Functions** status
3. Verify **Database** tables exist
4. Confirm **Secrets** are configured

#### 4. Configure Custom Domain (Optional)

1. Go to **Project Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter your custom domain: `muslimsoulmate.ai`
4. Follow DNS configuration instructions
5. Wait for SSL certificate provisioning (up to 24 hours)

**DNS Records Needed:**
```
Type: A
Name: @ (or muslimsoulmate.ai)
Value: [Lovable provides IP]

Type: CNAME
Name: www
Value: [Lovable provides domain]
```

#### 5. Post-Deployment Verification

**Critical Checks:**
- [ ] Production URL accessible
- [ ] SSL certificate active (https://)
- [ ] All pages load without 404s
- [ ] Profile dashboard functional
- [ ] Content upload works
- [ ] ChaiChat tracker updates
- [ ] Toast notifications appear
- [ ] Error boundaries catch errors
- [ ] Mobile responsive
- [ ] No console errors

**Edge Function Checks:**
```bash
# Test MMAgent chat endpoint
curl -X POST https://[your-project-id].supabase.co/functions/v1/agent-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [anon-key]" \
  -d '{"message": "Hello", "threadId": "test-123"}'
```

## 🔐 Secrets Management

### Adding Secrets (Lovable Cloud)

**IMPORTANT**: Do NOT use .env files. Lovable Cloud uses Supabase Secrets.

#### Via Lovable UI:
1. Navigate to **Cloud** tab
2. Click **Secrets** section
3. Click **"Add Secret"**
4. Enter secret name: `ANTHROPIC_API_KEY`
5. Enter secret value (do not commit to Git!)
6. Click **"Save"**

#### Using in Edge Functions:
```typescript
// supabase/functions/agent-chat/index.ts
const apiKey = Deno.env.get('ANTHROPIC_API_KEY');

if (!apiKey) {
  throw new Error('ANTHROPIC_API_KEY not configured');
}
```

### Required Secrets

| Secret Name | Purpose | Where to Get |
|------------|---------|--------------|
| `ANTHROPIC_API_KEY` | MMAgent AI chat | https://console.anthropic.com/ |

## 📊 Monitoring Setup

### 1. Error Tracking (Recommended: Sentry)

**Option A: Add via Lovable Integration**
1. Go to Project Settings → Integrations
2. Connect Sentry (if available)
3. Follow authentication flow

**Option B: Manual Setup**
```typescript
// Add to src/main.tsx
import * as Sentry from "@sentry/react";

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: "[Your Sentry DSN]",
    environment: "production",
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay()
    ],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}
```

**Note**: Store Sentry DSN as Lovable Cloud secret if needed in edge functions.

### 2. Analytics (Recommended: PostHog)

Already integrated - verify:
1. PostHog project created
2. API key configured
3. Events tracking correctly
4. Dashboard accessible

Key events tracked:
- `profile_completion_update`
- `content_uploaded`
- `chaichat_unlocked`
- `milestone_reached`
- `topic_suggested`

### 3. Performance Monitoring

**Lighthouse CI** (Future Enhancement):
```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            https://muslimsoulmate.ai
            https://muslimsoulmate.ai/profile
          uploadArtifacts: true
```

## 🔧 Environment-Specific Configuration

### Production vs. Development

Lovable handles this automatically:

**Development (Preview):**
- Uses preview Supabase instance
- Debug mode enabled
- Detailed error messages

**Production (Published):**
- Uses production Supabase instance
- Debug mode disabled
- User-friendly error messages
- Performance optimizations enabled

## 🚨 Rollback Procedure

If deployment issues occur:

### Option 1: Revert via Lovable History
1. Click project name → **"View History"**
2. Find last working version
3. Click **"Restore"**
4. Re-publish

### Option 2: Emergency Fixes
1. Use Lovable AI chat to describe issue
2. AI will diagnose and fix
3. Test in preview
4. Re-publish

### Database Rollback (CAUTION!)
1. Navigate to Cloud → Database
2. Use Supabase SQL editor to revert schema changes
3. **Create backup first!**

## 📋 Post-Launch Monitoring

### Week 1: Critical Monitoring

**Daily Checks:**
- [ ] Error rate <1%
- [ ] Average page load <3s
- [ ] Zero critical errors
- [ ] User feedback reviewed
- [ ] Analytics data flowing

**Key Metrics:**
- Profile completion rate
- ChaiChat unlock rate (70% threshold)
- Content upload success rate
- Topic suggestion click-through rate
- Average time to 70% completion

### Week 2-4: Optimization

**Monitor:**
- Performance metrics (Lighthouse scores)
- User engagement patterns
- Feature adoption rates
- Error patterns

**Optimize:**
- Slow-loading screens
- High-error components
- Low-engagement features

## 🔄 Continuous Deployment

### Making Updates Post-Launch

1. **Make changes in Lovable AI chat**
2. **Test in preview thoroughly**
3. **Click "Publish" → "Update"**
4. **Verify production deployment**
5. **Monitor for errors (first 30 minutes)**

**Best Practices:**
- Deploy during low-traffic hours
- Test changes in preview first
- Monitor errors immediately after deploy
- Have rollback plan ready
- Communicate changes to team

## 📞 Support & Troubleshooting

### Common Issues

**Issue: "Updates not showing in production"**
- Solution: Frontend requires manual "Update" click
- Backend deploys automatically

**Issue: "Edge function returning 500"**
- Check Cloud → Edge Functions → Logs
- Verify secrets configured
- Check function code for errors

**Issue: "Custom domain not working"**
- Verify DNS records propagated (use `dig` command)
- Wait 24-48 hours for SSL provisioning
- Check domain configuration in Project Settings

**Issue: "Database connection errors"**
- Check Cloud → Database status
- Verify RLS policies not blocking access
- Check Supabase project status

### Getting Help

1. **Lovable Discord**: https://discord.gg/lovable (fastest)
2. **Lovable Docs**: https://docs.lovable.dev
3. **Supabase Discord**: https://discord.supabase.com (backend issues)

## ✅ Deployment Sign-Off Template

```
═══════════════════════════════════════════════════
DEPLOYMENT RECORD
═══════════════════════════════════════════════════

Deployed By: _______________________________________
Date: ______________________________________________
Time: ______________________________________________

Version/Commit: ____________________________________

Production URL: ____________________________________
Custom Domain: _____________________________________

Backend Status:
□ Edge Functions Deployed
□ Database Migrations Applied
□ Secrets Configured
□ Storage Configured

Frontend Status:
□ Build Successful
□ Preview Tested
□ Published to Production
□ SSL Active

Post-Deployment Checks:
□ All pages accessible
□ No console errors
□ Profile completion works
□ Content upload works
□ ChaiChat tracker functional
□ Mobile responsive verified
□ Cross-browser tested

Monitoring:
□ Error tracking active
□ Analytics configured
□ Performance baseline recorded

Issues/Notes:
_______________________________________________________
_______________________________________________________
_______________________________________________________

Sign-Off: □ APPROVED FOR PRODUCTION
═══════════════════════════════════════════════════
```

---

## 🎉 Launch Day Checklist

**T-24 Hours:**
- [ ] Final QA testing complete
- [ ] Stakeholder approval received
- [ ] Monitoring dashboards configured
- [ ] Support team briefed
- [ ] Rollback plan documented

**T-2 Hours:**
- [ ] Deploy to production
- [ ] Verify all features working
- [ ] Check error rates
- [ ] Monitor performance

**T+2 Hours:**
- [ ] Verify user traffic flowing
- [ ] Check analytics events
- [ ] Monitor error logs
- [ ] Respond to any issues

**T+24 Hours:**
- [ ] Review metrics
- [ ] Check user feedback
- [ ] Document lessons learned
- [ ] Plan optimizations

---

**Last Updated**: 2025-11-20  
**Version**: 1.0.0  
**Maintained By**: Development Team
