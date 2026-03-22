# Upstream Literacy

An integrated e-commerce and community platform for literacy education leaders. Built with Django REST Framework and React.

## Architecture

```
backend/                    Django REST API
├── accounts/               User auth, JWT, profiles
├── catalog/                Products, categories, reviews, wishlist, coupons
├── cart/                   Persistent shopping cart (guest + auth)
├── checkout/               Payment processing (mock/Stripe/PayPal)
├── orders/                 Order management, analytics, email notifications
├── community/              Districts, matching, messaging, profiles
├── moderation/             Admin moderation tools
└── config/                 Django settings, URLs

frontend/                   React SPA (Vite + Tailwind CSS)
├── src/api/                Axios client with JWT interceptors
├── src/store/              Auth, Cart, Toast context providers
├── src/components/         Shared UI components
├── src/pages/              Route pages
│   ├── community/          Community features
│   └── admin/              Moderation + Analytics dashboards
└── public/                 Static assets
```

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Docker (optional, for PostgreSQL + Redis)

### Setup

```bash
# 1. Clone and enter directory
cd Upstream

# 2. Start database (Option A: Docker)
docker-compose up -d

# 2. Or use SQLite (Option B: No Docker needed)
# SQLite is used by default when DB_ENGINE is not set

# 3. Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_problem_statements
python manage.py seed_demo_data
python manage.py seed_full_catalog
python manage.py createsuperuser
python manage.py runserver 8050

# 4. Frontend (new terminal)
cd frontend
npm install
npx vite --port 5179
```

Open **http://localhost:5179**

### Demo Accounts

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Community Member | `sarah_j` | `literacy2026!` |
| Community Member | `marcus_c` | `literacy2026!` |

10 community members total — all use password `literacy2026!`

### Coupon Codes

| Code | Discount |
|------|----------|
| `WELCOME10` | 10% off (min $25) |
| `LITERACY20` | 20% off (min $75) |
| `SAVE15` | $15 off (min $50) |
| `EDUCATOR25` | 25% off (min $100) |

## Features

### E-Commerce
- 36 products with real stock photos, ratings, reviews
- Category browsing with filters, search, sorting, pagination
- Persistent cart (guest sessions + authenticated users)
- Checkout with credit card, PayPal, and Purchase Order (B2B)
- Coupon/discount code system
- Guest order tracking
- Wishlist / Save for Later
- Product recommendations ("Customers Also Bought")
- Bestseller badges, social proof ("X bought this")
- Order confirmation with estimated delivery, print receipt
- Email confirmations (mock — logs to console)

### Community Platform
- 30 NCES school districts with real demographic data
- 12 evidence-based problem statements (science of reading)
- Hybrid matching engine: 40% problem overlap + 30% semantic + 30% demographics
- OpenAI embedding support for semantic matching (optional)
- Direct messaging with real-time polling
- Unread message indicators
- Member directory with filters

### Admin
- Analytics dashboard: revenue, conversion funnel, top products, daily trends
- Moderation: flag/remove messages, join conversations
- Django admin panel for all models

### Infrastructure
- Toast notification system
- Error boundary with recovery
- 404 page
- SEO page titles
- Scroll restoration
- JWT auth with token refresh
- CORS configured
- Health check endpoint (`/api/health/`)

## API Endpoints

### Auth
- `POST /api/auth/register/` — Register
- `POST /api/auth/token/` — Login (JWT)
- `POST /api/auth/token/refresh/` — Refresh token
- `GET/PUT /api/auth/profile/` — User profile
- `POST /api/auth/change-password/` — Change password

### Catalog
- `GET /api/catalog/products/` — List (filter, search, sort, paginate)
- `GET /api/catalog/products/{slug}/` — Detail with reviews
- `GET /api/catalog/products/{slug}/recommendations/` — Related products
- `GET /api/catalog/categories/` — Categories
- `GET /api/catalog/search-suggestions/?q=` — Autocomplete
- `GET/POST/DELETE /api/catalog/wishlist/` — Wishlist
- `POST /api/catalog/coupon/validate/` — Validate coupon

### Cart & Checkout
- `GET /api/cart/` — Get cart
- `POST /api/cart/add/` — Add item
- `PATCH /api/cart/items/{id}/update/` — Update quantity
- `DELETE /api/cart/items/{id}/remove/` — Remove item
- `POST /api/checkout/` — Place order

### Orders
- `GET /api/orders/` — List orders
- `GET /api/orders/{number}/` — Order detail
- `POST /api/orders/lookup/` — Guest order tracking
- `GET /api/orders/analytics/dashboard/` — Analytics (admin)

### Community
- `GET /api/community/districts/search/?q=` — District search
- `GET /api/community/problem-statements/` — Problem statements
- `GET/POST/PUT /api/community/profile/` — Community profile
- `GET /api/community/matches/` — AI-powered matching
- `GET/POST /api/community/conversations/` — Messaging
- `GET /api/community/directory/` — Member directory
- `GET /api/community/unread-count/` — Unread messages

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python, Django 5, Django REST Framework |
| Frontend | React 18, Vite, Tailwind CSS v4 |
| Database | PostgreSQL + pgvector (or SQLite for dev) |
| Auth | JWT (SimpleJWT) |
| Payments | Mock backend (Stripe/PayPal ready) |
| AI | OpenAI embeddings for semantic matching |
| Images | Unsplash stock photos (free license) |

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and configure:

```
PAYMENT_BACKEND=mock          # or 'stripe'
OPENAI_API_KEY=               # for semantic matching
STRIPE_SECRET_KEY=            # for real payments
DB_ENGINE=sqlite              # or 'postgresql'
```

## License

Proprietary — Upstream Literacy, Inc.
