# Aura Jewellery HQ

Production retail site for Aura Jewellery — handcrafted charms & bracelets from Kolkata.

## Repository Structure

```
aura-jewellery-hq/
├── frontend/          Vite + React + TypeScript + Tailwind CSS
├── backend/           FastAPI + SQLAlchemy + NeonDB (PostgreSQL)
└── .github/           CI/CD workflows
```

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
```

### Backend (.env.example)
```
DATABASE_URL=postgresql+asyncpg://user:pass@host.neon.tech/db?ssl=require
ENVIRONMENT=development
ALLOWED_ORIGINS=["http://localhost:5173"]
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
```

**Backend:**
```bash
cd backend
pytest tests/ -v   # run test suite
```

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

---

## Folder Structure

```
src/
├── api/
│   ├── axiosClient.ts       # Axios instance with interceptors
│   ├── products.ts          # getProducts(), getProductById()
│   └── categories.ts        # getCategories()
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx       # Sticky, scroll-aware, mobile hamburger
│   │   ├── Footer.tsx       # Multi-column, social links
│   │   └── PageWrapper.tsx  # Framer Motion page transition wrapper
│   ├── ui/
│   │   ├── Button.tsx       # primary / ghost / outline variants
│   │   ├── Badge.tsx        # gold / danger / neutral
│   │   ├── GoldDivider.tsx  # decorative rule with diamond accent
│   │   └── Spinner.tsx      # Loading indicator
│   ├── home/
│   │   ├── HeroSection.tsx  # Full-viewport hero with animated text
│   │   ├── CategoryStrip.tsx# Category cards with skeleton loading
│   │   ├── ProductGrid.tsx  # Filtered product grid
│   │   ├── ProductCard.tsx  # Product card with hover actions
│   │   └── AboutSection.tsx # Brand story, scroll-animated
│   └── cart/
│       ├── CartDrawer.tsx   # Slide-in cart drawer (Framer Motion)
│       └── CartItem.tsx     # Quantity controls, remove
├── hooks/
│   ├── useProducts.ts       # React Query wrapper, mock fallback
│   ├── useCategories.ts     # React Query wrapper, mock fallback
│   └── useCart.ts           # Zustand cart selectors
├── store/
│   └── cartStore.ts         # Zustand cart store (persisted)
├── types/
│   └── index.ts             # Product, Category, CartItem interfaces
├── pages/
│   ├── HomePage.tsx         # Hero + CategoryStrip + ProductGrid + About
│   ├── ProductsPage.tsx     # Full catalog with category filters
│   └── NotFoundPage.tsx     # Branded 404 with gold animation
├── router/
│   └── index.tsx            # React Router v6 + AnimatePresence
├── App.tsx
├── main.tsx
└── index.css                # Tailwind directives + Google Fonts + utilities
```

---

## Routes

| Path | Page |
|---|---|
| `/` | Home (Hero, Categories, Products, About) |
| `/shop` | Full product catalog with filters |
| `/*` | 404 Not Found |

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