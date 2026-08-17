# API: Related parts, test templates, category parameter templates

## Related parts — `/api/part/related/`

POST **201**. Writable required: `part_1`, `part_2`. `note` maxLength 500. `pk`, `part_*_detail` read-only.  
GET filters: `part`, `part_1`, `part_2`, `search` (part_1__name, part_2__name), `limit`, `offset`, `ordering`.  
DELETE **204**.

| ID | Endpoint | Method | Scenario | Preconditions | Request/Data | Expected Status | Response Assertions | Business Assertions | Type | Priority |
|---|---|---|---|---|---|---|---|---|---|---|
| API-PART-191 | `/api/part/related/` | GET | List relations | At least one relation or empty DB. | Token. | 200 | `count`,`results`. Items: `pk`,`part_1`,`part_2`; details read-only. | | Positive | P1 |
| API-PART-192 | `/api/part/related/` | POST | Create relation | PART-A, PART-B exist. | `{"part_1":PART-A.pk,"part_2":PART-B.pk,"note":"alt"}` | 201 | `part_1`/`part_2` match. `pk` assigned. `note`=`alt`. Details may be expanded. | GET `?part=`PART-A.pk includes the relation. | Positive | P1 |
| API-PART-193 | `/api/part/related/` | POST | Missing `part_2` | PART-A. | `{"part_1":PART-A.pk}` | **Needs verification** | Both part_1 and part_2 required (writable). | No relation created. | Negative | P1 |
| API-PART-194 | `/api/part/related/` | POST | Invalid part PK | PART-A. | `part_2`: 99999999 | **Needs verification** | | | Negative | P1 |
| API-PART-195 | `/api/part/related/` | POST | `note` length 500 vs 501 | Valid pair. | 500 chars; 501. | 201; **Needs verification** | | | Boundary | P2 |
| API-PART-196 | `/api/part/related/` | GET | Filter `part_1` / `part_2` / `part` | Relation exists. | Each query PK. | 200 | Results match the filter. Difference between `part` vs `part_1` **Needs clarification**. | | Positive | P2 |
| API-PART-197 | `/api/part/related/{id}/` | GET | Retrieve | Relation from 192. | Path id. | 200 | Same `pk`. | | Positive | P1 |
| API-PART-198 | `/api/part/related/{id}/` | PATCH | Update note | Relation exists. | `{"note":"updated"}` | 200 | `note` updated. `part_1`/`part_2` unchanged. | | Positive | P2 |
| API-PART-199 | `/api/part/related/{id}/` | PUT | Replace | Relation exists. | `part_1`,`part_2`,`note`. | 200 | Fields match. | | Positive | P2 |
| API-PART-200 | `/api/part/related/{id}/` | DELETE | Delete relation | Disposable relation. | DELETE | 204 | Empty. | GET id **Needs verification**. Parts A/B still exist. | Positive | P1 |
| API-PART-201 | `/api/part/related/{id}/` | GET | Unknown id | Unused PK. | GET | **Needs verification** | | | Negative | P2 |

## Test templates — `/api/part/test-template/`

POST **201**. Writable required: `part`, `test_name` (maxLength 100). `key` **readOnly**. `choices` maxLength 5000. `description` maxLength 100, nullable.  
GET filters: `enabled`, `has_results`, `key`, `part`, `required`, `requires_attachment`, `requires_value`, `search` (description, test_name).

| ID | Endpoint | Method | Scenario | Preconditions | Request/Data | Expected Status | Response Assertions | Business Assertions | Type | Priority |
|---|---|---|---|---|---|---|---|---|---|---|
| API-PART-202 | `/api/part/test-template/` | GET | List | USER-OK. | Token. | 200 | Paginated. Items include `pk`,`part`,`test_name`,`key`,`results`. | | Positive | P1 |
| API-PART-203 | `/api/part/test-template/` | POST | Create template | Testable part recommended (schema does not require `testable`). | `{"part":PART-A.pk,"test_name":"Firmware Version"}` | 201 | `test_name` set. `key` server-generated (read-only). `pk` assigned. `results` read-only. | GET `?part=`PART-A.pk includes it. | Positive | P1 |
| API-PART-204 | `/api/part/test-template/` | POST | Client-supplied `key` ignored | Same. | `test_name` plus `"key":"hacked"`. | 201 | `key` is server-derived, not necessarily `"hacked"`. | | Negative | P2 |
| API-PART-205 | `/api/part/test-template/` | POST | Missing `test_name` or `part` | PART-A. | `{"part":PART-A.pk}`; `{"test_name":"X"}`. | **Needs verification** | | | Negative | P1 |
| API-PART-206 | `/api/part/test-template/` | POST | `test_name` 100 vs 101 | PART-A. | | 201; **Needs verification** | | | Boundary | P1 |
| API-PART-207 | `/api/part/test-template/` | POST | Flags and `choices` | PART-A. | `required`,`requires_value`,`requires_attachment`,`enabled` booleans; `choices` ≤5000; `description` ≤100. | 201 | Flags stored. | `choices` 5001 **Needs verification**. | Positive | P2 |
| API-PART-208 | `/api/part/test-template/` | POST | Invalid `part` PK | Unused. | `part`: 99999999 | **Needs verification** | | | Negative | P1 |
| API-PART-209 | `/api/part/test-template/` | GET | Filter `part` / `enabled` / `required` | Seed two templates. | Query flags. | 200 | Results match filters. | | Positive | P2 |
| API-PART-210 | `/api/part/test-template/{id}/` | GET | Retrieve | Template from 203. | Path id. | 200 | Same `pk`,`key`. | | Positive | P1 |
| API-PART-211 | `/api/part/test-template/{id}/` | PATCH | Disable | Template exists. | `{"enabled":false}` | 200 | `enabled` false. `key` unchanged. | Prefer disable over delete (product); schema allows PATCH. | Positive | P2 |
| API-PART-212 | `/api/part/test-template/{id}/` | DELETE | Delete | Disposable template. | DELETE | 204 | | GET id **Needs verification**. `results` count on part no longer includes it. | Positive | P1 |
| API-PART-213 | `/api/part/test-template/{id}/` | GET | Unknown id | Unused. | GET | **Needs verification** | | | Negative | P2 |

## Category parameter templates — `/api/part/category/parameters/`

POST **201**. Writable required: `category`, `template`. `default_value` maxLength 500. `pk`,`category_detail`,`template_detail` read-only.  
GET: `limit`,`offset` only (no extra filters documented).

| ID | Endpoint | Method | Scenario | Preconditions | Request/Data | Expected Status | Response Assertions | Business Assertions | Type | Priority |
|---|---|---|---|---|---|---|---|---|---|---|
| API-PART-214 | `/api/part/category/parameters/` | GET | List | USER-OK. | Token. | 200 | Paginated. Items: `pk`,`category`,`template`,`default_value`. | | Positive | P1 |
| API-PART-215 | `/api/part/category/parameters/` | POST | Link template to category | CAT-A, TPL-PARAM exist. | `{"category":CAT-A.pk,"template":TPL-PARAM.pk,"default_value":"10000"}` | 201 | FKs stored. `default_value`=`10000`. Details read-only. | | Positive | P1 |
| API-PART-216 | `/api/part/category/parameters/` | POST | Missing `template` | CAT-A. | `{"category":CAT-A.pk}` | **Needs verification** | | | Negative | P1 |
| API-PART-217 | `/api/part/category/parameters/` | POST | Invalid category or template PK | Unused ids. | Each invalid. | **Needs verification** | | | Negative | P1 |
| API-PART-218 | `/api/part/category/parameters/` | POST | `default_value` 500 vs 501 | Valid FKs. | | 201; **Needs verification** | | | Boundary | P2 |
| API-PART-219 | `/api/part/category/parameters/{id}/` | GET/PATCH/PUT | Retrieve and update default | Link from 215. | GET; PATCH `{"default_value":"1k"}`; PUT with category+template+value. | 200 / 200 / 200 | `default_value` updates on PATCH. | | Positive | P2 |
| API-PART-220 | `/api/part/category/parameters/{id}/` | DELETE | Delete link | Disposable link. | DELETE | 204 | | Category and parameter template records still exist. | Positive | P1 |
