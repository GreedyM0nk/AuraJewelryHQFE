# Aura Jewellery HQ

Production retail site for Aura Jewellery — handcrafted charms & bracelets from Kolkata.

## Repository Structure

```
aura-jewellery-hq/
├── frontend/          Vite + React + TypeScript + Tailwind CSS
├── backend/           FastAPI + SQLAlchemy + NeonDB (PostgreSQL)
├── aura-dashboard/    Streamlit investor relations + live analytics portal
└── .github/           CI/CD workflows
```

## Investor Dashboard (Streamlit)

`aura-dashboard` is the recruiter-facing investor relations analytics application backed by the same live Neon database.

### Key capabilities

- Executive summary KPIs and fulfillment funnel
- Revenue intelligence (trend, treemap, Pareto, MoM)
- Customer analytics (CLV tiers, RFM matrix, geography)
- Product and inventory risk analytics
- Order operations (Sankey, radar, calendar heatmap)
- SQL Data Explorer with CSV export

### Run locally

```bash
cd aura-dashboard
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
# set DATABASE_URL in .streamlit/secrets.toml
streamlit run app.py
```

### Deploy (Streamlit Community Cloud)

1. Push repository to GitHub.
2. Create a new app at `share.streamlit.io`.
3. Set `DATABASE_URL` in App Settings -> Secrets.
4. Deploy.

## Branching Strategy

| Branch | Purpose | Deployment |
|--------|---------|------------|
| `main` | Production | Auto-deploys to Vercel (FE) + Render (BE) |
| `develop` | Staging | Auto-deploys preview builds |
| `feature/*` | Feature branches | PR into develop |
| `fix/*` | Hotfixes | PR into develop (or main if critical) |

## Local Development

### Option A — Without Docker

**Frontend:**
```bash
cd frontend
npm install
npm run dev          # starts at http://localhost:5173
```

**Backend:**
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # add DATABASE_URL
uvicorn app.main:app --reload --port 8000
```

### Option B — With Docker Compose

```bash
cd /repo/root
cp backend/.env.example backend/.env   # add DATABASE_URL
docker-compose up                       # frontend + backend together
```

Frontend: http://localhost:5173  
Backend: http://localhost:8000

## CI/CD Pipeline

| Event | Workflow | Status |
|-------|----------|--------|
| Push to `develop` | ci-frontend.yml + ci-backend.yml | Lint, type check, test, build |
| PR to `main` | Both CI workflows | Must pass before merge |
| Merge to `main` | cd-deploy.yml | Auto-deploy to production |
| Daily 6AM UTC | db-health-check.yml | API + NeonDB health check |

## Environment Variables

### Frontend (.env.example)
```
VITE_API_URL=http://localhost:8000
VITE_INVESTOR_RELATIONS_URL=/investor-relations
```

### Backend (.env.example)
```
DATABASE_URL=postgresql+asyncpg://user:pass@host.neon.tech/db?ssl=require
ENVIRONMENT=development
ALLOWED_ORIGINS=http://localhost:5173
API_KEY=your-secret-key-here
RATE_LIMIT=100/minute
```

## GitHub Secrets Required

| Secret | Used by | Example |
|--------|---------|---------|
| `DATABASE_URL` | Backend CI + Deploy | `postgresql+asyncpg://...` |
| `VITE_API_URL` | Frontend CI + Deploy | `https://aura-api.onrender.com` |
| `API_KEY` | Backend CI + Deploy | `your-secret-key` |
| `PRODUCTION_API_URL` | Health check | `https://aura-api.onrender.com` |
| `VERCEL_TOKEN` | Frontend deploy | From vercel.com settings |
| `VERCEL_ORG_ID` | Frontend deploy | From .vercel/project.json |
| `VERCEL_PROJECT_ID` | Frontend deploy | From .vercel/project.json |
| `RENDER_DEPLOY_HOOK_URL` | Backend deploy | From Render dashboard |

## Deployment Instructions

### Vercel (Frontend)

```bash
npm install -g vercel
cd frontend
vercel              # link project, creates .vercel/
vercel --prod       # first deploy
```

Copy values from `.vercel/project.json` to GitHub secrets:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

### Render (Backend)

1. Go to [render.com](https://render.com) → New → Web Service
2. Connect this GitHub repo
3. Set Root Directory: `backend`
4. Add environment variables (see `.env.example`)
5. Get Deploy Hook URL → add as `RENDER_DEPLOY_HOOK_URL` secret

## Database (NeonDB)

- PostgreSQL managed service
- Shared between Aura Jewellery backend and DataAnalystProject cron
- Schema: `products`, `categories`, `customers`, `orders`
- Note: DataAnalystProject daily job feeds synthetic data; Aura API reads from same tables

## Testing

**Frontend:**
```bash
cd frontend
npm run build      # production build
npm run test       # run frontend unit tests once
npm run test:coverage  # run tests with coverage report
```

**Backend:**
```bash
cd backend
python -m pytest tests/ -v   # run test suite
```

> To run against the Neon DB directly (requires `DATABASE_URL` to be set):
> ```bash
> DATABASE_URL='postgresql+asyncpg://...' ENVIRONMENT=test API_KEY=test-key pytest tests/ -v
> ```

## Notes

- Frontend `.env` and `.env.*` files are ignored; only `.env.example` is tracked
- Backend `.env` is ignored; `.env.example` is tracked
- All secrets go into GitHub secrets, not into version control
- Both services communicate via `ALLOWED_ORIGINS` CORS policy

> **Note:** When the backend API is unavailable in development, the app automatically falls back to built-in mock data so you can develop UI without a running server.

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000` | Base URL for the Aura Jewellery backend API |

## Security and GitHub Secrets

This repo is configured to prevent accidental env commits:

- `.env` and `.env.*` are ignored in git
- `.env.example` remains tracked as a safe template

### Important rule

Any variable prefixed with `VITE_` is embedded into the frontend bundle and visible in the browser. Do not put private tokens, DB credentials, or server API keys in `VITE_*` variables.

### GitHub Secrets used

The workflow `.github/workflows/frontend-ci.yml` reads:

- `VITE_API_URL`

This value is used only at build time in CI and is not hardcoded in repository files.

### Set secret in GitHub

1. Go to your repository on GitHub.
2. Open `Settings` > `Secrets and variables` > `Actions`.
3. Click `New repository secret`.
4. Name: `VITE_API_URL`.
5. Value: your backend URL (for example, `https://api.example.com`).

### If a secret was ever exposed

- Rotate that credential immediately at the provider side (for example Neon database password/token).
- Update your local `.env` with the new value.
- Update the corresponding GitHub secret.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server (HMR) |
| `npm run build` | TypeScript check + production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint across all TS/TSX files |
| `npm run format` | Auto-format with Prettier |
| `npm run test` | Run Vitest unit tests |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run test:coverage` | Run unit tests with coverage report |

---

## Folder Structure

```
src/
├── api/
│   ├── axiosClient.ts       # Axios instance with interceptors
│   ├── products.ts          # getProducts(), getProduct(), createProduct(), updateProduct(), deleteProduct()
│   ├── categories.ts        # getCategories(), createCategory(), deleteCategory()
│   ├── customers.ts         # registerCustomer(), listCustomers(), deleteCustomer()
│   └── orders.ts            # createOrder(), getOrder(), listOrders(), updateOrderStatus(), deleteOrder()
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx       # Sticky, scroll-aware, mobile hamburger
│   │   ├── Footer.tsx       # Multi-column, social links
│   │   └── PageWrapper.tsx  # Framer Motion page transition wrapper
│   ├── ui/
│   │   ├── Button.tsx       # primary / ghost / outline variants
│   │   ├── Badge.tsx        # gold / danger / neutral
│   │   ├── GoldDivider.tsx  # decorative rule with diamond accent
│   │   ├── Spinner.tsx      # Loading indicator
│   │   └── ProductCardSkeleton.tsx # Reusable product loading skeleton
│   ├── search/
│   │   └── SearchModal.tsx  # Debounced product search modal
│   ├── home/
│   │   ├── HeroSection.tsx  # Full-viewport hero with animated text
│   │   ├── CategoryStrip.tsx# Category cards with skeleton loading
│   │   ├── ProductGrid.tsx  # Filtered product grid
│   │   ├── ProductCard.tsx  # Product card — links to /products/:id
│   │   └── AboutSection.tsx # Brand story, scroll-animated
│   └── cart/
│       ├── CartDrawer.tsx   # Slide-in cart drawer, "Proceed to Checkout" → /checkout
│       └── CartItem.tsx     # Quantity controls, remove
├── hooks/
│   ├── useProducts.ts       # React Query wrapper, URL-driven category/search/sort params
│   ├── useCategories.ts     # React Query categories query
│   └── useCart.ts           # Zustand cart selectors
├── store/
│   ├── cartStore.ts         # Zustand cart store (persisted to localStorage)
│   └── wishlistStore.ts     # Zustand wishlist store (persisted to localStorage)
├── types/
│   └── index.ts             # Product, Category, CartItem, Customer, Order, OrderItem interfaces
├── pages/
│   ├── HomePage.tsx         # Hero + CategoryStrip + ProductGrid + About
│   ├── ProductsPage.tsx     # Full catalog with category filters
│   ├── ProductDetailPage.tsx# /products/:productId — image, SKU, stock, Add to Cart
│   ├── WishlistPage.tsx     # /wishlist — saved favourites grid
│   ├── CheckoutPage.tsx     # /checkout — customer registration + order placement (2-step)
│   ├── OrderConfirmationPage.tsx # /order-confirmation/:orderId — success screen
│   ├── PrivacyPolicyPage.tsx # /privacy-policy
│   ├── TermsPage.tsx        # /terms
│   ├── NotFoundPage.tsx     # Branded 404 with gold animation
│   └── admin/
│       ├── AdminLayout.tsx       # API-key guard + sidebar nav
│       ├── AdminProductsPage.tsx # CRUD products table
│       ├── AdminCategoriesPage.tsx # CRUD categories table
│       ├── AdminCustomersPage.tsx  # Search + delete customers
│       └── AdminOrdersPage.tsx     # List, status update, delete orders
├── router/
│   └── index.tsx            # React Router v6 + AnimatePresence
├── App.tsx
├── main.tsx
└── index.css                # Tailwind directives + Google Fonts + utilities
```

---

## Routes

| Path | Page | Auth |
|---|---|---|
| `/` | Home (Hero, Categories, Products, About) | — |
| `/shop` | Full product catalog with filters | — |
| `/wishlist` | Saved products wishlist | — |
| `/collections` | Category cards | — |
| `/about` | Brand story | — |
| `/investor-relations` | Investor relations overview (ESG + annual highlights) | — |
| `/products/:productId` | Product detail — image, SKU, stock, Add to Cart | — |
| `/checkout` | Two-step checkout (customer info → order review) | — |
| `/order-confirmation/:orderId` | Order success screen | — |
| `/privacy-policy` | Privacy policy page | — |
| `/terms` | Terms of service page | — |
| `/investor-relations#esg` | ESG section deep link | — |
| `/investor-relations#annual` | Annual section deep link | — |
| `/admin` | Redirects to `/admin/products` | API key |
| `/admin/products` | Create / edit / delete products | API key |
| `/admin/categories` | Create / delete categories | API key |
| `/admin/customers` | Search + delete customers | API key |
| `/admin/orders` | List, update status, delete orders | API key |
| `/*` | 404 Not Found | — |

---

## Backend Additions

- `POST /api/v1/newsletter` endpoint added for newsletter subscriptions
- New backend files:
	- `backend/app/routers/newsletter.py`
	- `backend/app/schemas/newsletter.py`
- Seed script now includes products for `Necklaces` and `Rings` categories (`AJ-009` to `AJ-012`)

---

## Design Tokens

Custom Tailwind colours under `brand.*`:

| Token | Value |
|---|---|
| `brand-black` | `#0A0A0A` |
| `brand-charcoal` | `#141414` |
| `brand-gold` | `#C9A84C` |
| `brand-gold-light` | `#E8C97A` |
| `brand-gold-dark` | `#8B6914` |
| `brand-cream` | `#F5F0E8` |
| `brand-white` | `#FAFAFA` |

Fonts: **Cormorant Garamond** (display) · **Jost** (body) · **Cinzel** (accent) — loaded from Google Fonts.   

******************************************EOF******************************