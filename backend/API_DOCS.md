# GST Backend — API Documentation

> **Base URL:** `http://localhost:5000/api`  
> **Content-Type:** `application/json`  
> **Rate Limit:** 200 req / 15 min (global) · 20 req / 15 min (auth endpoints)

---

## Authentication

All protected endpoints require a **Bearer token** in the `Authorization` header:

```
Authorization: Bearer <accessToken>
```

Access tokens expire in **15 minutes**. Use the refresh endpoint to obtain a new one.

---

## 🟢 Health Check

### `GET /api/health`

> Public · No authentication required

**Response `200`:**
```json
{
  "success": true,
  "message": "GST API is running",
  "timestamp": "2026-06-29T05:30:00.000Z"
}
```

---

## 🔐 Auth — `/api/auth`

### `POST /api/auth/register`

> Public · Rate limited (20/15min)

Creates a new user account and returns tokens.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass1",
  "firstName": "John",
  "lastName": "Doe"
}
```

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `email` | string | ✅ | Valid email |
| `password` | string | ✅ | Min 8 chars, 1 uppercase, 1 number |
| `firstName` | string | ✅ | Max 100 chars |
| `lastName` | string | ✅ | Max 100 chars |

**Response `201`:**
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "accessToken": "<jwt_access_token>",
    "refreshToken": "<jwt_refresh_token>",
    "user": {
      "id": 1,
      "email": "john.doe@example.com",
      "role": "member"
    }
  }
}
```

---

### `POST /api/auth/login`

> Public · Rate limited (20/15min)

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass1"
}
```

| Field | Type | Required |
|-------|------|----------|
| `email` | string | ✅ |
| `password` | string | ✅ |

**Response `200`:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "<jwt_access_token>",
    "refreshToken": "<jwt_refresh_token>",
    "user": {
      "id": 1,
      "email": "john.doe@example.com",
      "role": "member"
    }
  }
}
```

---

### `POST /api/auth/refresh`

> Public · Rate limited (20/15min)

Rotates both tokens (old refresh token is revoked).

**Request Body:**
```json
{
  "refreshToken": "<jwt_refresh_token>"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "accessToken": "<new_access_token>",
    "refreshToken": "<new_refresh_token>"
  }
}
```

---

### `POST /api/auth/logout`

> Public (token optional — used to revoke the refresh token)

**Request Body:**
```json
{
  "refreshToken": "<jwt_refresh_token>"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### `POST /api/auth/logout-all`

> 🔒 Authenticated — revokes ALL sessions for the current user

**Headers:** `Authorization: Bearer <accessToken>`

**Response `200`:**
```json
{
  "success": true,
  "message": "All sessions terminated"
}
```

---

### `GET /api/auth/me`

> 🔒 Authenticated

Returns the currently authenticated user's info.

**Headers:** `Authorization: Bearer <accessToken>`

**Response `200`:**
```json
{
  "success": true,
  "message": "Current user",
  "data": {
    "id": 1,
    "email": "john.doe@example.com",
    "role": "member"
  }
}
```

---

## 👥 Members — `/api/members`

### `GET /api/members/executive`

> Public · No authentication required

Returns all executive board members.

**Response `200`:**
```json
{
  "success": true,
  "message": "Executive board",
  "data": [...]
}
```

---

### `GET /api/members/executive/:id`

> Public · No authentication required

Returns a single executive board member by ID.

**Path Params:** `id` — integer

**Response `200`:**
```json
{
  "success": true,
  "message": "Executive profile",
  "data": { ... }
}
```

---

### `POST /api/members/apply`

> 🔒 Authenticated (member)

Submit a membership application.

**Headers:** `Authorization: Bearer <accessToken>`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "linkedin_url": "https://linkedin.com/in/johndoe",
  "company": "Acme Corp",
  "job_title": "Software Engineer",
  "experience": "5 years in software development",
  "industry": "Technology",
  "motivation": "I want to contribute to the GST community",
  "referred": false,
  "tier": "professional"
}
```

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `firstName` | string | ✅ | — |
| `lastName` | string | ✅ | — |
| `email` | string | ✅ | Valid email |
| `phone` | string | ❌ | Valid mobile phone |
| `linkedin_url` | string | ❌ | Valid URL |
| `company` | string | ❌ | Max 255 chars |
| `job_title` | string | ❌ | Max 255 chars |
| `experience` | string | ❌ | — |
| `industry` | string | ❌ | — |
| `motivation` | string | ❌ | — |
| `referred` | boolean | ❌ | — |
| `tier` | string | ❌ | `student` \| `professional` \| `corporate` |

**Response `201`:**
```json
{
  "success": true,
  "message": "Membership application submitted successfully"
}
```

---

### `GET /api/members/me`

> 🔒 Authenticated (member)

Returns the authenticated user's own membership profile.

**Headers:** `Authorization: Bearer <accessToken>`

**Response `200`:**
```json
{
  "success": true,
  "message": "Profile",
  "data": { ... }
}
```

---

### `PUT /api/members/me`

> 🔒 Authenticated (member)

Updates the authenticated user's membership profile.

**Headers:** `Authorization: Bearer <accessToken>`

**Request Body:** *(any member fields to update)*
```json
{
  "phone": "+9876543210",
  "company": "New Corp",
  "job_title": "Senior Engineer"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Profile updated",
  "data": { ... }
}
```

---

### `GET /api/members`

> 🔒 Admin only

List all members with pagination and filtering.

**Headers:** `Authorization: Bearer <accessToken>`

**Query Parameters:**

| Param | Type | Default | Options |
|-------|------|---------|---------|
| `page` | int | 1 | min: 1 |
| `limit` | int | — | 1–100 |
| `search` | string | — | Name/email search |
| `status` | string | — | `pending` \| `active` \| `inactive` |
| `tier` | string | — | `student` \| `professional` \| `corporate` |
| `sort` | string | — | `joined_at` \| `first_name` \| `last_name` \| `status` |
| `order` | string | — | `asc` \| `desc` |

**Example:** `GET /api/members?status=active&tier=professional&page=1&limit=20`

**Response `200`:**
```json
{
  "success": true,
  "message": "Members list",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

---

### `GET /api/members/:id`

> 🔒 Admin only

**Headers:** `Authorization: Bearer <accessToken>`

**Path Params:** `id` — integer

**Response `200`:**
```json
{
  "success": true,
  "message": "Member detail",
  "data": { ... }
}
```

---

### `PATCH /api/members/:id/status`

> 🔒 Admin only

**Headers:** `Authorization: Bearer <accessToken>`

**Path Params:** `id` — integer

**Request Body:**
```json
{
  "status": "active"
}
```

| Field | Type | Required | Options |
|-------|------|----------|---------|
| `status` | string | ✅ | `pending` \| `active` \| `inactive` |

**Response `200`:**
```json
{
  "success": true,
  "message": "Member status updated"
}
```

---

### `DELETE /api/members/:id`

> 🔒 Admin only

**Headers:** `Authorization: Bearer <accessToken>`

**Path Params:** `id` — integer

**Response `200`:**
```json
{
  "success": true,
  "message": "Member deleted"
}
```

---

## 📅 Events — `/api/events`

### `GET /api/events`

> Public (optional auth)

List all events with pagination and filtering.

**Query Parameters:**

| Param | Type | Options |
|-------|------|---------|
| `page` | int | min: 1 |
| `limit` | int | 1–100 |
| `search` | string | Full-text search |
| `status` | string | `upcoming` \| `past` \| `draft` \| `cancelled` |
| `category` | string | — |
| `type` | string | — |
| `sort` | string | `event_date` \| `title` \| `created_at` |
| `order` | string | `asc` \| `desc` |

**Example:** `GET /api/events?status=upcoming&sort=event_date&order=asc`

**Response `200`:**
```json
{
  "success": true,
  "message": "Events list",
  "data": [...],
  "pagination": { "page": 1, "limit": 10, "total": 50 }
}
```

---

### `GET /api/events/:id`

> Public

**Path Params:** `id` — integer

**Response `200`:**
```json
{
  "success": true,
  "message": "Event detail",
  "data": { ... }
}
```

---

### `POST /api/events/:id/register`

> Public (optional auth — if authenticated, `user_id` is linked automatically)

Register for an event.

**Path Params:** `id` — event integer ID

**Request Body:**
```json
{
  "attendee_name": "Jane Smith",
  "attendee_email": "jane.smith@example.com",
  "company": "Tech Inc",
  "attendee_type": "guest",
  "payment_method": "card"
}
```

| Field | Type | Required | Options |
|-------|------|----------|---------|
| `attendee_name` | string | ✅ | — |
| `attendee_email` | string | ✅ | Valid email |
| `company` | string | ❌ | — |
| `attendee_type` | string | ❌ | `member` \| `guest` |
| `payment_method` | string | ❌ | `card` \| `at_door` \| `waived` |

**Response `201`:**
```json
{
  "success": true,
  "message": "Registration confirmed",
  "data": {
    "registration_id": 42
  }
}
```

---

### `POST /api/events`

> 🔒 Admin only

Create a new event.

**Headers:** `Authorization: Bearer <accessToken>`

**Request Body:**
```json
{
  "title": "GST Annual Conference 2026",
  "event_type": "Conference",
  "event_date": "2026-09-15",
  "status": "upcoming",
  "location_type": "physical",
  "capacity": 200,
  "featured": true,
  "description": "Annual gathering of GST professionals",
  "location": "Convention Center, New York",
  "ticket_price": 50.00
}
```

| Field | Type | Required | Options |
|-------|------|----------|---------|
| `title` | string | ✅ | — |
| `event_type` | string | ✅ | — |
| `event_date` | string | ✅ | Format: `YYYY-MM-DD` |
| `status` | string | ❌ | `upcoming` \| `past` \| `draft` \| `cancelled` |
| `location_type` | string | ❌ | `online` \| `physical` |
| `capacity` | int | ❌ | min: 0 |
| `featured` | boolean | ❌ | — |

**Response `201`:**
```json
{
  "success": true,
  "message": "Event created",
  "data": { ... }
}
```

---

### `PUT /api/events/:id`

> 🔒 Admin only

Update an existing event.

**Headers:** `Authorization: Bearer <accessToken>`

**Path Params:** `id` — integer

**Request Body:** *(any event fields to update)*
```json
{
  "title": "Updated Event Title",
  "status": "cancelled"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Event updated",
  "data": { ... }
}
```

---

### `DELETE /api/events/:id`

> 🔒 Admin only

**Headers:** `Authorization: Bearer <accessToken>`

**Path Params:** `id` — integer

**Response `200`:**
```json
{
  "success": true,
  "message": "Event deleted"
}
```

---

### `GET /api/events/:id/registrations`

> 🔒 Admin only

Get all registrations for a specific event.

**Headers:** `Authorization: Bearer <accessToken>`

**Path Params:** `id` — integer

**Response `200`:**
```json
{
  "success": true,
  "message": "Event registrations",
  "data": [...]
}
```

---

## 📚 Resources — `/api/resources`

### `GET /api/resources`

> Public (optional auth — members may see extra content)

**Query Parameters:**

| Param | Type | Options |
|-------|------|---------|
| `page` | int | min: 1 |
| `limit` | int | 1–100 |
| `search` | string | — |
| `year` | int | min: 2000 |
| `category` | string | — |
| `access` | string | `public` \| `members` |

**Example:** `GET /api/resources?category=Tax&year=2025&access=public`

**Response `200`:**
```json
{
  "success": true,
  "message": "Resources list",
  "data": [...],
  "pagination": { ... }
}
```

---

### `GET /api/resources/:id`

> Public (optional auth)

**Path Params:** `id` — integer

**Response `200`:**
```json
{
  "success": true,
  "message": "Resource detail",
  "data": { ... }
}
```

---

### `POST /api/resources`

> 🔒 Admin only

**Headers:** `Authorization: Bearer <accessToken>`

**Request Body:**
```json
{
  "title": "GST Filing Guide 2026",
  "access": "public",
  "has_video": true,
  "has_slides": false,
  "has_paper": true,
  "year": 2026,
  "category": "Tax Filing",
  "description": "Comprehensive guide to GST filing",
  "video_url": "https://example.com/video",
  "slides_url": "https://example.com/slides",
  "paper_url": "https://example.com/paper"
}
```

| Field | Type | Required | Options |
|-------|------|----------|---------|
| `title` | string | ✅ | — |
| `access` | string | ❌ | `public` \| `members` |
| `has_video` | boolean | ❌ | — |
| `has_slides` | boolean | ❌ | — |
| `has_paper` | boolean | ❌ | — |
| `year` | int | ❌ | 2000–2100 |

**Response `201`:**
```json
{
  "success": true,
  "message": "Resource created",
  "data": { ... }
}
```

---

### `PUT /api/resources/:id`

> 🔒 Admin only

**Headers:** `Authorization: Bearer <accessToken>`

**Path Params:** `id` — integer

**Request Body:** *(any resource fields to update)*

**Response `200`:**
```json
{
  "success": true,
  "message": "Resource updated",
  "data": { ... }
}
```

---

### `DELETE /api/resources/:id`

> 🔒 Admin only

**Headers:** `Authorization: Bearer <accessToken>`

**Path Params:** `id` — integer

**Response `200`:**
```json
{
  "success": true,
  "message": "Resource deleted"
}
```

---

## 💰 Donations — `/api/donations`

### `POST /api/donations`

> Public (optional auth — if authenticated, donor linked to account)

Submit a donation.

**Request Body:**
```json
{
  "donor_email": "donor@example.com",
  "amount": 100.00,
  "donor_name": "Jane Doe",
  "is_monthly": false,
  "payment_method": "card"
}
```

| Field | Type | Required | Options |
|-------|------|----------|---------|
| `donor_email` | string | ✅ | Valid email |
| `amount` | float | ✅ | min: 1 |
| `donor_name` | string | ❌ | — |
| `is_monthly` | boolean | ❌ | — |
| `payment_method` | string | ❌ | `card` \| `paypal` \| `check` |

**Response `201`:**
```json
{
  "success": true,
  "message": "Donation recorded",
  "data": { ... }
}
```

---

### `GET /api/donations`

> 🔒 Admin only

List all donations.

**Headers:** `Authorization: Bearer <accessToken>`

**Response `200`:**
```json
{
  "success": true,
  "message": "Donations list",
  "data": [...]
}
```

---

## 📩 Contact — `/api/contact`

### `POST /api/contact`

> Public

Submit a contact/inquiry form.

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "john.smith@example.com",
  "subject": "Membership Inquiry",
  "message": "I would like to know more about the membership tiers and benefits."
}
```

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `name` | string | ✅ | — |
| `email` | string | ✅ | Valid email |
| `subject` | string | ✅ | — |
| `message` | string | ✅ | Min 10 chars |

**Response `201`:**
```json
{
  "success": true,
  "message": "Message received",
  "data": { ... }
}
```

---

### `POST /api/contact/newsletter`

> Public

Subscribe to the newsletter.

**Request Body:**
```json
{
  "email": "subscriber@example.com"
}
```

**Response `201`:**
```json
{
  "success": true,
  "message": "Subscribed successfully",
  "data": { ... }
}
```

---

### `GET /api/contact/inquiries`

> 🔒 Admin only

List all contact inquiries.

**Headers:** `Authorization: Bearer <accessToken>`

**Response `200`:**
```json
{
  "success": true,
  "message": "Inquiries list",
  "data": [...]
}
```

---

## 🤝 Sponsors — `/api/sponsors`

### `POST /api/sponsors/enquiry`

> Public

Submit a sponsorship enquiry.

**Request Body:**
```json
{
  "company_name": "Tech Solutions Ltd",
  "contact_name": "Alice Johnson",
  "email": "alice@techsolutions.com",
  "phone": "+1234567890",
  "tier_interest": "Gold",
  "message": "We are interested in sponsoring the annual conference."
}
```

| Field | Type | Required | Options |
|-------|------|----------|---------|
| `company_name` | string | ✅ | — |
| `contact_name` | string | ✅ | — |
| `email` | string | ✅ | Valid email |
| `phone` | string | ❌ | — |
| `tier_interest` | string | ❌ | `Bronze` \| `Silver` \| `Gold` \| `Platinum` \| `Custom` |
| `message` | string | ❌ | — |

**Response `201`:**
```json
{
  "success": true,
  "message": "Enquiry submitted",
  "data": { ... }
}
```

---

### `GET /api/sponsors/enquiries`

> 🔒 Admin only

List all sponsorship enquiries.

**Headers:** `Authorization: Bearer <accessToken>`

**Response `200`:**
```json
{
  "success": true,
  "message": "Enquiries list",
  "data": [...]
}
```

---

## ⚙️ Admin — `/api/admin`

> All admin routes require: `Authorization: Bearer <adminAccessToken>`

### `GET /api/admin/stats`

Returns dashboard statistics (member counts, event counts, donations, etc.).

**Response `200`:**
```json
{
  "success": true,
  "message": "Dashboard stats",
  "data": { ... }
}
```

---

### `GET /api/admin/audit`

Returns the audit log with pagination.

**Query Parameters:**

| Param | Type |
|-------|------|
| `page` | int |
| `limit` | int |

**Response `200`:**
```json
{
  "success": true,
  "message": "Audit log",
  "data": [...],
  "pagination": { ... }
}
```

---

## ❌ Error Response Format

All errors follow this consistent format:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "errors": [ ... ]
}
```

### Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | OK |
| `201` | Created |
| `400` | Bad Request / Validation Error |
| `401` | Unauthorized (missing or invalid token) |
| `403` | Forbidden (insufficient role) |
| `404` | Not Found |
| `409` | Conflict (e.g., duplicate email) |
| `429` | Too Many Requests (rate limited) |
| `500` | Internal Server Error |

---

## 🔑 Quick Reference — Endpoint Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | None | Health check |
| POST | `/api/auth/register` | None | Register |
| POST | `/api/auth/login` | None | Login |
| POST | `/api/auth/refresh` | None | Refresh token |
| POST | `/api/auth/logout` | None | Logout |
| POST | `/api/auth/logout-all` | 🔒 Member | Revoke all sessions |
| GET | `/api/auth/me` | 🔒 Member | Current user |
| GET | `/api/members/executive` | None | Executive board list |
| GET | `/api/members/executive/:id` | None | Single executive |
| POST | `/api/members/apply` | 🔒 Member | Apply for membership |
| GET | `/api/members/me` | 🔒 Member | Own profile |
| PUT | `/api/members/me` | 🔒 Member | Update own profile |
| GET | `/api/members` | 🔑 Admin | List all members |
| GET | `/api/members/:id` | 🔑 Admin | Single member |
| PATCH | `/api/members/:id/status` | 🔑 Admin | Update member status |
| DELETE | `/api/members/:id` | 🔑 Admin | Delete member |
| GET | `/api/events` | None | List events |
| GET | `/api/events/:id` | None | Single event |
| POST | `/api/events/:id/register` | Optional | Register for event |
| POST | `/api/events` | 🔑 Admin | Create event |
| PUT | `/api/events/:id` | 🔑 Admin | Update event |
| DELETE | `/api/events/:id` | 🔑 Admin | Delete event |
| GET | `/api/events/:id/registrations` | 🔑 Admin | Event registrations |
| GET | `/api/resources` | Optional | List resources |
| GET | `/api/resources/:id` | Optional | Single resource |
| POST | `/api/resources` | 🔑 Admin | Create resource |
| PUT | `/api/resources/:id` | 🔑 Admin | Update resource |
| DELETE | `/api/resources/:id` | 🔑 Admin | Delete resource |
| POST | `/api/donations` | Optional | Submit donation |
| GET | `/api/donations` | 🔑 Admin | List donations |
| POST | `/api/contact` | None | Contact form |
| POST | `/api/contact/newsletter` | None | Newsletter signup |
| GET | `/api/contact/inquiries` | 🔑 Admin | List inquiries |
| POST | `/api/sponsors/enquiry` | None | Sponsor enquiry |
| GET | `/api/sponsors/enquiries` | 🔑 Admin | List enquiries |
| GET | `/api/admin/stats` | 🔑 Admin | Dashboard stats |
| GET | `/api/admin/audit` | 🔑 Admin | Audit log |
