// Ported from task3/app/front-end/js/views/MyRegistrationsView.js — uses
// EventStore/RegistrationStore (synchronous, localStorage-backed) instead
// of ApiService.
//
// "Select & cancel multiple": each card carries a checkbox, a header above
// the list carries "Select all", and a bar appears while anything is ticked
// so the whole selection can be cancelled in one confirmed step.
EC.MyRegistrationsView = class MyRegistrationsView {
  constructor(container, eventStore, registrationStore) {
    this.container         = container;
    this.eventStore        = eventStore;
    this.registrationStore = registrationStore;
    // Ticked cards, and whether the bar is asking to confirm. Both are
    // view state only: leaving the page forgets the selection.
    this._selected   = new Set();
    this._confirming = false;
  }

  render() {
    this.container.innerHTML = `
      <div class="page-body">
        <div class="page-hero">
          <h1>My Registrations</h1>
          <p>Events you've signed up for.</p>
        </div>
        <div id="reg-list-container"></div>
      </div>
    `;

    this._renderRegistrations();
  }

  destroy() {}

  _renderRegistrations() {
    const wrap = this.container.querySelector('#reg-list-container');

    const regs = this.registrationStore.getAll()
      .map(r => new EC.RegistrationModel(r))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // A registration cancelled from its own card must not stay selected.
    const liveIds = new Set(regs.map(r => r.id));
    this._selected.forEach(id => { if (!liveIds.has(id)) this._selected.delete(id); });
    if (regs.length === 0) this._selected.clear();
    if (this._selected.size === 0) this._confirming = false;

    if (regs.length === 0) {
      wrap.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <h3>No registrations yet</h3>
          <p>Browse upcoming events and register for ones that interest you.</p>
          <a href="#/" class="btn btn-primary" style="margin-top:16px">Browse Events</a>
        </div>`;
      return;
    }

    wrap.innerHTML = '<div class="reg-list" role="list"></div>';
    const list = wrap.querySelector('.reg-list');

    this._renderListHead(wrap, regs);
    wrap.insertAdjacentHTML('beforeend', '<div id="reg-bulk-bar"></div>');

    regs.forEach(reg => {
      // Wrapped in EventModel so the date renders through the same
      // `formattedDate` helper the listing, detail, and confirmation screens
      // use — the raw store record holds an ISO string ("2025-04-19").
      const rawEvent = this.eventStore.getById(reg.eventId);
      const ev = rawEvent ? new EC.EventModel(rawEvent) : null;
      const card = document.createElement('div');
      card.className = 'reg-card';
      card.setAttribute('role', 'listitem');

      card.innerHTML = `
        <div class="reg-card-info">
          <div class="reg-card-title">
            ${ev
              ? `<a href="#/event/${ev.id}">${this._esc(ev.title)}</a>`
              : this._esc('Unknown Event')}
          </div>
          <div class="reg-card-meta">
            ${ev ? `📅 ${this._esc(ev.formattedDate)} · ${this._esc(ev.time)}<br>
                    📍 ${this._esc(ev.location)}` : ''}
            <br>
            👤 ${this._esc(reg.name)} · ${this._esc(reg.email)}
            <br>
            🕐 Registered ${reg.formattedDate}
          </div>
          <details class="reg-card-details">
            <summary>Registration details</summary>
            <dl class="reg-detail-list">
              <div><dt>Phone</dt><dd>${this._esc(reg.phone) || '—'}</dd></div>
              <div><dt>Dietary restrictions</dt><dd>${this._esc(this._dietaryDisplay(reg))}</dd></div>
              <div><dt>Accessibility needs</dt><dd>${this._esc(reg.accessibilityNeeds) || '—'}</dd></div>
              <div><dt>Parking needed</dt><dd>${this._esc(reg.parkingNeededDisplay)}</dd></div>
            </dl>
          </details>
        </div>
        <div class="reg-card-actions">
          <button class="btn btn-danger btn-sm"
                  aria-label="Cancel registration for ${this._esc(ev?.title || 'event')}">
            Cancel
          </button>
        </div>
      `;

      this._addSelectionControl(card, reg, ev);

      card.querySelector('.reg-card-actions button').addEventListener('click', e => {
        const btn = e.currentTarget;
        if (!confirm('Are you sure you want to cancel this registration?')) return;
        btn.disabled = true;
        btn.textContent = 'Cancelling…';
        const result = this.registrationStore.delete(reg.id);
        if (!result.success) {
          alert(`Failed to cancel: ${result.errors.join(', ')}`);
          btn.disabled = false;
          btn.textContent = 'Cancel';
          return;
        }
        this._selected.delete(reg.id);
        this._renderRegistrations();
      });

      list.appendChild(card);
    });

    this._renderBulkBar();
  }

  // ── Selection ──────────────────────────────────────────────

  /** The count and "Select all", inserted above the list. */
  _renderListHead(wrap, regs) {
    wrap.insertAdjacentHTML('afterbegin', `
      <div class="reg-list-head">
        <span class="reg-count">${regs.length} registration${regs.length !== 1 ? 's' : ''}</span>
        <label class="select-all">
          <input type="checkbox" id="reg-select-all"
                 ${this._selected.size === regs.length ? 'checked' : ''} />
          Select all
        </label>
      </div>`);

    const selectAll = wrap.querySelector('#reg-select-all');
    // Half a selection is neither ticked nor empty — say so, rather than
    // showing a box that claims everything or nothing is chosen.
    selectAll.indeterminate = this._selected.size > 0 && this._selected.size < regs.length;

    selectAll.addEventListener('change', () => {
      if (selectAll.checked) regs.forEach(r => this._selected.add(r.id));
      else this._selected.clear();
      this._confirming = false;
      this._renderRegistrations();
    });
  }

  /** The checkbox on one card, plus its ticked look and handlers. */
  _addSelectionControl(card, reg, ev) {
    card.insertAdjacentHTML('afterbegin', `
      <div class="reg-select">
        <input type="checkbox" class="reg-checkbox"
               ${this._selected.has(reg.id) ? 'checked' : ''}
               aria-label="Select registration for ${this._esc(ev?.title || 'event')}" />
      </div>`);

    if (this._selected.has(reg.id)) card.classList.add('is-selected');

    const box = card.querySelector('.reg-checkbox');
    // The card's title is a link and Cancel sits alongside it — ticking a
    // box should do neither.
    box.addEventListener('click', e => e.stopPropagation());
    box.addEventListener('change', () => {
      if (box.checked) this._selected.add(reg.id);
      else this._selected.delete(reg.id);
      this._confirming = false;
      this._renderRegistrations();
    });
  }

  /**
   * The bar exists only while something is ticked: no empty bar, and no
   * space reserved for one. It has two states, and the confirmation
   * replaces the actions in place rather than opening a browser dialog.
   */
  _renderBulkBar() {
    const slot = this.container.querySelector('#reg-bulk-bar');
    if (!slot) return;

    const n = this._selected.size;
    if (n === 0) { slot.innerHTML = ''; return; }

    const noun = `registration${n !== 1 ? 's' : ''}`;

    slot.innerHTML = this._confirming
      ? `<div class="bulk-bar is-confirming" role="alertdialog" aria-label="Confirm cancellation">
           <div>
             <div class="bulk-confirm-text">Cancel ${n} ${noun}?</div>
             <div class="bulk-confirm-sub">Your spots will be released back to the events. This can't be undone.</div>
           </div>
           <div class="bulk-confirm-actions">
             <button type="button" class="btn-bulk-clear" data-action="keep">Keep them</button>
             <button type="button" class="btn-bulk-cancel" data-action="confirm">Yes, cancel ${n}</button>
           </div>
         </div>`
      : `<div class="bulk-bar" role="status">
           <span class="bulk-count">${n} selected</span>
           <span class="bulk-spacer"></span>
           <button type="button" class="btn-bulk-clear" data-action="clear">Clear</button>
           <button type="button" class="btn-bulk-cancel" data-action="ask">Cancel selected</button>
         </div>`;

    slot.querySelector('[data-action="clear"]')?.addEventListener('click', () => {
      this._selected.clear();
      this._renderRegistrations();
    });

    slot.querySelector('[data-action="ask"]')?.addEventListener('click', () => {
      this._confirming = true;
      this._renderRegistrations();
    });

    // "Keep them" backs out of the confirmation without dropping the
    // selection — the user asked to reconsider, not to start over.
    slot.querySelector('[data-action="keep"]')?.addEventListener('click', () => {
      this._confirming = false;
      this._renderRegistrations();
    });

    slot.querySelector('[data-action="confirm"]')?.addEventListener('click', () => {
      this._cancelSelected();
    });
  }

  /** Cancel every ticked registration, then repaint. Anything that fails to
   *  delete stays in the list and stays ticked, so it is visibly still there
   *  rather than silently dropped. */
  _cancelSelected() {
    [...this._selected].forEach(id => {
      const result = this.registrationStore.delete(id);
      if (result.success) this._selected.delete(id);
    });
    this._confirming = false;
    this._renderRegistrations();
  }

  /** The Step 2 checkbox values, shown back with the labels the form used. */
  _dietaryDisplay(reg) {
    const labels = {
      vegetarian: 'Vegetarian', vegan: 'Vegan', 'gluten-free': 'Gluten-Free',
      'nut-allergy': 'Nut Allergy', none: 'None',
    };
    const chosen = reg.dietaryRestrictions || [];
    return chosen.length ? chosen.map(v => labels[v] || v).join(', ') : 'None specified';
  }

  _esc(str) {
    const d = document.createElement('div');
    d.textContent = String(str ?? '');
    return d.innerHTML;
  }
};
