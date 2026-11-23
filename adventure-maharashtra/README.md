# Adventure Maharashtra

> **ONE PLATFORM. EVERY ADVENTURE.**  
> A centralized, production-grade multi-park discovery, booking, dynamic pricing, digital ticketing, and park operations platform for **Maharashtra, India**.

Adventure Maharashtra connects thrill seekers, families, and corporate groups with amusement parks, water parks, theme parks, high-altitude rope courses, and recreational resorts across Mumbai, Pune, Lonavala, Nashik, Kolhapur, and beyond.

---

## 🏔️ Architecture Overview

The platform is engineered as a decoupled full-stack monorepo:

```
adventure-maharashtra/
├── client/                      # React 18 + Vite + Tailwind CSS Single Page Application
│   ├── src/
│   │   ├── components/          # Reusable UI components (Navbar, Footer, Modals, Cards, Gates)
│   │   ├── context/             # AuthContext (sessions, favorites, JWT cookies)
│   │   ├── pages/               # Public, Customer, and Partner dashboards
│   │   │   ├── partner/         # Partner Operations, Scanner, and Yield Analytics
│   │   │   └── ...              # Home, Discovery, Details, Booking, Tickets, Reviews
│   │   └── services/            # Axios API client with credentials support
│   ├── tailwind.config.js       # Cinematic Dark Theme tokens
│   └── package.json
│
├── server/                      # Node.js + Express + MongoDB REST API Server
│   ├── src/
│   │   ├── config/              # MongoDB connection & environment variables
│   │   ├── controllers/         # Business logic (Auth, Parks, Packages, Bookings, Payments, Tickets, Reviews, Analytics)
│   │   ├── middleware/          # JWT auth, role RBAC, input validation, error handling
│   │   ├── models/              # Mongoose data models
│   │   ├── routes/              # Express REST routing modules
│   │   ├── scripts/             # Database seed scripts
│   │   └── tests/               # 65 automated integration tests (`node --test`)
│   └── package.json
└── README.md
```

---

## 🎨 Brand & Visual Identity

Engineered with a modern, dark, cinematic aesthetic inspired by extreme adventure sports and high-altitude theme parks:

| Token | Hex Value | Usage |
|---|---|---|
| **Primary Background** | `#050914` | Global root canvas & headers |
| **Secondary Background** | `#080F1D` | Navigation, elevated sections, sheets |
| **Card Background** | `#0B1220` | Cards, panels, input fields |
| **Elevated Card** | `#101A2D` | Modals, active states, popups |
| **Electric Cyan** | `#38BDF8` | Primary CTA, focus rings, highlights |
| **Royal Blue** | `#2563EB` | Gradients, primary badges, secondary accents |
| **Adventure Amber** | `#F59E0B` | Ratings, pricing highlights, urgency tags |
| **Emerald Neon** | `#10B981` | Turnstile gate admission, success banners |
| **Rose Crimson** | `#F43F5E` | Turnstile rejections, cancellations, errors |

---

## 🚀 Key Features by Phase

### 1. Discovery & Exploration (Phases 1 & 2)
- **Multi-parameter Search Widget**: Filter simultaneously by destination city, thrill category, date of visit, and group size.
- **Dynamic Park Catalog**: Real-time filtering by category (Theme Park, Water Park, Adventure Sports, Trekking & Eco-Resort), budget slider, minimum ratings, and sort order.
- **Park Detail Showcase**: High-resolution image carousels, package comparison tables, opening hours, ride safety rules, dynamic map coordinates, and customer reviews.
- **Curated Regional Hubs & Activities**: Dedicated guides for Lonavala, Mumbai MMR, Pune, Nashik, and Sahyadri adventure zones.

### 2. Authentication, Roles & Security (Phase 3)
- **Cookie-Based JWT Authentication**: Secure, `HttpOnly`, `SameSite: strict` token cookies with Authorization header fallback.
- **Role-Based Access Control (RBAC)**: Strict role barriers for `CUSTOMER`, `PARK_ADMIN`, `ENTRY_STAFF`, and `SUPER_ADMIN`.
- **Interactive Customer Center**: Saved favorites with one-click toggling, booking history with status filter tabs, profile management, and password update center.

### 3. Park & Package Operations Management (Phase 4)
- **Partner Operations Dashboard**: Multi-park operational switcher, live status tags (`PENDING`, `APPROVED`, `SUSPENDED`).
- **Park Registration & Editor**: Full metadata editing, geo-coordinates, operating hours, capacity, and cover imagery.
- **Multi-Tier Package Manager**: Create and update Standard Passes, Fast-track VIP bands, Meal combo add-ons, and weekend surge rates.
- **Super Admin Approvals**: Review queue for platform moderators to approve or reject newly submitted parks.

### 4. Dynamic Pricing Engine & Booking Flow (Phase 5)
- **5-Step Booking Wizard**: Date selector, pass tier quantity picker, optional meal/VIP add-on bundles, visitor contact form, and order summary review.
- **Dynamic Pricing Engine**:
  - Automatically calculates 18% GST and per-ticket platform convenience fees.
  - Weekend and holiday surge multipliers.
  - Promo coupon redemption engine with minimum cart threshold validation (`ADVENTURE10`, `MAHAWATER`, `WEEKEND20`, `FAMILYFEST`).
- **Cancellation & Tiered Refund Matrix**:
  - `> 48 hours` before visit: 100% refund.
  - `24 – 48 hours` before visit: 50% refund.
  - `< 24 hours` before visit: Non-refundable.

### 5. Payment Gateway & Webhook Reconciliation (Phase 6)
- **Paise-Grade Integer Financials**: Zero floating-point rounding errors; all monetary amounts stored in integer paise.
- **Razorpay Integration & Sandbox Gateway**: Full cryptographic HMAC SHA-256 signature verification.
- **Idempotency Safeguards**: Prevents double-charging or duplicate ticket issuance on accidental double clicks or webhook replays.
- **Full Refund Pipeline**: Automated refund record generation on booking cancellations.

### 6. Digital QR Passes & Gate Turnstile Scanner (Phase 7)
- **Dynamic Scannable QR Codes**: Offline-verifiable encrypted admission tokens generated using `qrcode`.
- **Turnstile Admissions Portal (`/partner/scanner`)**:
  - Dedicated venue entry mode with gate lane selector (Turnstile Gate 1 - Main Entry, VIP Fast-Track, South Gate).
  - Web Audio API acoustic feedback: Crisp 880Hz harmonic double-chime for approved admission; 220Hz low sawtooth buzz for rejections.
  - Replay protection: Instant rejection of previously redeemed passes or counterfeit QR tokens.
  - Partial redemption tracking for multi-guest party bookings.
  - Live admission audit feed logging visitor names, entry timestamps, gate lane, and remaining pass counts.

### 7. Verified Reviews & Partner Business Analytics (Phase 8)
- **Verified Visitor Reviews**: Only customers with confirmed booking references can submit reviews tagged with the "Verified Booking" badge.
- **Automated Rating Aggregator**: Automatically computes and updates park average ratings and review distribution bars (5-star down to 1-star).
- **Executive Business Intelligence Dashboard (`/partner/analytics`)**:
  - Financial KPIs: Total gross booking revenue (₹), average order value (AOV), and completed transactions.
  - Turnstile Check-In Rate (% of ticket holders currently inside the park).
  - Cancellation Rate tracking.
  - Demographic breakdown (Adults vs. Children vs. Seniors).
  - Package pass velocity table and recent visitor sentiment breakdown.

---

## 🔑 Demo Test Accounts

The database includes pre-configured personas ready for demonstration and grading:

| Persona | Role | Email | Password | Permissions & Access |
|---|---|---|---|---|
| **Aarav Patil** | `CUSTOMER` | `aarav@example.com` | `Password@123` | Discovery, Bookings, Digital QR Passes, Reviews |
| **Rohan Mehta** | `PARK_ADMIN` | `owner.imagicaa@adventuremaharashtra.in` | `Password@123` | Imagicaa management, Turnstile Scanner, Analytics |
| **Suresh Gate** | `ENTRY_STAFF` | `staff.imagicaa@adventuremaharashtra.in` | `Password@123` | Turnstile Scanner admission portal |
| **Rajesh Sharma** | `SUPER_ADMIN` | `admin@adventuremaharashtra.in` | `Admin@12345` | Global platform administration, park approvals |

*(Quick-fill buttons are provided directly on the `/login` screen for 1-click access)*

---

## 📡 Complete REST API Reference

### Authentication & User Profiles (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new customer account |
| `POST` | `/api/auth/login` | Public | Authenticate credentials & issue HttpOnly JWT cookie |
| `POST` | `/api/auth/logout` | Public | Clear authentication cookie |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile and role |
| `PUT` | `/api/auth/profile` | Authenticated | Update full name and mobile phone |
| `PUT` | `/api/auth/change-password` | Authenticated | Update password with current password verification |
| `GET` | `/api/auth/dashboard-stats` | Authenticated | Retrieve customer booking and favorite counts |

### Favorites (`/api/favorites`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/favorites` | Authenticated | List all saved favorite parks for user |
| `POST` | `/api/favorites` | Authenticated | Add park to favorites (idempotent) |
| `DELETE` | `/api/favorites/:parkId` | Authenticated | Remove park from favorites |

### Parks (`/api/parks`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/parks` | Public | Query parks with destination, category, price, and rating filters |
| `GET` | `/api/parks/slug/:slug` | Public | Get detailed park profile by URL slug |
| `GET` | `/api/parks/admin/my-parks` | Park Admin | List all parks managed by authenticated partner |
| `POST` | `/api/parks` | Park Admin | Register new park in `PENDING` approval state |
| `PUT` | `/api/parks/:id` | Park Owner / Admin | Update park details, timings, amenities, and location |
| `PATCH` | `/api/parks/:id/status` | Super Admin | Moderate park status (`APPROVED`, `REJECTED`, `SUSPENDED`) |
| `DELETE` | `/api/parks/:id` | Super Admin | Soft-deactivate park listing |

### Packages & Passes (`/api/packages`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/packages/park/:parkId` | Public | Retrieve active packages for a park |
| `POST` | `/api/packages` | Park Owner / Admin | Create new ticket pass tier |
| `PUT` | `/api/packages/:id` | Park Owner / Admin | Update pass pricing, inclusions, and surge rates |
| `DELETE` | `/api/packages/:id` | Park Owner / Admin | Deactivate package tier |

### Bookings & Dynamic Pricing (`/api/bookings`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/bookings/calculate` | Public | Preview dynamic price breakdown with GST, fees, and coupons |
| `POST` | `/api/bookings` | Authenticated | Create booking in `PENDING_PAYMENT` state |
| `GET` | `/api/bookings/my-bookings` | Authenticated | List bookings for current customer |
| `GET` | `/api/bookings/:id` | Authenticated | Retrieve booking by ID or unique reference code |
| `PUT` | `/api/bookings/:id/cancel` | Authenticated | Cancel booking and compute tiered cancellation refund |

### Payments & Gateways (`/api/payments`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/payments/create-order` | Authenticated | Create Razorpay / Sandbox gateway order in integer paise |
| `POST` | `/api/payments/verify` | Authenticated | Verify HMAC SHA-256 signature and issue digital tickets |
| `POST` | `/api/payments/webhook` | Gateway Service | Idempotent webhook event listener |
| `POST` | `/api/payments/:bookingId/refund` | Authenticated | Process refund for eligible cancelled booking |

### Digital Tickets & Turnstile Gates (`/api/tickets`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/tickets/booking/:bookingId` | Authenticated | Get all passes for a booking with embedded QR codes |
| `GET` | `/api/tickets/ref/:ticketReference` | Authenticated | Retrieve digital pass by reference code |
| `POST` | `/api/tickets/scan` | Staff / Admin | Scan QR token at turnstile gate; admits visitors with audit logging |
| `GET` | `/api/tickets/history/:parkId` | Staff / Admin | Retrieve gate admission audit trail for park |

### Customer Reviews (`/api/reviews`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/reviews/park/:parkId` | Public | Get park reviews with star rating breakdown distribution |
| `POST` | `/api/reviews` | Authenticated | Submit review with verified customer booking validation |
| `DELETE` | `/api/reviews/:id` | Author / Admin | Delete review and trigger park rating recalculation |

### Business & Platform Analytics (`/api/analytics`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/analytics/partner` | Park Admin | Real-time yield metrics, check-in rates, demographics, revenue |
| `GET` | `/api/analytics/platform` | Super Admin | Platform-wide totals (parks, bookings, gross volume, users) |

---

## 🛠️ Local Development & Quickstart

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB instance running on `localhost:27017` (or MongoDB Atlas URI in `.env`)
- **npm**: v9.0.0 or higher

### Installation & Execution

```bash
# 1. Clone the repository and enter directory
cd adventure-maharashtra

# 2. Install dependencies for both client and server
npm run install:all

# 3. Seed MongoDB with Maharashtra parks, passes, coupons & demo data
npm run seed

# 4. Run automated test suite (65 passing unit & integration tests)
npm test

# 5. Start development servers concurrently:
# Terminal 1 (Backend API on http://localhost:5000):
npm run server

# Terminal 2 (Frontend Client on http://localhost:5173):
npm run client
```

### Environment Configuration

`server/.env` template:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/adventure_maharashtra
JWT_SECRET=super_secret_adventure_maharashtra_jwt_key_2026
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
RAZORPAY_KEY_ID=rzp_test_adventure_maha_mock
RAZORPAY_KEY_SECRET=rzp_mock_secret_key_maha_2026
RAZORPAY_WEBHOOK_SECRET=webhook_secret_key_maha_2026
```

---

## 🧪 Verification & Test Suite

The platform includes **65 automated integration tests** covering all critical operational pathways:

- **Authentication & RBAC**: Registration, duplicate prevention, password hashing, HttpOnly cookies, profile updates, and role gating.
- **Booking & Dynamic Pricing**: Dynamic pricing engine, 18% GST calculation, coupon redemption, availability reservation, and tiered cancellation matrix.
- **Park Operations**: Park registration in `PENDING` state, admin ownership isolation, package CRUD, and Super Admin moderation.
- **Payments & Integrity**: Integer paise accuracy, HMAC SHA-256 signature verification, replay protection, and refund processing.
- **Digital Tickets & QR Gates**: Scannable QR code issuance, turnstile admission, cross-park scan rejection, multi-guest partial check-in, and replay attack rejection.
- **Reviews & Analytics**: Verified visitor reviews, rating recalculation, partner yield analytics, and platform statistics.

Execute test suite anytime:
```bash
cd server
npm test
```

Result:
```
ℹ tests 65
ℹ suites 0
ℹ pass 65
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ duration_ms 3851
```

---

## 📄 License
Adventure Maharashtra is developed for Maharashtra tourism and theme park operators. Released under the MIT License.
