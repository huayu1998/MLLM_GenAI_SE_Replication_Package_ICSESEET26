# Multimodal GenAI for Software Engineering Tasks — Replication Package

This repository contains the study materials, raw data, grading scripts, and analysis outputs for a between-subjects, think-aloud user study on how multimodal GenAI features (text, file/image upload, voice, and screen sharing in Google AI Studio) affect how people perform software engineering tasks and learn related SE concepts, compared to text-only GenAI usage.

## Repository Contents

### `Study_Design_Project/`

Materials given to participants and the internal grading keys. Full user study task instructions and workflow are in [`Study_Design_Project/README.md`](Study_Design_Project/README.md).

- `eventconnect/task0` … `task3`: each task's `INSTRUCTIONS.md`, blank `REPORT#.md` deliverable template, and the EventConnect app version used for that task (`app_task0` … `app_task3`).
- `keys/`: internal answer keys (`task1_key.md`, `task2_key.md`, `task3_key.md`) used to grade deliverables, plus the reference "Select & Cancel Multiple" implementation (`task3_multiselect-cancel/`) used as the baseline by the Task 3 grading scripts.

### `Surveys/`

- `Pre.pdf`, `NASA-TLX.pdf`, `Post (Control).pdf`, `Post (Experiement).pdf`: blank copies of the Google Form survey instruments.
- `responses/`: the corresponding anonymized response exports (`.xlsx`) for all 30 participants.

### `Interviews/`

- `Interview.pdf`: the semi-structured follow-up interview scripts.
- `Interview.xlsx`: interview transcripts/open-coding and thematic analysis (sheets: `Final`, `themes_summary`, and per-round open coding `E - R1`, `C - R1`, `E - R2`, `C - R2`).

### `Interaction_Log/`

- `Interaction Log.pdf`: experimenter's think-aloud observation notes, recorded live for every participant and task.
- `log_analysis/`: thematic analysis of those notes.
  - `scripts/parse_log.py`: splits `Interaction Log.pdf` into one row per behavioral note (`coding_data/logs_parsed.csv`).
  - `scripts/build_outputs.py`: merges the parsed logs with the hand-assigned codes and builds the analysis workbook and chart.
  - `coding_data/`: `logs_parsed.csv` (parsed notes), `primary_codes.txt` (hand-coded category per note), `codebook.csv` (53 categories grouped into 12 themes).
  - `Interaction_Log_Thematic_Analysis.xlsx`: resulting workbook — codebook, theme/category counts, per-group category breakdowns, and all coded logs.
  - `charts/themes_count.png`: bar chart of behavior counts per theme, by group.

### `Tasks_Scores/`

- `task1&2_scores.xlsx`: Task 1 and Task 2 scores for all participants.
- `Task1_Gradings/`, `Task2_Gradings/`: per-participant graded reports (`task1_pN.md`, `task2_pN.md`) — the participant's submitted report scored against the answer key, with per-row rationale.
- `Task3_Gradings/`: Task 3 is scored out of 10 (9 automated behavioral points + 1 manual visual-style point).
  - `Behavioral/run_behavioral.js` (with shared helpers in `common.js`): drives each participant's app in headless Chromium via Playwright and scores 9 behavioral checks; results in `behavioral_results.json`/`.csv`.
  - `CodeMetrics/task3_metrics.py`: computes code-change metrics (lines added/deleted, detected features, etc.) per participant from their git branch; outputs `task3_metrics.csv`/`.json` and the group-comparison summary `task3_summary.md`.
  - `VisualStyle/visual_style_scores.csv`: manually graded visual-style score (0–1) per participant.
  - `combine_results_task3.py`: merges the behavioral and visual-style scores into the final `scores_task3.csv`.
  - `package.json`: Node dependencies (Playwright) for the behavioral grading script.

## Reproducing the Analysis

**Interaction log thematic analysis** (Python; needs `pandas`, `pymupdf`, `openpyxl`, `matplotlib`, `seaborn`):

```
cd Interaction_Log/log_analysis/scripts
python parse_log.py
python build_outputs.py
```

**Task 3 grading** (participant branches `origin/P1`…`origin/P30` and the reference solution in `Study_Design_Project/keys/task3_multiselect-cancel/` must exist in the repo):

```
cd Tasks_Scores/Task3_Gradings
npm install
npx playwright install chromium
node Behavioral/run_behavioral.js
python3 CodeMetrics/task3_metrics.py
python3 combine_results_task3.py
```
