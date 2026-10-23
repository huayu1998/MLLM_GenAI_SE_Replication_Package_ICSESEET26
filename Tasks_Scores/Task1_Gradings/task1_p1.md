## Task 1 Report

Find the requirement issues and report them in the following table.

- **Requirement Violated** — the SRS requirement ID (if any) in the **Functional Requirements** **(§2.3)** and elements that the wireframe fails to satisfy.
- **Problem Type** — type of problems for the violated design, including inconsistent design, missing functionality, and unclear/ambiguous design.
- **Screen & UI Element** — which and what you found it in the wireframe.
- **Issue Description** — one or two sentences on what's wrong and why it conflicts with the requirement.
- **User Workflow Impact** — how this affects the user, judged against the **Use Case (§2.1)** and the **User Stories (§2.2)**. Name the affected UC step or User Story (if any) and a brief note on how it affects the user's workflow.

| #                                                                                                                                 | Requirement Violated         | Problem Type             | Screen & UI Element                                                         | Issue Description                                                                                                              | User Workflow Impact<br />(vs. UC/US)                                                                                                                   | Scored Rationale                                                                                                                                  | Score                                                          |
| --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ------------------------ | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Example                                                                                                                           | **R6** - Step 1 Fields | Unclear/ambiguous design | **Screen 3** Registration form - Email Address and Phone Number field | "Name" is marked "* required," but "Email Address" is not marked "* required," and "Phone Number" is not labeled "(optional)." | **UC step 3 / US3**: user can't tell email is required until submission fails, and may assume phone is mandatory since nothing marks it optional. | Given example (not graded)                                                                                                                        | —                                                             |
| 1                                                                                                                                 |                              |                          |                                                                             |                                                                                                                                |                                                                                                                                                         | —                                                                                                                                                | —                                                             |
| 2                                                                                                                                 |                              |                          |                                                                             |                                                                                                                                |                                                                                                                                                         | —                                                                                                                                                | —                                                             |
| 3                                                                                                                                 |                              |                          |                                                                             |                                                                                                                                |                                                                                                                                                         | —                                                                                                                                                | —                                                             |
| 4                                                                                                                                 |                              |                          |                                                                             |                                                                                                                                |                                                                                                                                                         | —                                                                                                                                                | —                                                             |
| wireframe bugs Screen 1	Missing text search bar	R3, US1	Add a keyword text search input field above the listing.                  |                              |                          |                                                                             |                                                                                                                                |                                                                                                                                                         | Key #1. Problem Type: none given (−1); Impact: none given (−1).                                                                                 | 3 / 5                                                          |
| Screen 1 / 2A	Price mismatch ($15 vs $20)	US2, R4	Make prices identical between listing and detail views.                         |                              |                          |                                                                             |                                                                                                                                |                                                                                                                                                         | Key #3. Problem Type: none given (−1); Impact: none given (−1).                                                                                 | 3 / 5                                                          |
| Screen 2A	Category tag mismatch	R2, R4	Align category tag ("Workshop").                                                           |                              |                          |                                                                             |                                                                                                                                |                                                                                                                                                         | The report problem is incorrect.                                                                                                                  | 0/5                                                            |
| Screen 2B	Sold out CTA not disabled	US2	Change button text to "Registration Closed" and set to disabled.                          |                              |                          |                                                                             |                                                                                                                                |                                                                                                                                                         | Key #2. Problem Type: none given (−1); Impact: none given (−1).                                                                                 | 3 / 5                                                          |
| Screen 3	Step indicator shows 2 steps	R5	Update step indicator to show all 3 steps: 1. Personal Info, 2. Preferences, 3. Confirm. |                              |                          |                                                                             |                                                                                                                                |                                                                                                                                                         | Key #5. Problem Type: none given (−1); Impact: none given (−1).                                                                                 | 3 / 5                                                          |
| Screen 3	Field labels incorrect	R6	Update labels to Name (required), Email (required), Phone Number (optional).                   |                              |                          |                                                                             |                                                                                                                                |                                                                                                                                                         | Restates the given example (R6 field labels), so no credit.                                                                                       | 0 / 5 (not counted: best 4 rule)                               |
| Screen 3	Missing navbar item	R1	Add "My Registrations" back to the navbar.                                                        |                              |                          |                                                                             |                                                                                                                                |                                                                                                                                                         | Key #4. Problem Type: none given (−1); Description: doesn't say which nav item is missing (only the fix does) (−0.5); Impact: none given (−1). | 2.5 / 5 (not counted: best 4 rule)                             |
| All Screens	Missing FAQ / Help	R9, US4	Add persistent "FAQ / Help" link to header or footer.                                      |                              |                          |                                                                             |                                                                                                                                |                                                                                                                                                         | Key #6. Problem Type: none given (−1); Impact: none given (−1).                                                                                 | 3 / 5 (not counted: best 4 rule; ties with the 4 counted rows) |

# SRS Review & Problem Report: EventConnect (v1)

**Document Name:** Software Requirements Specification (SRS) Review
**Project:** EventConnect
**Document Version:** 1.0
**Status:** Requires Revision

---

## 1. Executive Summary

This report summarizes the defects, contradictions, and ambiguities identified during the review of the **EventConnect Software Requirements Specification (SRS v1)**.

A total of **6 issues** were identified:

- **3 High-Severity Deficiencies:** Scope contradictions and missing system behaviors.
- **3 Medium-Severity Deficiencies:** Placement ambiguities, incomplete field validations, and missing state-handling rules.

Resolving these items is required before finalizing design mockups and proceeding to development.

---

## 2. Issue Summary Table

| Defect ID        | Severity | Category                 | Affected Sections        | Short Description                                                             |
| :--------------- | :------- | :----------------------- | :----------------------- | :---------------------------------------------------------------------------- |
| **SRS-01** | High     | Scope Contradiction      | Section 1.2, R1          | "My Registrations" requires user account tracking, which is out of scope.     |
| **SRS-02** | High     | Scope Contradiction      | Section 1.2, R2, R4, US2 | Paid events are displayed, but payment processing is out of scope.            |
| **SRS-03** | High     | Missing Requirement      | UC-01, R5, R8            | Missing post-submission success/confirmation state specification.             |
| **SRS-04** | Medium   | Structural Ambiguity     | R1, R9, US4              | FAQ/Help link is required on all screens but excluded from Navbar (R1).       |
| **SRS-05** | Medium   | Incomplete Spec          | R6, R7                   | Step 2 (Preferences) does not define optional/required labels for all fields. |
| **SRS-06** | Medium   | Missing Interaction Rule | R5, R8                   | No specification for backward form navigation or input persistence.           |

---

## 3. Detailed Problem Descriptions & Recommended Fixes

### SRS-01: Scope Conflict Regarding User Account Management

* **Severity:** 🔴 High
* **Affected Sections:** Section 1.2 (Product Scope), Requirement R1 (Navigation)
* **Description:** Section 1.2 explicitly specifies that *user account management is out of scope for v1*. However, Requirement **R1** includes `"My Registrations"` in the global navigation bar. Without authentication, cookies, or account sessions, the system cannot fetch or display user-specific registrations.
* **Recommended Action:**
  * **Option A (Preferred for v1):** Remove `"My Registrations"` from R1 and defer to v2.
  * **Option B:** Specify a lightweight, unauthenticated retrieval mechanism (e.g., lookup by email + confirmation code or local storage).

---

### SRS-02: Scope Conflict Regarding Event Pricing & Payment Processing

* **Severity:** 🔴 High
* **Affected Sections:** Section 1.2 (Product Scope), Requirements R2, R4, User Stories US1, US2
* **Description:** Requirements mandate displaying a `Price` across listing cards and detail screens (including non-free prices such as `$10`, `$15`), but Section 1.2 states *payments are out of scope*. The registration flow (R5–R8) collects info and submits without any checkout step.
* **Recommended Action:**
  * Clarify business logic for non-free events in the SRS: *"For v1, registering for a paid event reserves a spot; payment is settled offline (e.g., at the door) or handled externally."*

---

### SRS-03: Missing Post-Submission Confirmation State

* **Severity:** 🔴 High
* **Affected Sections:** Section 2.1 (Use Case UC-01), Requirements R5, R8
* **Description:** Use Case **UC-01** specifies: *"the app confirms successful registration."* However, **R5** and **R8** define Step 3 (Review Summary + Submit) as the terminal state of the form, with no requirement defining the post-submission confirmation screen, modal, or toast.
* **Recommended Action:**
  * Add **Requirement R10 (Registration Confirmation):**
    > *"Upon submitting Step 3, the user is navigated to a confirmation screen that confirms successful registration, displays the event name, date/time, and a summary confirmation message."*
    >

---

### SRS-04: Conflicting Navigation Bar & FAQ / Help Placement

* **Severity:** 🟡 Medium
* **Affected Sections:** Requirement R1 (Navigation), Requirement R9 (FAQ and Help), User Story US4
* **Description:** **R1** defines the exact navbar items as `[Brand, "Browse Events", "My Registrations", "About"]`. Concurrently, **R9** and **US4** mandate that a `"FAQ / Help"` link must be visible on *every screen*. It is currently undefined where this link should reside.
* **Recommended Action:**
  * Update **R1** to include `"FAQ / Help"` within the persistent header, or add a dedicated requirement specifying a global persistent footer containing the link.

---

### SRS-05: Incomplete Field Constraint Definitions for Step 2 (Preferences)

* **Severity:** 🟡 Medium
* **Affected Sections:** Requirement R6 (Step 1 fields), Requirement R7 (Step 2 fields)
* **Description:** **R6** explicitly specifies required/optional formats for Step 1 (`Name (required)`, `Email (required)`, `Phone Number (optional)`). In contrast, **R7** only marks `Parking Needed` as required, leaving `Dietary Restrictions` and `Accessibility Needs` without explicit optional/required labeling rules.
* **Recommended Action:**
  * Update **R7** to explicitly define constraints:
    > *"Step 2 (Preferences) collects: Dietary Restrictions (checkboxes, optional), Accessibility Needs (text area, optional), and Parking Needed (single choice, required)."*
    >

---

### SRS-06: Undefined Form Navigation & State Retention Rules

* **Severity:** 🟡 Medium
* **Affected Sections:** Requirements R5, R7, R8
* **Description:** The SRS does not define whether users can navigate backwards between registration steps (e.g., from Step 3 to Step 2 or Step 1), nor does it guarantee that user inputs are preserved upon backward navigation.
* **Recommended Action:**
  * Add a form behavior requirement:
    > *"Users can navigate back to previous steps via a 'Back' button. All previously entered inputs must remain populated and editable until final submission."*
    >

---

## 4. Next Steps

1. Update the SRS to version **1.1** incorporating the recommended changes.
2. Align wireframes and design mockups with the revised functional requirements.
3. Obtain stakeholder sign-off on scope decisions (Accounts & Payments).

---

**Task 1 grading summary**

- Total score: **12 / 20**
- More than 4 issues reported; best 4 graded rows counted: rows 1, 2, 4, 5 (Key #1, #3, #2, #5)
