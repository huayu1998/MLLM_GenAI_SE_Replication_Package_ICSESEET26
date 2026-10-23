// Shared helpers for the Task 3 behavioral checks.
//
// For each version of the app (the reference solution "KEY" and participants P1-P30), these helpers:
//   1. export that version's Task 3 app into _work/<version>/,
//   2. start the app's own server.js on a local port,
//   3. provide the seed data that every browser session starts with,
//   4. find the bulk-cancel button, whatever the participant labelled it.

const { execSync, spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');


// ---------------------------------------------------------------------------
// Paths and participants
// ---------------------------------------------------------------------------

// Repository root (this file lives in eventconnect/Task3_Gradings/).
const ROOT = path.resolve(__dirname, '..', '..');

// Scratch folder where each version of the app is exported before being served.
const WORK = path.join(__dirname, '_work');

// Task 3 app folder inside each participant's branch.
const APP = 'eventconnect/task3/app_task3';

// Reference solution, scored with the same checks to confirm they award full marks.
const KEY_DIR = path.join(ROOT, 'keys', 'task3_multiselect-cancel');

// "KEY" first, then participants P1-P30.
const VARIANTS = ['KEY', ...Array.from({ length: 30 }, (_, i) => `P${i + 1}`)];

// Odd-numbered participants are in group E, even-numbered in group C.
function group(variant) {
  if (variant === 'KEY') return 'KEY';
  return Number(variant.slice(1)) % 2 === 1 ? 'E' : 'C';
}


// ---------------------------------------------------------------------------
// Exporting and serving an app version
// ---------------------------------------------------------------------------

// Put a clean copy of one version's app into _work/<variant>/.
// Participant code comes from their git branch (origin/<variant>), so the
// working copy of the repository is never touched.
function exportVariant(variant) {
  const dir = path.join(WORK, variant);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });

  if (variant === 'KEY') {
    execSync(`cp -R "${KEY_DIR}/." "${dir}/"`);
  } else {
    // --strip-components=3 drops the leading "eventconnect/task3/app_task3/".
    execSync(`git -C "${ROOT}" archive origin/${variant} ${APP} | tar -x -C "${dir}" --strip-components=3`);
  }
  return dir;
}

// Start the exported app's server.js on `port` and wait (up to 5 s) until it answers.
async function serve(variant, port) {
  const dir = path.join(WORK, variant);
  const server = spawn('node', ['server.js'], {
    cwd: dir,
    env: { ...process.env, PORT: String(port) },
    stdio: 'ignore',
  });

  for (let attempt = 0; attempt < 50; attempt++) {
    try {
      await fetch(`http://127.0.0.1:${port}/`);
      return server;
    } catch {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  server.kill();
  throw new Error('server did not start for ' + variant);
}


// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

// Three registrations for a fictional attendee, matching the task mockup.
// The newest (Spring Fair, eventId 1) is shown first on screen.
const SEED = [
  { id: 'reg_seed_3', eventId: 1, createdAt: '2026-09-03T15:00:00.000Z' },
  { id: 'reg_seed_2', eventId: 2, createdAt: '2026-09-02T15:00:00.000Z' },
  { id: 'reg_seed_1', eventId: 8, createdAt: '2026-09-01T15:00:00.000Z' },
].map(registration => ({
  ...registration,
  name: 'Jamie Rivera',
  email: 'jamie.rivera@example.com',
  phone: null,
  dietaryRestrictions: [],
  accessibilityNeeds: '',
  parkingNeeded: 'no',
}));

// Runs in the browser before the app loads: writes the seed registrations to
// localStorage once per browser session, so later reloads keep any changes.
const seedScript = `(() => {
  try {
    if (localStorage.getItem('__seeded')) return;
    localStorage.setItem('eventconnect3:registrations:v2', ${JSON.stringify(JSON.stringify(SEED))});
    localStorage.setItem('__seeded', '1');
  } catch (e) {}
})();`;


// ---------------------------------------------------------------------------
// Locating the bulk-cancel button
// ---------------------------------------------------------------------------

// Participants labelled this button differently ("Cancel selected", "Cancel 2",
// "Delete selected", ...). Try its name first; otherwise take the last button in
// a bulk/selection bar that is not Clear, Keep, Yes, Confirm, etc.
async function findBulk(page) {
  const named = page.getByRole('button', {
    name: /cancel selected|(cancel|delete|remove)\s*(all)?\s*\(?\d*\)?\s*selected|(cancel|delete|remove) \d+/i,
  });
  if (await named.count()) return named.first();

  const inBar = page
    .locator('[id*="bulk" i],[class*="bulk" i],[class*="selection-bar" i],[class*="action-bar" i],[class*="selected-bar" i]')
    .getByRole('button', { name: /^(?!.*(clear|keep|yes|confirm|no\b|dismiss|select all|deselect|undo)).*$/i });
  if (await inBar.count()) return inBar.last();

  return null;
}


module.exports = { ROOT, WORK, VARIANTS, group, exportVariant, serve, seedScript, findBulk };
