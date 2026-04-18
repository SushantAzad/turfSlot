# Turf Slot Booking Application - Complete Setup Guide

## Table of Contents

1. Prerequisites
2. Project Setup
3. Supabase Configuration
4. Environment Variables
5. Database Setup
6. Running Locally
7. Deployment to Vercel
8. Troubleshooting
9. Features Overview
10. API Documentation

---

## 1. Prerequisites

- Node.js 18+ and npm/yarn
- Git
- Supabase account (free at https://supabase.com)
- Vercel account (optional, for deployment)
- Code editor (VS Code recommended)

---

## 2. Project Setup

### Clone or Create the Project

```bash
# Create project
mkdir turf-slot-booking
cd turf-slot-booking

# Or clone if using git
git clone <your-repo-url> turf-slot-booking
cd turf-slot-booking
```

### Install Dependencies

```bash
npm install
# or
yarn install
```

---

## 3. Supabase Configuration

### Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details:
   - Project Name: `turf-slot-booking`
   - Database Password: Create a strong password
   - Region: Choose closest to your users
4. Click "Create new project"
5. Wait for project to initialize (2-3 minutes)

### Get Supabase Credentials

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` key → `SUPABASE_SERVICE_ROLE_KEY`

### Enable Authentication

1. Go to **Authentication** > **Providers**
2. Ensure "Email" is enabled (default)
3. Go to **Authentication** > **Settings**
4. Under "Email Auth", ensure "Confirm email" is disabled for development

---

## 4. Environment Variables

### Create `.env.local` file

Create a file named `.env.local` in the project root:

```bash
cp .env.example .env.local
```

### Fill in `.env.local`

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Turf Slot Booking

RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

---

## 5. Database Setup

### Option A: Using Supabase Dashboard SQL Editor

1. Go to Supabase Dashboard > **SQL Editor**
2. Click **"New Query"**
3. Copy and paste the entire contents of `DATABASE_SCHEMA.sql`
4. Click **"Run"**
5. Wait for all tables and functions to be created

### Option B: Using Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Create migrations
supabase db push
```

### Verify Database Setup

1. Go to **Table Editor** in Supabase
2. Verify these tables exist:
   - `users`
   - `turfs`
   - `availability_slots`
   - `bookings`
   - `reviews`
   - `payment_records`
   - `notifications`
   - `analytics`
   - `audit_logs`

### Enable Row Level Security (RLS)

All RLS policies are included in the DATABASE_SCHEMA.sql file and will be automatically created. Verify in Supabase:

1. Go to **Authentication** > **Policies**
2. You should see policies for each table

---

## 6. Running Locally

### Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Test the Application

1. **Home Page**: `http://localhost:3000`
2. **Sign Up as Player**:
   - Go to `/auth/signup`
   - Select "Player/Team"
   - Create account
3. **Sign Up as Turf Owner**:
   - Go to `/auth/signup`
   - Select "Turf Owner"
   - Create account
4. **Test Workflows**:
   - Owner creates a turf
   - Owner adds available slots
   - Player browses and books
   - Owner approves/rejects bookings

### Common Issues

**Problem**: `NEXT_PUBLIC_SUPABASE_URL is not defined`

- **Solution**: Check `.env.local` file exists and has correct values

**Problem**: Database tables not showing

- **Solution**: Run DATABASE_SCHEMA.sql again via Supabase SQL Editor

**Problem**: "Invalid JWT" error

- **Solution**: Clear browser cookies and login again

---

## 7. Deployment to Vercel

### Prerequisites

- Vercel account (free at https://vercel.com)
- GitHub account with repository pushed

### Deploy Steps

1. **Push to GitHub**

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Deploy to Vercel**
   - Go to [https://vercel.com](https://vercel.com)
   - Click "New Project"
   - Select your GitHub repository
   - Click "Import"

3. **Configure Environment Variables**
   - In Vercel Dashboard > Project Settings > Environment Variables
   - Add all variables from `.env.local`:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `NEXT_PUBLIC_APP_URL=https://your-vercel-url.vercel.app`
     - Other variables as needed

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Visit your live application

### Post-Deployment Checklist

- [ ] Test signup/login
- [ ] Test turf creation
- [ ] Test booking flow
- [ ] Check analytics
- [ ] Verify real-time updates

---

## 8. Troubleshooting

### Database Issues

**No connections to database**

```sql
-- Check in Supabase Dashboard > SQL Editor
SELECT * FROM users LIMIT 1;
```

**Trigger errors**

- Ensure all functions are created before triggers
- Run DATABASE_SCHEMA.sql in order

### Authentication Issues

**CORS errors**

- Go to Supabase > Authentication > Settings
- Add your domain to "Redirect URLs"
- Format: `http://localhost:3000/auth/callback` (local)
- Format: `https://yourdomain.com/auth/callback` (production)

**Email verification stuck**

- Go to Supabase > Authentication > Settings
- Disable "Confirm email" for development

### Real-time Issues

**Realtime subscriptions not working**

- Check Supabase realtime is enabled
- Verify table has realtime enabled in Supabase Dashboard

```sql
-- Enable realtime for a table
ALTER TABLE bookings REPLICA IDENTITY FULL;
CREATE PUBLICATION bookings_pub FOR TABLE bookings;
```

---

## 9. Features Overview

### User Roles

#### Turf Owner

- ✅ Create and manage turfs
- ✅ Set prices and availability
- ✅ View booking requests
- ✅ Approve/reject bookings
- ✅ View analytics and revenue
- ✅ Receive real-time notifications
- ✅ Generate booking reports

#### Player/Team

- ✅ Browse available turfs
- ✅ View available slots
- ✅ Request bookings
- ✅ Track booking status
- ✅ View booking history
- ✅ Leave reviews

### Core Features

1. **Authentication**
   - Email/password signup
   - Role-based access
   - JWT sessions
   - Password reset

2. **Turf Management**
   - Create/edit turfs
   - Set pricing
   - Define availability
   - Manage amenities
   - Upload images

3. **Booking System**
   - Request-based booking
   - Owner approval workflow
   - Conflict prevention
   - Real-time updates
   - Booking status tracking

4. **Analytics**
   - Revenue charts
   - Booking trends
   - Customer ratings
   - Performance metrics

5. **Notifications**
   - Real-time booking updates
   - Email notifications (optional)
   - In-app alerts

---

## 10. API Endpoints

All operations use Server Actions and Supabase client library calls.

### Authentication

- `POST /auth/signup` (via Supabase Auth)
- `POST /auth/login` (via Supabase Auth)
- `POST /auth/logout` (via Supabase Auth)

### Turfs (Turf Owners)

- `GET /dashboard/owner/turfs` - List all turfs for owner
- `POST /api/turfs` - Create turf (requires owner role)
- `PATCH /api/turfs/[id]` - Update turf
- `DELETE /api/turfs/[id]` - Delete turf

### Bookings (Players)

- `GET /dashboard/user/bookings` - View my bookings
- `POST /api/bookings` - Create booking request
- `PATCH /api/bookings/[id]/cancel` - Cancel booking

### Bookings (Owners)

- `GET /dashboard/owner/bookings` - View booking requests
- `PATCH /api/bookings/[id]/approve` - Approve booking
- `PATCH /api/bookings/[id]/reject` - Reject booking

### Slots

- `GET /api/slots?turfId=[id]&date=[date]` - Get available slots
- `POST /api/slots` - Create slots (bulk)

### Analytics

- `GET /api/analytics/[turfId]` - Get turf analytics

---

## 11. Database Schema Summary

### Tables

| Table                | Purpose                               |
| -------------------- | ------------------------------------- |
| `users`              | User profiles and authentication data |
| `turfs`              | Turf information and configuration    |
| `availability_slots` | Individual booking slots              |
| `bookings`           | Booking requests and history          |
| `reviews`            | Customer reviews and ratings          |
| `payment_records`    | Payment tracking                      |
| `notifications`      | User notifications                    |
| `analytics`          | Performance metrics                   |
| `audit_logs`         | System audit trail                    |

### Key Relationships

- `users` (1) ← → (N) `turfs` (owner relationship)
- `turfs` (1) ← → (N) `availability_slots`
- `turfs` (1) ← → (N) `bookings`
- `bookings` (1) → (1) `availability_slots` (unique: only one booking per slot)
- `users` (1) ← → (N) `bookings` (booking requester)

---

## 12. File Structure

```
project/
├── app/
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                       # Home page
│   ├── globals.css                    # Global styles
│   ├── providers.tsx                  # Layout providers
│   ├── auth/
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   └── dashboard/
│       ├── layout.tsx
│       ├── page.tsx                   # Redirect based on role
│       ├── owner/
│       │   ├── layout.tsx
│       │   ├── page.tsx               # Owner dashboard
│       │   ├── turfs/page.tsx         # Turfs management
│       │   ├── bookings/page.tsx      # Booking requests
│       │   └── analytics/page.tsx     # Analytics
│       └── user/
│           ├── layout.tsx
│           ├── page.tsx               # User dashboard
│           ├── browse/page.tsx        # Browse turfs
│           └── bookings/page.tsx      # My bookings
├── components/                        # Reusable components
├── hooks/
│   ├── useAuth.ts                    # Authentication hooks
│   ├── useData.ts                    # Data fetching hooks
│   └── useMutation.ts                # Mutation hooks
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # Supabase client
│   │   └── queries.ts                # Database queries
│   ├── auth/
│   │   └── utils.ts                  # Auth utilities
│   ├── utils.ts                       # Common utilities
│   └── validation.ts                  # Zod schemas
├── types/
│   └── index.ts                       # TypeScript types
├── public/                            # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── DATABASE_SCHEMA.sql                # Database schema
├── .env.example                       # Environment vars template
└── README.md
```

---

## 13. Additional Configuration

### Payment Integration (Optional)

To integrate Razorpay:

1. Get credentials from https://razorpay.com
2. Add to `.env.local`:
   ```
   NEXT_PUBLIC_RAZORPAY_KEY_ID=your_key
   RAZORPAY_KEY_SECRET=your_secret
   ```
3. Use in checkout flow (placeholder code in codebase)

### Email Notifications (Optional)

To enable email notifications:

1. Setup Resend account at https://resend.com
2. Add to `.env.local`:
   ```
   RESEND_API_KEY=your_api_key
   ```

### Google Analytics (Optional)

1. Create Google Analytics property
2. Add to `.env.local`:
   ```
   NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
   ```

---

## 14. Performance Optimization

### Caching Strategy

- Use React Query for data fetching
- Implement ISR (Incremental Static Regeneration) for public pages
- Cache Supabase queries

### Database Optimization

- Indexes are pre-created in DATABASE_SCHEMA.sql
- Use pagination for large datasets
- Implement connection pooling

### Image Optimization

- Use Next.js Image component
- Implement lazy loading
- Compress images before upload

---

## 15. Security Best Practices

✅ **Do-s**:

- Always validate input with Zod
- Use RLS policies for all tables
- Implement rate limiting
- Use HTTPS in production
- Keep dependencies updated
- Use environment variables for secrets

❌ **Don't-s**:

- Don't expose secret keys in client-side code
- Don't hardcode database queries
- Don't skip authentication checks
- Don't store sensitive data in localStorage
- Don't commit `.env.local`

---

## 16. Monitoring & Logs

### Supabase Monitoring

- Check **Database** > **Logs** for query errors
- Monitor **Auth** > **Logs** for authentication issues
- Review **Storage** > **Logs** for file uploads (if using)

### Vercel Monitoring

- Check build logs for deployment issues
- Use Vercel Analytics for performance tracking
- Monitor error logs in Vercel dashboard

---

## 17. Maintenance

### Regular Tasks

- Update dependencies: `npm update`
- Check Supabase for pending migrations
- Review analytics and performance metrics
- Clean up old bookings (archival)

### Backup Strategy

- Supabase automatically backs up daily
- Export data regularly for external backup
- Use git for version control

---

## 18. Support & Resources

### Documentation

- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- TypeScript: https://www.typescriptlang.org/docs
- Tailwind CSS: https://tailwindcss.com/docs

### Community

- GitHub Issues for bugs
- Stack Overflow for questions
- Next.js Discord community
- Supabase Discord community

---

**Last Updated**: April 2024
**Version**: 1.0.0
