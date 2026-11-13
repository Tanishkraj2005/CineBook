# CineBook REST API Specification

This document details the REST API contracts, authentication headers, request payloads, and response envelopes for the CineBook Cinema Ticket Booking Platform.

---

## 1. Global Standards & Envelope Format

### Base URL
- Local: `http://localhost:5000/api`

### Headers
- `Content-Type: application/json`
- `Authorization: Bearer <jwt-token>` (for protected and admin routes)

### Standard Response Envelope
All endpoints return a uniform JSON format:

```json
{
  "success": true,
  "message": "Human readable description",
  "data": { ... }
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed validation or system message"
}
```

---

## 2. Authentication Endpoints (`/api/auth`)

### Register Customer
- **Endpoint:** `POST /api/auth/register`
- **Access:** Public
- **Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "Password@123",
    "phone": "9876543210"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Registration successful",
    "data": {
      "user": { "_id": "...", "name": "Jane Doe", "email": "jane@example.com", "role": "customer" },
      "token": "eyJhbGciOi..."
    }
  }
  ```

### Login
- **Endpoint:** `POST /api/auth/login`
- **Access:** Public
- **Body:**
  ```json
  { "email": "admin@cinebook.com", "password": "Admin@123" }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "user": { "_id": "...", "name": "Admin", "email": "admin@cinebook.com", "role": "admin" },
      "token": "eyJhbGciOi..."
    }
  }
  ```

### Get Authenticated Profile
- **Endpoint:** `GET /api/auth/me`
- **Access:** Protected (Bearer token)

---

## 3. Movie Catalog Endpoints (`/api/movies`)

### List Movies
- **Endpoint:** `GET /api/movies`
- **Access:** Public
- **Query Parameters:** `page`, `limit`, `genre`, `language`, `status` (`now_showing` | `coming_soon`), `search`, `sort` (`newest` | `popularity` | `rating`)

### Get Movie Details
- **Endpoint:** `GET /api/movies/:id`
- **Access:** Public

### Add New Movie
- **Endpoint:** `POST /api/movies`
- **Access:** Admin Only
- **Body:**
  ```json
  {
    "title": "Pushpa 2: The Rule",
    "description": "High-octane action saga...",
    "genre": ["Action", "Drama", "Crime"],
    "duration": 190,
    "language": ["Hindi", "Telugu", "Tamil"],
    "poster": "https://m.media-amazon.com/...",
    "banner": "https://i.ytimg.com/vi/...",
    "releaseDate": "2024-12-05",
    "certification": "U/A",
    "cast": [{ "name": "Allu Arjun", "role": "Pushpa Raj" }],
    "director": "Sukumar",
    "trailerUrl": "https://www.youtube.com/watch?v=g3JUbgOHgdw",
    "status": "now_showing"
  }
  ```

### Update / Delete Movie
- **Endpoints:** `PUT /api/movies/:id` | `DELETE /api/movies/:id`
- **Access:** Admin Only

---

## 4. Show & Screen Endpoints (`/api/shows`)

### List Screenings
- **Endpoint:** `GET /api/shows`
- **Query Parameters:** `movieId`, `cinemaId`, `date` (`YYYY-MM-DD`)

### Get Shows Grouped by Movie
- **Endpoint:** `GET /api/shows/movie/:movieId`
- **Access:** Public (Returns nested structure: `City -> Cinema -> Dates -> Time Slots`)

### Create Show
- **Endpoint:** `POST /api/shows`
- **Access:** Admin Only
- **Collision Protection:** Automatically checks and blocks overlapping showtimes on the same screen.

---

## 5. Seat Reservation & Locking (`/api/seats`)

### Get Seat Map & Availability
- **Endpoint:** `GET /api/shows/:showId/seats`
- **Access:** Public
- **Returns:** Audited grid of rows, seat numbers, categories (`standard`, `premium`, `recliner`), prices, and live status (`available`, `locked`, `booked`).

### Atomic Seat Hold
- **Endpoint:** `POST /api/seats/lock`
- **Access:** Protected
- **Body:**
  ```json
  {
    "showId": "65b...",
    "seats": [{ "row": "D", "seatNumber": 1 }, { "row": "D", "seatNumber": 2 }]
  }
  ```
- **Behavior:** Locks seats for 10 minutes. If already locked or booked, returns `400 Conflict`.

### Release Seat Hold
- **Endpoint:** `POST /api/seats/unlock` | `DELETE /api/seats/lock`
- **Access:** Protected

---

## 6. Bookings & Ticket Issuance (`/api/bookings`)

### Create Pending Booking
- **Endpoint:** `POST /api/bookings`
- **Access:** Protected
- **Body:** `{ "showId": "...", "seats": [...] }`
- **Verification:** Ensures caller holds valid non-expired locks on all requested seats.

### Cancel Booking
- **Endpoint:** `PUT /api/bookings/:id/cancel`
- **Access:** Protected (Owner or Admin)
- **Constraint:** Only allowed at least 1 hour before scheduled showtime. Releases seats back to public pool and marks `paymentStatus: 'refunded'`.

### Gate Entry QR Verification
- **Endpoint:** `POST /api/bookings/verify-ticket`
- **Access:** Admin / Staff Only
- **Body:**
  ```json
  { "ticketIdentifier": "CINEBOOK-VERIFY-CB-5PVS0FUO" }
  ```
- **Responses:**
  - `200 OK`: Ticket validated. Attendee admitted.
  - `400 Bad Request`: Ticket was cancelled/refunded or payment unconfirmed.
  - `409 Conflict`: Ticket was **ALREADY ADMITTED** (prevents double entry).

---

## 7. Payments & Checkout (`/api/payments`)

### Initiate Payment
- **Endpoint:** `POST /api/payments/create`
- **Body:** `{ "bookingId": "...", "paymentMethod": "upi" | "card" | "cash" }`

### Verify Simulated Payment
- **Endpoint:** `POST /api/payments/verify`
- **Body:** `{ "paymentId": "...", "transactionId": "..." }`
- **Result:** Transitions booking to `confirmed`, permanently adds seats to `show.bookedSeats`, removes temporary locks, and writes to `AuditLog`.

---

## 8. Admin Reports & Occupancy (`/api/admin`)

### Dashboard Metrics
- **Endpoint:** `GET /api/admin/dashboard`
- **Access:** Admin Only
- **Returns:** Gross turnover, total bookings, customer counts, monthly and weekly Recharts trends.

### Occupancy Reconciliation & Audit Trail
- **Endpoint:** `GET /api/admin/reports`
- **Access:** Admin Only
- **Returns:**
  - `occupancyReport`: Capacity, confirmed seats, cancelled seats, available seats, and occupancy percentage per screening.
  - `auditLogs`: Chronological immutable record of business mutations (`TICKET_ADMITTED`, `BOOKING_CANCELLED`, `PAYMENT_COMPLETED`).

