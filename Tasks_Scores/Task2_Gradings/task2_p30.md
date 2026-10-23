## Task 2 Report

Find the UIs usability issues and report them in the following table.

1. **Heuristic Violated** — the heuristic ID and name.
2. **UI Element / Screen** — where you found it.
3. **Issue Description** — one or two sentences on what's wrong and why it conflicts with that heuristic.
4. **Proposed Redesign** — what you'd change to fix it.

| # | Heuristic Violated                             | Problem Type                   | Screen & UI Element                                                       | Issue Description                                                                                                                                     | User Workflow Impact                                                                                                                                        | Scored Rationale                                                                                 | Score |
| - | ---------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ----- |
| 1 | **H1** - Visibility of System Status     | Missing State Feedback         | **Event Detail Page** - "Register Now" button / Registration status | Although the event appears under "My Registrations," opening the event from "Browse Events" still shows an active "Register Now" button.              | Users cannot tell that they are already registered when viewing the event page, which can lead to confusion or accidental duplicate registrations.          | Restates the given example (no "already registered" indicator on the detail page), so no credit. | 0 / 4 |
| 2 | **H4** - Consistency and Standards       | Redundant / Inconsistent UI    | **Event Detail Page** - Dual "Register Now" buttons                 | The "Register Now" action button is displayed twice on the same screen.                                                                               | Creates visual confusion and violates standard layout conventions where a single primary call-to-action is expected.                                        | Key #5. Redesign: none given; the submission has no Proposed Redesign column (−1).              | 3 / 4 |
| 3 | **H6** - Recognition Rather than Recall  | Missing Navigation Control     | **Event Detail Page** - Back navigation                             | There is no visible "Back" button or arrow to return to the previous view; users must locate and click "Browse Events" in the navigation bar instead. | Users have to recall how to navigate back to the event listing via the top menu rather than recognizing an immediate, contextual "Back" option on the page. | Heuristic Violated: it violates the H3/H7 (-1); No Proposed Redesign given (-1)                  | 2 / 4 |
| 4 | **H8** - Aesthetic and Minimalist Design | Inefficient / Restrictive Flow | **Registration Form** - Attendee quantity / Personal Info fields    | The form only allows registering one person at a time, with no option to add additional guests or select ticket quantity.                             | Users registering a group or family must repeatedly fill out the entire multi-step form from scratch for each additional person.                            | Heuristic Violated: it violates the H7 (-1); No Proposed Redesign given (-1)                    | 2 / 4 |

---

**Task 2 grading summary**

- Total score: **7 / 16**
