## Task 1 Report

Find the requirement issues and report them in the following table.

1. **Requirement Violated** — the SRS requirement ID (if any) in the **Functional Requirements** **(§2.3)** and elements that the wireframe fails to satisfy.
2. **Problem Type** — type of problems for the violated design, including inconsistent design, missing functionality, and unclear/ambiguous design.
3. **Screen & UI Element** — which and what you found it in the wireframe.
4. **Issue Description** — one or two sentences on what's wrong and why it conflicts with the requirement.
5. **User Workflow Impact** — how this affects the user, judged against the **Use Case (§2.1)** and the **User Stories (§2.2)**. Name the affected UC step or User Story (if any) and a brief note on how it affects the user's workflow.

| #       | Requirement Violated         | Problem Type             | Screen & UI Element                                                         | Issue Description                                                                                                              | User Workflow Impact<br />(vs. UC/US)                                                                                                                   | Scored Rationale                                        | Score |
| ------- | ---------------------------- | ------------------------ | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ----- |
| Example | **R6** - Step 1 Fields | Unclear/ambiguous design | **Screen 3** Registration form - Email Address and Phone Number field | "Name" is marked "* required," but "Email Address" is not marked "* required," and "Phone Number" is not labeled "(optional)." | **UC step 3 / US3**: user can't tell email is required until submission fails, and may assume phone is mandatory since nothing marks it optional. | Given example (not graded)                              | —    |
| 1       | R9- Have FAQ section         | missing functionality    | R9- Have FAQ section                                                        |                                                                                                                                |                                                                                                                                                         | Key #6. Description: missing (-1), Impact: missing (-1) | 3/5   |

| Screens missing FAQ section | No place to answers users' frequently asked questions about using the EventConnect app                                                                                                                               |                                                                                                                                                         |
| 2       |      R3. Search and Filter                        |      missing functionality                    |         Screen one event list                                                                    |   Cant search by text                                                                                                                             |                                                                                                                                                         | Key #1. Impact: empty (−1). | 4 / 5 |
| 3       |                              |        R5. Registration flow structure                  |    missing functionality                                                                          |        Cant add preferences when registering                                                                                                                        |                                                                                                                                                         | Wrong problem as there's no Preference page wireframe to be checked | 0/5 |
| 4       |                R6. Step 1 fields. (optional).               |             ambiguous design             |                                                                             |                                                                                                                                |                                                                                                                                                         | Incomplete row (only a requirement ID); R6 field labels is also the given example, so no credit. | 0 / 5 |

---

**Task 1 grading summary**

- Total score: **7 / 20**
