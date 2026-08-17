# AgentQA

Test assets for the InvenTree **Parts** module: manual UI and API cases, plus Playwright automation for both.

The product under test is InvenTree’s Parts domain (create/edit parts, categories, attributes, revisions, parameters, related parts, and the matching REST API). Behavior is taken from the stable InvenTree docs — not invented. Gaps are marked **Needs clarification** / **Needs verification** in the manual cases.

**Sources of truth**

- [Parts (UI)](https://docs.inventree.org/en/stable/part/)
- [Parts and Part Categories API schema](https://docs.inventree.org/en/stable/api/schema/part/) (API 530)
- [API overview](https://docs.inventree.org/en/stable/api/) (auth, roles, **403**)



## Layout

```
AgentQA/
  testcases/         # Manual UI + API cases (canonical)
  automation/ui/     # Playwright UI tests (Platform UI /web)
  automation/api/    # Playwright API tests (no browser)
  agents/            # Specs used to generate the assets above
```


| Path                                 | What it is                                                                                                                                     |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `[testcases/](testcases/)`           | Manual functional cases. Indexes: `[ui-manual-tests.md](testcases/ui-manual-tests.md)`, `[api-manual-tests.md](testcases/api-manual-tests.md)` |
| `[automation/ui/](automation/ui/)`   | Playwright + TypeScript, page objects, Chromium. See `[automation/ui/README.md](automation/ui/README.md)`                                      |
| `[automation/api/](automation/api/)` | Playwright + TypeScript `APIRequestContext`. See `[automation/api/README.md](automation/api/README.md)`                                        |
| `[agents/](agents/)`                 | Instruction specs for generating cases and automation                                                                                          |




## Manual tests

**UI** — 270 cases (`UI-PART-001` – `UI-PART-270`) by feature:


| File                                                                             | Area                                    |
| -------------------------------------------------------------------------------- | --------------------------------------- |
| `[01_part_creation.md](testcases/01_part_creation.md)`                           | Manual create, validation, permissions  |
| `[02_part_import.md](testcases/02_part_import.md)`                               | Import from file / supplier             |
| `[03_part_detail_view.md](testcases/03_part_detail_view.md)`                     | Detail header and tabs                  |
| `[04_part_categories.md](testcases/04_part_categories.md)`                       | Hierarchy, filtering, parametric tables |
| `[05_part_attributes.md](testcases/05_part_attributes.md)`                       | Virtual, template, assembly, locked, …  |
| `[06_units_of_measure.md](testcases/06_units_of_measure.md)`                     | Part UoM                                |
| `[07_part_revisions.md](testcases/07_part_revisions.md)`                         | Revisions                               |
| `[08_part_parameters.md](testcases/08_part_parameters.md)`                       | Parameters                              |
| `[09_part_templates_variants.md](testcases/09_part_templates_variants.md)`       | Templates and variants                  |
| `[10_test_templates.md](testcases/10_test_templates.md)`                         | Test templates                          |
| `[11_attachments_images_related.md](testcases/11_attachments_images_related.md)` | Images, attachments, related parts      |
| `[12_cross_functional.md](testcases/12_cross_functional.md)`                     | Cross-feature flows                     |


**API** — 250 cases (`API-PART-001` – `API-PART-250`) by endpoint group:


| File                                                                         | API group                           |
| ---------------------------------------------------------------------------- | ----------------------------------- |
| `[api_01_part_crud.md](testcases/api_01_part_crud.md)`                       | `/api/part/` CRUD                   |
| `[api_02_part_list_filter.md](testcases/api_02_part_list_filter.md)`         | Filters, search, pagination         |
| `[api_03_part_validation.md](testcases/api_03_part_validation.md)`           | Field validation                    |
| `[api_04_part_category.md](testcases/api_04_part_category.md)`               | `/api/part/category/`               |
| `[api_05_relationships.md](testcases/api_05_relationships.md)`               | Category, revision, variant FKs     |
| `[api_06_auth_conflicts.md](testcases/api_06_auth_conflicts.md)`             | Auth, 403, conflicts                |
| `[api_07_related_tests_params.md](testcases/api_07_related_tests_params.md)` | Related parts, test templates       |
| `[api_08_supporting_endpoints.md](testcases/api_08_supporting_endpoints.md)` | Pricing, requirements, serials, BOM |


Automated tests map back with `// Covers: UI-PART-xxx` or `// Covers: API-PART-xxx`.

## Automation

Both suites need **Node.js 18+** and a running InvenTree instance. Env vars are the same (`BASE_URL`, `INVENTREE_USERNAME`, `INVENTREE_PASSWORD`, optional readonly user). Copy `.env.example` → `.env` in each suite; do not commit `.env`.

### UI (Playwright, Chromium)

Drives the Platform UI (`/web`). Locators follow InvenTree’s PUI control names. API is used only to seed and clean up data.

```bash
cd automation/ui
npm install
npx playwright install chromium
cp .env.example .env
npx playwright test
```



### API (Playwright, no browser)

HTTP tests against `/api/part/` and related endpoints. Token auth with Basic fallback. Each test creates unique `QA-API-…` data and deletes it in teardown.

```bash
cd automation/api
npm install
cp .env.example .env
npx playwright test
npx playwright test --grep @p1
```

Documented success codes asserted in API tests: GET/PATCH/PUT **200**, POST create **201**, DELETE **204**, permission denied **403**. Codes not on the schema page (400/401/404/409) are treated as 4xx / not-success, not as a hard contract.

## Conventions

- Do not invent product behavior, endpoints, or status codes.
- Tests are independent; names are unique per run (`QA-UI-…` / `QA-API-…`).
- UI and API automation stay in separate folders so they can be installed and run on their own.
- `agents/` holds the generation specs; `testcases/` is the case library to maintain going forward.

