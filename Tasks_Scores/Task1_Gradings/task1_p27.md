Task 1 Report

Find the requirement issues and report them in the following table.

1. Requirement Violated — the SRS requirement ID (if any) in the Functional
   Requirements (§2.3) and elements that the wireframe fails to satisfy.
2. Problem Type — type of problems for the violated design, including
   inconsistent design, missing functionality, and unclear/ambiguous design.
3. Screen & UI Element — which and what you found it in the wireframe.
4. Issue Description — one or two sentences on what's wrong and why it
   conflicts with the requirement.
5. User Workflow Impact — how this affects the user, judged against the Use
   Case (§2.1) and the User Stories (§2.2). Name the affected UC step or User
   Story (if any) and a brief note on how it affects the user's workflow.

| \#      | Requirement Violated                                 | Problem Type             | Screen & UI Element                                                         | Issue Description                                                                                                                | User Workflow Impact<br />(vs. UC/US)                                                                                                                   | Scored Rationale           | Score |
| ------- | ---------------------------------------------------- | ------------------------ | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ----- |
| Example | **R6** - Step 1 Fields                         | Unclear/ambiguous design | **Screen 3** Registration form - Email Address and Phone Number field | "Name" is marked "\* required," but "Email Address" is not marked "\* required," and "Phone Number" is not labeled "(optional)." | **UC step 3 / US3**: user can't tell email is required until submission fails, and may assume phone is mandatory since nothing marks it optional. | Given example (not graded) | —    |
| 1       | **R3** - Search and Filter                     | Missing functionality    | **Screen 1** Event listing page - Top filter controls                 | The page provides category and sort controls but lacks a text input field for keyword searching.                                 | **UC step 1 / US1**: Users cannot search for specific events by keyword directly, slowing down event discovery.                                   | Key #1. No deductions.     | 5 / 5 |
| 2       | **R4** - Event detail page                     | Inconsistent design      | **Screen 2B** Event detail page (Sold Out) - Primary CTA button       | The button displays "Register Now" instead of transitioning to a disabled "Registration Closed" state for sold-out events.       | **US2**: Misleads users into attempting registration for an event that has reached full capacity.                                                 | Key #2. No deductions.     | 5 / 5 |
| 3       | **R5** - Registration flow structure           | Missing functionality    | **Screen 3** Registration form - Step progress indicator              | The indicator shows a 2-step flow (Personal Info to Confirm), entirely omitting Step 2 (Preferences).                            | **UC step 4 / US3**: Users bypass required preference selection (dietary, accessibility, parking) before reaching confirmation.                   | Key #5. No deductions.     | 5 / 5 |
| 4       | **R2 / R4** - Event listing and detail content | Inconsistent design      | **Screen 1 & Screen 2A** - Price display for "Urban Garden Workshop"  | The listing card displays a price of $15, while the detail page lists the price as $20 per person.                               | **UC step 2 / US2**: Causes confusion regarding actual registration cost when transitioning between screens.                                      | Key #3. No deductions.     | 5 / 5 |

---

**Task 1 grading summary**

- Total score: **20 / 20**
