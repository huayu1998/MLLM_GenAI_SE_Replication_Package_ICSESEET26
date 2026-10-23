# Task 3 — Feature Implementation (Design-to-Code)

**Time Limit: 15-20 minutes**

---

## Background

EventConnect's product team is adding a **"Select & Cancel Multiple"** feature: cancelling registrations is one at a time now, so someone clearing several events out of their list has to confirm, wait, and repeat. They should tick the ones they want and cancel them all at once. Designer has produced a high-fidelity mockup (**`task3/CancelMultiple_Design.pdf`**) of the feature.

---

## Your Task

1. Run the app, open a terminal, start the local server:

   ```
   cd eventconnect/task3/app_task3
   ```

   ```
   node server.js
   ```

   Then Click **Open in Browser** on the pop-up that appears when the server starts.
2. Open **My Registrations** page and register 2-3 events, that's the page you'll be working on.
3. Open the target design: **`task3/CancelMultiple_Design.pdf`**. Anything outlined with a **dashed magenta border** is part of the feature; everything else already exists and should not change.
4. Implement the feature so the My Registrations page matches the design.

### Files to Edit

> **You will only need to edit two files:** `app_task3/js/views/MyRegistrationsView.js`and `app_task3/css/components.css` to make it to look like the mockup.

`MyRegistrationsView.js` renders the registration list, and the My Registrations section of `css/components.css` styles it.

**Everything you need is already in the file you're editing — you should not need to open any other source file.**

You're free to structure your code however you like — the point is that the running app ends up behaving like the design.

---

## Use AI To Help With Your Task

Describe the design and share the relevant text files with AI for help.

**Example opening prompt:**

> "I need to add a new feature to an existing web app called EventConnect. Can you help me implement it?"

---

## Deliverable

A fully or partially working feature is both acceptable and your deliverable.

Open a new terminal, follow the commands to commit and push your code for Task 3 to the repository:

```
git add .
```

```
git commit -m "Task 3"
```

```
git push
```

**Thanks, you've finished Task 3!**
