# UI Functional Test Specification

Manual / UI functional test cases for the InvenTree **Parts** module.

**Source of truth:** [Parts documentation](https://docs.inventree.org/en/stable/part/) (stable, fetched 2026-08-17) and linked sub-pages. Behavior not stated in documentation is marked **Needs clarification**.

**Feature files:**

| File | Area | IDs |
|---|---|---|
| [01_part_creation.md](01_part_creation.md) | Manual part creation, initial stock, supplier options, validation, permissions | UI-PART-001 – UI-PART-028 |
| [02_part_import.md](02_part_import.md) | Import from file, import from supplier, wizard, update-existing | UI-PART-029 – UI-PART-042 |
| [03_part_detail_view.md](03_part_detail_view.md) | Detail header, tab visibility, Stock, Allocated, BOM, Build Orders, Used In, Related, Notes | UI-PART-043 – UI-PART-075 |
| [04_part_categories.md](04_part_categories.md) | Hierarchy, filtering, breadcrumbs, category parameter templates, parametric tables | UI-PART-076 – UI-PART-095 |
| [05_part_attributes.md](05_part_attributes.md) | Virtual, Template, Assembly, Component, Trackable, Purchaseable, Salable, Consumable, Testable, Active, Locked | UI-PART-096 – UI-PART-140 |
| [06_units_of_measure.md](06_units_of_measure.md) | Part UoM, supplier-part units, conversion, custom units | UI-PART-141 – UI-PART-160 |
| [07_part_revisions.md](07_part_revisions.md) | Create revision, constraints, navigation, settings | UI-PART-161 – UI-PART-180 |
| [08_part_parameters.md](08_part_parameters.md) | Parameter templates, values, uniqueness, units, parametric filter/sort | UI-PART-181 – UI-PART-210 |
| [09_part_templates_variants.md](09_part_templates_variants.md) | Template flag, variants, serial uniqueness, stock roll-up | UI-PART-211 – UI-PART-225 |
| [10_test_templates.md](10_test_templates.md) | Test templates, keys, cascade, results | UI-PART-226 – UI-PART-240 |
| [11_attachments_images_related.md](11_attachments_images_related.md) | Images, attachments, related parts | UI-PART-241 – UI-PART-255 |
| [12_cross_functional.md](12_cross_functional.md) | Flows that span multiple Parts capabilities | UI-PART-256 – UI-PART-270 |

---

## Coverage Summary

| Scope item | Status | Primary IDs |
|---|---|---|
| 1. Part creation — manual entry | Covered | UI-PART-001 – UI-PART-028 |
| 1. Part creation — import flows | Covered | UI-PART-029 – UI-PART-042 |
| 2. Part detail — Stock | Covered | UI-PART-049 – UI-PART-054 |
| 2. Part detail — BOM | Covered | UI-PART-057 – UI-PART-058, UI-PART-108 – UI-PART-112 |
| 2. Part detail — Allocated | Covered | UI-PART-055 – UI-PART-056, UI-PART-113 |
| 2. Part detail — Build Orders | Covered | UI-PART-059 – UI-PART-060 |
| 2. Part detail — Parameters | Covered | UI-PART-068, UI-PART-181 – UI-PART-210 |
| 2. Part detail — Variants | Covered | UI-PART-048, UI-PART-211 – UI-PART-225 |
| 2. Part detail — Revisions | Covered | UI-PART-161 – UI-PART-180 |
| 2. Part detail — Attachments | Covered | UI-PART-069, UI-PART-241 – UI-PART-248 |
| 2. Part detail — Related Parts | Covered | UI-PART-070, UI-PART-249 – UI-PART-253 |
| 2. Part detail — Test Templates | Covered | UI-PART-066, UI-PART-226 – UI-PART-240 |
| 3. Part categories — hierarchy | Covered | UI-PART-076 – UI-PART-082 |
| 3. Part categories — filtering | Covered | UI-PART-083 – UI-PART-086 |
| 3. Part categories — parametric tables | Covered | UI-PART-087 – UI-PART-095, UI-PART-200 – UI-PART-208 |
| 4. Attributes — Virtual | Covered | UI-PART-096 – UI-PART-102 |
| 4. Attributes — Template | Covered | UI-PART-103, UI-PART-211 – UI-PART-225 |
| 4. Attributes — Assembly | Covered | UI-PART-104 – UI-PART-107 |
| 4. Attributes — Component | Covered | UI-PART-113 – UI-PART-115 |
| 4. Attributes — Trackable | Covered | UI-PART-116 – UI-PART-121 |
| 4. Attributes — Purchaseable | Covered | UI-PART-122 – UI-PART-126 |
| 4. Attributes — Salable | Covered | UI-PART-127 – UI-PART-130 |
| 4. Attributes — Active / Inactive | Covered | UI-PART-131 – UI-PART-136 |
| 5. Units of measure | Covered | UI-PART-141 – UI-PART-160 |
| 6. Part revisions — creation and constraints | Covered | UI-PART-161 – UI-PART-180 |
| 7. Negative / boundary — duplicate IPN | Covered | UI-PART-014 – UI-PART-017 |
| 7. Negative / boundary — inactive-part restrictions | Covered (partial; docs incomplete) | UI-PART-131 – UI-PART-136 |
| 7. Negative / boundary — revision-of-revision | Covered; expected result flagged | UI-PART-170 |
| 8. Cross-functional behavior | Covered | UI-PART-256 – UI-PART-270 |

**Test-type mix:** positive, negative, boundary, validation, permissions, state-transition, persistence, navigation, error-handling.

### Coverage gaps and risks

| Gap / risk | Impact | Notes |
|---|---|---|
| Inactive-part “many actions” are not enumerated | High | Docs say inactive parts are unavailable for many actions without listing them. Cases assert documented behavior only and flag the rest. |
| Revision-of-revision chain | Medium | Docs forbid self-circular revision and duplicate revision codes. They do not explicitly forbid pointing *Revision Of* at another revision. |
| Duplicate part **name** uniqueness | Medium | Docs call Name a “unique” text label. Exact error text and whether uniqueness is global vs per-category is not specified. |
| Exact form-field required set on Create Part | Medium | Docs say “required attributes” without listing them. Name is treated as required; others flagged. |
| Import-from-supplier depends on a plugin | Medium | Cases require a supplier mixin plugin; skipped if none is installed. |
| Transfer Orders / Return Orders feature flags | Low | Tab visibility depends on global feature enablement not fully specified on the Parts pages. |
| Mobile app and REST-only creation | Out of scope | Spec is UI functional. |
| Exact permission group names beyond Part “create” | Low | Only “create” permission hiding *Add Parts* is documented. |

---

## Assumptions and Open Questions

### Assumptions (undocumented; treat as test design only)

1. Tester has a staff/admin account unless a case specifies a restricted role.
2. Default global settings match documented defaults (`Allow Duplicate IPN` = True, `Initial Stock Data` = False, `Part Revisions` = True, `Part Locking` = True, `Show related parts` = True, `Copy Category Parameter Templates` = True).
3. A part **Name** is required to submit the Create Part form.
4. Category, stock location, supplier, and manufacturer records used as test data already exist.
5. “Reload / reopen the part” is the persistence check unless a case says otherwise.

### Open questions (Needs clarification)

1. Exact required fields on the Create Part form besides Name.
2. Full list of actions blocked for an **inactive** part (purchase orders, sales orders, adding to BOM, creating stock, editing, appearing in pickers).
3. Whether a part may be a revision of another revision (revision chain) vs only of the original part.
4. Whether duplicate Name is rejected globally or only within a category; exact validation message.
5. Whether blank IPN values are excluded from the duplicate-IPN check when `Allow Duplicate IPN` is False.
6. Exact UI labels/error strings (screenshots exist; strings are not transcribed in docs).
7. Whether Related Parts relationships are bidirectional in the UI table.
8. Behavior when `Assembly Revision Only` is True and the user duplicates a non-assembly part with Revision Of set.

---

## Test Data

Use unique suffixes (`-YYYYMMDD-NN`) so cases stay independent.

| ID | Record | Key values |
|---|---|---|
| CAT-ROOT | Category | Name: `QA-Electronics` |
| CAT-CHILD | Sub-category of CAT-ROOT | Name: `QA-Resistors` |
| CAT-LEAF | Sub-category of CAT-CHILD | Name: `QA-SMD` |
| LOC-A | Stock location | Name: `QA-Warehouse-A` |
| LOC-B | Stock location | Name: `QA-Warehouse-B` |
| SUP-A | Supplier company | Name: `QA-Supplier-A` |
| MFR-A | Manufacturer company | Name: `QA-Manufacturer-A` |
| PART-STD | Active component, purchaseable | Name: `QA-R-10K`, IPN: `IPN-10K-001`, UoM blank |
| PART-ASM | Active assembly | Name: `QA-PCB-ASM`, Assembly=true |
| PART-VIRT | Virtual part | Name: `QA-Labor-Hour`, Virtual=true |
| PART-TPL | Template part | Name: `QA-Widget`, Template=true |
| PART-TRK | Trackable assembly | Name: `QA-SN-Widget`, Trackable=true, Assembly=true |
| PART-TST | Testable part | Name: `QA-DUT`, Testable=true |
| PART-WIRE | Physical UoM | Name: `QA-Hookup-Wire`, Units=`metre` |
| PTMPL-RES | Parameter template | Name: `QA-Resistance`, Units=`ohm` |
| PTMPL-COLOR | Parameter template | Name: `QA-Color`, Choices=`Red,Green,Blue` |
| PTMPL-UID | Unique parameter template | Name: `QA-SKU`, Unique=`Unique for model type` |
| FILE-PARTS | Import file | CSV with Name, Description, IPN, Category columns |
| IMG-PNG | Part image | Valid PNG, ~200 KB |
| IMG-BAD | Corrupt image | `.png` extension, invalid payload |
| ATT-PDF | Attachment | Datasheet PDF |
| USER-NOPART | Restricted user | Authenticated; no Part **create** permission |
| USER-STAFF | Staff user | Part create/change; staff for import |

**Settings toggles used as data (restore after each case):**

| Setting | Documented default | Cases that change it |
|---|---|---|
| Allow Duplicate IPN | True | UI-PART-014, UI-PART-015, UI-PART-016 |
| Allow Editing IPN | True | UI-PART-018 |
| IPN Regex | empty | UI-PART-019, UI-PART-020 |
| Initial Stock Data | False | UI-PART-008, UI-PART-009 |
| Initial Supplier Data | True | UI-PART-010, UI-PART-011 |
| Part Locking | True | UI-PART-137 – UI-PART-140 |
| Part Revisions | True | UI-PART-177 |
| Assembly Revision Only | False | UI-PART-178 |
| Show related parts | True | UI-PART-253 |
| Copy Category Parameter Templates | True | UI-PART-091, UI-PART-092 |
| Enforce Parameter Units | True | UI-PART-198, UI-PART-199 |
| Require Active Part (Build) | False | UI-PART-134 |
| Copy Part BOM / Parameter / Test Data | True | UI-PART-164, UI-PART-219 |

---

## Test Cases

Detailed cases live in the feature files listed above. Each file uses:

| ID | Area | Scenario | Preconditions | Test Data | Steps | Expected Result | Type | Priority |
|---|---|---|---|---|---|---|---|---|

Priority: **P1** blocking core path · **P2** important rule · **P3** edge / settings.

Do not invent UI copy. Where the docs do not specify an error string, assert that submission is blocked and an error is shown.
