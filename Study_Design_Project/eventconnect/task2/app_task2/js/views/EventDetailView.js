EC.EventDetailView = class EventDetailView {
  constructor(container, eventStore, router, eventId) {
    this.container  = container;
    this.eventStore = eventStore;
    this.router     = router;
    this.eventId    = eventId;
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
                <span class="meta-icon" aria-hidden="true">&#128197;</span>
                <span><span class="meta-label">Date &amp; Time</span><br>${this._esc(ev.formattedDate)} &middot; ${this._esc(ev.time)}</span>
              </li>
              <li>
                <span class="meta-icon" aria-hidden="true">&#128205;</span>
                <span><span class="meta-label">Location</span><br>${this._esc(ev.location)} &middot; ${this._esc(ev.address)}</span>
              </li>
              <li>
                <span class="meta-icon" aria-hidden="true">&#128101;</span>
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
              ${ev.isSoldOut
                ? `<button class="btn btn-ghost btn-full" type="button" disabled aria-disabled="true">Registration Closed</button>`
                : `<a href="#/register/${ev.id}" class="btn btn-primary btn-full">Register Now</a>
                   <a href="#/register/${ev.id}" class="btn btn-primary btn-full">Register Now</a>
                   <button class="btn btn-ghost btn-full" type="button">&#128197; Add to Calendar</button>`
              }
            </div>

            <div class="sidebar-divider" role="separator"></div>

            <!-- Booking facts only. Date, time, location and organizer all
                 appear in the meta list beside this sidebar, and repeating
                 them here just competed with the price and the CTA. -->
            <ul class="sidebar-detail-list">
              <li><strong>Max Occupancy Threshold</strong> ${ev.capacity.total} attendees</li>
            </ul>
          </aside>
        </div>
      </main>
    `;
  }

  destroy() {}

  _esc(str) {
    const d = document.createElement('div');
    d.textContent = String(str ?? '');
    return d.innerHTML;
  }
}
