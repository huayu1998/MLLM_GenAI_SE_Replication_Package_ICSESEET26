// Automated behavioral checks for Task 3 (multi-select cancel on the "My Registrations" page).
//
// Each version of the app (the reference solution "KEY" and participants P1-P30) is served
// locally and driven in a headless Chromium browser with Playwright. Nine checks, one per
// behavioral row (1-9) of the Task 3 grading key, are each run in a fresh browser session
// that starts with the same three seeded registrations.
//
// Score per check: 1 = pass, 0.5 = partial (implemented but incomplete or unreliable), 0 = fail.
// The visual-style row (row 10) is graded manually and is not part of this script.
//
// Outputs (in this folder):
//   behavioral_results.json  per-check scores, total, end-to-end flag, and a note per check
//   behavioral_results.csv   the same scores without the notes
//
// Usage (from Task3_Gradings/, after `npm install` and `npx playwright install chromium`):
//   node Behavioral/run_behavioral.js              # KEY and all participants
//   node Behavioral/run_behavioral.js P28 P29 P30  # only these; merged into the existing results
//   CHROMIUM_PATH=/path/to/chrome node Behavioral/run_behavioral.js   # use a specific browser binary

const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const common = require('../common');


// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const OUT_DIR = __dirname;
const FIRST_PORT = 4100;
const pageUrl = port => `http://127.0.0.1:${port}/#/my-registrations`;

// localStorage key under which the app stores registrations.
const STORAGE_KEY = 'eventconnect3:registrations:v2';

// One entry per behavioral row of the grading key.
const ROWS = [
  'r1_checkbox_on_every_card',
  'r2_tick_does_nothing_else',
  'r3_select_all',
  'r4_bar_appears_disappears',
  'r5_count_correct',
  'r6_clear',
  'r7_confirm_in_page_no_native',
  'r8_confirm_cancels_batch',
  'r9_all_cancelled_empty_state',
];


// ---------------------------------------------------------------------------
// Browser session
// ---------------------------------------------------------------------------

// Open the app in a new, isolated browser context with the seed data loaded.
// Native browser dialogs (alert/confirm) are counted and either dismissed or accepted.
async function openApp(browser, port, { dialogs = 'dismiss' } = {}) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.addInitScript(common.seedScript);

  const page = await context.newPage();
  page.setDefaultTimeout(4000);

  const log = { dialogs: 0 };
  page.on('dialog', dialog => {
    log.dialogs++;
    if (dialogs === 'accept') dialog.accept();
    else dialog.dismiss();
  });

  await page.goto(pageUrl(port));
  await page.waitForTimeout(400);
  return { context, page, log };
}


// ---------------------------------------------------------------------------
// Page helpers
// ---------------------------------------------------------------------------

const cards = page => page.locator('.reg-card, [role="listitem"]');
const cardCheckboxes = page => cards(page).locator('input[type="checkbox"]');
const button = (page, name) => page.getByRole('button', { name });

// True if the locator matches something and the first match is visible.
async function isShown(locator) {
  return (await locator.count()) > 0 && await locator.first().isVisible().catch(() => false);
}

async function checkedCount(page) {
  const boxes = cardCheckboxes(page);
  let count = 0;
  for (let i = 0; i < await boxes.count(); i++) {
    if (await boxes.nth(i).isChecked()) count++;
  }
  return count;
}

async function tickCard(page, index) {
  await cardCheckboxes(page).nth(index).check({ force: true });
  await page.waitForTimeout(120);
}

// The "Select all" checkbox: the one labelled "Select all", otherwise the first
// checkbox that is not inside a card.
async function findSelectAllBox(page) {
  const labelled = page.getByLabel(/select all/i);
  if (await labelled.count()) return labelled.first();

  const boxes = page.locator('input[type="checkbox"]');
  const total = await boxes.count();
  for (let i = 0; i < total; i++) {
    const insideCard = await boxes.nth(i).evaluate(el => !!el.closest('.reg-card,[role="listitem"]'));
    if (!insideCard) return boxes.nth(i);
  }
  return null;
}

// Click "Select all": its checkbox if there is one, otherwise a "Select all" /
// "Deselect all" button or label. Returns false if neither exists.
async function clickSelectAll(page) {
  const box = await findSelectAllBox(page);
  const isCheckbox = box && await box.evaluate(el => el.type === 'checkbox').catch(() => false);
  if (isCheckbox) {
    await box.click({ force: true });
    return true;
  }

  const text = page.getByText(/^\s*(select|deselect) all/i);
  if (await text.count()) {
    await text.first().click({ force: true });
    return true;
  }
  return false;
}

async function isBarVisible(page) {
  const bulk = await common.findBulk(page);
  return !!bulk && await bulk.isVisible();
}

// Text of the selection bar: the nearest ancestor (up to 4 levels) of the
// bulk-cancel button whose text contains a digit, i.e. the selected count.
async function selectionBarText(page) {
  const bulk = await common.findBulk(page);
  if (!bulk) return null;
  return bulk.evaluate(el => {
    let node = el;
    for (let i = 0; i < 4 && node.parentElement; i++) {
      node = node.parentElement;
      if (/\d/.test(node.innerText)) return node.innerText;
    }
    return el.parentElement.innerText;
  });
}

// Wording that suggests an in-page confirmation, e.g. "Cancel 2 registrations?".
const confirmationText = page =>
  page.getByText(/(cancel|delete|remove)\s+\d+\s+\w+\s*\??|can.?t be undone|cannot be undone|are you sure|permanently/i);

// The "yes, go ahead" button of a confirmation (not the "Cancel selected" button itself).
const confirmButton = page =>
  button(page, /yes|confirm|cancel \d|proceed|delete/i).filter({ hasNotText: /selected/i });

// Click the bulk-cancel button, then confirm if an in-page confirmation appears.
async function bulkCancelAndConfirm(page) {
  const bulk = await common.findBulk(page);
  if (bulk) await bulk.click();
  await page.waitForTimeout(250);

  const yes = confirmButton(page);
  if (await yes.count()) await yes.last().click();
  await page.waitForTimeout(300);
}


// ---------------------------------------------------------------------------
// The nine checks
// ---------------------------------------------------------------------------
// Each check receives a freshly opened page and returns [score, note].

const CHECKS = {
  // Row 1: every one of the three cards has its own checkbox.
  async r1_checkbox_on_every_card(page) {
    const total = await cards(page).count();
    let withBox = 0;
    for (let i = 0; i < total; i++) {
      if (await cards(page).nth(i).locator('input[type="checkbox"]').count()) withBox++;
    }
    const score = total === 3 && withBox === 3 ? 1 : withBox > 0 ? 0.5 : 0;
    return [score, `${withBox}/${total} cards have a checkbox`];
  },

  // Row 2: ticking a checkbox only selects the card. It must not navigate,
  // remove a card, or open a dialog.
  async r2_tick_does_nothing_else(page, log) {
    const hashBefore = await page.evaluate(() => location.hash);
    await cardCheckboxes(page).first().click({ force: true });
    await page.waitForTimeout(200);

    const samePage = (await page.evaluate(() => location.hash)) === hashBefore;
    const cardsKept = (await cards(page).count()) === 3;
    const oneChecked = (await checkedCount(page)) === 1;
    const noDialog = !log.dialogs;

    const score = samePage && cardsKept && oneChecked && noDialog ? 1
      : samePage && cardsKept && noDialog ? 0.5 : 0;
    return [score, `nav=${!samePage} cards=${await cards(page).count()} checked=${await checkedCount(page)} dialogs=${log.dialogs}`];
  },

  // Row 3: "Select all" ticks all three cards; clicking it again unticks them.
  async r3_select_all(page) {
    if (!(await clickSelectAll(page))) return [0, 'no Select all'];
    await page.waitForTimeout(150);
    const afterSelect = await checkedCount(page);

    await clickSelectAll(page);
    await page.waitForTimeout(150);
    const afterUnselect = await checkedCount(page);

    const score = afterSelect === 3 && afterUnselect === 0 ? 1 : afterSelect === 3 ? 0.5 : 0;
    return [score, `after select=${afterSelect}, after unselect=${afterUnselect}`];
  },

  // Row 4: the selection bar appears when a card is ticked and disappears when it is unticked.
  async r4_bar_appears_disappears(page) {
    await tickCard(page, 0);
    const appears = await isBarVisible(page);

    await cardCheckboxes(page).nth(0).uncheck({ force: true });
    await page.waitForTimeout(150);
    const disappears = !(await isBarVisible(page));

    const score = appears && disappears ? 1 : appears ? 0.5 : 0;
    return [score, `appears=${appears} disappears=${disappears}`];
  },

  // Row 5: with two cards ticked, the selection bar shows the count "2".
  async r5_count_correct(page) {
    await tickCard(page, 0);
    await tickCard(page, 1);
    const text = await selectionBarText(page);
    if (!text) return [0, 'no bar'];

    const number = text.match(/\b(\d+)\b/);
    const score = number && number[1] === '2' ? 1 : 0.5;
    return [score, `bar="${text.replace(/\s+/g, ' ').slice(0, 60)}"`];
  },

  // Row 6: "Clear" unticks everything and hides the bar without removing any card.
  async r6_clear(page) {
    await tickCard(page, 0);
    await tickCard(page, 1);
    const clear = button(page, /^\s*clear/i);
    if (!(await clear.count())) return [0, 'no Clear button'];

    await clear.first().click();
    await page.waitForTimeout(200);
    const allUnchecked = (await checkedCount(page)) === 0;
    const barGone = !(await isBarVisible(page));
    const cardsKept = (await cards(page).count()) === 3;

    const score = allUnchecked && barGone && cardsKept ? 1
      : cardsKept && (allUnchecked || barGone) ? 0.5 : 0;
    return [score, `unchecked=${allUnchecked} barGone=${barGone} cards=${await cards(page).count()}`];
  },

  // Row 7: bulk cancel asks for confirmation inside the page (not a native browser
  // dialog), offers a way to back out, and has not removed anything yet.
  async r7_confirm_in_page_no_native(page, log) {
    await tickCard(page, 0);
    await tickCard(page, 1);
    const bulk = await common.findBulk(page);
    if (!bulk) return [0, 'no bulk-cancel button'];

    await bulk.click();
    await page.waitForTimeout(250);
    const inPage = await isShown(confirmationText(page));
    const backOut = await button(page, /keep|go back|never mind|^\s*no\b|don.?t cancel/i).count();
    const nothingRemoved = (await cards(page).count()) === 3;
    const native = log.dialogs > 0;

    const score = inPage && backOut && nothingRemoved && !native ? 1
      : inPage && nothingRemoved && !native ? 0.5
      : inPage && native ? 0.5 : 0;
    return [score, `inPage=${inPage} backOut=${backOut > 0} native=${native} cards=${await cards(page).count()}`];
  },

  // Row 8: confirming the bulk cancel of two cards leaves one card on screen and
  // one registration in storage, hides the bar, and shows a count of 1.
  async r8_confirm_cancels_batch(page) {
    await tickCard(page, 0);
    await tickCard(page, 1);
    await bulkCancelAndConfirm(page);

    const cardsLeft = await cards(page).count();
    const stored = await page.evaluate(
      key => JSON.parse(localStorage.getItem(key) || '[]').length, STORAGE_KEY);
    const barShown = await isBarVisible(page);
    const countShowsOne = await isShown(page.getByText(
      /\b1\b[^\d]{0,12}(registration|reservation|event|selected|total)|(registration|reservation|event)s?\W{0,3}\b1\b/i));

    const score = cardsLeft === 1 && stored === 1 && !barShown && countShowsOne ? 1
      : (cardsLeft === 1 || stored === 1) ? 0.5 : 0;
    return [score, `cards=${cardsLeft} stored=${stored} barGone=${!barShown} countShows1=${countShowsOne}`, { removedFromStorage: stored === 1 }];
  },

  // Row 9: select all, cancel, confirm -> the "No registrations yet" empty state,
  // with no leftover "Select all" header, selection bar, or registration count.
  async r9_all_cancelled_empty_state(page) {
    if (!(await clickSelectAll(page))) return [0, 'no Select all'];
    await page.waitForTimeout(150);
    await bulkCancelAndConfirm(page);

    const emptyState = await isShown(page.getByText(/no registrations yet/i));
    const leftovers = (await isShown(page.getByText(/select all/i)))
      || (await isBarVisible(page))
      || (await isShown(page.getByText(/\b\d+\s+registrations?\b/i)));

    const score = emptyState && !leftovers ? 1 : emptyState ? 0.5 : 0;
    return [score, `empty=${emptyState} strandedHeaderOrBar=${leftovers}`];
  },
};

// Rows 8 and 9 accept native confirm() dialogs so that an app using them can still
// complete the cancellation (row 7 already penalises using a native dialog).
const ACCEPT_DIALOGS = new Set(['r8_confirm_cancels_batch', 'r9_all_cancelled_empty_state']);


// ---------------------------------------------------------------------------
// Scoring one app version
// ---------------------------------------------------------------------------

// Run all nine checks against the app served on `port`.
// A check that throws scores 0 and records the error in its note.
async function scoreApp(browser, port) {
  const scores = {};
  const notes = {};
  let removedFromStorage = false;

  for (const row of ROWS) {
    const dialogs = ACCEPT_DIALOGS.has(row) ? 'accept' : 'dismiss';
    const { context, page, log } = await openApp(browser, port, { dialogs });
    try {
      const [score, note, extra] = await CHECKS[row](page, log);
      scores[row] = score;
      if (note) notes[row] = note;
      if (extra) removedFromStorage = extra.removedFromStorage;
    } catch (error) {
      scores[row] = 0;
      notes[row] = 'error: ' + String(error).split('\n')[0].slice(0, 120);
    } finally {
      await context.close();
    }
  }

  // "Usable end to end": confirming a bulk cancel really removed the two
  // registrations from storage, and row 8 earned at least partial credit.
  const endToEnd = removedFromStorage && (scores.r8_confirm_cancels_batch ?? 0) >= 0.5;
  return { scores, notes, endToEnd };
}


// ---------------------------------------------------------------------------
// Writing results
// ---------------------------------------------------------------------------

// When only some participants were run, keep everyone else's existing results.
function mergeWithExisting(results, requested, jsonFile) {
  if (!requested.length || !fs.existsSync(jsonFile)) return results;
  const kept = JSON.parse(fs.readFileSync(jsonFile, 'utf8'))
    .filter(row => !requested.includes(row.participant));
  return [...kept, ...results];
}

// KEY first, then P1, P2, ... in numeric order.
function sortByParticipant(rows) {
  const order = row => (row.participant === 'KEY' ? -1 : Number(row.participant.slice(1)));
  return rows.sort((a, b) => order(a) - order(b));
}

function writeResults(rows) {
  fs.writeFileSync(path.join(OUT_DIR, 'behavioral_results.json'), JSON.stringify(rows, null, 1));

  const header = ['participant', 'group', ...ROWS, 'total_rows_1_9', 'usable_end_to_end'];
  const lines = rows.map(row => header.map(column => row[column] ?? '').join(','));
  fs.writeFileSync(path.join(OUT_DIR, 'behavioral_results.csv'), [header.join(','), ...lines].join('\n'));
}


// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const requested = process.argv.slice(2);
  const variants = requested.length ? requested : common.VARIANTS;

  // Playwright's own Chromium by default; set CHROMIUM_PATH to use a specific browser binary.
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  const results = [];

  for (const [index, variant] of variants.entries()) {
    common.exportVariant(variant);
    const port = FIRST_PORT + index;
    let server;
    try {
      server = await common.serve(variant, port);
      const { scores, notes, endToEnd } = await scoreApp(browser, port);
      const total = ROWS.reduce((sum, row) => sum + (scores[row] ?? 0), 0);

      results.push({
        participant: variant,
        group: common.group(variant),
        ...scores,
        total_rows_1_9: total,
        usable_end_to_end: endToEnd,
        notes,
      });
      console.log(variant, common.group(variant), total, endToEnd ? 'E2E' : '-');
    } catch (error) {
      results.push({ participant: variant, group: common.group(variant), error: String(error) });
      console.log(variant, 'ERROR', error.message);
    } finally {
      if (server) server.kill();
    }
  }
  await browser.close();

  const jsonFile = path.join(OUT_DIR, 'behavioral_results.json');
  writeResults(sortByParticipant(mergeWithExisting(results, requested, jsonFile)));
}

main();
