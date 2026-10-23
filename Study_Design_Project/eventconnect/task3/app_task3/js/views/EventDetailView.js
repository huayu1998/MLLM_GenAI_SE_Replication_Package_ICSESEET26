// Routed event detail page (replaces the old EventDetailModal.js) — matches
// task1/task2's Screen 2 design: a full page with breadcrumb, main content,
// and a sticky sidebar, instead of a modal dialog.
EC.EventDetailView = class EventDetailView {
  constructor(container, eventStore, router, eventId, registrationStore) {
    this.container         = container;
    this.eventStore        = eventStore;
    this.router            = router;
    this.eventId           = eventId;
    this.registrationStore = registrationStore;
  }

  render() {
    const raw = this.eventStore.getById(this.eventId);

    if (!raw) {
      this.container.innerHTML = `
        <main class="s2-body">
          <div class="empty-state">
            <div class="empty-state-icon">🔍</div>
            <h3>Event not found</h3>
            <p>It may have been removed, or the link is incorrect.</p>
            <a href="#/" class="btn btn-primary" style="margin-top:16px">Browse Events</a>
          </div>
        </main>`;
      return;
    }

    const ev  = new EC.EventModel(raw);
    const pct = ev.capacityPercent;

    this.container.innerHTML = `
      <main class="s2-body">
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a href="#/">Events</a>
          <span class="breadcrumb-sep" aria-hidden="true">&#8250;</span>
          <span aria-current="page">${this._esc(ev.title)}</span>
        </nav>

        <div class="s2-layout">
          <div class="s2-main">
            <img class="s2-banner" src="${this._esc(ev.image)}" alt="${this._esc(ev.imageAlt)}" />

            <div class="s2-tag-row">
              <span class="tag">${this._esc(ev.category)}</span>
            </div>

            <h2>${this._esc(ev.title)}</h2>

            <ul class="s2-meta-list" aria-label="Event details">
              <li>
                <span class="meta-icon" aria-hidden="true">📅</span>
                <span><span class="meta-label">Date &amp; Time</span><br>${this._esc(ev.formattedDate)} &middot; ${this._esc(ev.time)}</span>
              </li>
              <li>
                <span class="meta-icon" aria-hidden="true">📍</span>
                <span><span class="meta-label">Location</span><br>${this._esc(ev.location)} &middot; ${this._esc(ev.address)}</span>
              </li>
              <li>
                <span class="meta-icon" aria-hidden="true">👥</span>
                <span><span class="meta-label">Hosted by</span><br>${this._esc(ev.organizer)}</span>
              </li>
            </ul>

            <p class="s2-desc-heading">About This Event</p>
            <div class="s2-desc"><p>${this._esc(ev.description)}</p></div>
          </div>

          <aside class="s2-sidebar" aria-label="Registration details">
            <div class="sidebar-price">${ev.priceDisplay}${ev.isFree ? '' : ' <small>per person</small>'}</div>

            <div class="sidebar-badge-row">
              <span class="badge ${ev.badgeClass}">${ev.badgeText}</span>
              <span>${ev.isSoldOut ? 'No spots remaining' : `${ev.spotsRemaining} spots remaining`}</span>
            </div>

            <div class="capacity-bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="Capacity: ${pct}% full">
              <div class="capacity-fill" style="width:${pct}%"></div>
            </div>
            <p class="capacity-label">${ev.capacity.registered} of ${ev.capacity.total} registered</p>

            <div class="sidebar-cta-stack">
              ${this._renderCta(ev)}
              ${(!ev.isSoldOut || this.registrationStore?.getForEvent(ev.id))
                ? `<button class="btn btn-ghost btn-full" type="button" id="btn-add-calendar">&#128197; Add to Calendar</button>
                   <p class="calendar-status" id="calendar-status" role="status" aria-live="polite"></p>`
                : ''}
            </div>

            <div class="sidebar-divider" role="separator"></div>

            <!-- Booking facts only. Date, time, location and organizer all
                 appear in the meta list beside this sidebar, and repeating
                 them here just competed with the price and the CTA. -->
            <ul class="sidebar-detail-list">
              <li><strong>Total Capacity</strong> ${ev.capacity.total} attendees</li>
            </ul>
          </aside>
        </div>
      </main>
    `;

    this._bindCalendarButton(ev);
  }

  destroy() {}

  // ── Registration state ────────────────────────────────────

  /**
   * The primary call to action, reflecting whether this event has already
   * been registered for. Without this the page kept offering "Register Now"
   * to someone already signed up, who then only found out after filling in
   * the whole form.
   */
  _renderCta(ev) {
    const existing = this.registrationStore?.getForEvent(ev.id);

    if (existing) {
      return `
        <div class="registered-note" role="status">
          <span class="registered-badge">&#10003; You&rsquo;re registered</span>
          <span class="registered-detail">Confirmed for ${this._esc(existing.email)}</span>
        </div>
        <a href="#/my-registrations" class="btn btn-outline btn-full">View my registration</a>`;
    }

    return ev.isSoldOut
      ? `<button class="btn btn-ghost btn-full" type="button" disabled aria-disabled="true">Registration Closed</button>`
      : `<a href="#/register/${ev.id}" class="btn btn-primary btn-full">Register Now</a>`;
  }

  // ── Add to Calendar ───────────────────────────────────────

  /**
   * Builds an .ics file for the event and downloads it, then confirms in
   * place. Previously this button was wired to nothing at all, so a click
   * produced no feedback of any kind.
   */
  _bindCalendarButton(ev) {
    const btn = this.container.querySelector('#btn-add-calendar');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const status = this.container.querySelector('#calendar-status');
      try {
        const blob = new Blob([this._buildIcs(ev)], { type: 'text/calendar;charset=utf-8' });
        const url  = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this._slug(ev.title)}.ics`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);

        if (status) {
          status.textContent = '✓ Calendar file downloaded — open it to add the event.';
          status.classList.add('is-success');
        }
      } catch {
        if (status) {
          status.textContent = 'Sorry, the calendar file could not be created.';
          status.classList.remove('is-success');
        }
      }
    });
  }

  /** Minimal RFC 5545 event. Times come from the event's "2:00 PM – 4:30 PM"
   *  string; if that can't be parsed the entry falls back to an all-day one. */
  _buildIcs(ev) {
    const [startRaw, endRaw] = String(ev.time || '').split(/[–—-]/).map(s => s && s.trim());
    const start = this._icsStamp(ev.date, startRaw);
    const end   = this._icsStamp(ev.date, endRaw);

    const when = start && end
      ? [`DTSTART:${start}`, `DTEND:${end}`]
      : [`DTSTART;VALUE=DATE:${String(ev.date).replace(/-/g, '')}`];

    const fold = value => String(value).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');

    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//EventConnect//EN',
      'BEGIN:VEVENT',
      `UID:eventconnect-${ev.id}@example.com`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      ...when,
      `SUMMARY:${fold(ev.title)}`,
      `LOCATION:${fold([ev.location, ev.address].filter(Boolean).join(', '))}`,
      `DESCRIPTION:${fold(ev.description)}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
  }

  /** "2:00 PM" + "2025-04-19" → "20250419T140000" (local time, no TZ suffix). */
  _icsStamp(date, time) {
    const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(String(time || '').trim());
    if (!match || !date) return null;

    let hours = Number(match[1]) % 12;
    if (/PM/i.test(match[3])) hours += 12;

    return `${String(date).replace(/-/g, '')}T${String(hours).padStart(2, '0')}${match[2]}00`;
  }

  _slug(title) {
    return String(title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'event';
  }

  _esc(str) {
    const d = document.createElement('div');
    d.textContent = String(str ?? '');
    return d.innerHTML;
  }
};
