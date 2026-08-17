# API: Supporting Part endpoints

One or more tests per remaining inventory path. Nested request fields not fully expanded on the schema page are **Needs clarification**.

## BOM copy / validate

| ID | Endpoint | Method | Scenario | Preconditions | Request/Data | Expected Status | Response Assertions | Business Assertions | Type | Priority |
|---|---|---|---|---|---|---|---|---|---|---|
| API-PART-221 | `/api/part/{id}/bom-copy/` | POST | Copy BOM from another part | Assembly PART-DST empty BOM; PART-SRC has BOM. | `{"part":PART-SRC.pk}` (required). Optionals: `copy_substitutes` default true, `include_inherited` default false, `remove_existing` default true, `skip_invalid` default false. | **201** | Success body per schema for this POST. | PART-DST BOM contains copied lines. PART-SRC unchanged. | Positive | P1 |
| API-PART-222 | `/api/part/{id}/bom-copy/` | POST | Missing `part` | PART-DST exists. | `{}` | **Needs verification** | `part` required. | BOM unchanged. | Negative | P1 |
| API-PART-223 | `/api/part/{id}/bom-copy/` | POST | Invalid source `part` | PART-DST. | `{"part":99999999}` | **Needs verification** | | | Negative | P1 |
| API-PART-224 | `/api/part/{id}/bom-validate/` | GET | Read validation state | Assembly with BOM. | GET | **200** | Fields: `pk`, `valid`, `bom_validated`, `bom_checksum`, `bom_checked_date`, `bom_checked_by`, `bom_checked_by_detail`. | | Positive | P2 |
| API-PART-225 | `/api/part/{id}/bom-validate/` | PATCH | Validate BOM | Same. | Body per schema (**Needs clarification** of writable fields; GET shows `valid`). | **200** | Validation fields updated if request valid. | | Positive | P2 |
| API-PART-226 | `/api/part/{id}/bom-validate/` | PUT | Validate BOM via PUT | Same. | Same caveat. | **200** | | | Positive | P3 |
| API-PART-227 | `/api/part/{id}/bom-copy/` | POST | Unknown destination id | Unused `{id}`. | `{"part":PART-SRC.pk}` | **Needs verification** | | | Negative | P2 |

## Pricing, requirements, serial numbers

| ID | Endpoint | Method | Scenario | Preconditions | Request/Data | Expected Status | Response Assertions | Business Assertions | Type | Priority |
|---|---|---|---|---|---|---|---|---|---|---|
| API-PART-228 | `/api/part/{id}/pricing/` | GET | Read pricing | PART-A exists. | GET | **200** | JSON object (pricing serializer). Read-only computed fields must not be required in the request. | Not included in default part payload (related to requirements note). | Positive | P2 |
| API-PART-229 | `/api/part/{id}/pricing/` | PATCH | Partial pricing update | PART-A. | Writable fields only — **Needs clarification** which pricing fields are writable vs readOnly. | **200** | | | Positive | P3 |
| API-PART-230 | `/api/part/{id}/pricing/` | PUT | Replace pricing | PART-A. | Same. | **200** | | | Positive | P3 |
| API-PART-231 | `/api/part/{id}/requirements/` | GET | Requirements snapshot | PART-A. | GET | **200** | Numbers: `allocated_to_build_orders`, `allocated_to_sales_orders`, `building`, `can_build`, `ordering`, `required_for_build_orders`, `required_for_sales_orders`, `scheduled_to_build`, `total_stock`, `unallocated_stock`. All read-only. | Schema: omitted from default part API because expensive. | Positive | P2 |
| API-PART-232 | `/api/part/{id}/serial-numbers/` | GET | Serial extras | Trackable part preferred. | GET | **200** | Object with `latest`, `next` (strings per example). | | Positive | P2 |
| API-PART-233 | `/api/part/{id}/pricing/` | GET | Unknown part | Unused id. | GET | **Needs verification** | | | Negative | P2 |

## Thumbs

| ID | Endpoint | Method | Scenario | Preconditions | Request/Data | Expected Status | Response Assertions | Business Assertions | Type | Priority |
|---|---|---|---|---|---|---|---|---|---|---|
| API-PART-234 | `/api/part/thumbs/` | GET | List thumbnails | USER-OK. | Token. | **200** | JSON list/page per schema. | | Positive | P3 |
| API-PART-235 | `/api/part/thumbs/{id}/` | GET | Retrieve thumb | Valid thumbs id. | GET | **200** | | | Positive | P3 |
| API-PART-236 | `/api/part/thumbs/{id}/` | PATCH | Update thumb metadata | Valid id. | Body per schema. | **200** | | Nested fields **Needs clarification**. | Positive | P3 |
| API-PART-237 | `/api/part/thumbs/{id}/` | PUT | Replace thumb | Valid id. | Body per schema. | **200** | | No DELETE in schema — do not call DELETE as a documented method. | Positive | P3 |

## Internal price / sale price

POST **201**. Detail GET/PATCH/PUT **200**. DELETE **204**.

| ID | Endpoint | Method | Scenario | Preconditions | Request/Data | Expected Status | Response Assertions | Business Assertions | Type | Priority |
|---|---|---|---|---|---|---|---|---|---|---|
| API-PART-238 | `/api/part/internal-price/` | GET | List | USER-OK. | Token. | **200** | Paginated. | | Positive | P2 |
| API-PART-239 | `/api/part/internal-price/` | POST | Create | PART-A. | Body per Internal Price serializer — **Needs clarification** of required writable fields (page example includes generated fields). | **201** | `pk` assigned. | GET list includes it. | Positive | P2 |
| API-PART-240 | `/api/part/internal-price/{id}/` | GET/PATCH/PUT/DELETE | Detail CRUD | Price from 239. | GET; PATCH change; PUT; DELETE. | 200 / 200 / 200 / **204** | DELETE empty. | After DELETE, GET **Needs verification**. | Positive | P2 |
| API-PART-241 | `/api/part/sale-price/` | GET | List | USER-OK. | Token. | **200** | Paginated. | | Positive | P2 |
| API-PART-242 | `/api/part/sale-price/` | POST | Create | PART-A salable preferred (not required in this schema). | Body **Needs clarification**. | **201** | `pk` assigned. | | Positive | P2 |
| API-PART-243 | `/api/part/sale-price/{id}/` | GET/PATCH/PUT/DELETE | Detail CRUD | From 242. | Same pattern as 240. | 200 / 200 / 200 / **204** | | | Positive | P2 |

## Stocktake

| ID | Endpoint | Method | Scenario | Preconditions | Request/Data | Expected Status | Response Assertions | Business Assertions | Type | Priority |
|---|---|---|---|---|---|---|---|---|---|---|
| API-PART-244 | `/api/part/stocktake/` | GET | List | USER-OK. | Token. | **200** | Paginated. | | Positive | P3 |
| API-PART-245 | `/api/part/stocktake/` | POST | Create | PART-A. | Body **Needs clarification**. | **201** | `pk` assigned. | | Positive | P3 |
| API-PART-246 | `/api/part/stocktake/generate/` | POST | Generate stocktake | USER-OK. | Body **Needs clarification**. | **201** | | | Positive | P3 |
| API-PART-247 | `/api/part/stocktake/{id}/` | GET/PATCH/PUT/DELETE | Detail CRUD | From 245. | | 200 / 200 / 200 / **204** | | | Positive | P3 |
| API-PART-248 | `/api/part/stocktake/` | DELETE | Collection DELETE | Understand impact first (bulk). | DELETE collection. | **204** | Schema documents collection DELETE 204. | **High risk** — confirm which rows are deleted before using in a shared environment. | Negative | P3 |

## Auth smoke on a supporting endpoint

| ID | Endpoint | Method | Scenario | Preconditions | Request/Data | Expected Status | Response Assertions | Business Assertions | Type | Priority |
|---|---|---|---|---|---|---|---|---|---|---|
| API-PART-249 | `/api/part/{id}/requirements/` | GET | Unauthenticated | USER-NONE. | No auth. | **Needs verification** | Not 200 requirements body. | | Security | P2 |
| API-PART-250 | `/api/part/{id}/bom-copy/` | POST | USER-RO forbidden | USER-RO. Valid source/dest. | `{"part":PART-SRC.pk}` | **403** | Overview: out-of-role → 403. | Destination BOM unchanged. | Security | P2 |
