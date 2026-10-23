// Ported from task3/app/front-end/js/views/MyRegistrationsView.js — uses
// EventStore/RegistrationStore (synchronous, localStorage-backed) instead
// of ApiService.
EC.MyRegistrationsView = class MyRegistrationsView {
  constructor(container, eventStore, registrationStore) {
    this.container         = container;
    this.eventStore        = eventStore;
    this.registrationStore = registrationStore;
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

      card.querySelector('button').addEventListener('click', e => {
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
        card.remove();
        if (list.children.length === 0) this._renderRegistrations();
      });

      list.appendChild(card);
    });
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
