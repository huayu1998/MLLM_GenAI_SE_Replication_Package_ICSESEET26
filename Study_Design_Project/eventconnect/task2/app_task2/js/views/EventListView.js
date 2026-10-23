EC.EventListView = class EventListView {
  constructor(container, eventStore, router) {
    this.container  = container;
    this.eventStore = eventStore;
    this.router     = router;
    this._filters   = { search: '', category: 'all', sort: 'date', order: 'asc' };
    this._debounceId = null;
  }

  render() {
    this.container.innerHTML = `
      <main class="s1-body">
        <div class="s1-hero">
          <h1>Upcoming Community Events</h1>
          <p>Discover and register for events happening in your area.</p>
        </div>

        <div class="s1-toolbar" role="search">
          <div class="search-wrap">
            <span class="search-icon" aria-hidden="true">&#128269;</span>
            <input id="ev-search" class="search-input" type="text"
                   placeholder="Search events by name, date, or location…"
                   aria-label="Search events" />
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
      </main>
    `;

    this._loadCategories();
    this._bindEvents();
    this._renderFiltered();
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
  }

  _bindEvents() {
    const searchEl   = this.container.querySelector('#ev-search');
    const categoryEl = this.container.querySelector('#ev-category');
    const sortEl     = this.container.querySelector('#ev-sort');

    searchEl.addEventListener('input', () => {
      clearTimeout(this._debounceId);
      this._showSearching();
      this._debounceId = setTimeout(() => {
        this._filters.search = searchEl.value.trim();
        this._renderFiltered();
      }, 200);
    });

    categoryEl.addEventListener('change', () => {
      this._filters.category = categoryEl.value;
      this._renderFiltered();
    });

    sortEl.addEventListener('change', () => {
      const [field, order] = sortEl.value.split('-');
      this._filters.sort  = field;
      this._filters.order = order || 'asc';
      this._renderFiltered();
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

  _renderFiltered() {
    const grid = this.container.querySelector('#ev-grid');
    const meta = this.container.querySelector('#ev-results-meta');

    const raw = this.eventStore.getAll(this._filters);
    const events = raw.map(e => new EC.EventModel(e));

    meta.classList.remove('is-searching');
    meta.innerHTML = events.length === 0
      ? 'No events match your search.'
      : `Showing <strong>${events.length}</strong> event${events.length !== 1 ? 's' : ''}`;

    if (events.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="empty-state-icon">📭</div>
          <h3>No events found</h3>
          <p>Try adjusting your search or filters to find what you're looking for.</p>
        </div>`;
      return;
    }

    grid.innerHTML = '';
    events.forEach(ev => grid.appendChild(this._createCard(ev)));
  }

  _createCard(ev) {
    const card = document.createElement('article');
    card.className = `event-card${ev.isSoldOut ? ' sold-out' : ''}`;
    card.tabIndex = 0;
    card.setAttribute('role', 'link');
    card.setAttribute('aria-label',
      `${ev.title}, ${ev.shortDate}, ${ev.location}. ${ev.statusLabel}. View details.`
    );

    card.innerHTML = `
      <div class="card-img-wrap">
        <img src="${this._esc(ev.image)}" alt="${this._esc(ev.imageAlt)}" />
        <div class="card-badge-overlay">
          <span class="badge ${ev.badgeClass}">${ev.badgeText}</span>
        </div>
      </div>
      <div class="card-body">
        <div class="card-tag-row"><span class="tag">${this._esc(ev.category)}</span></div>
        <h3 class="card-title">${this._esc(ev.title)}</h3>
        <div class="card-meta">
          <div class="card-meta-row">&#128197; ${this._esc(ev.formattedDate)} &middot; ${this._esc(ev.time)}</div>
          <div class="card-meta-row">&#128205; ${this._esc(ev.location)}</div>
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
