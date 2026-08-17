# InvenTree Parts — UI Automation

Playwright tests for the InvenTree **Parts** module, mapped from `testcases/ui-manual-tests.md`.

This project lives in `automation/ui/` so it stays separate from the manual cases. Tests drive the **Platform UI** (`/web`) using documented control names from InvenTree’s own PUI suite (`text-field-*`, `action-menu-add-parts`, `panel-tabs-*`).

## Prerequisites

- Node.js 18+
- A running InvenTree instance with the Platform UI enabled
- A user who can create, change, and delete parts

## Install

```bash
cd automation/ui
npm install
npx playwright install chromium
```

## Configure

```bash
cp .env.example .env
```

Set:

| Variable | Purpose |
|---|---|
| `BASE_URL` | InvenTree origin, e.g. `http://localhost:8000` |
| `INVENTREE_USERNAME` / `INVENTREE_PASSWORD` | User with Part create permission |
| `INVENTREE_READONLY_USERNAME` / `INVENTREE_READONLY_PASSWORD` | Optional; required for UI-PART-012 |

Do not commit `.env`.

## Run

```bash
# all UI tests
npx playwright test

# one file
npx playwright test tests/part-crud.spec.ts

# one test by title
npx playwright test --grep "create a part with required fields"

# headed
npx playwright test --headed

# Playwright inspector
npx playwright test --debug

# interactive UI mode
npx playwright test --ui

# HTML report (after a run)
npx playwright show-report
```

npm scripts: `npm test`, `npm run test:headed`, `npm run test:debug`, `npm run test:ui`, `npm run report`.

## Layout

```
automation/ui/
  tests/          # spec files (testDir)
  pages/          # page objects
  fixtures/       # auth + shared fixtures
  data/           # locators and payloads
  utils/          # env, unique names, API cleanup
  playwright.config.ts
```

API calls are used only to **seed and delete** data. Create/edit/navigate assertions go through the UI.

## Coverage (manual IDs)

| Spec | Manual IDs (primary) | Scope item |
|---|---|---|
| `part-crud.spec.ts` | UI-PART-001, 002, 003, 004, 005, 022 | Core Part CRUD |
| `part-creation-validation.spec.ts` | UI-PART-006, 007, 012, 013, 017 | Creation + validation |
| `part-detail-tabs.spec.ts` | UI-PART-043, 048, 049, 057, 062, 068, 074 | Detail tabs + navigation |
| `categories.spec.ts` | UI-PART-004, 025, 079, 083, 086, 087 | Categories + filtering |
| `part-attributes.spec.ts` | UI-PART-053, 096, 113, 132, 137–139 | Attributes |
| `parameters.spec.ts` | UI-PART-068, 184 | Parameters |
| `revisions.spec.ts` | UI-PART-161–164 | Revisions |
| `negative.spec.ts` | UI-PART-014, 016, 017 | Negative / boundary |
| `cross-functional.spec.ts` | UI-PART-256 | Create → parameter → stock → category |

## Assumptions and selector notes

- Target UI is InvenTree **PUI** (`/web/login`, `/web/part/...`), not the legacy Django templates.
- Login controls: `login-username`, `login-password`, button **Log in**.
- Add Parts: `action-menu-add-parts` → `action-menu-add-parts-create-part`.
- Form fields: `text-field-name`, `text-field-description`, `text-field-IPN`, related/tree category fields.
- Detail panels: `panel-tabs-*` + tab name (Stock, Bill of Materials, Parameters, …).
- PUI text inputs debounce (~250ms). Page objects blur the field instead of using a fixed sleep.
- Parameter template setup tries `part/parameter/template/` then `generic/parameter/template/`.
- Names are unique per run (`QA-UI-<suffix>`) and deleted via API in teardown.
- UI-PART-012 is skipped unless a read-only user is configured.
- Tests are serial (`workers: 1`) to reduce interference on a shared instance.

## Diagnostics

On failure Playwright keeps a **trace**, **screenshot**, and **video** (`retain-on-failure`). Open a trace with:

```bash
npx playwright show-trace test-results/**/trace.zip
```
