/**
 * Shown when the hash matches no route. Previously the router quietly fell
 * back to the event list while the address bar kept the bad path, so a
 * mistyped or stale link looked like it had worked — the page just didn't
 * match the URL. Naming the path that failed makes the mismatch visible and
 * gives the user somewhere to go next.
 */
EC.NotFoundView = class NotFoundView {
  constructor(container, path) {
    this.container = container;
    this.path      = path;
  }

  render() {
    this.container.innerHTML = `
      <div class="page-body">
        <div class="empty-state">
          <div class="empty-state-icon">🧭</div>
          <h3>Page not found</h3>
          <p>
            We couldn&rsquo;t find <code class="not-found-path">#${this._esc(this.path)}</code>.
            The link may be out of date, or the address may have a typo.
          </p>
          <div class="not-found-actions">
            <a href="#/" class="btn btn-primary">Browse Events</a>
            <a href="#/my-registrations" class="btn btn-ghost">My Registrations</a>
          </div>
        </div>
      </div>`;
  }

  destroy() {}

  _esc(str) {
    const d = document.createElement('div');
    d.textContent = String(str ?? '');
    return d.innerHTML;
  }
};
