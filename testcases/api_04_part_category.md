# API: Part Categories — `/api/part/category/`

**Success:** GET/PATCH/PUT **200** · POST **201** · DELETE **204**  
**Tree:** `GET /api/part/category/tree/` **200**

Writable required: `name` (maxLength 100). `structural`: parts may not be assigned directly to a structural category.

| ID | Endpoint | Method | Scenario | Preconditions | Request/Data | Expected Status | Response Assertions | Business Assertions | Type | Priority |
|---|---|---|---|---|---|---|---|---|---|---|
| API-PART-106 | `/api/part/category/` | GET | List categories | USER-OK. CAT-A exists. | Token. Optional `limit`. | 200 | Required `count`,`results`. Result items include `pk`,`name`,`pathstring`,`level`,`starred`. | CAT-A present. | Positive | P1 |
| API-PART-107 | `/api/part/category/` | POST | Create root category | Unique name. | `{"name":"QA-API-Electronics"}` | 201 | `name` set. `pk` integer. `parent` null. `pathstring` read-only populated. `level` read-only. `starred` boolean. | GET by id returns it. `top_level` filter includes it. | Positive | P1 |
| API-PART-108 | `/api/part/category/` | POST | Create child category | CAT-A exists. | `{"name":"QA-API-Resistors","parent":CAT-A.pk}` | 201 | `parent`=CAT-A.pk. `pathstring` includes parent path. | Parent `subcategories` increases (**Needs verification** of exact count semantics). | Positive | P1 |
| API-PART-109 | `/api/part/category/` | POST | Optional fields | LOC-A exists. | `name`, `description` (≤250), `default_keywords` (nullable, ≤250), `icon` (nullable, ≤100), `default_location`=LOC-A.pk, `structural` false. | 201 | Fields echoed. `default_location`=LOC-A.pk. | | Positive | P2 |
| API-PART-110 | `/api/part/category/{id}/` | GET | Retrieve category | CAT-A exists. | Path id. Query `path_detail=true`. | 200 | Category schema required `level`,`name`,`pathstring`,`pk`,`starred`. `path` array when path_detail requested (**Needs verification** if only then). | | Positive | P1 |
| API-PART-111 | `/api/part/category/{id}/` | PATCH | Rename | CAT-A unlocked/unused. | `{"name":"QA-API-Electronics-2"}` | 200 | `name` updated. `pk` same. `pathstring` may change. | GET reflects new name. Child `pathstring` **Needs verification**. | Positive | P1 |
| API-PART-112 | `/api/part/category/{id}/` | PUT | Update writable fields | CAT-B. | Body with `name` and optionals. | 200 | Writable fields match. Read-only not client-set. | | Positive | P2 |
| API-PART-113 | `/api/part/category/{id}/` | DELETE | Delete empty category | Category created for test, no children/parts (or after moving them). | DELETE id. | 204 | Empty body. | GET id fails (**Needs verification** status). | Positive | P1 |
| API-PART-114 | `/api/part/category/` | POST | Missing `name` | USER-OK. | `{}` | **Needs verification** | | No category created. | Negative | P1 |
| API-PART-115 | `/api/part/category/` | POST | `name` length 100 vs 101 | USER-OK. | 100 chars; 101 chars. | 201; **Needs verification** | | | Boundary | P1 |
| API-PART-116 | `/api/part/category/` | POST | `description` 250 vs 251 | USER-OK. | | 201; **Needs verification** | maxLength 250. | | Boundary | P2 |
| API-PART-117 | `/api/part/category/` | POST | `default_keywords` null and 251 | USER-OK. | null; 251 chars. | 201; **Needs verification** | nullable, maxLength 250. | | Boundary | P2 |
| API-PART-118 | `/api/part/category/` | POST | `icon` 100 vs 101 | USER-OK. | | 201; **Needs verification** | maxLength 100, nullable. | | Boundary | P3 |
| API-PART-119 | `/api/part/category/` | POST | `parent` invalid PK | USER-OK. | `{"name":"QA-API-BadParent","parent":99999999}` | **Needs verification** | | No orphaned parent link. | Negative | P1 |
| API-PART-120 | `/api/part/category/` | POST | `parent` wrong type | USER-OK. | `{"name":"QA-API-ParStr","parent":"root"}` | **Needs verification** | integer nullable. | | Negative | P2 |
| API-PART-121 | `/api/part/category/` | POST | `parent` null for root | USER-OK. | `{"name":"QA-API-RootNull","parent":null}` | 201 | `parent` null. | | Positive | P2 |
| API-PART-122 | `/api/part/category/{id}/` | PATCH | Set `parent` to self | CAT-A. | `{"parent":CAT-A.pk}` | **Needs verification** | Cycle should not persist. | Circular parent **Needs clarification**. | Negative | P1 |
| API-PART-123 | `/api/part/category/{id}/` | PATCH | Set `parent` to own descendant | CAT-A with child CAT-B. | PATCH CAT-A `parent`=CAT-B.pk | **Needs verification** | | Cycle prevention **Needs clarification**. | Negative | P1 |
| API-PART-124 | `/api/part/category/` | GET | Filter `parent` | CAT-B child of CAT-A. | `?parent=`CAT-A.pk | 200 | Results’ `parent` is CAT-A.pk. | | Positive | P1 |
| API-PART-125 | `/api/part/category/` | GET | Filter `top_level` | Root and child exist. | `?top_level=true` | 200 | Results have no parent / are top-level. | Children excluded. | Positive | P1 |
| API-PART-126 | `/api/part/category/` | GET | Filter `name` | CAT-A unique name. | `?name=` exact name | 200 | Matching name. Schema `name` query has no description — treat as exact or contains **Needs clarification**. | | Positive | P2 |
| API-PART-127 | `/api/part/category/` | GET | `search` | Documented fields: description, name, pathstring. | `?search=` fragment of name | 200 | CAT-A in results. | | Positive | P1 |
| API-PART-128 | `/api/part/category/` | GET | `cascade` | Nested categories. | `?parent=`CAT-A.pk`&cascade=true` | 200 | Schema: include sub-categories in filtered results. | Deeper descendants included when cascade true. | Positive | P2 |
| API-PART-129 | `/api/part/category/` | GET | `depth` / `structural` / `starred` / `exclude_tree` | Seed structural category. | Each query. | 200 | `structural=true` returns structural categories only. Others **Needs clarification** of depth meaning. | | Positive | P3 |
| API-PART-130 | `/api/part/category/` | GET | Pagination | ≥3 categories. | `?limit=1&offset=0` | 200 | `results.length` ≤ 1. `count` ≥ 3. | | Positive | P1 |
| API-PART-131 | `/api/part/category/` | GET | `ordering` | Distinct names. | `?ordering=name` | 200 | Ordered by name. | | Positive | P2 |
| API-PART-132 | `/api/part/category/tree/` | GET | Tree list | Nested categories. | Token. Optional `max_level`,`level`,`parent`,`search`,`limit`. | 200 | Paginated `count`/`results`. Items suitable for tree rendering (include `name`,`level`, etc.). | Hierarchy can be reconstructed. | Positive | P1 |
| API-PART-133 | `/api/part/category/tree/` | GET | `max_level` limits depth | Deep tree. | `?max_level=1` | 200 | Levels deeper than max excluded. | | Boundary | P2 |
| API-PART-134 | `/api/part/category/{id}/` | GET | Unknown id | Unused PK. | GET | **Needs verification** | | | Negative | P1 |
| API-PART-135 | `/api/part/category/{id}/` | PATCH | Read-only `pathstring`/`level`/`pk` | CAT-A. | `{"pathstring":"hack","level":99,"pk":1}` | **Needs verification** | Server values not replaced by client. | | Negative | P1 |
| API-PART-136 | `/api/part/category/` | POST | `structural=true` | USER-OK. | `{"name":"QA-API-Struct","structural":true}` | 201 | `structural` true. | Parts must not be assigned directly (API-PART-148). | Positive | P1 |
| API-PART-137 | `/api/part/category/{id}/` | DELETE | Unknown id | Unused PK. | DELETE | **Needs verification** | Schema lists 204 for the method, not for missing ids. | | Negative | P2 |
| API-PART-138 | `/api/part/category/{id}/` | DELETE | Category with children or parts | CAT-A has CAT-B and/or PART-A. | DELETE CAT-A. | **Needs verification** | | Protect or cascade **Needs clarification**. | Conflict | P1 |
| API-PART-139 | `/api/part/category/` | PATCH | Custom list PATCH | USER-OK. | Payload **Needs clarification**. | 200 | Documented success. | Record which rows change. | Positive | P3 |
| API-PART-140 | `/api/part/category/` | PUT | Custom list PUT | USER-OK. | Same. | 200 | | Record behavior. | Positive | P3 |
