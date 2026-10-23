#!/usr/bin/env python3
"""Split Interaction Log.pdf into one row per ';'-separated behavioral log.

    python parse_log.py [pdf_path] [out_csv]

Needs pymupdf and pandas. (pdftotext drops many "f" characters from the
Google Docs export of the updated PDF; PyMuPDF reads it correctly.)
"""
import re
import sys
from pathlib import Path

import pandas as pd
import pymupdf

HERE = Path(__file__).resolve().parent
DATA = HERE.parent / "coding_data"
pdf = Path(sys.argv[1]) if len(sys.argv) > 1 else HERE.parents[2] / "Interaction Log.pdf"
out = Path(sys.argv[2]) if len(sys.argv) > 2 else DATA / "logs_parsed.csv"

with pymupdf.open(pdf) as doc:
    text = "\n".join(page.get_text() for page in doc)
text = "\n".join(line.rstrip() for line in text.splitlines())

# P9's notes put one action per line instead of separating them with ';'.
LINE_STYLE = {"P9"}


def mark_line_breaks(content):
    """Turn each line that starts a new action (capital letter) into a ';' break."""
    out = []
    for line in content.split("\n"):
        line = line.strip()
        if not line:
            continue
        starts_action = re.match(r"[A-Z(]", line) and out and not out[-1].rstrip().endswith(("&", ";"))
        starts_action = starts_action and not line.startswith("Components.css")
        out.append(("; " if starts_action else " ") + line)
    return "".join(out)


def closes(content, i):
    """True if the '(' at position i has a matching ')' later in the text."""
    depth = 0
    for ch in content[i:]:
        depth += (ch == "(") - (ch == ")")
        if depth == 0:
            return True
    return False


def split_top_level(content):
    """Split on ';' that are not inside parentheses (a ';' in '(a; b; c)' lists sub-examples).

    A '(' the note-taker never closed (P22 Task 3) is ignored, so it does not
    swallow the rest of the task.
    """
    parts, depth, cur = [], 0, []
    for i, ch in enumerate(content):
        if ch == "(" and closes(content, i):
            depth += 1
        depth -= ch == ")" and depth > 0
        if ch == ";" and depth == 0:
            parts.append("".join(cur))
            cur = []
        else:
            cur.append(ch)
    parts.append("".join(cur))
    return [p.strip() for p in parts if p.strip()]


# Pieces of a ';'-separated list that are not actions on their own
# (file names, "one for Real Time.", a lone word like "problems") are glued back onto the previous log.
FRAGMENT = re.compile(r"^(?:[\w.]+\.(?:md|pdf|js|css)|one for .*|\w+)$", re.I)


def merge_fragments(logs):
    out = []
    for log in logs:
        if out and FRAGMENT.match(log):
            out[-1] += "; " + log
        else:
            out.append(log)
    return out


# Participant blocks start with a line like "P12 - C"
parts = re.split(r"(?m)^(P\d+)\s*-\s*([EC])\b[^\n]*\n", text)
rows = []
for i in range(1, len(parts), 3):
    pid, group, body = parts[i], parts[i + 1], parts[i + 2]
    # Task headers sit at the start of a line: "Task 2 (condition) - ...",
    # "Task 2 - ..." or "Task 2 Read ...". A header with no text after it
    # (P17 "Task 1 (...) Task 2 (...) -") gets no logs.
    header_re = r"(?m)^\s*Task (\d+)\s*(\((?:[^()]|\([^()]*\))*\))?\s*(?:-\s*)?"
    tasks = re.split(header_re, body)
    for j in range(1, len(tasks), 3):
        task, cond, content = int(tasks[j]), " ".join((tasks[j + 1] or "").strip("() ").split()), tasks[j + 2]
        # P17 puts "Task 1 (...)" and "Task 2 (...)" on one line; the empty
        # Task 1 header ends up glued to the front of the Task 2 content.
        m = re.match(r"Task (\d+)\s*(\((?:[^()]|\([^()]*\))*\))?\s*-?\s*", content)
        if m:
            task, cond, content = int(m.group(1)), " ".join((m.group(2) or "").strip("() ").split()), content[m.end():]
        if pid in LINE_STYLE:
            content = mark_line_breaks(content)
        content = re.sub(r"\s+", " ", content).strip()
        for k, log in enumerate(merge_fragments(split_top_level(content))):
            rows.append(dict(pid=pid, pnum=int(pid[1:]), group=group, task=task,
                             condition=cond, seq=k + 1, log=log))

df = pd.DataFrame(rows)
df.insert(0, "log_id", range(1, len(df) + 1))
df.to_csv(out, index=False)
print(f"{len(df)} logs, {df.pid.nunique()} participants -> {out}")
print(df.groupby("group").size().to_string())
