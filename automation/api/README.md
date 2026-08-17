# InvenTree Parts — API Automation

Playwright **API** tests (TypeScript, `APIRequestContext`) for the InvenTree **Parts** API, mapped from `testcases/api-manual-tests.md`.

This project lives in `automation/api/` so it stays separate from the manual cases and from UI Playwright tests. Tests do **not** drive a browser.

**Schema source:** [Parts and Part Categories](https://docs.inventree.org/en/stable/api/schema/part/) (API 530) and the [API overview](https://docs.inventree.org/en/stable/api/) (auth, **403** on permission denied).

## Prerequisites

- Node.js 18+
- A running InvenTree instance with the REST API enabled
- A user who can create, change, and delete parts and categories

Browser install (`npx playwright install`) is **not** required for these API tests.

## Install

```bash
cd automation/api
npm install
```

## Configure

```bash
cp .env.example .env
```

Set:

| Variable | Purpose |
|---|---|
| `BASE_URL` | InvenTree origin, e.g. `http://localhost:8000` |
| `INVENTREE_USERNAME` / `INVENTREE_PASSWORD` | User with Part create/change/delete |
| `INVENTREE_READONLY_USERNAME` / `INVENTREE_READONLY_PASSWORD` | Optional; required for API-PART-171 – 175 |
| `API_TIMEOUT_MS` | Request timeout (default `30000`) |

Do not commit `.env`. Variable names match `automation/ui/` so the same instance can be used for both suites.

Auth: the client fetches a token (Basic against `/api/user/token/` or `/api/user/me/token/`) and sends `Authorization: Token <value>`. If the token endpoint is unavailable it falls back to HTTP Basic.

## Run

```bash
# all API tests
npx playwright test

# one file
npx playwright test tests/part-crud.spec.ts

# one test by title
npx playwright test --grep "create part with required name"

# by tag
npx playwright test --grep @p1
npx playwright test --grep @crud
npx playwright test --grep "@auth and @p1"

# Playwright inspector
npx playwright test --debug

# HTML report (after a run)
npx playwright show-report
```

npm scripts: `npm test`, `npm run test:debug`, `npm run test:ui`, `npm run report`, `npm run typecheck`.

Tags: `@p1`, `@p2`, `@p3`, `@crud`, `@filter`, `@validation`, `@category`, `@relationship`, `@auth`, `@supporting`.

## Layout

```
automation/api/
  tests/          # spec files (testDir)
  clients/        # InventreeClient (endpoint methods)
  schemas/        # response shape helpers
  fixtures/       # auth, unique prefix, create/cleanup tracker
  data/           # shared field lists
  utils/          # env + unique names
  playwright.config.ts
```

Each test is independent: it creates its own data with a unique `QA-API-…` name and the `tracker` fixture deletes related rows, test templates, parts (unlocked/inactive first), then categories.

## Coverage (manual IDs)

| Spec | Manual IDs (primary) | Scope item |
|---|---|---|
| `part-crud.spec.ts` | API-PART-001 – 024, 027, 032, 034, 035 | Part CRUD |
| `part-category.spec.ts` | API-PART-106 – 136 | Category CRUD, tree, filters |
| `part-filters.spec.ts` | API-PART-036 – 065 | List filters, search, pagination |
| `part-validation.spec.ts` | API-PART-071 – 105, 176 – 178 | Required / maxLength / types |
| `relationships.spec.ts` | API-PART-141 – 157, 164 | Category / revision / variant FKs |
| `auth.spec.ts` | API-PART-166 – 175, 183, 185, 186 | Auth, 403, conflicts |
| `supporting.spec.ts` | API-PART-189 – 234 | Related, templates, requirements, serials, pricing, thumbs |

Every test includes `// Covers: API-PART-xxx`.

## Assertions and schema gaps

Documented success codes used as hard asserts:

- GET / PATCH / PUT → **200**
- POST create → **201**
- DELETE → **204**
- Permission denied (overview) → **403**

**400 / 401 / 404 / 409** are not listed on the Parts schema page. Negative tests assert a **4xx** / non-success response instead of inventing a code.

Skipped or recorded as assumptions:

- List PATCH/PUT `/api/part/` (API-PART-023/024) — method exists; selection contract is unclear, so tests skip to avoid bulk mutation.
- Nested writeOnly objects (`duplicate`, `initial_stock`, `initial_supplier`) — nested `$ref` not expanded on the schema page.
- `/api/part/parameter/` — not on this schema page; not called.
- Duplicate `name` / `IPN` uniqueness depends on product settings, not this schema.
- Read-only user cases skip when `INVENTREE_READONLY_*` is unset.
- `category_name` is listed required on the serializer but may be omitted on create when `category` is null.
- DELETE of an **active** part is rejected by the product (typically 400); tests deactivate first, then assert **204**.
- Category DELETE requires `delete_child_categories` and `delete_parts` on this instance (not on the schema page).
- Test-template `description` is schema-nullable but this instance rejects a blank description; tests send a value.
- Omitting `limit` on list endpoints may return a raw JSON array instead of `{count, results}`. The client defaults `limit=50` so schema asserts see the documented envelope. `/api/part/category/tree/` may still return an array.

## Test-data cleanup

- Prefer the `tracker` fixture (automatic, including failed tests).
- Names are prefixed `QA-API-` so leftovers are searchable: `GET /api/part/?search=QA-API-`.
- Manual leftover sweep (authenticated session / curl):

```bash
curl -s -u "$INVENTREE_USERNAME:$INVENTREE_PASSWORD" \
  "$BASE_URL/api/part/?search=QA-API-&limit=100"
```

Delete unused parts before categories. Unlock and set `active=false` if DELETE is rejected.
