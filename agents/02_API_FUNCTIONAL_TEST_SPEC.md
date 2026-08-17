# API Functional Test Specification — Cursor Agent Instructions

## Purpose
Create comprehensive manual API functional test cases for the InvenTree Parts API from the supplied problem statement and official API schema documentation.

## Source of truth
- API schema: https://docs.inventree.org/en/stable/api/schema/part/
- Use the actual schema definitions, endpoint paths, HTTP methods, request/response fields, validation rules, and relationships available from the documentation.
- Do not invent endpoints or fields. Mark unavailable/ambiguous behavior as **Needs clarification**.

## Scope
At minimum cover:
1. CRUD operations for Parts
2. CRUD operations for Part Categories
3. Parts list filtering, pagination, and search
4. Field-level validation — required, max length, nullable, read-only, invalid types/formats
5. Relational integrity — category assignment, default locations, supplier linkage where supported
6. Unauthorized/forbidden access
7. Invalid payloads
8. Conflict scenarios
9. Positive, negative, and boundary behavior
10. Response schema and business-rule validation

## Test design rules
For each endpoint:
- Cover happy path, invalid payload, missing required field, null, wrong type, boundary length/value, unsupported value, authorization, resource-not-found, conflict, and relationship validation as applicable.
- Validate HTTP status, response body, response schema, headers where relevant, and persistence/business behavior.
- Include setup dependencies and cleanup.
- Include data-driven candidates.
- Do not assume a status code; derive it from the API contract or clearly flag it for verification.

## Required output
Create `api-manual-tests.md` with:

# API Functional Test Specification
## API Inventory
## Coverage Summary
## Assumptions and Open Questions
## Test Data
## Test Cases

Use:
| ID | Endpoint | Method | Scenario | Preconditions | Request/Data | Expected Status | Response Assertions | Business Assertions | Type | Priority |
|---|---|---|---|---|---|---|---|---|---|---|

IDs: `API-PART-001`, etc.

## Quality gate
- Map every in-scope endpoint to at least one test.
- Identify uncovered schema fields and relationships.
- Include positive/negative/boundary/security coverage.
- Identify tests suitable for parameterization.
- Flag anything that cannot be verified from the supplied schema.

Do not write automation code in this phase.
