# 🚀 Deploy Turf Slot Booking App to Vercel

This guide will help you deploy your application to Vercel with auto-deployment on git push.

---

## Step 1: Reset Database with New Trigger

Before deploying, you need to reset the Supabase database with the updated schema that includes the auth trigger.

### In Supabase Dashboard:

1. Go to [app.supabase.com](https://app.supabase.com)
2. Select your project
3. Go to **Settings** > **Danger Zone** > **Reset Database**
4. Confirm reset (this will delete all data)
5. Wait 30 seconds for database to reset

### Deploy New Schema:

1. Go to **SQL Editor** > **New Query**
2. Copy the **entire** `DATABASE_SCHEMA.sql` file from your project
3. Paste into Supabase SQL Editor
4. Click **Run**

**Expected**: ✓ All queries execute successfully with no errors

---

## Step 2: Prepare GitHub Repository

### Initialize Git (if not already done):

```bash
cd /opt/php74/slot

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Turf Slot Booking App"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/turf-slot-booking.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy to Vercel

### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

Follow the prompts:

- **Which scope?** → Select your account
- **Link existing project?** → No
- **Project name?** → `turf-slot-booking`
- **Framework?** → Next.js
- **Build settings?** → Press Enter (use defaults)

### Option B: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New..."** → **Project**
3. Select your GitHub repository
4. Click **"Import"**
5. Proceed to Step 4

---

## Step 4: Add Environment Variables in Vercel

Once your project is created in Vercel:

1. Go to **Project Settings** → **Environment Variables**
2. Add these variables (from your `.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=https://byzctivajajwavcxusgo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=https://your-project-name.vercel.app
NEXT_PUBLIC_APP_NAME=Turf Slot Booking
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

3. Click **"Save"**
4. Vercel will automatically redeploy with the new variables

---

## Step 5: Configure Supabase CORS & Auth

### Add Vercel URL to Supabase Auth Redirects:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Authentication** > **Settings**
4. Scroll down to **Redirect URLs**
5. Add these:
   - `https://your-project-name.vercel.app/auth/callback`
   - `https://your-project-name.vercel.app`
   - `https://your-project-name.vercel.app/dashboard`

**Save** the changes.

---

## Step 6: Enable Auto-Deployment

Auto-deployment is enabled by default on Vercel.

Every time you push to `main` branch:

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

Vercel will automatically:

1. Pull the latest code
2. Install dependencies
3. Build the project
4. Deploy to production

You can monitor deployments at [vercel.com/dashboard](https://vercel.com/dashboard)

---

## Step 7: Test Production Deployment

### Test Your Live Site:

1. Go to your Vercel deployment URL: `https://your-project-name.vercel.app`
2. Test signup:
   - Click **Sign Up**
   - Enter email, password, name, and role
   - Come you should see dashboard
3. Test login:
   - Logout
   - Click **Log In**
   - Enter credentials
   - Should see dashboard
4. Test workflows:
   - **As Owner**: Create turf → Add slots → See bookings
   - **As Player**: Browse turfs → Book slot → See in bookings

---

## Step 8: Configure Custom Domain (Optional)

To use your own domain instead of `*.vercel.app`:

1. In Vercel Dashboard, go to **Settings** > **Domains**
2. Enter your domain name
3. Follow instructions to update DNS records
4. Domain will be active within 24 hours

---

## Troubleshooting Deployment

### Build Fails with "Module not found"

**Solution**:

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
git add .
git commit -m "Reinstall dependencies"
git push
```

### 404 Error on routes

**Solution**: Make sure Next.js app router is working:

```bash
npm run build
npm run start
```

Test locally first, then push.

### Auth not working on production

**Solution**:

1. Check Supabase URL and keys are correct in Vercel env vars
2. Verify CORS redirects are added in Supabase
3. Check browser cookies are enabled
4. Clear site data and try again

### Database connection timeout

**Solution**:

1. Check Supabase project is active
2. Verify DATABASE_SCHEMA.sql was run successfully
3. Test query in Supabase SQL Editor
4. Check network connectivity

---

## Post-Deployment Checklist

- [ ] Vercel deployment is live
- [ ] Custom domain configured (optional)
- [ ] Environment variables are set
- [ ] Supabase auth redirects configured
- [ ] Signup/Login works
- [ ] Can create turfs
- [ ] Can add slots
- [ ] Can book slots
- [ ] Owner can approve/reject bookings
- [ ] Analytics shows data
- [ ] Mobile responsive
- [ ] No console errors

---

## Continuous Deployment Workflow

### Daily Development:

```bash
# Make changes locally
code .

# Test locally
npm run dev

# Commit and push
git add .
git commit -m "Feature: Add X"
git push origin main

# Vercel automatically deploys!
```

### Check Deployment Status:

```bash
# View Vercel dashboardvercel dashboard  # Opens dashboard in browser
# Or go to https://vercel.com/dashboard
```

---

## Rollback to Previous Version

If something breaks:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Deployments**
4. Find previous working deployment
5. Click **Promote to Production**

Or revert git:

```bash
git revert HEAD
git push origin main
```

---

## Monitor Production

### Check Logs:

```bash
vercel logs  # Or use dashboard
```

### Check Analytics:

- Vercel provides free analytics
- Go to **Analytics** tab in Vercel Dashboard
- See:
  - Page load times
  - Error rates
  - Traffic patterns

### Setup Error Tracking (Optional):

Add Sentry for error monitoring:

```bash
npm install @sentry/nextjs
```

---

## Database Backups

Supabase automatically backs up daily. To manually backup:

1. **Export Data**:

   ```sql
   SELECT * FROM users;
   -- Copy and save to CSV
   ```

2. **Create Manual Backup**:
   - Supabase Dashboard > **Backups**
   - Click **Create Backup**

3. **Schedule Regular Backups**:
   - Download exports weekly
   - Store in safe location

---

## Performance Optimization

### Caching:

Add caching headers in `next.config.js`:

```javascript
headers: async () => {
  return [
    {
      source: '/api/(.*)',
      headers: [
        { key: 'Cache-Control', value: 'no-cache' },
      ],
    },
  ];
},
```

### Image Optimization:

Already configured with Next.js Image component.

### Database Optimization:

- Indexes already created
- Queries already optimized
- Connection pooling enabled

---

## Scale to Higher Traffic

As your app grows:

1. **Upgrade Vercel Plan**: Add more serverless function capacity
2. **Upgrade Supabase**: Increase database limits
3. **Add CDN**: Configure Cloudflare in front
4. **Database Read Replicas**: Supabase support optional replicas

---

## Maintenance

### Monthly Tasks:

- [ ] Review Vercel analytics
- [ ] Check database size
- [ ] Update dependencies: `npm update`
- [ ] Review error logs
- [ ] Test critical workflows

### Quarterly Tasks:

- [ ] Security audit
- [ ] Performance review
- [ ] User feedback review
- [ ] Plan new features

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Get Help**: Create issue in GitHub repo

---

## Summary

Your Turf Slot Booking application is now:

✅ **Deployed** on Vercel (global CDN)  
✅ **Auto-scaling** for traffic  
✅ **Fast** with serverless functions  
✅ **Secure** with HTTPS  
✅ **Monitored** with Vercel analytics  
✅ **Backed up** automatically  
✅ **Auto-deploying** on git push

**Your live URL**: `https://your-project-name.vercel.app`

---

**Last Updated**: April 2026  
**Status**: Production Ready ✅
