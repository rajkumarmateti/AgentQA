# UI Automated Tests — Cursor Agent Instructions

## Purpose
Generate a runnable, maintainable UI automation project from `ui-manual-tests.md` for the InvenTree Parts module.

## Framework
Use **Playwright** unless the existing repository clearly mandates another framework.

## Inputs
- `ui-manual-tests.md`
- InvenTree Parts documentation: https://docs.inventree.org/en/stable/part/
- Existing application source/repository, if present

## Scope
Automate the highest-value functional coverage first:
1. Core Part CRUD
2. Part creation and validation
3. Part detail navigation and key tabs
4. Categories and filtering
5. Important Part attributes
6. Parameters
7. Revisions and key constraints
8. Negative/boundary scenarios
9. At least one cross-functional flow:
   create part → add parameters → create stock → verify through category/view flow

## Architecture rules
- Use Page Object Model or a similarly clear component abstraction.
- Separate test data, page objects, API helpers, and tests.
- Prefer stable semantic selectors (`getByRole`, labels, test IDs) over brittle CSS/XPath.
- Never use arbitrary sleeps.
- Use Playwright auto-waiting and explicit conditions for asynchronous behavior.
- Keep tests independent and idempotent.
- Use fixtures for authentication, setup, and cleanup.
- Parameterize repeated validation/scenario data.
- Capture useful diagnostics on failure: trace, screenshot, video where appropriate.
- Avoid hard-coded credentials and environment-specific URLs.
- Support environment variables/configuration.
- Do not bypass the UI for the behavior under test; API/database setup may be used only for test preparation when justified.

## Required project structure
Prefer:
tests/ui/
pages/
fixtures/
data/
utils/
playwright.config.*
README.md

Adapt to the existing repository rather than overwriting its conventions.

## Traceability
Every automated test should reference the manual test ID in a comment or metadata, e.g.:
`// Covers: UI-PART-001, UI-PART-002`

## Assertions
Assert:
- visible UI state
- navigation
- form validation
- persisted values
- business rules
- meaningful error messages
Avoid weak assertions such as only checking that a page loaded.

## Execution
Provide commands in README for:
- install dependencies
- configure environment
- run all UI tests
- run a single test
- headed/debug mode
- report generation

## Quality gate
Before finishing:
- Ensure code is syntactically valid and runnable.
- Remove duplicate selectors/helpers.
- Validate every test against the current UI.
- Ensure cleanup prevents test pollution.
- Document any assumptions, selector limitations, or fixes made.
