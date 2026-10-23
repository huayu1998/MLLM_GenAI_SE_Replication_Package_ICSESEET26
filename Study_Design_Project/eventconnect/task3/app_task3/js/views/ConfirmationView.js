/**
 * Standalone confirmation page for a completed registration, reached at
 * /registration/:regId.
 *
 * The success message used to be rendered inside RegistrationFlowView while
 * the URL still read /register/:id, so reloading the confirmation dropped the
 * user back into an empty Step 1 and the proof of registration simply
 * vanished. Giving it its own route means it can be reloaded, bookmarked, and
 * shared — everything on screen is rebuilt from the stored registration.
 */
EC.ConfirmationView = class ConfirmationView {
  constructor(container, eventStore, registrationStore, regId) {
    this.container         = container;
    this.eventStore        = eventStore;
    this.registrationStore = registrationStore;
    this.regId             = regId;
  }

  render() {
    const reg = this.registrationStore.getById(this.regId);

    if (!reg) {
      this.container.innerHTML = `
        <main class="s3-body">
          <div class="empty-state">
            <div class="empty-state-icon">🔍</div>
            <h3>Registration not found</h3>
            <p>It may have been cancelled, or the link is incorrect.</p>
            <a href="#/my-registrations" class="btn btn-primary" style="margin-top:16px">My Registrations</a>
          </div>
        </main>`;
      return;
    }

    const rawEvent = this.eventStore.getById(reg.eventId);
    const ev = rawEvent ? new EC.EventModel(rawEvent) : null;

    this.container.innerHTML = `
      <main class="s3-body">
        <div class="s3-inner">
          <div class="success-panel" role="status" aria-live="polite">
            <div class="success-icon" aria-hidden="true">✓</div>
            <h2 class="success-heading">You're registered!</h2>
            <p class="success-body">
              Your spot for <strong>${this._esc(ev ? ev.title : 'this event')}</strong> has been confirmed.
              A confirmation email will be sent to <strong>${this._esc(reg.email)}</strong>.
            </p>
            ${ev ? `<p class="success-detail">${this._esc(ev.formattedDate)} &middot; ${this._esc(ev.location)}</p>` : ''}
            <p class="success-reference">
              Confirmation reference <strong>${this._esc(this._reference(reg.id))}</strong>
            </p>
            <div class="success-actions">
              <a class="btn btn-outline" href="#/my-registrations">View My Registrations</a>
              <a class="btn btn-ghost" href="#/">Browse more events</a>
            </div>
          </div>
        </div>
      </main>
    `;
  }

  destroy() {}

  /** Derived from the stored id, so the same registration always shows the
   *  same reference no matter how often the page is reloaded. */
  _reference(id) {
    return `EC-${String(id).replace(/[^a-z0-9]/gi, '').slice(-6).toUpperCase()}`;
  }

  _esc(str) {
    const d = document.createElement('div');
    d.textContent = String(str ?? '');
    return d.innerHTML;
  }
};
