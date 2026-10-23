## Task 2 Report

Find the UIs usability issues and report them in the following table.

1. **Heuristic Violated** — the heuristic ID and name.
2. **UI Element / Screen** — where you found it.
3. **Issue Description** — one or two sentences on what's wrong and why it conflicts with that heuristic.
4. **Proposed Redesign** — what you'd change to fix it.

| #                 | Heuristic Violated                             | UI Element / Screen                                                      | Issue Description                                                                                                                                                                                                          | Proposed Redesign                                                                                                                                                  | Scored Rationale           | Score |
| :---------------- | :--------------------------------------------- | :----------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ----- |
| **Example** | **H6** — Recognition Rather Than Recall | Event Listing and Event Detail show — no "already registered" indicator | H6 requires the system to show relevant status directly in the interface rather than making the user recall it (or find out the hard way). The user has to remember, unaided, which events they've already registered for. | Show a clear "✓ You're registered" badge/state on the card and detail page (replacing or alongside "Register Now") for events the user has already signed up for. | Given example (not graded) | —    |
| **1**       | **H5** — Error Prevention               | Screen 3 (Registration Form) — Phone Number field                       | The field allows arbitrary text/letters to be entered instead of numbers, risking form rejection or malformed data upon submission.                                                                                        | Implement numeric-only input validation or an input mask to restrict entry to valid telephone digits.                                                              | Key #7. No deductions.     | 4 / 4 |
| **2**       | **H5** — Error Prevention               | Screen 3 (Registration Form) — Name field                               | The field accepts numeric characters instead of standard alphabetical names, permitting accidental or invalid entries.                                                                                                     | Implement input validation that restricts numbers or prompts the user when non-alphabetical characters are entered.                                                | No deduction.              | 4 / 4 |
| **3**       | **H4** — Consistency & Standards        | Screen 2 (Event Detail Page) — "Register Now" buttons                   | Having multiple identical "Register Now" buttons scattered across the view creates visual clutter and confuses users about standard interaction patterns.                                                                  | Consolidate the action into a single, prominent "Register Now" primary call-to-action button placed in a standard location.                                        | Key #5. No deductions.     | 4 / 4 |
| **4**       | **H5** — Error Prevention               | Screen 3 (Registration Form - Step 2) — Dietary Preference checkboxes   | The checkboxes permit conflicting selections by allowing users to check both a specific diet restriction and "None" at the same time.                                                                                      | Implement mutual exclusion behavior where selecting "None" deselects all other options, and selecting any specific restriction automatically unchecks "None".      | No deduction.              | 4 / 4 |

---

**Task 2 grading summary**

- Total score: **16 / 16**
