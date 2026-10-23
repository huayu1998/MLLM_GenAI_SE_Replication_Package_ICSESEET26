#!/usr/bin/env python3
"""
Task 3 code metrics for every participant (P1-P30).

Each participant worked on their own git branch (origin/P1 ... origin/P30).
For every branch, this script compares the final state of the Task 3 app
against the starting code on origin/main and records:

  * lines added / deleted in the two files that Task 3 is about
    (MyRegistrationsView.js and components.css),
  * final size of those files (LOC and source lines of code),
  * the time of the participant's "Task 3" commit,
  * which expected features appear in the code (regex-based heuristics),
  * warning flags for submissions whose numbers need a manual look.

Participants with odd numbers are in group E and even numbers in group C.

Outputs (written next to this script unless --out-dir is given):
  task3_metrics.csv   one row per participant
  task3_metrics.json  the same data as JSON
  task3_summary.md    group means / medians / ranges and Cliff's delta (E vs C)

Usage:
  python3 task3_metrics.py              # fetches origin first
  python3 task3_metrics.py --no-fetch   # use the remote branches already present
"""

import argparse
import csv
import json
import os
import re
import statistics
import subprocess
from pathlib import Path


# --------------------------------------------------------------------------
# Configuration
# --------------------------------------------------------------------------

# Starting code that every participant received.
BASELINE_REF = "origin/main"

# Task 3 app folder and the two files the task asks participants to change.
APP_DIR = "eventconnect/task3/app_task3"
JS_FILE = APP_DIR + "/js/views/MyRegistrationsView.js"
CSS_FILE = APP_DIR + "/css/components.css"

PARTICIPANT_NUMBERS = range(1, 31)

# Expected features of the Task 3 "bulk cancel" UI. Each one is detected with
# a case-insensitive regular expression over the JS and CSS files combined.
# A feature counts as implemented only if its pattern matches MORE often in
# the participant's code than in the baseline, so code that already existed
# in the starting app is not credited.
FEATURES = {
    "per_card_checkbox":    r'type=["\']checkbox["\']',
    "select_all":           r"select[-_ ]?all",
    "selected_count_label": r"\$\{[^}]*(selected|size|length)[^}]*\}\s*selected|selected\s*<",
    "registration_count":   r"registrations?\b.*(length|size)|(length|size).*registrations?",
    "indeterminate_state":  r"indeterminate",
    "clear_button":         r">\s*Clear\s*<|Clear selection|clear",
    "cancel_selected_btn":  r"Cancel selected",
    "confirm_prompt":       r"Cancel \$\{[^}]+\}[^`\n]*\?|Keep them",
    "keep_them_btn":        r"Keep them",
    "yes_cancel_btn":       r"Yes, cancel",
    "bulk_delete":          r"registrationStore\.delete|\.delete\(",
    "selected_card_style":  r"(is-|reg-card--|reg-card\.|\.)selected|reg-card[^{\n]*:has\(|classList\.(add|toggle)\([^)]*select",
    "singular_plural":      r"===\s*1\s*\?",
    "empty_state_after":    r"empty-state|No registrations yet",
    "sticky_bar":           r"sticky|fixed",
}

# A class method definition at two-space indentation, e.g. "  _render() {".
METHOD_PATTERN = re.compile(r"^\s{2}_?\w+\(.*\)\s*\{", re.M)

# Metrics compared between groups in the summary table.
SUMMARY_METRICS = [
    "js_added", "css_added", "total_added", "total_deleted",
    "net_loc", "js_final_sloc", "new_methods", "features_detected",
]

# Separates fields in `git log` output (cannot appear in commit messages).
FIELD_SEP = "\x1f"


# --------------------------------------------------------------------------
# Git helpers
# --------------------------------------------------------------------------

def git(*args):
    """Run a git command in the current repository and return its stdout."""
    result = subprocess.run(["git", *args], capture_output=True, text=True)
    return result.stdout


def file_at(ref, path):
    """Contents of `path` at git ref `ref` (empty string if it does not exist)."""
    return git("show", f"{ref}:{path}")


def changed_lines_per_file(branch):
    """Map each changed file under APP_DIR to (lines_added, lines_deleted)."""
    changes = {}
    for line in git("diff", "--numstat", BASELINE_REF, branch, "--", APP_DIR).splitlines():
        if not line.strip():
            continue
        added, deleted, path = line.split("\t")[:3]
        # git prints "-" instead of a number for binary files.
        changes[path] = (
            int(added) if added != "-" else 0,
            int(deleted) if deleted != "-" else 0,
        )
    return changes


def task3_commit_time(branch):
    """Date of the most recent participant commit whose message mentions "Task 3"."""
    log = git("log", branch, "--not", BASELINE_REF,
              f"--format=%s{FIELD_SEP}%ad", "--date=iso")
    for line in log.splitlines():  # newest commit first
        subject, date = line.split(FIELD_SEP)
        if "Task 3" in subject:
            return date
    return ""


# --------------------------------------------------------------------------
# Code measurements
# --------------------------------------------------------------------------

def count_loc(text, kind):
    """Return (total lines, source lines) where source lines skip blanks and comments."""
    lines = text.splitlines()
    blank = sum(1 for line in lines if not line.strip())
    comment_prefixes = ("//", "/*", "*") if kind == "js" else ("/*", "*")
    comments = sum(1 for line in lines if line.strip().startswith(comment_prefixes))
    return len(lines), len(lines) - blank - comments


def detect_features(code, baseline_code):
    """For each feature, True if its pattern matches more often than in the baseline."""
    return {
        name: len(re.findall(pattern, code, re.I)) > len(re.findall(pattern, baseline_code, re.I))
        for name, pattern in FEATURES.items()
    }


def warning_flags(js, css, js_added, css_added, css_deleted):
    """Notes on submissions whose line counts should not be taken at face value."""
    flags = []
    if len(js.splitlines()) <= 3 and len(js) > 2000:
        flags.append("JS collapsed to 1 line (LOC unreliable)")
    if css_deleted >= 300:
        flags.append("CSS mostly overwritten (%d lines deleted, tip=%d lines)"
                     % (css_deleted, len(css.splitlines())))
    if js_added + css_added < 50:
        flags.append("very small change")
    return flags


def measure_participant(number, baseline_js, baseline_css):
    """Collect every metric for participant P<number> into one row."""
    branch = f"origin/P{number}"
    js = file_at(branch, JS_FILE)
    css = file_at(branch, CSS_FILE)

    changes = changed_lines_per_file(branch)
    js_added, js_deleted = changes.get(JS_FILE, (0, 0))
    css_added, css_deleted = changes.get(CSS_FILE, (0, 0))
    other_files = [path for path in changes if path not in (JS_FILE, CSS_FILE)]

    js_loc, js_sloc = count_loc(js, "js")
    css_loc, css_sloc = count_loc(css, "css")

    features = detect_features(js + "\n" + css, baseline_js + "\n" + baseline_css)
    flags = warning_flags(js, css, js_added, css_added, css_deleted)

    return {
        "participant": f"P{number}",
        "group": "E" if number % 2 == 1 else "C",
        "task3_commit_time": task3_commit_time(branch),
        "js_added": js_added,
        "js_deleted": js_deleted,
        "css_added": css_added,
        "css_deleted": css_deleted,
        "total_added": js_added + css_added,
        "total_deleted": js_deleted + css_deleted,
        "net_loc": js_added + css_added - js_deleted - css_deleted,
        "js_final_loc": js_loc,
        "js_final_sloc": js_sloc,
        "css_final_loc": css_loc,
        "css_final_sloc": css_sloc,
        "new_inline_styles_in_js": js.count('style="') - baseline_js.count('style="'),
        "other_files_changed": ";".join(other_files),
        "new_methods": len(METHOD_PATTERN.findall(js)) - len(METHOD_PATTERN.findall(baseline_js)),
        "js_chars": len(js),
        "flags": "; ".join(flags),
        "features_detected": sum(features.values()),
        **{f"f_{name}": found for name, found in features.items()},
    }


# --------------------------------------------------------------------------
# Summary statistics
# --------------------------------------------------------------------------

def cliffs_delta(a, b):
    """Cliff's delta effect size: P(a > b) - P(a < b), from -1 to +1."""
    wins = sum((x > y) - (x < y) for x in a for y in b)
    return wins / (len(a) * len(b))


def describe(values):
    """Format as "mean / median / min–max"."""
    return (f"{statistics.mean(values):.1f} / {statistics.median(values):.1f} / "
            f"{min(values)}–{max(values)}")


def summary_markdown(rows):
    """Markdown report: group comparison table, then one line per participant."""
    group_e = [row for row in rows if row["group"] == "E"]
    group_c = [row for row in rows if row["group"] == "C"]

    lines = [
        "# Task 3 metrics (auto-generated)\n",
        "Baseline: `origin/main` app_task3. Files in scope: MyRegistrationsView.js, components.css.\n",
        "| Metric (mean / median / range) | E | C | Cliff's δ (E vs C) |",
        "|---|---|---|---|",
    ]
    for metric in SUMMARY_METRICS:
        e_values = [row[metric] for row in group_e]
        c_values = [row[metric] for row in group_c]
        lines.append(f"| {metric} | {describe(e_values)} | {describe(c_values)} | "
                     f"{cliffs_delta(e_values, c_values):+.2f} |")

    lines += [
        "",
        "| P | Grp | JS+ | JS- | CSS+ | CSS- | Net | Features | Flags |",
        "|---|---|---|---|---|---|---|---|---|",
    ]
    for row in rows:
        lines.append(f"| {row['participant']} | {row['group']} | {row['js_added']} | "
                     f"{row['js_deleted']} | {row['css_added']} | {row['css_deleted']} | "
                     f"{row['net_loc']} | {row['features_detected']}/{len(FEATURES)} | "
                     f"{row['flags']} |")
    return "\n".join(lines)


# --------------------------------------------------------------------------
# Main
# --------------------------------------------------------------------------

def main():
    script_dir = Path(__file__).resolve().parent
    parser = argparse.ArgumentParser(description="Compute Task 3 code metrics per participant.")
    parser.add_argument("--out-dir", type=Path, default=script_dir,
                        help="folder for the output files (default: this script's folder)")
    parser.add_argument("--no-fetch", action="store_true",
                        help="do not run `git fetch` before measuring")
    args = parser.parse_args()
    out_dir = args.out_dir.resolve()

    # All git commands run from the repository root.
    repo_root = subprocess.check_output(
        ["git", "rev-parse", "--show-toplevel"], cwd=script_dir, text=True).strip()
    os.chdir(repo_root)

    if not args.no_fetch:
        subprocess.run(["git", "fetch", "--prune", "origin"], capture_output=True)

    baseline_js = file_at(BASELINE_REF, JS_FILE)
    baseline_css = file_at(BASELINE_REF, CSS_FILE)
    rows = [measure_participant(n, baseline_js, baseline_css) for n in PARTICIPANT_NUMBERS]

    out_dir.mkdir(parents=True, exist_ok=True)
    with open(out_dir / "task3_metrics.json", "w") as f:
        json.dump(rows, f, indent=1)
    with open(out_dir / "task3_metrics.csv", "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)

    summary = summary_markdown(rows)
    (out_dir / "task3_summary.md").write_text(summary)
    print(summary)


if __name__ == "__main__":
    main()
