# Quick Reference Guide

## 🚀 5-Minute Quick Start

### 1. Setup

```bash
npm install
cp .env.example .env.local
# Edit .env.local with Supabase credentials
npm run dev
```

### 2. Database

- Go to Supabase Dashboard
- Copy-paste `DATABASE_SCHEMA.sql` into SQL Editor
- Run it

### 3. Test

- Visit http://localhost:3000
- Signup as owner and player
- Test booking workflow

---

## 📝 Common Commands

### Development

```bash
npm run dev                 # Start dev server
npm run build              # Build for production
npm run start              # Start production server
npm run lint              # Run ESLint
npm run type-check        # Check TypeScript
```

### Database

```bash
# Run SQL schema
# Go to Supabase > SQL Editor > paste DATABASE_SCHEMA.sql > Run

# View data
# Go to Supabase > Table Editor
```

### Git

```bash
git add .
git commit -m "message"
git push origin main
```

---

## 🏗️ File Locations

### Authentication

- Pages: `/app/auth/login`, `/app/auth/signup`
- Logic: `/lib/auth/utils.ts`
- Hooks: `/hooks/useAuth.ts`

### Turfs

- Owner Pages: `/app/dashboard/owner/turfs`
- Queries: `/lib/supabase/queries.ts` → `turfQueries`
- Types: `/types/index.ts` → `Turf`

### Bookings

- User Pages: `/app/dashboard/user/bookings`
- Owner Pages: `/app/dashboard/owner/bookings`
- Queries: `/lib/supabase/queries.ts` → `bookingQueries`
- Types: `/types/index.ts` → `Booking`

### Styles

- Global: `/app/globals.css`
- Tailwind: `/tailwind.config.ts`

### Types & Validation

- Types: `/types/index.ts`
- Validation: `/lib/validation.ts`

---

## 🔗 API Query Patterns

### Fetch Data

```typescript
// In component
const { turfs, isLoading } = useTurfs();

// Or manual
const turfs = await turfQueries.getAll();
```

### Create/Update

```typescript
const result = await turfQueries.create(ownerId, turfData);
const result = await turfQueries.update(turfId, updateData);
```

### Submit Form

```typescript
const { mutate, isLoading } = useMutation(async (data) => {
  return await turfQueries.create(userId, data);
});

mutate(formData);
```

---

## 🎨 Component Patterns

### Basic Page

```typescript
'use client';

import { useAuth } from '@/hooks/useAuth';

export default function MyPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>Not authenticated</div>;

  return <div>Welcome {user.full_name}</div>;
}
```

### Form with Validation

```typescript
'use client';

import { useState } from 'react';
import { MySchema } from '@/lib/validation';
import { ZodError } from 'zod';

export default function MyForm() {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      MySchema.parse(formData);
      // Submit
    } catch (err: any) {
      if (err instanceof ZodError) {
        setErrors(/* convert to map */);
      }
    }
  };

  return <form onSubmit={submit}>{/* form */}</form>;
}
```

### Data Display

```typescript
const { turfs, isLoading } = useTurfs();

return (
  <div>
    {isLoading && <div>Loading...</div>}
    {turfs.length === 0 && <div>No turfs</div>}
    {turfs.map(turf => <TurfCard key={turf.id} turf={turf} />)}
  </div>
);
```

---

## 🗄️ Database Query Reference

### Users

```typescript
userQueries.getById(id);
userQueries.getByEmail(email);
userQueries.create(user);
userQueries.update(id, updates);
```

### Turfs

```typescript
turfQueries.getAll(limit, offset);
turfQueries.getById(id);
turfQueries.getByOwnerId(ownerId);
turfQueries.create(ownerId, turf);
turfQueries.update(id, updates);
turfQueries.search(query, limit);
```

### Slots

```typescript
slotQueries.getByTurfAndDate(turfId, date);
slotQueries.getAvailableSlots(turfId, startDate, endDate);
slotQueries.create(slot);
slotQueries.createBulk(slots);
```

### Bookings

```typescript
bookingQueries.getById(id);
bookingQueries.getUserBookings(userId);
bookingQueries.getTurfBookings(turfId);
bookingQueries.create(booking);
bookingQueries.updateStatus(id, status);
bookingQueries.cancel(id, reason);
```

---

## ✅ Validation Examples

### Turf

```typescript
import { TurfSchema } from "@/lib/validation";

TurfSchema.parse({
  name: "My Turf",
  location: "Downtown",
  price_per_slot: 500,
  // ... other fields
});
```

### Booking

```typescript
import { BookingSchema } from "@/lib/validation";

BookingSchema.parse({
  slot_id: "uuid",
  turf_id: "uuid",
  notes: "Evening game",
});
```

---

## 🔐 Authentication Patterns

### Protected Page

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function ProtectedPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) return <div>Loading...</div>;

  return <div>Protected content</div>;
}
```

### Role Check

```typescript
if (user?.role !== 'turf_owner') {
  return <div>Access denied</div>;
}
```

### Login

```typescript
const { login } = useAuthMutations();

const result = await login(email, password);
if (result.error) {
  toast.error(result.error);
} else {
  router.push("/dashboard");
}
```

---

## 🎯 Error Handling

### Try-Catch

```typescript
try {
  const result = await turfQueries.create(ownerId, data);
  toast.success("Created!");
} catch (err: any) {
  toast.error(err.message);
}
```

### Validation Errors

```typescript
try {
  TurfSchema.parse(data);
} catch (err: any) {
  if (err instanceof ZodError) {
    const errors = err.errors.reduce((acc, e) => {
      acc[e.path[0]] = e.message;
      return acc;
    }, {});
    setErrors(errors);
  }
}
```

---

## 📱 Responsive Classes (Tailwind)

```
Grid responsive:      grid-cols-1 md:grid-cols-2 lg:grid-cols-3
Padding responsive:   p-4 md:p-6 lg:p-8
Font size:            text-base md:text-lg lg:text-xl
Display:              block sm:hidden md:block
Flexbox gap:          gap-2 md:gap-4 lg:gap-6
```

---

## 🔄 Real-time Subscription

```typescript
const channel = supabase
  .channel("booking-updates")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "bookings",
      filter: `turf_id=eq.${turfId}`,
    },
    (payload) => {
      console.log("New booking!", payload);
    },
  )
  .subscribe();

// Cleanup
channel.unsubscribe();
```

---

## 📊 Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🚀 Deployment Checklist

- [ ] All env vars set in Vercel
- [ ] Database schema deployed
- [ ] Auth redirect URLs configured
- [ ] RLS policies verified
- [ ] Test login/signup
- [ ] Test booking workflow
- [ ] Monitor logs

---

## 📞 Key Files to Know

| File                       | Purpose              |
| -------------------------- | -------------------- |
| `/types/index.ts`          | All type definitions |
| `/lib/validation.ts`       | All Zod schemas      |
| `/lib/supabase/queries.ts` | All database queries |
| `/lib/auth/utils.ts`       | Auth functions       |
| `/hooks/useAuth.ts`        | Auth hooks           |
| `/app/globals.css`         | Global styles        |

---

## 🆘 Common Issues & Fixes

### "Supabase credentials not found"

- Check `.env.local` exists
- Verify NEXT_PUBLIC_SUPABASE_URL is set
- Restart dev server

### "Table not found"

- Run DATABASE_SCHEMA.sql in Supabase
- Check table names match exactly

### "CORS error"

- Add domain to Supabase > Settings > Auth > Redirect URLs
- Format: `http://localhost:3000/auth/callback` (local)

### "Can't book same slot twice"

- This is correct! Unique constraint prevents double-booking
- Only one approved booking per slot allowed

### "Booking stuck as pending"

- Owner needs to approve booking
- Check owner dashboard > bookings

---

**Last Updated**: April 2024  
**For full docs, see**: README.md, SETUP_GUIDE.md, API_DOCUMENTATION.md
