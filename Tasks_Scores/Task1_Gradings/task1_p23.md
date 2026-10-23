## Task 1 Report

Find the requirement issues and report them in the following table.

1. **Requirement Violated** — the SRS requirement ID (if any) in the **Functional Requirements** **(§2.3)** and elements that the wireframe fails to satisfy.
2. **Problem Type** — type of problems for the violated design, including inconsistent design, missing functionality, and unclear/ambiguous design.
3. **Screen & UI Element** — which and what you found it in the wireframe.
4. **Issue Description** — one or two sentences on what's wrong and why it conflicts with the requirement.
5. **User Workflow Impact** — how this affects the user, judged against the **Use Case (§2.1)** and the **User Stories (§2.2)**. Name the affected UC step or User Story (if any) and a brief note on how it affects the user's workflow.

| #       | Requirement Violated             | Problem Type             | Screen & UI Element                                                         | Issue Description                                                                                                                       | User Workflow Impact<br />(vs. UC/US)                                                                                                                   | Scored Rationale                                            | Score |
| ------- | -------------------------------- | ------------------------ | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ----- |
| Example | **R6** - Step 1 Fields     | Unclear/ambiguous design | **Screen 3** Registration form - Email Address and Phone Number field | "Name" is marked "* required," but "Email Address" is not marked "* required," and "Phone Number" is not labeled "(optional)."          | **UC step 3 / US3**: user can't tell email is required until submission fails, and may assume phone is mandatory since nothing marks it optional. | Given example (not graded)                                  | —    |
| 1       | R3(Search and Filter)            | Missing functionality    | Screen 1 (Event Listing Page) — Top filter bar                             | The listing page provides dropdowns for Category and Sort, but omits the required text search field for keyword searching.              | Affects UC-01 (Step 1) and User Story 1; users cannot search events by keyword and are forced to manually browse or use broad filters.                  | Key #1. No deductions.                                      | 5 / 5 |
| 2       | R1 (Navigation)                  | Inconsistent design      | Screen 3 (Registration Form · Step 1) — Top Navigation Bar                | The navigation bar displays only "Browse Events" and "About", omitting "My Registrations" which must appear identically on all screens. | Affects global navigation consistency across UC-01; users cannot navigate to their existing registrations from the registration flow.                   | Key #4. No deductions.                                      | 5 / 5 |
| 3       | R5 (Registration flow structure) | Missing functionality    | Screen 3 (Registration Form · Step 1) — Step Indicator                    | The step indicator displays only 2 steps (Personal Info and Confirm), omitting Step 2 (Preferences) from the required 3-step flow.      | Affects UC-01 (Step 4) and User Story 3; users cannot anticipate or complete the Preferences step and are misled about form length.                     | Key #5. No deductions.                                      | 5 / 5 |
| 4       | R6 (Step 1 fields)               | Inconsistent design      | Screen 3 (Registration Form · Step 1) — Form field labels                 | "Email Address" is missing the required "required" label, and "Phone Number" is missing the "(optional)" indicator.                     | Affects UC-01 (Step 3) and User Story 3; users are not clearly informed which fields are mandatory versus optional before advancing.                    | Restates the given example (R6 field labels), so no credit. | 0 / 5 |

---

**Task 1 grading summary**

- Total score: **15 / 20**
