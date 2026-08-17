# API: Part field-level validation

**Endpoints:** `POST /api/part/`, `PATCH|PUT /api/part/{id}/`  
Documented constraints only. Error HTTP status is **Needs verification** unless noted.

| ID | Endpoint | Method | Scenario | Preconditions | Request/Data | Expected Status | Response Assertions | Business Assertions | Type | Priority |
|---|---|---|---|---|---|---|---|---|---|---|
| API-PART-071 | `/api/part/` | POST | `name` length 100 (max) | USER-OK. | `name` = 100-char unique string. | 201 | `name` length 100. | Part stored. | Boundary | P1 |
| API-PART-072 | `/api/part/` | POST | `name` length 101 | USER-OK. | `name` = 101 chars. | **Needs verification** | Error; no 201 Part. | No part created. | Boundary | P1 |
| API-PART-073 | `/api/part/` | POST | `name` wrong type | USER-OK. | `{"name":123}` | **Needs verification** | Error. | | Negative | P1 |
| API-PART-074 | `/api/part/` | POST | `name` null | USER-OK. | `{"name":null}` | **Needs verification** | `name` is not nullable in schema. | | Negative | P1 |
| API-PART-075 | `/api/part/` | POST | `IPN` length 100 vs 101 | USER-OK. Unique names. | `IPN` 100 chars; then 101. | 201 then **Needs verification** | 100 accepted (`maxLength` 100). 101 rejected. | | Boundary | P1 |
| API-PART-076 | `/api/part/` | POST | `IPN` omitted uses default `""` | USER-OK. | `{"name":"QA-API-NoIPN"}` | 201 | `IPN` is `""` (default). | | Positive | P2 |
| API-PART-077 | `/api/part/` | POST | `description` max 250 vs 251 | USER-OK. | description 250; then 251. | 201 then **Needs verification** | | | Boundary | P1 |
| API-PART-078 | `/api/part/` | POST | `keywords` max 250, nullable | USER-OK. | `keywords` null; `keywords` 250; `keywords` 251. | 201; 201; **Needs verification** | Null allowed. 250 ok. 251 not. | | Boundary | P2 |
| API-PART-079 | `/api/part/` | POST | `notes` max 50000, nullable | USER-OK. | `notes` null; large string 50000; 50001. | 201; 201; **Needs verification** | | Parameterize size. | Boundary | P3 |
| API-PART-080 | `/api/part/` | POST | `units` max 20, nullable | USER-OK. | `units` null; 20 chars; 21 chars. | 201; 201; **Needs verification** | Schema does not require pint-valid units on this field. Invalid unit **business** rejection is **Needs clarification**. | | Boundary | P2 |
| API-PART-081 | `/api/part/` | POST | `revision` max 100, nullable, default `""` | USER-OK. | omit; null; 100 chars; 101 chars. | 201 / 201 / 201 / **Needs verification** | Default `""` when omitted. | | Boundary | P2 |
| API-PART-082 | `/api/part/` | POST | `link` valid URI ≤2000 | USER-OK. | `link`=`https://example.com/a` | 201 | `link` stored. | | Positive | P2 |
| API-PART-083 | `/api/part/` | POST | `link` empty string (oneOf maxLength 0) | USER-OK. | `link`=`""` | 201 | Empty link accepted per oneOf. | | Boundary | P2 |
| API-PART-084 | `/api/part/` | POST | `link` null | USER-OK. | `link`: null | 201 | Nullable. | | Positive | P2 |
| API-PART-085 | `/api/part/` | POST | `link` invalid URI | USER-OK. | `link`=`not a url` | **Needs verification** | | | Negative | P2 |
| API-PART-086 | `/api/part/` | POST | `link` length 2001 | USER-OK. | URI-looking string length 2001. | **Needs verification** | maxLength 2000 on URI branch. | | Boundary | P3 |
| API-PART-087 | `/api/part/` | POST | `category` null | USER-OK. | `{"name":"QA-API-NoCat","category":null}` | 201 | `category` null. | Uncategorized part allowed. | Positive | P1 |
| API-PART-088 | `/api/part/` | POST | `category` wrong type | USER-OK. | `{"name":"QA-API-CatStr","category":"Electronics"}` | **Needs verification** | integer required. | | Negative | P1 |
| API-PART-089 | `/api/part/` | POST | `default_location` null vs non-integer | USER-OK. | null; `"warehouse"`. | 201; **Needs verification** | nullable integer. | | Negative | P2 |
| API-PART-090 | `/api/part/` | POST | `default_expiry` min 0 | USER-OK. | `0`; `-1`; `1`. | 201; **Needs verification**; 201 | minimum 0. | | Boundary | P2 |
| API-PART-091 | `/api/part/` | POST | `default_expiry` wrong type | USER-OK. | `{"name":"QA-API-Exp","default_expiry":"tomorrow"}` | **Needs verification** | integer (int64). | | Negative | P2 |
| API-PART-092 | `/api/part/` | POST | `minimum_stock` / `maximum_stock` numeric | USER-OK. | `0.0`; `10.5`; `"ten"`. | 201; 201; **Needs verification** | type number, default 0.0. | Whether min > max is rejected is **Needs clarification**. | Boundary | P2 |
| API-PART-093 | `/api/part/` | POST | Boolean field wrong type | USER-OK. | `{"name":"QA-API-Bool","active":"yes"}` | **Needs verification** | | Parameterize other booleans. | Negative | P1 |
| API-PART-094 | `/api/part/` | POST | `tags` array of strings vs invalid | USER-OK. | `tags:["qa","api"]`; `tags:"qa"`; `tags:[1]`. | 201; **Needs verification**; **Needs verification** | array of string. | | Negative | P2 |
| API-PART-095 | `/api/part/` | POST | `image` URI nullable | USER-OK. | `image` null; invalid non-URI. | 201; **Needs verification** | format uri, nullable. | File upload via multipart **Needs clarification**. | Negative | P3 |
| API-PART-096 | `/api/part/` | POST | Malformed JSON | USER-OK. | Body `{name:` | **Needs verification** | | | Invalid payload | P1 |
| API-PART-097 | `/api/part/` | POST | Wrong Content-Type | USER-OK. | Valid JSON with `Content-Type: text/plain`. | **Needs verification** | | | Invalid payload | P2 |
| API-PART-098 | `/api/part/` | POST | Extra unknown property | USER-OK. | `{"name":"QA-API-Extra","not_a_field":true}` | **Needs verification** | If 201, `not_a_field` not stored. | Strict vs ignore-unknown **Needs clarification**. | Negative | P3 |
| API-PART-099 | `/api/part/{id}/` | PATCH | `description` over maxLength | Unlocked part. | description 251 chars. | **Needs verification** | | Unchanged description if rejected. | Boundary | P1 |
| API-PART-100 | `/api/part/{id}/` | PATCH | Null non-nullable `name` | Unlocked part. | `{"name":null}` | **Needs verification** | | `name` unchanged if rejected. | Negative | P1 |
| API-PART-101 | `/api/part/{id}/` | PATCH | `revision_of` / `variant_of` / `responsible` / `creation_user` type integer or null | Unlocked part. Valid user PK if used. | Each field null; integer; string. | 201/200 for null/int; **Needs verification** for string | nullable integers. | Invalid FK: see relationships file. | Validation | P2 |
| API-PART-102 | `/api/part/` | POST | Array/object where object expected | USER-OK. | `{"name":"QA-API-Arr","duplicate":[]}` | **Needs verification** | `duplicate` must be PartDuplicateOptions object if sent. | | Negative | P2 |
| API-PART-103 | `/api/part/` | POST | Empty body | USER-OK. | No body / `null`. | **Needs verification** | | | Negative | P1 |
| API-PART-104 | `/api/part/{id}/` | PATCH | `minimum_stock` string number | Unlocked part. | `{"minimum_stock":"5"}` | **Needs verification** | Schema type number, not string. | | Negative | P3 |
| API-PART-105 | `/api/part/` | POST | Unicode `name` within maxLength | USER-OK. | `name` with non-ASCII, length ≤100. | 201 | `name` round-trips. | | Positive | P3 |
