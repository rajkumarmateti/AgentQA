# API Automated Tests — Cursor Agent Instructions

## Purpose
Generate a runnable API automation project from `api-manual-tests.md` for the InvenTree Parts API.

## Framework
Playwright API testing is also acceptable when the repository is TypeScript/Playwright-based.

## Inputs
- `api-manual-tests.md`
- API schema: https://docs.inventree.org/en/stable/api/schema/part/
- Existing InvenTree repository/environment, if present

## Scope
Automate:
1. Part CRUD
2. Part Category CRUD
3. Filtering, pagination, and search
4. Required/max-length/nullable/read-only validation
5. Relationship integrity
6. Unauthorized/forbidden access
7. Not-found and conflict cases
8. Positive, negative, and boundary scenarios
9. Response schema and business-rule assertions

## Architecture rules
- Use reusable API client/service methods.
- Separate endpoint logic, test data, fixtures, schemas, and tests.
- Externalize base URL and credentials.
- Never commit secrets.
- Use fixtures for authentication and reusable setup/cleanup.
- Make tests independent and repeatable.
- Use parameterization for validation matrices and similar scenarios.
- Prefer schema validation for structured responses.
- Create and clean up test data safely.
- Do not depend on test execution order.

## Recommended structure
tests/api/
clients/
schemas/
fixtures/
data/
utils/
conftest.py
pytest.ini
README.md

Adapt to the existing repository conventions.

## Traceability
Each automated test must reference its manual test ID:
`# Covers: API-PART-001`

## Assertions
For each request validate as applicable:
- HTTP status
- response headers
- response schema/types
- required fields
- returned values
- persistence
- relationship integrity
- business rules
- error payload structure

Do not assert undocumented behavior without marking it as an assumption.

## Data-driven testing
Use parameterization for:
- invalid/missing/null fields
- boundary lengths
- filtering/search combinations
- authorization cases
- similar CRUD variations

## Execution
README must explain:
- environment setup
- dependency installation
- configuration
- running all API tests
- running one test
- running by marker
- report generation
- test-data cleanup

## Quality gate
Before finishing:
- Every automated test maps to a manual API test.
- Positive, negative, boundary, and authorization coverage exists.
- Response schema and business assertions are meaningful.
- No secrets are committed.
- Tests can run against a fresh/running InvenTree instance.
- Document any schema gaps, environment limitations, or code fixes.
