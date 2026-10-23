EC.MyRegistrationsView = class MyRegistrationsView {
  constructor(container, eventStore, registrationStore) {
    this.container         = container;
    this.eventStore        = eventStore;
    this.registrationStore = registrationStore;
  }

  render() {
    const regs = this.registrationStore.getAll()
      .map(r => new EC.RegistrationModel(r))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (regs.length === 0) {
      this.container.innerHTML = `
        <main class="s1-body">
          <div class="s1-hero">
            <h1>My Registrations</h1>
            <p>Events you've signed up for.</p>
          </div>
          <div class="empty-state">
            <div class="empty-state-icon">📋</div>
            <h3>No registrations yet</h3>
            <p>Browse upcoming events and register for ones that interest you.</p>
            <a href="#/" class="btn btn-primary" style="margin-top:16px">Browse Events</a>
          </div>
        </main>`;
      return;
    }

    this.container.innerHTML = `
      <main class="s1-body">
        <div class="s1-hero">
          <h1>My Registrations</h1>
          <p>Events you've signed up for.</p>
        </div>
        <div class="reg-list" role="list"></div>
      </main>`;

    const list = this.container.querySelector('.reg-list');
    regs.forEach(reg => list.appendChild(this._createCard(reg)));
  }

  destroy() {}

  _createCard(reg) {
    // Wrapped in EventModel so the date renders through the same
    // `formattedDate` helper the listing, detail, and confirmation screens
    // use — the raw store record holds an ISO string ("2025-04-19").
    const raw = this.eventStore.getById(reg.eventId);
    const ev  = raw ? new EC.EventModel(raw) : null;
    const card = document.createElement('div');
    card.className = 'reg-card';
    card.setAttribute('role', 'listitem');

    card.innerHTML = `
      <div class="reg-card-info">
        <div class="reg-card-title">${this._esc(ev?.title || 'Unknown Event')}</div>
        <div class="reg-card-meta">
          ${ev ? `📅 ${this._esc(ev.formattedDate)} · ${this._esc(ev.time)}<br>📍 ${this._esc(ev.location)}<br>` : ''}
          👤 ${this._esc(reg.name)} · ${this._esc(reg.email)}<br>
          🕐 Registered ${reg.formattedDate}
        </div>
      </div>
      <div class="reg-card-actions">
        <button class="btn btn-danger btn-sm" aria-label="Cancel registration for ${this._esc(ev?.title || 'event')}">Cancel</button>
      </div>
    `;

    card.querySelector('button').addEventListener('click', e => {
      const btn = e.currentTarget;
      btn.disabled = true;
      btn.textContent = 'Cancelling…';
      const result = this.registrationStore.delete(reg.id);
      if (!result.success) {
        alert(`Failed to cancel: ${result.errors.join(', ')}`);
        btn.disabled = false;
        btn.textContent = 'Cancel';
        return;
      }
      this.render();
    });

    return card;
  }

  _esc(str) {
    const d = document.createElement('div');
    d.textContent = String(str ?? '');
    return d.innerHTML;
  }
};
