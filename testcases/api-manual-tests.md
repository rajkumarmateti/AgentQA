# API Functional Test Specification

Manual API functional test cases for the InvenTree **Parts and Part Categories** API.

**Source of truth:** [Parts and Part Categories schema](https://docs.inventree.org/en/stable/api/schema/part/) (API **530**, fetched 2026-08-17) and [API overview](https://docs.inventree.org/en/stable/api/) (authentication, roles, **403** on permission denied).

Do not invent endpoints or fields. Status codes that are **not** listed on the schema (or overview) are marked **Needs verification**.

**API-wise files:**

| File | API group | IDs |
|---|---|---|
| [api_01_part_crud.md](api_01_part_crud.md) | `/api/part/` and `/api/part/{id}/` CRUD | API-PART-001 – API-PART-035 |
| [api_02_part_list_filter.md](api_02_part_list_filter.md) | List filters, search, pagination, ordering | API-PART-036 – API-PART-070 |
| [api_03_part_validation.md](api_03_part_validation.md) | Field validation, types, lengths, read-only, null | API-PART-071 – API-PART-105 |
| [api_04_part_category.md](api_04_part_category.md) | `/api/part/category/` CRUD, tree, structural | API-PART-106 – API-PART-140 |
| [api_05_relationships.md](api_05_relationships.md) | Category, location, revision, variant, duplicate, initial stock/supplier | API-PART-141 – API-PART-165 |
| [api_06_auth_conflicts.md](api_06_auth_conflicts.md) | Auth, 403, not-found, invalid payload, conflicts | API-PART-166 – API-PART-190 |
| [api_07_related_tests_params.md](api_07_related_tests_params.md) | Related parts, test templates, category parameter templates | API-PART-191 – API-PART-220 |
| [api_08_supporting_endpoints.md](api_08_supporting_endpoints.md) | Pricing, BOM copy/validate, requirements, serials, thumbs, stocktake, prices | API-PART-221 – API-PART-250 |

---

## API Inventory

Schema page: **Parts and Part Categories**. Auth headers on every endpoint: `oauth2`, `cookieAuth`, `basicAuth`, `tokenAuth` (`Token <value>`).

| Method | Path | Documented success | Notes |
|---|---|---|---|
| GET | `/api/part/` | 200 | Paginated list. Filters in inventory below. |
| PATCH | `/api/part/` | 200 | Custom list PATCH (not typical DRF). |
| POST | `/api/part/` | **201** | Create part. Writable required field: `name`. |
| PUT | `/api/part/` | 200 | Custom list PUT. |
| GET | `/api/part/{id}/` | 200 | Query: `category_detail`, `location_detail`, `parameters`, `path_detail`, `price_breaks`, `tags`. |
| PATCH | `/api/part/{id}/` | 200 | Partial update. |
| PUT | `/api/part/{id}/` | 200 | Update. |
| DELETE | `/api/part/{id}/` | **204** | No content. |
| GET | `/api/part/category/` | 200 | Paginated. |
| PATCH | `/api/part/category/` | 200 | Custom list PATCH. |
| POST | `/api/part/category/` | **201** | Writable required: `name`. |
| PUT | `/api/part/category/` | 200 | Custom list PUT. |
| GET | `/api/part/category/{id}/` | 200 | Query: `path_detail`. |
| PATCH | `/api/part/category/{id}/` | 200 | |
| PUT | `/api/part/category/{id}/` | 200 | |
| DELETE | `/api/part/category/{id}/` | **204** | |
| GET | `/api/part/category/tree/` | 200 | Tree rendering. |
| GET/POST | `/api/part/category/parameters/` | 200 / **201** | Category parameter templates. POST required writable: `category`, `template`. |
| GET/PATCH/PUT/DELETE | `/api/part/category/parameters/{id}/` | 200 / 200 / 200 / **204** | |
| GET/POST | `/api/part/related/` | 200 / **201** | POST required writable: `part_1`, `part_2`. |
| GET/PATCH/PUT/DELETE | `/api/part/related/{id}/` | 200 / 200 / 200 / **204** | |
| GET/POST | `/api/part/test-template/` | 200 / **201** | POST required writable: `part`, `test_name`. `key` is read-only. |
| GET/PATCH/PUT/DELETE | `/api/part/test-template/{id}/` | 200 / 200 / 200 / **204** | |
| GET/POST | `/api/part/internal-price/` | 200 / **201** | |
| GET/PATCH/PUT/DELETE | `/api/part/internal-price/{id}/` | 200 / 200 / 200 / **204** | |
| GET/POST | `/api/part/sale-price/` | 200 / **201** | |
| GET/PATCH/PUT/DELETE | `/api/part/sale-price/{id}/` | 200 / 200 / 200 / **204** | |
| GET/POST/DELETE | `/api/part/stocktake/` | 200 / **201** / **204** | Collection DELETE documented 204. |
| POST | `/api/part/stocktake/generate/` | **201** | |
| GET/PATCH/PUT/DELETE | `/api/part/stocktake/{id}/` | 200 / 200 / 200 / **204** | |
| GET | `/api/part/thumbs/` | 200 | |
| GET/PATCH/PUT | `/api/part/thumbs/{id}/` | 200 | No DELETE in schema. |
| POST | `/api/part/{id}/bom-copy/` | **201** | Required: `part`. |
| GET/PATCH/PUT | `/api/part/{id}/bom-validate/` | 200 | |
| GET/PATCH/PUT | `/api/part/{id}/pricing/` | 200 | |
| GET | `/api/part/{id}/requirements/` | 200 | |
| GET | `/api/part/{id}/serial-numbers/` | 200 | Body: `latest`, `next`. |

**Not on this schema page:** `/api/part/parameter/` (part parameter values). Treat as **out of this schema**; do not invent the path.

### GET `/api/part/` query parameters (documented)

`active`, `ancestor`, `assembly`, `bom_valid`, `cascade`, `category` (integer or literal `'null'`), `category_detail`, `component`, `consumable`, `convert_from`, `created_after`, `created_before`, `default_location`, `depleted_stock`, `exclude_id`, `exclude_related`, `exclude_tree`, `has_ipn`, `has_pricing`, `has_revisions`, `has_stock`, `has_units`, `high_stock`, `in_bom_for`, `IPN`, `IPN_regex`, `is_revision`, `is_template`, `is_variant`, `limit`, `location_detail`, `locked`, `low_stock`, `name_regex`, `offset`, `on_order`, `ordering`, `parameters`, `path_detail`, `price_breaks`, `purchaseable`, `related`, `revision_of`, `salable`, `search`, `starred`, `stock_to_build`, `tags`, `testable`, `trackable`, `unallocated_stock`, `variant_of`, `virtual`.

Search fields: `IPN`, `category__name`, `description`, `keywords`, `manufacturer_parts__MPN`, `name`, `revision`, `supplier_parts__SKU`, `tags__name`, `tags__slug`.

### Part writable vs read-only (POST/PATCH/PUT body)

| Writable | Constraints from schema |
|---|---|
| `name` | string, maxLength 100; listed required on serializer (request must send it on create) |
| `IPN` | string, default `""`, maxLength 100 |
| `description` | string, maxLength 250, optional |
| `keywords` | string, maxLength 250, nullable |
| `notes` | string, maxLength 50000, nullable |
| `link` | nullable; URI maxLength 2000 **or** empty string maxLength 0 |
| `units` | string, maxLength 20, nullable |
| `revision` | string, default `""`, maxLength 100, nullable |
| `category` | integer, nullable |
| `default_location` | integer, nullable |
| `responsible` | integer, nullable |
| `revision_of` | integer, nullable |
| `variant_of` | integer, nullable |
| `creation_user` | integer, nullable |
| `default_expiry` | int64, min 0, max 9223372036854775807 |
| `minimum_stock` / `maximum_stock` | number (double), default 0.0 |
| `active`, `assembly`, `component`, `consumable`, `is_template`, `locked`, `purchaseable`, `salable`, `testable`, `trackable`, `virtual` | boolean |
| `tags` | array of string |
| `image` | URI string, nullable |
| `copy_category_parameters` | boolean, default true, **writeOnly** |
| `duplicate` | PartDuplicateOptions, **writeOnly** |
| `existing_image` | string, **writeOnly** |
| `initial_stock` | InitialStock, **writeOnly** |
| `initial_supplier` | InitialSupplier, **writeOnly** |

**Read-only (must not be client-authoritative):** `pk`, `barcode_hash`, `full_name`, `thumbnail`, `starred`, `category_name`, `category_path`, `category_detail`, `category_default_location`, `default_location_detail`, `creation_date`, `parameters`, `price_breaks`, `pricing_*`, `in_stock`, `total_in_stock`, `unallocated_stock`, `allocated_to_*`, `building`, `ordering`, `external_stock`, `stock_item_count`, `revision_count`, `required_for_*`, `scheduled_to_build`, `variant_stock`.

List response required keys: `count`, `results`. `next`/`previous` nullable URI.

### Category writable fields

| Field | Constraints |
|---|---|
| `name` | string, maxLength 100; required |
| `description` | string, maxLength 250 |
| `default_keywords` | string, maxLength 250, nullable |
| `icon` | string, maxLength 100, nullable |
| `parent` | integer, nullable |
| `default_location` | integer, nullable |
| `structural` | boolean — parts may **not** be assigned directly to a structural category |

Read-only: `pk`, `level`, `pathstring`, `path`, `starred`, `part_count`, `subcategories`, `parent_default_location`, `parameters`.

---

## Coverage Summary

| Scope item | Status | Primary IDs |
|---|---|---|
| 1. Parts CRUD | Covered | API-PART-001 – API-PART-035 |
| 2. Part Categories CRUD | Covered | API-PART-106 – API-PART-140 |
| 3. List filtering, pagination, search | Covered | API-PART-036 – API-PART-070 |
| 4. Field-level validation | Covered | API-PART-071 – API-PART-105 |
| 5. Relational integrity | Covered | API-PART-141 – API-PART-165 |
| 6. Unauthorized / forbidden | Covered | API-PART-166 – API-PART-175 |
| 7. Invalid payloads | Covered | API-PART-176 – API-PART-182, validation file |
| 8. Conflict scenarios | Covered | API-PART-183 – API-PART-190 |
| 9. Positive / negative / boundary | Covered | Mixed throughout |
| 10. Response schema + business rules | Covered | Assertions on every case |

Every inventory endpoint has **at least one** test (supporting endpoints in `api_08_supporting_endpoints.md`).

### Parameterization candidates

- Boolean part flags (`active`, `assembly`, `component`, …) for create + list filter
- `limit`/`offset` pairs
- String maxLength: `name` 100, `IPN` 100, `description` 250, `keywords` 250, `units` 20, `revision` 100, `notes` 50000, `link` 2000
- Invalid FK integers for `category`, `default_location`, `revision_of`, `variant_of`, `parent`
- Auth matrix: none / bad token / basic / token / missing Part role

### Uncovered / cannot verify from schema

| Item | Reason |
|---|---|
| HTTP 400 / 401 / 404 / 409 | Not listed on this schema page. 403 is documented on the API overview. |
| Duplicate `name` / IPN HTTP status | Business uniqueness is not in this schema (IPN uniqueness is a global setting). |
| Locked-part edit rejection status | `locked` is a boolean field; lock *behavior* is not encoded as a status in the schema. |
| Structural category assignment status | Business rule is in the field description; error code is not. |
| `PartDuplicateOptions` / `InitialStock` / `InitialSupplier` nested properties | Referenced by `$ref` but nested property tables were not expanded as required/optional in the fetched page examples. |
| PUT vs PATCH required-field difference | Same serializer; whether PUT requires a full body is **Needs verification**. |
| List PATCH/PUT semantics (which items, payload shape) | Custom list methods; payload contract is the Part/Category serializer but targeting is unspecified. |
| Part parameter value CRUD | Not on this schema page. |

---

## Assumptions and Open Questions

### Assumptions

1. Tests run against a reachable InvenTree instance (`http://localhost:8000` per schema servers) with Token auth unless a case says otherwise.
2. Serializer `"required"` arrays mix **response** required fields (`pk`, `starred`, …) with writable `name`. Create requests send writable `name`; they do **not** send read-only fields.
3. Cleanup: DELETE created parts/categories after each case when DELETE is allowed (not locked; not used in an assembly if that setting blocks it).
4. `Content-Type: application/json` unless testing form/multipart.

### Open questions

1. Exact status for validation failures, missing auth, and unknown `{id}` (schema omits them).
2. List PATCH/PUT request shape and which records they mutate.
3. Whether `name` uniqueness is enforced by the API.
4. Nested schemas for `duplicate`, `initial_stock`, `initial_supplier`.
5. Whether POST create returns `Location` header (not documented).

---

## Test Data

| ID | Record | Notes |
|---|---|---|
| USER-OK | User with Part and PartCategory change/create/delete roles | Token `TOK-OK` |
| USER-RO | Authenticated user, Part **view** only (no add/change/delete) | Token `TOK-RO` |
| USER-NONE | No credentials | |
| CAT-A | Category name `QA-API-Electronics` | `structural=false` |
| CAT-B | Child of CAT-A, name `QA-API-Resistors` | |
| CAT-STRUCT | `structural=true` | Must not accept direct part assignment |
| LOC-A | Existing stock location PK | For `default_location` |
| PART-A | Part `name=QA-API-R10K`, `IPN=API-IPN-001`, `category=CAT-A.pk` | |
| PART-B | Second part for related/revision/variant | |
| TPL-PARAM | Existing parameter template PK | For category parameters |
| AUTH-HEADER | `Authorization: Token TOK-OK` | Documented prefix |

Use unique `name`/`IPN` suffixes per run. Restore mutated settings if a case changes them.

---

## Test Cases

Detailed cases are in the API-wise files. Table columns:

| ID | Endpoint | Method | Scenario | Preconditions | Request/Data | Expected Status | Response Assertions | Business Assertions | Type | Priority |
|---|---|---|---|---|---|---|---|---|---|---|

**Expected Status** uses the schema value when present. Otherwise: **Needs verification**.
