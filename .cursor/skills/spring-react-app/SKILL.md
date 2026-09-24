---
name: spring-react-app
description: >-
  Scaffolds a Spring Boot 3 + React Vite app matching this boilerplate: JWT
  auth, category CRUD, product CRUD with required category and image,
  pagination, single JAR, Nginx Docker Compose, and Ubuntu deploy. Use when
  creating a project with this structure, scaffolding a Spring React app, or
  adding product-management features like this repo.
---

# Spring React App

Build a new project that matches this boilerplate. Do not invent a different layout (no root `pom.xml`, no `backend/` folder, no separate frontend container).

## Stack (do not change)

| Layer | Choice |
| --- | --- |
| Backend | Spring Boot 3.2, Java 21, Maven |
| Security | Spring Security 6, stateless JWT access + DB refresh token |
| Roles | `ADMIN`, `USER` |
| Domain | Category CRUD + product catalog CRUD with required category and image (URL or file upload) |
| DB default | H2 in-memory; MySQL driver on classpath |
| Frontend | React 18, Vite 5, React Router 6, Axios |
| Packaging | `frontend-maven-plugin` builds UI; `maven-resources-plugin` copies `frontend/dist` into `webapp` static |
| Runtime | One JAR in `webapp/target/` |
| Deploy | Docker Compose: `nginx` (80/443) → `app` (8080) |

## Workflow

Copy this checklist and complete it in order:

```
- [ ] 1. Confirm app name, Java package, and artifact names
- [ ] 2. Create the directory tree (see structure.md)
- [ ] 3. Write webapp (Security, JWT 401, auth, health, SPA)
- [ ] 4. Write category + product APIs (CRUD, pagination, image upload)
- [ ] 5. Write frontend (auth, branding, categories, products, lightbox)
- [ ] 6. Wire Maven frontend build + copy-resources
- [ ] 7. Add Docker, Nginx, compose, .env template
- [ ] 8. Add README (Ubuntu deploy + local run)
- [ ] 9. Verify local package command
```

### 1. Names

Ask only if missing. Defaults:

- Display name: **Product Management Application** (login heading, `index.html` title, Maven `<name>`, README title)
- `spring.application.name`: `product-management-application`
- Java package: `com.base`
- Main class: `com.base.BaseApplication`
- Maven artifact: `product-management-webapp` version `1.0.0`
- JAR: `webapp/target/product-management-webapp-1.0.0.jar`
- Docker image / container: `base-structure-app`

Rename consistently if the user gives another name. Keep folder names `webapp/`, `frontend/`, `nginx-docker/`.

### 2. Layout

Create the tree in [structure.md](structure.md). Required top-level entries:

- `webapp/` — Spring Boot only
- `frontend/` — Vite app, sibling of `webapp`
- `frontend/public/` — `favicon.svg`, `favicon.png`, `logo.png`
- `nginx-docker/` — Nginx image + SSL entrypoint
- `docker-compose.yml`, `install.sh`, `README.md`, `.gitignore`
- Ignore `uploads/` (product image files)

### 3. Backend rules

Package layers under the root package:

`config` · `controller` · `dto` · `entity` · `filter` · `repository` · `service`

**Security** (`SecurityConfig`):

- CSRF off, CORS `*`, stateless session
- Permit `/health`, `/api/auth/**`
- Authenticate `/api/**`
- Permit everything else (SPA, static, `/uploads/**`)
- `authenticationEntryPoint` returns **401 JSON** `{ "message": "Unauthorized" }` (not 403)
- `JwtAuthenticationFilter` before `UsernamePasswordAuthenticationFilter`

**JWT**

- Access token via JJWT 0.12 (`jjwt-api` / `jjwt-impl` / `jjwt-jackson`)
- Refresh token: UUID stored in `refresh_tokens`, expiry from `jwt.refresh-token-validity`
- Config in `application.yml`: `jwt.secret`, `access-token-validity` (15m), `refresh-token-validity` (24h)
- Expired or invalid Bearer token: filter writes **401** and stops the chain (do not continue unauthenticated)
- `shouldNotFilter`: `/health`, `/api/auth/login`, `/api/auth/refresh`, `/api/auth/register`
- Refresh rotation: `deleteByUserId` **then** create the new refresh token (never delete after create)

**Auth / health / SPA**

| Method | Path | Auth |
| --- | --- | --- |
| `GET` | `/health` | Public, returns `status`, `message`, `timestamp` |
| `POST` | `/api/auth/login` | Public → `{ accessToken, refreshToken, username, role }` |
| `POST` | `/api/auth/refresh` | Public, body `{ refreshToken }` |
| `GET` | `/api/user` | `USER` or `ADMIN` via `@PreAuthorize` (API only; not shown on Dashboard) |
| `GET` | `/api/admin` | `ADMIN` (API only; not shown on Dashboard) |

`SpaController` must forward these paths to `index.html` (do not use a catch-all that steals `/api/**`):

`/`, `/login`, `/dashboard`, `/products`, `/products/new`, `/products/{id:\\d+}`, `/products/{id:\\d+}/edit`, `/categories`, `/categories/new`, `/categories/{id:\\d+}`, `/categories/{id:\\d+}/edit`

**Category API**

| Method | Path | Auth |
| --- | --- | --- |
| `GET` | `/api/categories?page=0&size=5&q=` | USER or ADMIN, paged |
| `GET` | `/api/categories/options` | USER or ADMIN, all categories sorted by name (product dropdown) |
| `GET` | `/api/categories/{id}` | USER or ADMIN |
| `POST` | `/api/categories` | ADMIN |
| `PUT` | `/api/categories/{id}` | ADMIN |
| `DELETE` | `/api/categories/{id}` | ADMIN; **409** if any product uses it |

Category list uses `PageResponseDto`. Default page size **5**, max 50. Search `q` matches name and description. Sort by `name` ascending. Response includes `productCount`.

**Product API**

| Method | Path | Auth |
| --- | --- | --- |
| `GET` | `/api/products?page=0&size=5&q=` | USER or ADMIN, paged |
| `GET` | `/api/products/{id}` | USER or ADMIN |
| `POST` | `/api/products` | ADMIN |
| `PUT` | `/api/products/{id}` | ADMIN |
| `POST` | `/api/products/{id}/image` | ADMIN, multipart field `file` |
| `DELETE` | `/api/products/{id}` | ADMIN |

List response (`PageResponseDto`):

```json
{ "content": [], "page": 0, "size": 5, "totalElements": 0, "totalPages": 0 }
```

Default page size **5**, max size 50. Search `q` matches name, SKU, **category name**, description (case-insensitive). Sort by `id` ascending.

**Category entity**

`categories`: unique `name`, optional `description`, `createdAt`, `updatedAt`.

**Product entity**

`products`: `name`, unique `sku`, `description`, `price` (BigDecimal ≥ 0), `stock` (≥ 0), required `@ManyToOne` `category` (`category_id`), `imageUrl`, `createdAt`, `updatedAt`.

Product request uses required `categoryId`. Product response includes both `categoryId` and `category` (name).

Image rules:

- Image is **required** on the product form: image URL **or** uploaded file
- `imageUrl` on create/update may be blank when a file is uploaded afterward (`POST /products/{id}/image`)
- Upload JPEG/PNG/GIF/WebP, max 5MB (`spring.servlet.multipart`)
- Store files under `uploads/`, public URL `/uploads/{filename}`
- `WebConfig` resource handler `/uploads/**` → `uploads/` directory URI **with trailing slash** (create the dir at startup)
- `UploadController` `GET /uploads/{filename}` serves the file with probed content type (reject `..` / path separators)
- Seed images with stable URLs (`https://picsum.photos/seed/{sku}/400/400`)
- Delete local file when product is deleted or image is replaced

`RestExceptionHandler` maps `ResponseStatusException` and validation errors to `{ "message": "..." }`.

**Entities / seed**

- `UserEntity` table `users`: `username` unique, BCrypt `password`, enum `Role { ADMIN, USER }`
- `RefreshTokenEntity` table `refresh_tokens`: `token`, `user_id`, `expiryDate`
- `CategoryEntity` table `categories`
- Seed `data.sql` with admin/user (`password123`), sample **categories**, then products that set `category_id` via `(SELECT id FROM categories WHERE name = '...')`
- Enough products to paginate
- `defer-datasource-initialization: true`

**UserService** implements `UserDetailsService`. Authorities in the JWT filter must be `ROLE_` + role name.

Do not leave debug `System.out` or hardcoded password prints in `AuthController`.

### 4. Frontend rules

Vite same-origin. Dev port **5173**. Proxy `/api` and `/uploads` → `http://localhost:8080`.

Required files:

- `public/favicon.svg`, `public/favicon.png`, `public/logo.png` — purple product-box mark
- `src/context/AuthContext.jsx` — login/logout; persist `accessToken`, `refreshToken`, `username`, `role`
- `src/utils/axios.js` — Bearer token; refresh on **401 or 403** (not `/auth/` URLs) with a request queue; clear storage and redirect to `/login` on failure
- `src/utils/productImage.js` — `productImageSrc`; `uploadProductImage` sends `FormData` and **must not** set a manual `multipart/form-data` header (use `Content-Type: undefined` so the boundary is set)
- `src/components/ProtectedRoute.jsx`, `AdminRoute.jsx`
- `src/components/AppLogo.jsx` — `/logo.png`; header links to `/products`
- `src/components/AppHeader.jsx` — logo + nav: Dashboard, Products, Categories + logout
- `src/components/ImageLightbox.jsx` — full image; close via ×, backdrop, Esc; `referrerPolicy="no-referrer"`
- `src/components/ProductThumb.jsx` — thumbnail; reset `onError` when `src` changes; failed load → “No image”
- Pages: `Login`, `Dashboard`, `ProductList`, `ProductForm`, `ProductDetail`, `CategoryList`, `CategoryForm`

**Branding**

- Login `h1` and document title: **Product Management Application**
- Favicon: `/favicon.svg` + `/favicon.png`; apple-touch-icon: `/logo.png`
- Login shows the logo above the title
- Header shows the logo before the page title
- Required-field labels use `className="required"`; global CSS `.required::after { content: ' *'; color: #dc3545; }`

**Routes**

| Path | Guard | Page |
| --- | --- | --- |
| `/login` | public | Login |
| `/dashboard` | authenticated | Dashboard |
| `/products` | authenticated | ProductList |
| `/products/new` | ADMIN | ProductForm create |
| `/products/:id` | authenticated | ProductDetail |
| `/products/:id/edit` | ADMIN | ProductForm edit |
| `/categories` | authenticated | CategoryList |
| `/categories/new` | ADMIN | CategoryForm create |
| `/categories/:id/edit` | ADMIN | CategoryForm edit |
| `/` | — | Navigate to `/products` |

After login, go to `/products`.

**Dashboard**

- Cards only: **Product managing** and **Category managing**
- Do **not** show User Endpoint or Admin Endpoint fetch cards

**Product list UI**

- Columns in this order: **SKU, Name, Category, Price, Stock, Image, Actions**
- Left-align SKU, Name, Category headers; center Price, Stock, Image, Actions
- Image click opens lightbox
- Search is server-side (`q`), debounced ~300ms, resets to page 0
- Pagination: **First**, **Previous**, at most **5** page-number buttons (sliding window), **Next**, **Last**
- Show “x–y of total”
- USER: view only. ADMIN: Add / Edit / Delete

**Product form**

- Fields: name, sku, price, stock, **category select**, image URL, file upload, description
- Required (red asterisk): Name, SKU, Price, Stock, Category, Image
- Category is a required `<select>` loaded from `GET /categories/options`; placeholder “Select a category”
- Image required: URL **or** file (JPEG/PNG/GIF/WebP). Hint: “Provide an image URL or upload a file.”
- If no categories exist, link to `/categories/new`
- After save, if a file is selected, `POST /products/{id}/image`
- Preview click opens lightbox

**Category list UI**

- Columns: **Name, Description, Products, Actions** (hide Actions for USER)
- Search name/description, debounce ~300ms, same pagination controls as products
- USER: view only. ADMIN: Add / Edit / Delete
- Form fields: required name, optional description

Scripts in `package.json`:

- `dev` / `build` → `--mode localhost`
- `dev:dev` / `build:dev` → `--mode dev`
- `dev:prod` / `build:prod` → `--mode prod`

### 5. Maven

`webapp/pom.xml` only (no parent POM at repo root). Maven `<name>` is **Product Management Application**.

`frontend-maven-plugin` 1.15.0:

- `workingDirectory`: `../frontend`
- Node `v20.10.0`, npm `10.2.4`
- Executions: install-node-and-npm → npm install → `npm ${frontend.build.command}`

`maven-resources-plugin` `copy-frontend`:

- From `../frontend/dist`
- To `${project.build.directory}/classes/static`

Profiles:

- `dev` (default): `frontend.build.command` = `run build:dev`
- `prod`: `run build:prod`

Dockerfile build arg `APP_PROFILE` must match `-P` (`dev` or `prod`).

### 6. Docker and Ubuntu

Match [structure.md](structure.md) for compose, Dockerfiles, and Nginx.

Hard constraints:

- Compose services named `nginx` and `app`
- Nginx depends on `app`, network `app-net`
- App publishes `8080` internally only
- Volumes: `logs/webapp`, `logs/nginx`, `config`, `lego_certs`, `namecheap_certs`, `lego_webroot`
- If `LEGO_DOMAIN` empty → HTTP only; else Let's Encrypt via lego when `IS_LET_ENCRYPT=true`
- `install.sh` installs Docker on Ubuntu, writes `.env` if missing, runs `docker compose up -d --build`
- README must include Ubuntu deploy **and** local two-process run (`mvn spring-boot:run` + `npm run dev`)

### 7. Verify

From `webapp/`:

```bash
mvn -B -ntp -DskipTests clean package -Pdev
```

Expect `target/product-management-webapp-1.0.0.jar` (or the renamed artifact).

Do not start a production deploy unless the user asked.

## Examples

**User:** "Create a new project like this one named inventory-hub."

Same tree, category + product CRUD, required category/image, pagination, JWT 401 refresh, branding, Docker/Ubuntu docs. Rename package/artifact if asked.

**User:** "Scaffold Spring + React with JWT and Docker on Ubuntu."

Follow this skill end-to-end. Include categories and products. Do not switch to Next.js, Gradle, or Kubernetes.

## Additional resources

- Exact file tree and required files: [structure.md](structure.md)
