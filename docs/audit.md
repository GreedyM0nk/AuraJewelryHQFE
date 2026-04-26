# GitHub Copilot Improvement Prompts — Aura Jewellery HQ
## Based on live site audit · April 26, 2026

> Paste each prompt separately into Copilot Chat with `@workspace`. They are ordered by priority.
> Stack: Vite + React 18 + TypeScript + Tailwind + Zustand (FE) · FastAPI + SQLAlchemy async (BE) · Neon PostgreSQL 17

---

## PROMPT 1 — Fix Ghost Cart Item + Cart Drawer "Proceed to Checkout" Button

### Problem (confirmed by live audit)
`localStorage('aura-cart')` contains a stale item with `id: "1"` from old mock data alongside real DB UUIDs. The checkout page shows this ghost product as "Golden Lotus Charm" at ₹4,500 — duplicating the real cart item. Also, the Cart Drawer has a "PROCEED TO CHECKOUT" button that does nothing (not linked to `/checkout`).

### Fix these two things:

**1 — Purge stale cart items on app boot.**
In `frontend/src/store/cartStore.ts`, add a migration/validation in the Zustand `persist` config `onRehydrateStorage` callback:
```typescript
onRehydrateStorage: () => (state) => {
  if (!state) return;
  // Remove any item whose product.id is not a valid UUID (old mock IDs like "1", "2", etc.)
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  state.items = state.items.filter(item => UUID_REGEX.test(item.product.id));
}
```

**2 — Wire up "PROCEED TO CHECKOUT" button in CartDrawer.**
In `frontend/src/components/cart/CartDrawer.tsx`:
- Import `useNavigate` from `react-router-dom`
- Change the "PROCEED TO CHECKOUT" button `onClick` to: `() => { toggleCart(); navigate('/checkout'); }`
- Disable the button if `items.length === 0`

Do NOT change any other cart logic or styles.

---

## PROMPT 2 — Fix Order Confirmation Page: Pass & Display Order Data

### Problem (confirmed by live audit)
`/order-confirmation/:orderId` renders the order ID correctly but shows `Total Amount: -`. When navigating directly to the URL the order data isn't available because it relies on `location.state` which is only set when navigating from checkout. Also, the page does not show the order items list.

### Fix this fully:

**In `frontend/src/pages/CheckoutPage.tsx`**, when navigating after a successful order:
```typescript
navigate(`/order-confirmation/${order.id}`, {
  state: {
    orderId: order.id,
    totalAmount: order.total_amount,
    items: order.items,   // array of { product_id, quantity, unit_price }
    customerName: customerName  // from Step 1 form state
  }
});
```

**In `frontend/src/pages/OrderConfirmationPage.tsx`**:
- Read data from `location.state` first
- If `location.state` is missing (direct URL navigation), call `GET /orders/:orderId` using the `adminApiKey` from `localStorage`. If that also fails (no key), show only the order ID with a generic "Your order has been placed" message — never show a blank `-`
- Display:
  - A large checkmark icon (use Lucide's `CheckCircle2` in `text-brand-gold`)
  - Order ID (truncated to first 8 chars, with full ID in a `title` attribute)
  - Customer name ("Thank you, {name}!")  
  - Items table: product name, quantity, unit price, line total
  - Grand total
  - Estimated delivery: "5–7 business days"
  - "CONTINUE SHOPPING" button → `/shop`

---

## PROMPT 3 — Fix Checkout: Email Validation Error UX + Empty Cart Guard

### Problem (confirmed by live audit)
When a user enters an email with a `.test` or other rejected TLD, the backend returns a `422` with the message "Request failed with status code 422" — unhelpful. Also, if the cart is empty and someone navigates to `/checkout` directly, the page renders with no products and no warning.

### Fix both:

**In `frontend/src/pages/CheckoutPage.tsx`:**

1. **Empty cart guard** — at the top of the component:
```typescript
const { items } = useCart();
if (items.length === 0) {
  return (
    <PageWrapper>
      <div className="text-center py-24">
        <p className="font-body text-brand-cream/60 mb-6">Your cart is empty.</p>
        <Link to="/shop" className="font-accent text-brand-gold tracking-widest text-sm hover:underline">
          BROWSE COLLECTION
        </Link>
      </div>
    </PageWrapper>
  );
}
```

2. **Better error messages** — catch the axios error detail and surface it:
```typescript
} catch (err: any) {
  const detail = err?.response?.data?.detail;
  if (Array.isArray(detail)) {
    // FastAPI validation errors → extract the first human-readable message
    const msg = detail[0]?.msg ?? 'Validation error';
    setError(msg.replace('value is not a valid email address: ', ''));
  } else if (typeof detail === 'string') {
    setError(detail);
  } else if (err?.status === 409) {
    // Email exists — not an error, continue with existing customer
    // (already handled — ensure this path doesn't set an error)
  } else {
    setError('Something went wrong. Please try again.');
  }
}
```

3. **Show the error inline** — below the email field, not as a generic banner. Style with `text-red-400 text-sm font-body mt-1`.

4. **Add quantity display to cart summary** in Step 2: show `× {quantity}` next to each item, and if an item has `quantity > 1` show the line total (`unit_price × quantity`), not just `unit_price`.

---

## PROMPT 4 — Product Detail Page: Fetch from API + Add Related Products + Quantity Selector

### Problem (confirmed by live audit)
`/products/:productId` renders product data but makes **zero API calls** — it is either rendering from route state or cached data. If a product's price or stock changes in the DB, the page won't reflect it. Also missing: quantity selector, related products, and no breadcrumb is rendering.

### Fix the following in `frontend/src/pages/ProductDetailPage.tsx`:

**1. Always fetch fresh data on mount:**
```typescript
const { productId } = useParams<{ productId: string }>();
const [product, setProduct] = useState<Product | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  setLoading(true);
  axiosClient.get(`/products/${productId}`)
    .then(res => setProduct(res.data))
    .catch(() => setProduct(null))
    .finally(() => setLoading(false));
}, [productId]);
```

**2. Quantity selector** — add a `quantity` state (default 1, min 1, max `product.stock_quantity`):
- Show `−` / `+` buttons flanking a quantity number
- `addItem` should be called `quantity` times, or better: extend `cartStore.addItem` to accept an optional `quantity` param
- If `stock_quantity === 0`: show "OUT OF STOCK" badge, disable Add to Cart

**3. Related products strip** — at the bottom, fetch `GET /products?category_id={product.category_id}&limit=4` and exclude the current product. Show as a horizontal scroll row of `ProductCard` components titled "YOU MAY ALSO LIKE"

**4. Breadcrumb** — render `Home / Shop / {category.name} / {product.name}` using React Router `Link`s. Each segment should be navigable.

---

## PROMPT 5 — Newsletter Subscribe: Wire to Backend or Show Confirmation

### Problem (confirmed by live audit)
The homepage newsletter form (`frontend/src/pages/HomePage.tsx`) has an email input and "SUBSCRIBE" button but clicking it does nothing — no API call, no feedback, no state change.

### Fix the newsletter subscription flow:

**Option A — Wire to a new backend endpoint (recommended):**

Backend: Add `POST /api/v1/newsletter` to a new `backend/app/routers/newsletter.py`:
```python
@router.post('/newsletter', status_code=201)
async def subscribe(payload: NewsletterSubscribe, db: AsyncSession = Depends(get_db)):
    # Upsert into customers table with minimal data (name="Subscriber", country="Unknown")
    # If email already exists → return 200 silently (don't 409)
    existing = await db.scalar(select(Customer).where(Customer.email == payload.email))
    if existing:
        return {"message": "Already subscribed"}
    customer = Customer(name="Subscriber", email=payload.email, country="Unknown")
    db.add(customer)
    return {"message": "Subscribed"}
```
`NewsletterSubscribe` schema: `{ email: EmailStr }`

Frontend: In `HomePage.tsx`, on subscribe button click:
```typescript
const [subState, setSubState] = useState<'idle'|'loading'|'success'|'error'>('idle');
const handleSubscribe = async () => {
  setSubState('loading');
  try {
    await axiosClient.post('/newsletter', { email: subEmail });
    setSubState('success');
  } catch { setSubState('error'); }
};
```
Show state:
- `loading`: spinner inside button
- `success`: replace input row with "✓ You're on the list!" in `text-brand-gold`
- `error`: show "Please enter a valid email" below input in `text-red-400`

**Option B — No backend (simpler):**
Just show a success state after any syntactically valid email is submitted, with no API call. Add email format validation with a regex. Replace button text with "✓ SUBSCRIBED" and disable the input.

Implement Option A if the backend router can be added; otherwise implement Option B.

---

## PROMPT 6 — Fix Footer: Copyright Year + Dead Company Links

### Problem (confirmed by live audit)
Two issues found in `frontend/src/components/layout/Footer.tsx`:

1. **Copyright year is hardcoded as `2025`** — shows wrong year permanently
2. **All "Company" section links** (Our Story, Craftsmanship, Sustainability, Careers, Press) point to `/` — they are dead links. Same for Privacy Policy and Terms of Service.

### Fix both:

**1. Dynamic copyright year:**
```tsx
<p>© {new Date().getFullYear()} Aura Jewellery HQ. All rights reserved.</p>
```

**2. Company links** — update to point to meaningful destinations:
```tsx
const companyLinks = [
  { label: 'Our Story',      to: '/about' },
  { label: 'Craftsmanship',  to: '/about#craftsmanship' },
  { label: 'Sustainability', to: '/about#sustainability' },
  { label: 'Careers',        to: '/about#careers' },
  { label: 'Press',          to: '/about#press' },
];
```

**3. Legal links** — create two stub pages and wire them:
- Create `frontend/src/pages/PrivacyPolicyPage.tsx` with a basic privacy policy stating the site collects name/email for order processing only
- Create `frontend/src/pages/TermsPage.tsx` with basic terms: products are handcrafted, delivery within India only, 30-day return policy
- Register `/privacy-policy` and `/terms` routes in `frontend/src/router/index.tsx`
- Update Footer links: `<Link to="/privacy-policy">Privacy Policy</Link>` and `<Link to="/terms">Terms of Service</Link>`

---

## PROMPT 7 — "BOOK CONSULTATION" Button: Wire to WhatsApp or Modal

### Problem (confirmed by live audit)
The "BOOK CONSULTATION" button in the Navbar is a `<button>` element with no `onClick` handler — it does nothing when clicked.

### Fix in `frontend/src/components/layout/Navbar.tsx`:

Change the button to open WhatsApp with a pre-filled message:
```tsx
<a
  href="https://wa.me/919000000000?text=Hi!%20I%27d%20like%20to%20book%20a%20jewellery%20consultation."
  target="_blank"
  rel="noopener noreferrer"
  className={/* keep existing button styles */}
>
  BOOK CONSULTATION
</a>
```

If a modal is preferred instead of WhatsApp redirect, implement a `ConsultationModal` with:
- Fields: Name, Phone, Preferred date (date picker), Message
- On submit: open WhatsApp with the filled details pre-encoded in the URL
- No backend needed

---

## PROMPT 8 — Search Functionality: Wire the Search Button

### Problem (confirmed by live audit)
The Search button in the Navbar opens nothing. There is no search UI, no search results page, and no API call to `GET /products?search=`.

### Implement search in `frontend/src/components/layout/Navbar.tsx` and a new `SearchModal`:

**`frontend/src/components/search/SearchModal.tsx`:**
- Overlay modal (dark background, centered input)
- Debounced input (300ms) → calls `GET /products?search={query}&limit=6`
- Results show inline below the input: product image (40×40), name, price, link to `/products/:id`
- "View all results" link → `/shop?search={query}`
- ESC key closes the modal
- Close on backdrop click

**In `Navbar.tsx`:**
- Add `isSearchOpen` state
- Search button `onClick` → `setIsSearchOpen(true)`
- Render `<SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />`

---

## PROMPT 9 — Admin Dashboard: Fix Auth Persistence + Add Missing PATCH/DELETE for Products

### Problem (confirmed by live audit)
When navigating between admin pages, `localStorage('adminApiKey')` is cleared and the auth form re-appears. The admin key should persist across page navigations. Also, the admin products table uses a wrong key (`wrong-key-test` was accepted in our test — the UI accepted it and showed data because `GET /products` is a public endpoint, not admin-protected).

### Fix in `frontend/src/pages/admin/AdminLayout.tsx`:

**1. Auth persistence issue** — the key is being cleared on page navigation. The issue is likely that `AdminLayout` re-mounts and calls `localStorage.removeItem` on every mount when a 401 is received. Fix:
- Only clear `localStorage('adminApiKey')` when a real `401` is received from an admin API call (a write call like POST/PATCH/DELETE), not on every mount
- On mount, just check `localStorage.getItem('adminApiKey')` — if present, trust it and show the dashboard immediately

**2. Validate the key on unlock** — when the user enters a key and clicks "UNLOCK", validate it immediately by calling `GET /api/v1/categories` with the key:
```typescript
const handleUnlock = async () => {
  try {
    await axiosClient.get('/categories', { headers: { 'X-Api-Key': key } });
    // 200 → key is valid (categories is a read endpoint but use it to test connectivity)
    // Actually test with a write-like approach: try GET /customers which is admin-protected
    await axiosClient.get('/customers', { headers: { 'X-Api-Key': key } });
    localStorage.setItem('adminApiKey', key);
    setIsAuthenticated(true);
  } catch {
    setError('Invalid API key. Please check your Render environment variables.');
  }
};
```

**3. Fix `/admin/products` Edit modal** — ensure `PATCH /products/{id}` sends `X-Api-Key` header correctly (from `localStorage('adminApiKey')`), and refresh the products table after a successful edit without a full page reload.

---

## PROMPT 10 — Performance: Lazy Load Images + Add Loading Skeletons

### Problem (confirmed by live audit)
Lighthouse flags 2 failures. The site loads all 8 product images immediately on the homepage even for products below the fold. No skeleton loaders exist for product grids — users see blank space during API fetch on slow connections.

### Implement both improvements:

**1. Lazy image loading** — in `frontend/src/components/shop/ProductCard.tsx`:
```tsx
<img
  src={product.image_url}
  alt={product.name}
  loading="lazy"
  decoding="async"
  className="..."
/>
```
Add the same `loading="lazy"` to all images in `CollectionsPage.tsx` category cards and `HomePage.tsx` craftsmanship images.

**2. Product grid skeleton** — create `frontend/src/components/ui/ProductCardSkeleton.tsx`:
```tsx
export const ProductCardSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="bg-brand-charcoal/60 aspect-square w-full mb-3" />
    <div className="h-4 bg-brand-charcoal/60 w-3/4 mb-2" />
    <div className="h-3 bg-brand-charcoal/60 w-1/2 mb-2" />
    <div className="h-4 bg-brand-charcoal/60 w-1/4" />
  </div>
);
```

Use it in `ProductsPage.tsx`, `CollectionsPage.tsx`, and `HomePage.tsx`:
```tsx
{loading
  ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
  : products.map(p => <ProductCard key={p.id} product={p} />)
}
```

**3. Category card skeleton** — same pattern for the category grid. Show 4 skeleton cards while `useCategories` is loading.

---

## PROMPT 11 — Necklaces & Rings: Add Seed Data for Empty Categories

### Problem (confirmed by DB query)
`GET /products?category_id=11111111-1111-1111-1111-111111111003` (Necklaces) and `?category_id=11111111-1111-1111-1111-111111111004` (Rings) return 0 products. The category tabs on the shop page show nothing when clicked. This is a DB data problem.

### Fix in `backend/scripts/seed.py`:

Add 2 necklace products and 2 ring products to the seed data. Use the existing UUIDs for the categories. Example additions:
```python
# Necklaces (category_id: 11111111-1111-1111-1111-111111111003)
{
    "id": "22222222-2222-2222-2222-222222220009",
    "name": "Temple Coin Necklace",
    "description": "22k gold coin pendant on a fine rope chain, inspired by temple motifs.",
    "price": Decimal("12500.00"),
    "category_id": "11111111-1111-1111-1111-111111111003",
    "image_url": "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600&q=80",
    "stock_quantity": 5,
    "sku": "AJ-009"
},
{
    "id": "22222222-2222-2222-2222-222222220010",
    "name": "Layered Kundan Necklace",
    "description": "Three-strand kundan set necklace in antique gold finish.",
    "price": Decimal("18900.00"),
    "category_id": "11111111-1111-1111-1111-111111111003",
    "image_url": "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80",
    "stock_quantity": 3,
    "sku": "AJ-010"
},
# Rings (category_id: 11111111-1111-1111-1111-111111111004)
{
    "id": "22222222-2222-2222-2222-222222220011",
    "name": "Floral Signet Ring",
    "description": "Handcrafted floral signet in 18k yellow gold, adjustable band.",
    "price": Decimal("7200.00"),
    "category_id": "11111111-1111-1111-1111-111111111004",
    "image_url": "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80",
    "stock_quantity": 8,
    "sku": "AJ-011"
},
{
    "id": "22222222-2222-2222-2222-222222220012",
    "name": "Meenakari Statement Ring",
    "description": "Bold meenakari enamel ring with peacock motif in 22k gold.",
    "price": Decimal("9800.00"),
    "category_id": "11111111-1111-1111-1111-111111111004",
    "image_url": "https://images.unsplash.com/photo-1573408301185-9519f94b4e15?w=600&q=80",
    "stock_quantity": 6,
    "sku": "AJ-012"
}
```

All four use `ON CONFLICT (sku) DO NOTHING` — safe to run multiple times. After updating the seed, trigger a manual deploy on Render or push to main to run the CD seed job automatically.

---

## SUMMARY TABLE

| # | Prompt | Type | Priority | Files Affected |
|---|--------|------|----------|----------------|
| 1 | Fix ghost cart item + checkout button | Bug fix | 🔴 Critical | `cartStore.ts`, `CartDrawer.tsx` |
| 2 | Order confirmation data display | Bug fix | 🔴 Critical | `CheckoutPage.tsx`, `OrderConfirmationPage.tsx` |
| 3 | Checkout: email error UX + empty cart | Bug fix | 🔴 High | `CheckoutPage.tsx` |
| 4 | Product detail: API fetch + quantity + related | Feature | 🟠 High | `ProductDetailPage.tsx`, `cartStore.ts` |
| 5 | Newsletter subscribe | Feature | 🟠 High | `HomePage.tsx`, new BE router |
| 6 | Footer: copyright year + dead links | Bug fix | 🟡 Medium | `Footer.tsx`, new pages, router |
| 7 | "Book Consultation" button | Bug fix | 🟡 Medium | `Navbar.tsx` |
| 8 | Search functionality | Feature | 🟡 Medium | `Navbar.tsx`, new `SearchModal.tsx` |
| 9 | Admin auth persistence + key validation | Bug fix | 🟡 Medium | `AdminLayout.tsx` |
| 10 | Lazy images + skeletons | Performance | 🟢 Low | `ProductCard.tsx`, `ProductCardSkeleton.tsx`, pages |
| 11 | Seed necklace & ring products | Data | 🟢 Low | `seed.py` |