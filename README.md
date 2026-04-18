# Turf Slot Booking Application

A production-ready SaaS platform for booking sports turf venues. Built with Next.js, Supabase, and modern web technologies.

## 🎯 Overview

TurfSlot is a complete turf slot booking system that enables:

- **Turf Owners** to manage venues, set pricing, and approve bookings
- **Players/Teams** to browse, search, and book available slots
- **Real-time sync** for instant updates
- **Analytics & Reporting** for owners
- **Secure transactions** with built-in conflict prevention

## ✨ Key Features

### For Turf Owners

- ✅ Create and manage multiple turfs
- ✅ Set custom pricing and availability
- ✅ Real-time booking requests with approval workflow
- ✅ Revenue analytics and trends
- ✅ Booking calendar with visual management
- ✅ Turf analytics dashboard

### For Players/Teams

- ✅ Browse and search turfs by location, price, and amenities
- ✅ View real-time availability
- ✅ Book slots with request-approval workflow
- ✅ Track booking status and history
- ✅ Leave reviews and ratings
- ✅ Mobile-responsive interface

### Technical Features

- 🔐 **Security**: Role-based access control (RBAC) with RLS policies
- ⚡ **Real-time**: Supabase Real-time for instant updates
- 🗄️ **Database**: PostgreSQL with advanced indexing
- 🎨 **UI**: Tailwind CSS with responsive design
- 📱 **Mobile**: Fully responsive interface
- 🔔 **Notifications**: Real-time in-app notifications
- 📊 **Analytics**: Built-in analytics and reporting
- 🛡️ **Rate Limiting**: Built-in rate limiting protection
- ✔️ **Validation**: Zod schema validation
- 🚀 **Performance**: Optimized queries and caching

## 📋 Tech Stack

| Component       | Technology        | Version   |
| --------------- | ----------------- | --------- |
| Frontend        | Next.js           | ^14.0     |
| Framework       | React             | ^18.2     |
| Styling         | Tailwind CSS      | ^3.3      |
| Language        | TypeScript        | ^5.2      |
| Backend         | Supabase          | Latest    |
| Database        | PostgreSQL        | Latest    |
| Auth            | Supabase Auth     | JWT-based |
| Real-time       | Supabase Realtime | Optional  |
| Form Validation | Zod               | ^3.22     |
| HTTP Client     | Axios             | ^1.5      |
| Charts          | Recharts          | ^2.10     |
| Notifications   | React Hot Toast   | ^2.4      |
| Deployment      | Vercel            | -         |

## 🚀 Quick Start

### Prerequisites

```bash
Node.js 18+
npm or yarn
Supabase account (free)
```

### 1. Clone Repository

```bash
git clone <repository-url>
cd turf-slot-booking
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

```bash
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

### 4. Setup Database

- Go to Supabase Dashboard
- Run the SQL from `DATABASE_SCHEMA.sql` in the SQL Editor

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## 📚 Documentation

- **[Setup Guide](./SETUP_GUIDE.md)** - Detailed setup instructions
- **[API Documentation](./API_DOCUMENTATION.md)** - Complete API reference
- **[Database Schema](./DATABASE_SCHEMA.sql)** - Database structure and relationships

## 📁 Project Structure

```
turf-slot-booking/
├── app/                          # Next.js App Router
│   ├── auth/                    # Authentication pages
│   ├── dashboard/               # Protected dashboard
│   │   ├── owner/              # Turf owner pages
│   │   └── user/               # Player pages
│   └── api/                     # API routes
├── components/                  # Reusable React components
├── hooks/                       # Custom React hooks
│   ├── useAuth.ts              # Auth hooks
│   ├── useData.ts              # Data fetching hooks
│   └── useMutation.ts          # Mutation hooks
├── lib/
│   ├── supabase/               # Supabase client & queries
│   ├── auth/                   # Auth utilities
│   ├── utils.ts                # Utility functions
│   └── validation.ts           # Zod schemas
├── types/                       # TypeScript type definitions
├── public/                      # Static assets
└── DATABASE_SCHEMA.sql         # Database schema

```

## Database Schema

### Core Tables

- **users** - User profiles and roles
- **turfs** - Turf venue information
- **availability_slots** - Individual booking slots
- **bookings** - Booking requests and status
- **reviews** - Customer reviews and ratings
- **payment_records** - Payment tracking
- **notifications** - User notifications
- **analytics** - Performance metrics
- **audit_logs** - System audit trail

See [DATABASE_SCHEMA.sql](./DATABASE_SCHEMA.sql) for complete schema details.

## User Roles & Access

### Turf Owner (`turf_owner`)

- Create and manage turfs
- Set pricing and availability
- View and approve/reject bookings
- Access analytics dashboard
- Manage slot calendar

### Player/Team (`user`)

- Browse available turfs
- View real-time slots
- Make booking requests
- Track booking status
- Leave reviews

## 🔐 Security Features

- ✅ **JWT Authentication** via Supabase Auth
- ✅ **Row Level Security (RLS)** on all tables
- ✅ **Password Hashing** with pgcrypto
- ✅ **Role-Based Access Control** (RBAC)
- ✅ **Double-booking Prevention** with transactions
- ✅ **Rate Limiting** built-in
- ✅ **Input Validation** with Zod
- ✅ **CORS** protection
- ✅ **Environment Variables** for secrets
- ✅ **Audit Logging** for all changes

## 📊 Core Workflows

### User Registration

1. User creates account with email, password, and role
2. Email verification (optional in development)
3. User profile auto-created in `users` table
4. Redirect to appropriate dashboard

### Turf Owner Workflow

1. Owner logs in to dashboard
2. Creates turf with details, pricing, availability
3. System generates availability slots
4. Receives booking requests from players
5. Reviews and approves/rejects requests
6. Slot marked as booked when approved
7. Views analytics and earnings

### Player Booking Workflow

1. Player searches turfs by location, price, amenities
2. Views available slots for a turf
3. Selects desired slot and makes booking request
4. Status remains "pending" until owner approves
5. Receives confirmation once approved
6. Can cancel booking before 24 hours (customizable)
7. Can leave review after slot completion

### Conflict Resolution

- **Prevention**: Unique constraint on (slot_id, status:approved)
- **Transactions**: Double-booking prevention at database level
- **Real-time Sync**: Live slot availability updates
- **Automatic Cleanup**: Rejected/cancelled bookings free slot

## 🔄 Real-time Features

Subscribe to real-time updates:

```typescript
// Booking status changes
supabase
  .channel("bookings")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "bookings" },
    (payload) => console.log(payload),
  )
  .subscribe();

// Slot availability changes
supabase
  .channel("slots")
  .on(
    "postgres_changes",
    { event: "UPDATE", schema: "public", table: "availability_slots" },
    (payload) => console.log(payload),
  )
  .subscribe();
```

## 📊 Analytics Available

### For Turf Owners

- Total bookings (monthly, quarterly, yearly)
- Revenue trends and forecasts
- Occupancy rates
- Popular time slots
- Customer ratings and reviews
- Peak booking times
- Cancellation rates

### Metrics

- `total_bookings` - Number of confirmed bookings
- `total_revenue` - Income from bookings
- `average_rating` - Customer satisfaction (1-5)
- `occupancy_rate` - Percentage of slots booked

## 🧪 Testing

### Manual Testing Checklist

- [ ] Signup as Turf Owner
  - [ ] Create turf
  - [ ] Add availability slots
  - [ ] View turf details
- [ ] Signup as Player
  - [ ] Browse turfs
  - [ ] Search and filter
  - [ ] Book a slot
- [ ] Booking Workflow
  - [ ] Booking appears as "Pending" for owner
  - [ ] Owner approves booking
  - [ ] Player sees "Approved" status
  - [ ] Slot marked as booked
- [ ] Conflict Prevention
  - [ ] Two players can't book same slot
  - [ ] Error shown appropriately
- [ ] Real-time Updates
  - [ ] New bookings appear instantly
  - [ ] Slot availability updates live
- [ ] Mobile Responsiveness
  - [ ] Test on mobile devices
  - [ ] Navigation is responsive
  - [ ] Forms are touch-friendly

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Import to Vercel**

- Go to vercel.com
- Click "New Project"
- Select your GitHub repo
- Add environment variables
- Click "Deploy"

3. **Configure Custom Domain**

- Add domain in Vercel dashboard
- Update DNS records
- Update Supabase redirect URLs

### Pre-deployment Checklist

- [ ] Environment variables set
- [ ] Database schema deployed
- [ ] Authentication enabled
- [ ] RLS policies verified
- [ ] Real-time subscriptions tested
- [ ] Error handling tested
- [ ] Performance optimized
- [ ] SEO metadata added
- [ ] Analytics configured
- [ ] Monitoring setup

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed deployment instructions.

## 🐛 Troubleshooting

### Common Issues

#### CORS Errors

- Add domain to Supabase redirect URLs
- Check environment variables

#### Database Connection Errors

- Verify Supabase credentials
- Check database connection limit
- Review Supabase logs

#### Real-time Not Working

- Ensure Realtime is enabled in Supabase
- Check network connectivity
- Verify RLS policies

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for more troubleshooting tips.

## 📝 Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=          # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # Public anonymous key
SUPABASE_SERVICE_ROLE_KEY=         # Service role key (keep secret!)
NEXT_PUBLIC_APP_URL=               # App URL (http://localhost:3000 for dev)
NEXT_PUBLIC_APP_NAME=              # App name for UI
```

Optional for features:

```
NEXT_PUBLIC_RAZORPAY_KEY_ID=       # Razorpay payment key
RAZORPAY_KEY_SECRET=               # Razorpay secret
RESEND_API_KEY=                    # Email sending (Resend)
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=   # Google Analytics
```

## 🎨 UI Components

Built-in styled components using Tailwind CSS:

- Buttons (primary, secondary, success, danger)
- Input fields with validation
- Cards with hover effects
- Badges for status
- Loading spinners
- Toast notifications
- Form feedback
- Modal dialogs
- Data tables
- Charts and graphs

## 📱 Responsive Design

Breakpoints:

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

All pages tested and optimized for mobile-first design.

## 🔄 API Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": {
    /* Response data */
  },
  "message": "Operation successful",
  "error": null
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error code",
  "message": "Human readable message",
  "details": {
    /* Additional details */
  }
}
```

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│     Next.js Frontend (App Router)   │
│  ├─ Auth Pages                      │
│  ├─ Owner Dashboard                 │
│  └─ Player Dashboard                │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│   Supabase Client & API Layer       │
│  ├─ Authentication                  │
│  ├─ Real-time Subscriptions         │
│  └─ Database Queries                │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│  Supabase (Backend as a Service)    │
│  ├─ PostgreSQL Database             │
│  ├─ Auth System                     │
│  ├─ Real-time Engine                │
│  └─ Storage                         │
└─────────────────────────────────────┘
```

## 📦 Performance Optimization

- ✅ Code splitting with Next.js
- ✅ Image optimization
- ✅ Database query optimization
- ✅ Caching strategies
- ✅ Pagination for large datasets
- ✅ Lazy loading components
- ✅ Minified CSS/JS

## 🔐 Privacy & Compliance

- GDPR compliant data handling
- Secure password storage
- User data isolation via RLS
- Audit logging of all actions
- Data encryption at transit (HTTPS)
- Optional data deletion on request

## 📄 License

This project is provided as-is for educational and commercial use.

## 🤝 Support

For issues, questions, or suggestions:

1. Check [SETUP_GUIDE.md](./SETUP_GUIDE.md)
2. Review [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
3. Check error messages in browser console
4. Review Supabase logs and metrics

## 🎓 Learning Path

New to this stack? Start here:

1. Read this README
2. Follow [SETUP_GUIDE.md](./SETUP_GUIDE.md)
3. Run the app locally
4. Browse the codebase
5. Check [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
6. Deploy to Vercel

## 🚀 Future Enhancements

- Payment integration (Razorpay/Stripe)
- Email notifications
- SMS notifications
- Advanced analytics
- Admin dashboard
- Multi-language support
- Advanced search filters
- Bulk booking
- Team management
- Cancellation policies

## 📞 Contact

For questions or issues, please create an issue in the repository.

---

**Version**: 1.0.0  
**Last Updated**: April 2024  
**Status**: Production Ready ✅
