# Task 2 — Usability Review

**Time Limit: 15-20 minutes**

---

## Background

The EventConnect team has built a **functional web app** — that lets you browse events, register for one, and see your registrations. Before this app moves further into development, the team wants a usability review against **Nielsen's 10 usability heuristics**, a widely used checklist for evaluating interface design.

---

## Your Role

You are a **UX reviewer** doing a pre-development usability audit. With the quick reference below, walk through the design, flag heuristic violations, and propose fixes.

---

## Nielsen's 10 Usability Heuristics (quick reference)

| #   | Heuristic                                               | Explaination                                                                                                 |
| --- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| H1  | Visibility of System Status                             | The system always shows what's currently going on / selected through feedback.                               |
| H2  | Match Between System and the Real World                 | Use the user's language and follow real-world conventions, avoid technical jargon.                           |
| H3  | User Control and Freedom                                | Give users an easy, clearly marked way to exit unwanted actions (e.g., cancel, back, undo).                 |
| H4  | Consistency and Standards                               | The design elements are consistent and behave the same throughout the application.                           |
| H5  | Error Prevention                                        | Design prevents mistakes from occurring in the first place (e.g., comfirmation dialog, input constraints). |
| H6  | Recognition Rather than Recall                          | Make elements, actions, options visible rather than requiring users to remember them.                        |
| H7  | Flexibility and Efficiency of Use                       | Support shortcuts to speed up the interaction for experienced users without hurting novices.                |
| H8  | Aesthetic and Minimalist Design                         | Interfaces are clean with only relevant information needed, each element has its value.                      |
| H9  | Help Users Recognize, Diagnose, and Recover from Errors | Error messages in plain language and clearly suggest solution(s).                                            |
| H10 | Help and Documentation                                  | Help and documentation available if needed, even of interface is self-explanatory.                           |

---

## Your Task

1. Run the app, open a terminal and start the local server:

   * Change directory:

     ```
     cd eventconnect/task2/app_task2
     ```
   * Run the server:

     ```
     node server.js
     ```

   Then click **Open in Browser** on the pop-up that appears when the server starts.
2. Use the app the way a real user would: browse events, search an event, open an event's detail page, complete the registration flow, check "My Registrations," and cancel an event. Try edge cases too (e.g., refreshing the page), and pay attention to how it responds or fails to respond as you interact with it.
3. For each element that violates one of the 10 heuristics above, report it in the `task2/REPORT2.md`.
4. Please follow the **exact format** of the given example to report the **4 metrics** for each usability issue.
5. Report exactly **4** issues — one per row in the table.

You do not need to touch the code — a written proposal for the fix is enough.

---

## Use AI To Help With Your Task

Describe what you're looking at and ask AI to help you check specific elements against specific heuristics.

**Example opening prompt:**

> "I have a working web app called EventConnect. Can you help me review it for usability issues as I use it?"

---

## Deliverable

Your completed `task2/REPORT2.md` is your deliverable. Every row must name a specific heuristic — general impressions without a named heuristic don't count. Once you've filled it in, commit and push it:

1. Open the terminal.
2. Stage your changes:
   ```
   git add .
   ```
3. Commit them:
   ```
   git commit -m "Task 2"
   ```
4. Push to the repository:
   ```
   git push
   ```

**Thanks, you've finished Task 2!**
