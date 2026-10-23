/**
 * Minimal hash-based client-side router with simple ":param" segment
 * matching (event detail and registration are now routed pages —
 * /event/:id and /register/:id — instead of a modal).
 */
EC.Router = class Router {
  constructor() {
    this._routes = []; // [{ pattern, segments, handler }]
    this._currentCleanup = null;

    window.addEventListener('hashchange', () => this._resolve());
  }

  addRoute(pattern, handler) {
    this._routes.push({ pattern, segments: pattern.split('/').filter(Boolean), handler });
    return this;
  }

  /** Handler for a hash that matches no route. Without one, an unknown URL
   *  used to fall through to the event list while the address bar still
   *  showed the bad path, leaving no sign anything had gone wrong. */
  setNotFound(handler) {
    this._notFoundHandler = handler;
    return this;
  }

  start() {
    this._resolve();
  }

  navigateTo(hash) {
    window.location.hash = hash;
  }

  get currentRoute() {
    return window.location.hash.slice(1) || '/';
  }

  _match(path) {
    const pathSegments = path.split('/').filter(Boolean);
    for (const route of this._routes) {
      if (route.segments.length !== pathSegments.length) continue;
      const params = {};
      let ok = true;
      for (let i = 0; i < route.segments.length; i++) {
        const rSeg = route.segments[i];
        const pSeg = pathSegments[i];
        if (rSeg.startsWith(':')) {
          params[rSeg.slice(1)] = decodeURIComponent(pSeg);
        } else if (rSeg !== pSeg) {
          ok = false;
          break;
        }
      }
      if (ok) return { handler: route.handler, params };
    }
    return null;
  }

  _resolve() {
    if (typeof this._currentCleanup === 'function') {
      this._currentCleanup();
      this._currentCleanup = null;
    }

    const path = this.currentRoute;
    const match = this._match(path);

    const cleanup = match
      ? match.handler(match.params)
      : this._notFoundHandler?.(path);

    if (typeof cleanup === 'function') {
      this._currentCleanup = cleanup;
    }

    window.scrollTo(0, 0);
    this._updateActiveNav(path);
  }

  /**
   * Routes that live underneath a nav destination, so the nav keeps showing
   * where you are. Without this, opening an event or starting a registration
   * cleared the highlight entirely and left no indication of the current
   * section anywhere on the page.
   */
  static CHILD_ROUTES = {
    '/': ['/event/', '/register/', '/registration/'],
  };

  _updateActiveNav(path) {
    document.querySelectorAll('.nav-links a').forEach(link => {
      const href = link.getAttribute('href') || '';
      const linkPath = href.startsWith('#') ? href.slice(1) : href;
      const children = EC.Router.CHILD_ROUTES[linkPath] || [];
      const isActive = linkPath === '/'
        ? path === '/' || children.some(prefix => path.startsWith(prefix))
        : path.startsWith(linkPath);
      link.classList.toggle('active', isActive);
    });
  }
};
