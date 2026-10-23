EC.EventListView = class EventListView {
  constructor(container, eventStore, router, registrationStore) {
    this.container         = container;
    this.eventStore        = eventStore;
    this.router            = router;
    this.registrationStore = registrationStore;
    // Restored from the last visit, so navigating away and back doesn't
    // silently throw away the search and filters the user set up.
    this._filters    = this._loadFilters();
    this._debounceId = null;
    this._allEvents  = [];
  }

  render() {
    this.container.innerHTML = `
      <div class="page-body">
        <div class="page-hero">
          <h1>Upcoming Community Events</h1>
          <p>Discover and register for events happening in your area.</p>
        </div>

        <div class="toolbar" role="search">
          <div class="search-wrap">
            <span class="search-icon" aria-hidden="true">&#128269;</span>
            <input id="ev-search" class="search-input" type="search"
                   placeholder="Search events by name, date, or location…"
                   aria-label="Search events"
                   value="${this._esc(this._filters.search)}" />
            <button type="button" id="ev-search-clear" class="search-clear"
                    aria-label="Clear search" hidden>&times;</button>
          </div>
          <!-- The control is named by its own <label>; the option text holds
               only the value. The "▾" that used to be baked into every option
               doubled up with the chevron the CSS already draws. -->
          <div class="filter-group">
            <label class="filter-label" for="ev-category">Category</label>
            <select id="ev-category" class="filter-select">
              <option value="all">All</option>
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label" for="ev-sort">Sort by</label>
            <select id="ev-sort" class="filter-select">
              <option value="date-asc">Upcoming first</option>
              <option value="date-desc">Farthest first</option>
              <option value="price-asc">Price low → high</option>
              <option value="price-desc">Price high → low</option>
              <option value="status-asc">Availability</option>
              <option value="title-asc">Name A–Z</option>
            </select>
          </div>
        </div>

        <p id="ev-results-meta" class="results-meta" aria-live="polite"></p>
        <div id="ev-grid" class="event-grid" aria-label="Event listing"></div>
      </div>
    `;

    this._loadCategories();
    this._bindEvents();
    this._loadEvents();
  }

  destroy() {
    clearTimeout(this._debounceId);
  }

  // ── Private ────────────────────────────────────────────────

  _loadCategories() {
    const sel = this.container.querySelector('#ev-category');
    this.eventStore.getCategories().forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      sel.appendChild(opt);
    });
    sel.value = this._filters.category;   // restore the saved selection
  }

  // ── Filter persistence ─────────────────────────────────────
  //
  // Held in sessionStorage so leaving the listing and coming back doesn't
  // silently discard the user's search and filters. It belongs to this tab
  // and is gone when the tab closes.

  _filterKey() {
    return 'eventconnect3:listing-filters';
  }

  _defaultFilters() {
    return { search: '', category: 'all', sort: 'date', order: 'asc' };
  }

  _loadFilters() {
    try {
      const raw = sessionStorage.getItem(this._filterKey());
      const saved = raw ? JSON.parse(raw) : null;
      return saved && typeof saved === 'object'
        ? { ...this._defaultFilters(), ...saved }
        : this._defaultFilters();
    } catch {
      return this._defaultFilters();
    }
  }

  _saveFilters() {
    try {
      sessionStorage.setItem(this._filterKey(), JSON.stringify(this._filters));
    } catch { /* sessionStorage unavailable — filters just won't persist */ }
  }

  /** Reset everything and repaint. Used by the ✕ in the field, the Escape
   *  key, and the "Clear all filters" button in the empty state. */
  _clearFilters({ searchOnly = false } = {}) {
    const searchEl = this.container.querySelector('#ev-search');
    if (searchOnly) {
      this._filters.search = '';
      if (searchEl) searchEl.value = '';
    } else {
      this._filters = this._defaultFilters();
      if (searchEl) searchEl.value = '';
      const categoryEl = this.container.querySelector('#ev-category');
      const sortEl     = this.container.querySelector('#ev-sort');
      if (categoryEl) categoryEl.value = 'all';
      if (sortEl) sortEl.value = 'date-asc';
    }
    clearTimeout(this._debounceId);
    this._saveFilters();
    this._loadEvents();
    searchEl?.focus();
  }

  _syncClearButton() {
    const btn = this.container.querySelector('#ev-search-clear');
    const searchEl = this.container.querySelector('#ev-search');
    if (btn && searchEl) btn.hidden = searchEl.value.length === 0;
  }

  _bindEvents() {
    const searchEl   = this.container.querySelector('#ev-search');
    const categoryEl = this.container.querySelector('#ev-category');
    const sortEl     = this.container.querySelector('#ev-sort');
    const clearEl    = this.container.querySelector('#ev-search-clear');

    sortEl.value = `${this._filters.sort}-${this._filters.order}`;   // restore
    this._syncClearButton();

    searchEl.addEventListener('input', () => {
      this._syncClearButton();
      clearTimeout(this._debounceId);
      this._showSearching();
      this._debounceId = setTimeout(() => {
        this._filters.search = searchEl.value.trim();
        this._saveFilters();
        this._loadEvents();
      }, 300);
    });

    // Escape clears without reaching for the mouse.
    searchEl.addEventListener('keydown', e => {
      if (e.key === 'Escape' && searchEl.value) {
        e.preventDefault();
        this._clearFilters({ searchOnly: true });
        this._syncClearButton();
      }
    });

    clearEl.addEventListener('click', () => {
      this._clearFilters({ searchOnly: true });
      this._syncClearButton();
    });

    categoryEl.addEventListener('change', () => {
      this._filters.category = categoryEl.value;
      this._saveFilters();
      this._loadEvents();
    });

    sortEl.addEventListener('change', () => {
      const [field, order] = sortEl.value.split('-');
      this._filters.sort  = field;
      this._filters.order = order || 'asc';
      this._saveFilters();
      this._loadEvents();
    });
  }

  /**
   * Search is debounced, so for a moment after each keystroke the grid still
   * shows the previous query's results. Say that out loud instead of letting
   * stale rows pass for the answer.
   */
  _showSearching() {
    const meta = this.container.querySelector('#ev-results-meta');
    if (!meta) return;
    meta.textContent = 'Searching…';
    meta.classList.add('is-searching');
  }

  _loadEvents() {
    const grid = this.container.querySelector('#ev-grid');
    const meta = this.container.querySelector('#ev-results-meta');

    const raw = this.eventStore.getAll(this._filters);
    this._allEvents = raw.map(e => new EC.EventModel(e));

    meta.classList.remove('is-searching');

    meta.textContent = this._allEvents.length === 0
      ? 'No events match your search.'
      : `Showing ${this._allEvents.length} event${this._allEvents.length !== 1 ? 's' : ''}`;

    if (this._allEvents.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="empty-state-icon">📭</div>
          <h3>No events found</h3>
          <p>Try adjusting your search or filters to find what you're looking for.</p>
          <button type="button" id="ev-clear-filters" class="btn btn-primary" style="margin-top:16px">
            Clear all filters
          </button>
        </div>`;
      grid.querySelector('#ev-clear-filters')
        ?.addEventListener('click', () => this._clearFilters());
      return;
    }

    grid.innerHTML = '';
    this._allEvents.forEach(ev => grid.appendChild(this._createCard(ev)));
  }

  _createCard(ev) {
    // Shown on the card so the user doesn't have to remember which events
    // they already signed up for (or find out by filling in the form again).
    const isRegistered = !!this.registrationStore?.getForEvent(ev.id);

    const card = document.createElement('article');
    card.className = `event-card${ev.isSoldOut ? ' sold-out' : ''}${isRegistered ? ' is-registered' : ''}`;
    card.dataset.eventId = ev.id;
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'link');
    card.setAttribute('aria-label',
      `${ev.title}, ${ev.shortDate}, ${ev.location}. ${ev.statusLabel}.`
      + `${isRegistered ? " You're registered." : ''} View details.`
    );

    card.innerHTML = `
      <div class="card-img-wrap">
        <img src="${this._esc(ev.image)}" alt="${this._esc(ev.imageAlt)}" />
        <div class="card-badge-overlay">
          <span class="badge ${ev.badgeClass}">${ev.badgeText}</span>
        </div>
      </div>
      <div class="card-body">
        <div class="card-tag-row">
          <span class="tag">${this._esc(ev.category)}</span>
          ${isRegistered ? '<span class="registered-badge">&#10003; You&rsquo;re registered</span>' : ''}
        </div>
        <h3 class="card-title">${this._esc(ev.title)}</h3>
        <div class="card-meta">
          <div class="card-meta-row">📅 ${ev.shortDate} · ${this._esc(ev.time)}</div>
          <div class="card-meta-row">📍 ${this._esc(ev.location)}</div>
        </div>
        <div class="card-footer">
          <span class="card-price${ev.isFree ? ' free' : ''}">${ev.priceDisplay}</span>
          <a href="#/event/${ev.id}" class="btn btn-primary btn-sm">View Details</a>
        </div>
      </div>
    `;

    const open = () => this.router.navigateTo(`/event/${ev.id}`);
    card.addEventListener('click', e => {
      if (e.target.closest('a')) return; // let the real link navigate itself
      open();
    });
    card.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target === card) {
        e.preventDefault();
        open();
      }
    });

    return card;
  }

  _esc(str) {
    const d = document.createElement('div');
    d.textContent = String(str ?? '');
    return d.innerHTML;
  }
};
