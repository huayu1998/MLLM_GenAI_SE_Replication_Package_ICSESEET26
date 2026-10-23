# Task 0 — Warm-Up

**Time Limit: 5 minutes**

---

## Purpose

Before the real tasks start, this warm-up walks you once to get you familiar with the task workflow: **run the app → look at the files → use Google AI Studio → edit → commit and push**.

---

## Your Task

### 1. Run the app (≈1 min)

Open a terminal and start the local server:

* Change directory:

  ```
  cd eventconnect/task0/app_task0
  ```
* Run the server:

  ```
  node server.js
  ```

  Then click **Open in Browser** on the pop-up that appears when the server starts.

You should see a **Setup check** page with a practice event card. The card says the event has more spots left than it has seats — try to fix it using AI.

### 2. Ask the AI (≈2 min)

In **Google AI Studio**, start a chat and ask AI to help you locate and fix the bug in the **`app_task0/js/welcome.js`**. Try using text file upload feature.

**Example opening prompt:**

> "This file renders an event card. It should say 28 of 40 spots left, but the page shows 52. Can you find the problem and tell me which line to change?"

### 3. Make the fix (≈1 min)

Open `app_task0/js/welcome.js` in the editor, change the one line the AI pointed at, save, and **reload the browser tab**. The card should now read **28 of 40 spots left**.

### 4. Report the bug in `task0/REPORT0.md` (≈1 min)

Write one line saying what was wrong and how you found it. This is practice for the report tables in Tasks 1 and 2.

### 5. Stop the server & Commit and push (≈30 sec)

Stop the warm-up server with **Ctrl+C** in its terminal.

Then, open a terminal and run:

```
git add .
```

```
git commit -m "Task 0"
```

```
git push
```

---

**Do you have any questions before proceeding?**
