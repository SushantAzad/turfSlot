# Turf Slot Booking API Documentation

## Base URL

- **Development**: http://localhost:3000
- **Production**: https://your-domain.com

## Authentication

All authenticated endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

The token is automatically handled by Supabase Auth and stored in the session.

---

## Authentication Endpoints

### Sign Up

**POST** `/api/auth/signup`

Creates a new user account.

**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "role": "user" // or "turf_owner"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "user",
    "full_name": "John Doe"
  },
  "message": "Account created successfully"
}
```

---

### Log In

**POST** `/api/auth/login`

Authenticates user and returns session token.

**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "user"
    },
    "session": {
      "access_token": "jwt_token",
      "refresh_token": "refresh_token"
    }
  },
  "message": "Login successful"
}
```

---

### Log Out

**POST** `/api/auth/logout`

Logs out the current user.

**Response**:

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Turf Endpoints

### List All Turfs (Public)

**GET** `/api/turfs`

Get all active turfs with pagination.

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 10, max: 100) |
| location | string | Filter by location |
| minPrice | number | Minimum price filter |
| maxPrice | number | Maximum price filter |

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Elite Sports Complex",
      "location": "Downtown",
      "price_per_slot": 500,
      "surface_type": "grass",
      "capacity": 11,
      "amenities": ["parking", "lights"],
      "is_active": "active"
    }
  ],
  "message": "Turfs retrieved successfully"
}
```

---

### Get Turf Details

**GET** `/api/turfs/:id`

Get detailed information about a specific turf.

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Elite Sports Complex",
    "description": "Professional turf with night lights",
    "location": "Downtown",
    "price_per_slot": 500,
    "surface_type": "grass",
    "capacity": 11,
    "opening_time": "09:00",
    "closing_time": "22:00",
    "amenities": ["parking", "lights", "changing_rooms"],
    "images_urls": ["url1", "url2"],
    "reviews": [
      {
        "rating": 5,
        "comment": "Great turf!",
        "user": "John Doe"
      }
    ],
    "average_rating": 4.5
  }
}
```

---

### Create Turf (Turf Owner Only)

**POST** `/api/turfs`

Create a new turf.

**Authorization**: Required (turf_owner role)

**Request Body**:

```json
{
  "name": "Elite Sports Complex",
  "description": "Professional turf",
  "location": "Downtown",
  "price_per_slot": 500,
  "surface_type": "grass",
  "capacity": 11,
  "amenities": ["parking", "lights"],
  "opening_time": "09:00",
  "closing_time": "22:00",
  "slot_duration_minutes": 60
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "owner_id": "uuid",
    "name": "Elite Sports Complex",
    ...
  },
  "message": "Turf created successfully"
}
```

---

### Update Turf (Turf Owner Only)

**PATCH** `/api/turfs/:id`

Update turf details.

**Authorization**: Required (turf owner must own the turf)

**Request Body**: Same as Create Turf (partial update)

**Response**: Updated turf object

---

### Delete Turf (Turf Owner Only)

**DELETE** `/api/turfs/:id`

Delete a turf (soft delete - marks as inactive).

**Response**:

```json
{
  "success": true,
  "message": "Turf deleted successfully"
}
```

---

## Availability Slots Endpoints

### Get Available Slots

**GET** `/api/slots`

Get available slots for a turf on a specific date range.

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| turfId | string | Yes | Turf ID |
| startDate | string | Yes | Start date (YYYY-MM-DD) |
| endDate | string | Yes | End date (YYYY-MM-DD) |

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "turf_id": "uuid",
      "slot_date": "2024-01-15",
      "start_time": "14:00",
      "end_time": "15:00",
      "is_booked": false
    }
  ]
}
```

---

### Create Slots (Turf Owner Only)

**POST** `/api/slots`

Create availability slots for a turf.

**Authorization**: Required (turf owner)

**Request Body**:

```json
{
  "turfId": "uuid",
  "slots": [
    {
      "slot_date": "2024-01-15",
      "start_time": "14:00",
      "end_time": "15:00"
    },
    {
      "slot_date": "2024-01-15",
      "start_time": "16:00",
      "end_time": "17:00"
    }
  ]
}
```

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "turf_id": "uuid",
      "slot_date": "2024-01-15",
      "start_time": "14:00",
      "end_time": "15:00"
    }
  ],
  "message": "Slots created successfully"
}
```

---

## Booking Endpoints

### Get My Bookings (Users)

**GET** `/api/bookings`

Get all bookings for the current user.

**Authorization**: Required

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by status (pending, approved, rejected, cancelled) |

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "turf_id": "uuid",
      "slot_id": "uuid",
      "status": "approved",
      "booking_date": "2024-01-10T10:00:00Z",
      "confirmation_date": "2024-01-10T10:05:00Z",
      "total_price": 500,
      "turf": { ... },
      "slot": { ... }
    }
  ]
}
```

---

### Get Turf Bookings (Turf Owner)

**GET** `/api/bookings/turf/:turfId`

Get all bookings for a turf.

**Authorization**: Required (must be turf owner)

**Response**: Array of bookings for that turf

---

### Create Booking

**POST** `/api/bookings`

Create a booking request.

**Authorization**: Required (user role)

**Request Body**:

```json
{
  "turf_id": "uuid",
  "slot_id": "uuid",
  "notes": "Evening game"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "turf_id": "uuid",
    "slot_id": "uuid",
    "status": "pending",
    "total_price": 500,
    "booking_date": "2024-01-10T10:00:00Z"
  },
  "message": "Booking request created successfully"
}
```

---

### Approve Booking (Turf Owner)

**PATCH** `/api/bookings/:id/approve`

Approve a booking request.

**Authorization**: Required (turf owner must own the turf)

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "approved",
    "confirmation_date": "2024-01-10T10:05:00Z"
  },
  "message": "Booking approved successfully"
}
```

---

### Reject Booking (Turf Owner)

**PATCH** `/api/bookings/:id/reject`

Reject a booking request.

**Authorization**: Required (turf owner)

**Request Body**:

```json
{
  "reason": "Not available at this time"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "rejected"
  },
  "message": "Booking rejected successfully"
}
```

---

### Cancel Booking

**PATCH** `/api/bookings/:id/cancel`

Cancel a booking.

**Authorization**: Required (user who made the booking)

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "cancelled"
  },
  "message": "Booking cancelled successfully"
}
```

---

## Review Endpoints

### Get Turf Reviews

**GET** `/api/reviews/turf/:turfId`

Get all reviews for a turf.

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| limit | number | Number of reviews (default: 10) |
| sort | string | Sort order: newest, oldest, highest, lowest |

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "rating": 5,
      "comment": "Great turf and friendly staff!",
      "user": {
        "id": "uuid",
        "full_name": "John Doe"
      },
      "created_at": "2024-01-10T10:00:00Z"
    }
  ],
  "average_rating": 4.5,
  "total_reviews": 20
}
```

---

### Create Review

**POST** `/api/reviews`

Create a review for a booked turf.

**Authorization**: Required

**Request Body**:

```json
{
  "booking_id": "uuid",
  "turf_id": "uuid",
  "rating": 5,
  "comment": "Excellent turf!"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "booking_id": "uuid",
    "turf_id": "uuid",
    "rating": 5,
    "comment": "Excellent turf!"
  },
  "message": "Review created successfully"
}
```

---

## Analytics Endpoints

### Get Turf Analytics (Turf Owner)

**GET** `/api/analytics/turf/:turfId`

Get analytics for a turf.

**Authorization**: Required (turf owner must own the turf)

**Response**:

```json
{
  "success": true,
  "data": {
    "total_bookings": 150,
    "total_revenue": 75000,
    "average_rating": 4.5,
    "total_reviews": 45,
    "occupancy_rate": 85,
    "revenue_trend": [
      {
        "month": "2024-01",
        "revenue": 12000,
        "bookings": 24
      }
    ]
  }
}
```

---

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "error": "Invalid input",
  "details": {
    "field": "email",
    "message": "Invalid email format"
  }
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "error": "Forbidden",
  "message": "You don't have permission to access this resource"
}
```

### 404 Not Found

```json
{
  "success": false,
  "error": "Not found",
  "message": "Resource not found"
}
```

### 409 Conflict

```json
{
  "success": false,
  "error": "Conflict",
  "message": "Slot already booked by another user"
}
```

### 429 Too Many Requests

```json
{
  "success": false,
  "error": "Too many requests",
  "message": "Rate limit exceeded. Please try again later."
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

---

## Rate Limiting

- **Window**: 60 seconds
- **Limit**: 100 requests per window per IP
- **Headers**:
  - `X-RateLimit-Limit`: 100
  - `X-RateLimit-Remaining`: 95
  - `X-RateLimit-Reset`: 1234567890

---

## Pagination

For list endpoints, use these query parameters:

| Parameter | Type   | Default | Max |
| --------- | ------ | ------- | --- |
| page      | number | 1       | -   |
| limit     | number | 10      | 100 |

**Response includes**:

```json
{
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

---

## Sorting

For list endpoints, use `sort` parameter:

**Format**: `field:asc` or `field:desc`

**Examples**:

- `?sort=created_at:desc`
- `?sort=price_per_slot:asc`

---

## Filtering

For list endpoints, use query parameters to filter:

**Examples**:

- `?location=downtown`
- `?minPrice=100&maxPrice=500`
- `?status=approved`
- `?surfaceType=grass`

---

## Real-time Updates

Using Supabase Real-time subscriptions:

```typescript
// Subscribe to booking changes
supabase
  .channel(`bookings:turf_${turfId}`)
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "bookings" },
    (payload) => {
      console.log("Change received!", payload);
    },
  )
  .subscribe();
```

---

**API Version**: 1.0
**Last Updated**: April 2024
