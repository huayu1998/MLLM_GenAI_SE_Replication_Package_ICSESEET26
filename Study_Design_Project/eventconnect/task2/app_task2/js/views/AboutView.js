EC.AboutView = class AboutView {
  constructor(container) {
    this.container = container;
  }

  render() {
    this.container.innerHTML = `
      <main class="s1-body">
        <div class="s1-hero">
          <h1>About EventConnect</h1>
          <p>Your community event registration portal.</p>
        </div>

        <div class="about-content">
          <h2>What is EventConnect?</h2>
          <p>
            EventConnect is a community platform that makes it easy to discover
            local events, learn about what's happening, and register — all in one
            place. Whether it's a neighborhood fair, a hands-on workshop, a live
            music night, or a kids' coding camp, EventConnect brings your community
            together.
          </p>

          <h2>Key Features</h2>
          <ul>
            <li><strong>Browse events</strong> — See all upcoming community events in a clean, searchable grid.</li>
            <li><strong>Search &amp; filter</strong> — Search by event name, filter by category, and sort by date, price, or availability.</li>
            <li><strong>Event details</strong> — View full details including date, time, location, description, organizer, and live capacity tracking.</li>
            <li><strong>Register in 3 steps</strong> — A guided registration form collects your contact info and preferences, then confirms your spot instantly.</li>
            <li><strong>Manage registrations</strong> — View all your upcoming registrations in one place and cancel if plans change.</li>
          </ul>

          <h2>How to Use</h2>
          <ul>
            <li><strong>Step 1:</strong> On the <a href="#/">Browse Events</a> page, use the search bar or the Category / Sort dropdowns to find events.</li>
            <li><strong>Step 2:</strong> Click any event card to open its detail page and review date, location, description, and remaining capacity.</li>
            <li><strong>Step 3:</strong> If the event is open, click <strong>Register Now</strong> and complete the 3-step form: personal info, preferences, and review.</li>
            <li><strong>Step 4:</strong> Visit <a href="#/my-registrations">My Registrations</a> to see everything you've signed up for, or cancel a spot.</li>
          </ul>

          <h2>Availability Status Guide</h2>
          <ul>${this._statusGuide()}</ul>

          <h2>Technical Notes</h2>
          <p>
            This is a fully client-side prototype — no server, no build step, no
            install required. All event and registration data lives in your
            browser's <code>localStorage</code>, so it persists across reloads on
            this device but isn't shared anywhere else. There is no user
            authentication in this version. This is a prototype built for study
            and demonstration purposes.
          </p>
        </div>
      </main>
    `;
  }

  destroy() {}

  /**
   * Built from EC.STATUS_BADGES — the same data the event cards and the detail
   * sidebar render — so this legend always shows the exact badge the user sees
   * on the listing, rather than a hand-written copy that can fall out of sync.
   */
  _statusGuide() {
    return Object.values(EC.STATUS_BADGES).map(b => `
            <li><span class="badge ${b.className}">${b.icon} ${b.label}</span> — ${b.help}</li>`
    ).join('');
  }
};
