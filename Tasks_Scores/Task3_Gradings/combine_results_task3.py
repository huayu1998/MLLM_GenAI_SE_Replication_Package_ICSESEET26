#!/usr/bin/env python3
"""
Combine the Task 3 grading results into one score table.

Each participant's Task 3 score (out of 10) has two parts:
  * behavioral score (0-9): one point per behavioral check passed, produced by
    the automated test run in Behavioral/behavioral_results.json
  * visual style score (0-1): graded manually, stored in
    VisualStyle/visual_style_scores.csv

  total_score = behavioral score + visual style score

Output: scores_task3.csv, one row per participant, group E (odd-numbered
participants) first, then group C (even-numbered participants).

Usage:
  python3 combine_results_task3.py
"""

import csv
import json
from pathlib import Path


# --------------------------------------------------------------------------
# Configuration
# --------------------------------------------------------------------------

HERE = Path(__file__).resolve().parent

BEHAVIORAL_FILE = HERE / "Behavioral" / "behavioral_results.json"
VISUAL_STYLE_FILE = HERE / "VisualStyle" / "visual_style_scores.csv"
OUTPUT_FILE = HERE / "scores_task3.csv"

MAX_BEHAVIORAL = 9
MAX_VISUAL_STYLE = 1

# Group E = odd-numbered participants, group C = even-numbered participants.
PARTICIPANT_ORDER = ([f"P{i}" for i in range(1, 31, 2)]
                     + [f"P{i}" for i in range(2, 31, 2)])


# --------------------------------------------------------------------------
# Loading inputs
# --------------------------------------------------------------------------

def load_behavioral_results():
    """Behavioral grading results, keyed by participant ID."""
    with open(BEHAVIORAL_FILE) as f:
        return {row["participant"]: row for row in json.load(f)}


def load_visual_style_scores():
    """Visual style scores (0-1), keyed by participant ID."""
    with open(VISUAL_STYLE_FILE) as f:
        return {row["participant"]: float(row["visual_style_total_of_1"])
                for row in csv.DictReader(f)}


# --------------------------------------------------------------------------
# Combining
# --------------------------------------------------------------------------

def fmt(score):
    """Write whole numbers without a decimal point: 9.0 -> "9", 9.5 -> "9.5"."""
    return f"{score:g}"


def combine(behavioral, visual_style):
    """Build one output row per participant who has both scores."""
    rows = []
    for participant in PARTICIPANT_ORDER:
        if participant not in behavioral or participant not in visual_style:
            print("skipping", participant, "(missing behavioral or visual-style score)")
            continue

        behavioral_score = float(behavioral[participant]["total_rows_1_9"])
        visual_score = visual_style[participant]
        assert 0 <= behavioral_score <= MAX_BEHAVIORAL and 0 <= visual_score <= MAX_VISUAL_STYLE, (
            f"{participant}: score out of range "
            f"(behavioral={behavioral_score}, visual={visual_score})")

        rows.append({
            "participant": participant,
            "group": behavioral[participant]["group"],
            "behavioral_total_of_9": fmt(behavioral_score),
            "visual_style_total_of_1": fmt(visual_score),
            "total_score": fmt(behavioral_score + visual_score),
            # Whether the whole bulk-cancel flow works from start to finish.
            "end_to_end": behavioral[participant]["usable_end_to_end"],
        })
    return rows


def write_csv(rows):
    with open(OUTPUT_FILE, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)


def main():
    rows = combine(load_behavioral_results(), load_visual_style_scores())
    write_csv(rows)
    print(len(rows), "participants written")


if __name__ == "__main__":
    main()
