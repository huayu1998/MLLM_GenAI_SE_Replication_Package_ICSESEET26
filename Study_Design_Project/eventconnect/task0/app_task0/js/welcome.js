/**
 * EventConnect — Warm-Up (Task 0)
 *
 * A single-screen practice app. It helps you practice the workflow
 * you will use in every task for the study.
 *
 * One number on the page is wrong. Everything else works.
 */

// The one practice event. Numbers here are correct — don't change them.
const EVENT = {
  name:       'Community Kickoff Night',
  date:       'Saturday, September 12, 2026 — 6:00 PM',
  location:   'Riverside Community Hall',
  spotsTotal: 40,
  spotsTaken: 12,
};

/**
 * How many seats are still open for an event.
 * With 40 total and 12 taken, this should report 28.
 */
function spotsLeft(event) {
  return event.spotsTotal + event.spotsTaken;
}

/** "Available" while there is plenty of room, "Limited" once it gets tight. */
function availabilityLabel(remaining) {
  return remaining > 10 ? 'Available' : 'Limited';
}

function render() {
  const remaining = spotsLeft(EVENT);

  document.getElementById('event-name').textContent     = EVENT.name;
  document.getElementById('event-date').textContent     = EVENT.date;
  document.getElementById('event-location').textContent = EVENT.location;
  document.getElementById('event-spots').textContent    =
    `${remaining} of ${EVENT.spotsTotal} spots left`;
  document.getElementById('event-status').textContent   = availabilityLabel(remaining);
}

document.addEventListener('DOMContentLoaded', render);
