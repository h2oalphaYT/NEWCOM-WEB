# Newcom Web

Public website for Newcom (newcom.lk). It shows live stock from the **Newcom Inventory** SQL Server database, read-only.

```
backend/   Go Fiber API, same layout as NewCom_Inventory/backend (config, controllers, routes, middleware, utils)
frontend/  Next.js (App Router) site; design reference mockups live in frontend/PC builder-html/
```

## Backend

```bash
cd backend
cp .env.example .env   # fill DB_* from NewCom_Inventory/backend/.env, and COMPANY_CODE
go run .
```

| Route | Purpose |
|---|---|
| `GET /api/health` | DB reachability |
| `GET /api/items?q=&category=&page_no=&row_count=` | Catalogue (`fxMastItemsGetAll`) |
| `GET /api/items/:id` | One item (`fxMastItemsGetById`) |
| `GET /api/categories` | Categories (`fxMastCategoryLists`) |
| `GET /api/categories/:code/subcategories` | Sub categories |
| `GET /api/brands` | Brands (`fxMastBrandGetAll`) |

Read-only by design: the `ReadOnly` middleware rejects any non-GET request, CORS allows GET only, there are
no save/delete routes, and internal columns (cost, supplier, margin, ...) are stripped from item rows.
Use a database login that only has read rights for production.

## Frontend

```bash
cd frontend
npm install
npm run dev            # http://localhost:3000, expects the API at NEWCOM_API_URL (default http://localhost:8090)
```

Pages: `/` home (video hero, 3D assembly), `/products` catalogue with per-category filters and branch stock,
`/products/[id]`, `/compare`, `/pre-owned`, `/cart` (checkout demo), `/pc-builder` (v3: Intel/AMD, templates,
3D part fitting, wattage, compatibility, print quotation, share link), `/support/warranty` (claim + tracking),
`/services` (repair booking via WhatsApp), `/contact`. All data is sample data in `src/lib/catalog.js` and
`src/lib/builder.js` until the inventory API is connected. Branches shown come from `site.branches`.
Contact details are in `src/lib/site.js`, taken from newcom.lk.
