# Task 3 Behavioral Checks

`Behavioral/run_behavioral.js` scores each participant's Task 3 app (multi-select cancel on the "My Registrations" page). It serves the app locally, drives it in a headless Chromium browser with [Playwright](https://playwright.dev), and runs nine checks, one for each behavioral row of the grading key.

Each check scores **1** (pass), **0.5** (partial) or **0** (fail), so the behavioral total is out of 9. The visual-style point (row 10) is graded manually and is not part of this script.

## Requirements

- Node.js 18 or later
- Git, run inside the study repository, with:
  - one branch per participant, `origin/P1` … `origin/P30`
  - the reference solution in `keys/task3_multiselect-cancel/`

## Setup

From this folder (`eventconnect/Task3_Gradings/`):

```bash
npm install
npx playwright install chromium
```

## Run

```bash
node Behavioral/run_behavioral.js
```

This scores the reference solution (`KEY`) and P1–P30. It takes about 5 minutes and prints one line per app: participant, group, total, and `E2E` or `-`.

To rescore only some participants and merge them into the existing results:

```bash
node Behavioral/run_behavioral.js P28 P29 P30
```

To use a specific Chromium binary instead of Playwright's own, set `CHROMIUM_PATH`:

```bash
CHROMIUM_PATH=/path/to/chromium node Behavioral/run_behavioral.js
```

## Output

Results are written to `Behavioral/`:

| File | Contents |
|---|---|
| `behavioral_results.json` | Per-check scores, total, end-to-end flag, and a note on what each check observed |
| `behavioral_results.csv` | The same scores, without the notes |

The `KEY` row should score 9/9. This confirms that the checks give full marks to a correct implementation.

`usable_end_to_end` is `true` when confirming a bulk cancel really removes the selected registrations from storage.

## How it works

For each app version, `common.js`:

1. exports the Task 3 app from the participant's branch into `_work/<participant>/`;
2. starts that app's own `server.js` on a local port;
3. loads the same three seed registrations into the browser before each check.

Each check runs in a fresh browser session, so one check cannot affect another.

## Combined scores

To merge the behavioral and visual-style scores into `scores_task3.csv` (total out of 10):

```bash
python3 combine_results_task3.py
```
