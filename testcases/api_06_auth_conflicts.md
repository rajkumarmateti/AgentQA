# API: Authorization, invalid payloads, not-found, conflicts

**Auth (overview):** Basic username/password or `Authorization: Token <token>`. Cookie and oauth2 also listed on the schema.  
**403:** Documented — action outside the user’s roles returns **403**.  
**401 / 404 / 400 / 409:** **Not** listed on the Parts schema page — **Needs verification**.

| ID | Endpoint | Method | Scenario | Preconditions | Request/Data | Expected Status | Response Assertions | Business Assertions | Type | Priority |
|---|---|---|---|---|---|---|---|---|---|---|
| API-PART-166 | `/api/part/` | GET | No credentials | USER-NONE. | No Authorization header. | **Needs verification** (not 200) | Not a part list. | | Security | P1 |
| API-PART-167 | `/api/part/` | GET | Invalid token | USER-NONE. | `Authorization: Token invalidtoken` | **Needs verification** | | | Security | P1 |
| API-PART-168 | `/api/part/` | GET | Token missing `Token ` prefix | Valid raw token string without prefix. | `Authorization: TOK-OK` (no `Token `). | **Needs verification** | Schema requires prefix `Token`. | | Security | P1 |
| API-PART-169 | `/api/part/` | GET | Valid Token auth | USER-OK. | `Authorization: Token TOK-OK` | 200 | List schema. | | Positive | P1 |
| API-PART-170 | `/api/part/` | GET | Valid Basic auth | USER-OK username/password. | HTTP Basic. | 200 | List schema. | | Positive | P2 |
| API-PART-171 | `/api/part/` | POST | USER-RO cannot create | USER-RO view-only Part role. | `{"name":"QA-API-Forbidden-Create"}` | **403** | Permission error message (overview). | No part created. | Security | P1 |
| API-PART-172 | `/api/part/{id}/` | PATCH | USER-RO cannot change | PART-A. USER-RO. | `{"description":"nope"}` | **403** | | Description unchanged. | Security | P1 |
| API-PART-173 | `/api/part/{id}/` | DELETE | USER-RO cannot delete | Disposable part. USER-RO. | DELETE | **403** | | Part still exists. | Security | P1 |
| API-PART-174 | `/api/part/category/` | POST | USER-RO cannot create category | USER-RO without category add. | `{"name":"QA-API-NoCat"}` | **403** | | | Security | P1 |
| API-PART-175 | `/api/part/` | GET | USER-RO can list if view granted | USER-RO has view. | GET | 200 | List schema. | Read allowed. | Permissions | P2 |
| API-PART-176 | `/api/part/` | POST | Invalid JSON | USER-OK. | `{` | **Needs verification** | | No part created. | Invalid payload | P1 |
| API-PART-177 | `/api/part/` | POST | JSON array instead of object | USER-OK. | `[{"name":"x"}]` | **Needs verification** | | | Invalid payload | P1 |
| API-PART-178 | `/api/part/` | POST | Empty object | USER-OK. | `{}` | **Needs verification** | Missing `name`. | | Invalid payload | P1 |
| API-PART-179 | `/api/part/{id}/` | PATCH | Invalid JSON | PART-A. | `{description:` | **Needs verification** | | Part unchanged. | Invalid payload | P2 |
| API-PART-180 | `/api/part/` | POST | Unsupported media type | USER-OK. | XML body. | **Needs verification** | Schema allows json, x-www-form-urlencoded, multipart. | | Invalid payload | P2 |
| API-PART-181 | `/api/part/` | GET | Unsupported method TRACE | USER-OK. | TRACE `/api/part/` | **Needs verification** | | | Negative | P3 |
| API-PART-182 | `/api/part/{id}/` | POST | POST on detail (not in inventory) | PART-A. | POST body. | **Needs verification** | Detail POST is not listed (except sub-routes). | | Negative | P2 |
| API-PART-183 | `/api/part/` | POST | Duplicate `name` | PART-A name already used. | Same `name` as PART-A. | **Needs verification** | Schema does not mark `name` unique. | Record uniqueness enforcement. | Conflict | P1 |
| API-PART-184 | `/api/part/` | POST | Duplicate `IPN` when setting disallows | Global Allow Duplicate IPN false. Existing IPN. | Same IPN, unique name. | **Needs verification** | Setting is not in this schema. | If rejected, no second part. | Conflict | P1 |
| API-PART-185 | `/api/part/` | POST | Duplicate `IPN` when setting allows | Allow Duplicate IPN true (schema default of the *setting* is not here; product default True). | Same IPN, unique name. | 201 | Second part created. | Both parts exist. | Positive | P2 |
| API-PART-186 | `/api/part/{id}/` | PATCH | Concurrent update (lost update) | Two PATCH with different descriptions. | Sequential PATCH A then B. | 200, 200 | Last write wins unless ETag documented (it is not). | No ETag/If-Match in this schema. | Conflict | P3 |
| API-PART-187 | `/api/part/{id}/` | DELETE | Delete part used in assembly | Part is a BOM line; Allow Deletion from Assembly false (product setting, not schema). | DELETE | **Needs verification** | | Part remains if protected. | Conflict | P2 |
| API-PART-188 | `/api/part/{id}/` | PATCH | Edit locked part | `locked`=true. | `{"description":"lock-edit"}` | **Needs verification** | Schema: locked parts cannot be edited. | Description unchanged if enforced. | Conflict | P1 |
| API-PART-189 | `/api/part/related/` | POST | Relate a part to itself | PART-A. | `{"part_1":PART-A.pk,"part_2":PART-A.pk}` | **Needs verification** | | Self-relation should not persist if business-forbidden (not in schema). | Conflict | P2 |
| API-PART-190 | `/api/part/related/` | POST | Duplicate related pair | Existing PART-A–PART-B relation. | Same `part_1`/`part_2`. | **Needs verification** | | Duplicate relationship **Needs clarification**. | Conflict | P2 |
