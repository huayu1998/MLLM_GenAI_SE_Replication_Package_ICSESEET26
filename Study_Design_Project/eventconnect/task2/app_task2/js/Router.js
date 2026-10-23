/**
 * Minimal hash-based client-side router — no dependency, mirrors task3/app's
 * Router.js but adds simple ":param" segment matching (task2's screens need
 * /event/:id and /register/:id).
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

  _updateActiveNav(path) {
    document.querySelectorAll('.nav-links a').forEach(link => {
      const href = link.getAttribute('href') || '';
      const linkPath = href.startsWith('#') ? href.slice(1) : href;
      link.classList.toggle('active', linkPath === '/' ? path === '/' : path.startsWith(linkPath));
    });
  }
};
