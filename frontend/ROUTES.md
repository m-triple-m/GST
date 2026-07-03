# GST Frontend — URL Hierarchy

> **Base URL:** `http://localhost:5173` (Vite dev server)
>
> Last updated: 2026-06-30

---

## 🌐 Public Routes

*Accessible by anyone — wrapped in `PageLayout` (Navbar + Footer)*

| URL                | Component                | Description                                            |
| ------------------ | ------------------------ | ------------------------------------------------------ |
| `/`              | `HomePage`             | Landing page with hero, membership CTA, events preview |
| `/events`        | `EventsPage`           | Full event listing                                     |
| `/events/:id`    | `EventDetailPage`      | Single event detail                                    |
| `/membership`    | `MembershipPage`       | 4-step public membership application form              |
| `/executive`     | `ExecutiveBoardPage`   | Executive board directory                              |
| `/executive/:id` | `ExecutiveProfilePage` | Individual executive profile                           |
| `/resources`     | `ResourcesPage`        | Downloadable resources & publications                  |
| `/donate`        | `DonatePage`           | Donation form                                          |
| `/about`         | `AboutPage`            | About GST                                              |
| `/contact`       | `ContactPage`          | Contact form                                           |
| `/sponsor`       | `SponsorPage`          | Sponsorship information                                |

---

## 🔓 Public — Fullscreen Routes

*No Navbar or Footer wrapper*

| URL               | Component            | Description                               |
| ----------------- | -------------------- | ----------------------------------------- |
| `/login`        | `LoginPage`        | Login form (fullscreen)                   |
| `/unauthorized` | `UnauthorizedPage` | Shown when a user lacks the required role |

---

## 🔒 Member Routes

*Requires login — role: `member`, `executive`, or `admin`*

### Dashboard Layout (sidebar) — all members

| URL            | Component         | Description                                              |
| -------------- | ----------------- | -------------------------------------------------------- |
| `/dashboard` | `DashboardPage` | Member dashboard — participated events, profile summary |

### Dashboard Layout (sidebar) — executive + admin only

| URL                       | Component             | Description                    |
| ------------------------- | --------------------- | ------------------------------ |
| `/dashboard/events/new` | `ScheduleEventPage` | Schedule / propose a new event |

### Page Layout (Navbar + Footer) — all members

| URL                      | Component             | Description                   |
| ------------------------ | --------------------- | ----------------------------- |
| `/events/:id/register` | `RegisterEventPage` | Register for a specific event |
| `/cart`                | `CartPage`          | Shopping cart                 |
| `/checkout`            | `CheckoutPage`      | Checkout / payment            |

---

## 🛡️ Admin Routes

*Requires login — role: `admin` only — wrapped in `AdminLayout`*

| URL                | Component          | Description                                                          |
| ------------------ | ------------------ | -------------------------------------------------------------------- |
| `/admin`         | `AdminDashboard` | Admin overview: stats, pending apps, recent activity                 |
| `/admin/members` | `AdminMembers`   | Member management: approve, deactivate, promote to executive, delete |
| `/admin/events`  | `AdminEvents`    | Event management                                                     |

---

## 🔑 Role Summary

| Role                | Granted by                           | Access                                                 |
| ------------------- | ------------------------------------ | ------------------------------------------------------ |
| **Guest**     | Anyone                               | All public routes +`/membership` application         |
| **member**    | Auto on application approval         | Dashboard, profile, cart, event registration           |
| **executive** | Admin promotes via`/admin/members` | All member access + schedule events + member directory |
| **admin**     | Manual DB/seed                       | Everything above + all`/admin/*` routes              |

> When admin toggles a member's executive status via the admin panel, the `users.role` is automatically updated to `'executive'`/`'member'`. The change takes effect on the **next login** (JWT is re-issued with the new role).

---

## 📁 File Locations

* [ ]

  ```
  frontend/src/
  ├── App.jsx                          ← Route definitions
  ├── api.js                           ← Shared axios instance (baseURL from .env)
  ├── context/
  │   └── AuthContext.jsx              ← Auth state + login/logout
  ├── routes/
  │   └── ProtectedRoute.jsx           ← Role-based route guard
  ├── layouts/
  │   ├── PageLayout.jsx               ← Navbar + Footer wrapper
  │   ├── DashboardLayout.jsx          ← Member sidebar layout
  │   └── AdminLayout.jsx              ← Admin sidebar layout
  └── pages/
      ├── public/
      │   ├── HomePage.jsx
      │   ├── EventsPage.jsx
      │   ├── EventDetailPage.jsx
      │   ├── MembershipPage.jsx        ← Uses membership.config.js for static data
      │   ├── membership.config.js      ← Tiers, form defaults, validation regexes, select options
      │   ├── ExecutiveBoardPage.jsx
      │   ├── ExecutiveProfilePage.jsx
      │   ├── ResourcesPage.jsx
      │   ├── DonatePage.jsx
      │   ├── AboutPage.jsx
      │   ├── ContactPage.jsx
      │   ├── SponsorPage.jsx
      │   ├── LoginPage.jsx
      │   └── UnauthorizedPage.jsx
      ├── member/
      │   ├── DashboardPage.jsx
      │   ├── ScheduleEventPage.jsx
      │   ├── RegisterEventPage.jsx
      │   ├── CartPage.jsx
      │   └── CheckoutPage.jsx
      └── admin/
          ├── AdminDashboard.jsx
          ├── AdminMembers.jsx          ← Live API: approve / deactivate / executive / delete
          └── AdminEvents.jsx
  ```
