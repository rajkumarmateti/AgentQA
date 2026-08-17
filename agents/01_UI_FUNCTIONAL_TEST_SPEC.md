# UI Functional Test Specification — Cursor Agent Instructions

## Purpose

Create comprehensive manual/UI functional test cases for the InvenTree **Parts** module from the official Parts documentation.

## Source of truth

- Parts documentation: [https://docs.inventree.org/en/stable/part/](https://docs.inventree.org/en/stable/part/)
- Include relevant sub-pages such as Part Views, Part Parameters, Part Templates, Part Revisions, Creating a Part, etc.
- Do not invent product behavior. If documentation is ambiguous, mark the behavior as **Needs clarification**.

## Scope

At minimum cover:

1. Part creation — manual entry and import flows
2. Part detail view — Stock, BOM, Allocated, Build Orders, Parameters, Variants, Revisions, Attachments, Related Parts, Test Templates
3. Part categories — hierarchy, filtering, parametric tables
4. Part attributes — Virtual, Template, Assembly, Component, Trackable, Purchaseable, Salable, Active/Inactive
5. Units of measure configuration
6. Part revisions — creation and constraints
7. Negative/boundary cases — duplicate IPN, inactive-part restrictions, revision-of-revision prevention, etc.
8. Cross-functional behavior where a UI action affects another Parts capability



## Test design rules

For every feature:

- Cover positive, negative, boundary, validation, permissions, state-transition, persistence, navigation, and error-handling behavior where applicable.
- Include preconditions, test data, steps, expected results, priority, and test type.
- Prefer independent, atomic test cases.
- Use equivalence partitioning, boundary value analysis, decision tables, state-transition testing, and pairwise coverage where useful.
- Identify dependencies and risks.
- Avoid duplicate cases.



## Required output

Create `ui-manual-tests.md` with this structure:

# UI Functional Test Specification



## Coverage Summary



## Assumptions and Open Questions



## Test Data



## Test Cases

Use this table:


| ID  | Area | Scenario | Preconditions | Test Data | Steps | Expected Result | Type | Priority |
| --- | ---- | -------- | ------------- | --------- | ----- | --------------- | ---- | -------- |


IDs must be stable, e.g. `UI-PART-001`.

## Quality gate

Before finishing:

- Verify every minimum scope item is represented.
- Include positive + negative + boundary coverage.
- Ensure expected results are observable and testable.
- Flag undocumented assumptions.
- Remove duplicates.
- Summarize coverage gaps and risks.

Do not write automation code in this phase.