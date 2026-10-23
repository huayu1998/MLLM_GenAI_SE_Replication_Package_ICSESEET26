# Task 3 — Answer Key ("Select & Cancel Multiple" Feature)

**INTERNAL —** Use this to score the participant's final implemented "Select & Cancel Multiple" feature against `task3/CancelMultiple_Design.pdf`.

**Note:** Score by running the participant's app, not by reading their code — a row counts only if the behavior actually works in the browser.

| #  | Behavior                                      | How to Check                                                               | Pass Criteria                                                                                         |
| -- | --------------------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 1  | Checkbox exists on every card                 | Open My Registrations                                                      | Each registration card shows a checkbox, distinct from the existing Cancel button                     |
| 2  | Ticking a box does nothing else               | Click directly on a card's checkbox                                        | The event page does NOT open and nothing is cancelled; only the selection changes                     |
| 3  | "Select all" selects and clears everything    | Tick "Select all", then untick it                                          | All cards become selected, then all become unselected                                                 |
| 4  | Selection bar appears and disappears          | Tick a card, then untick it                                                | The bar appears while at least one card is selected and is gone when none are                         |
| 5  | Count in the bar is correct                   | Tick two cards                                                             | The bar reads "2 selected" (wording may vary; the number must match)                                  |
| 6  | "Clear" drops the selection                   | Tick two cards, press Clear                                                | All checkboxes clear and the bar disappears; nothing is cancelled                                     |
| 7  | Cancelling asks first, without a browser box  | Tick two cards, press "Cancel selected"                                    | A confirmation appears in the page itself (no`confirm()` dialog), offering a way to back out        |
| 8  | Confirming cancels the whole batch            | Confirm the cancellation                                                   | Both registrations disappear in one go, the count updates, and the bar clears                         |
| 9  | Cancelling everything reaches the empty state | Select all, confirm                                                        | The existing "No registrations yet" empty state is shown, with no header row or bar stranded above it |
| 10 | UI matches the mockup's visual style          | Compare the running page with Screens 1–5 of`CancelMultiple_Design.pdf` | The implemented feature fully matches the mock-up design styles.                                      |

## Scoring Notes

- A row counts if the participant's app produces the behavior in **Pass Criteria** when checked as described in **How to Check**, regardless of how the code is structured. See the point distribution below:
- **Every Row**:  Full credit (1 pt) if the behavior/visual style meets the pass criteria; partial credit (0.5 pt) if it is implemented but incomplete or unreliable (for example, it works for one card but not for several, or the bar or count is briefly wrong); otherwise, no credit (0 pt). For row 10 only: gives partial credit (0.5 pt) if majority of the visual style matches the design mockup.
- **End-to-End Usage**: record a separate pass/fail on whether the feature is "usable end-to-end."
- Total points: **10** pts. (10 checklist rows × 1 pt per row)
