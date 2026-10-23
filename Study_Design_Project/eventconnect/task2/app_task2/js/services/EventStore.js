// Wrapped in an IIFE so STORAGE_KEY gets its own scope — these are classic
// (non-module) scripts sharing one global scope, unlike ES modules, so a
// bare top-level `const` here would collide with RegistrationStore.js's
// own STORAGE_KEY constant.
(function () {
const STORAGE_KEY = 'eventconnect2:events:v2';

/**
 * Client-only replacement for the Express + JSON-file back-end: same
 * search/filter/sort/capacity logic, but reads and writes localStorage
 * instead of a server. Seeds itself from EC.SEED_EVENTS on first run only.
 */
EC.EventStore = class EventStore {
  constructor() {
    this._events = this._load();
  }

  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch { /* fall through to reseed */ }
    const seeded = EC.SEED_EVENTS.map(e => ({ ...e, capacity: { ...e.capacity } }));
    this._persist(seeded);
    return seeded;
  }

  _persist(events = this._events) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch { /* localStorage unavailable — fail silently */ }
  }

  getAll({ search, category, sort, order } = {}) {
    let events = this._events.map(e => ({ ...e, capacity: { ...e.capacity } }));

    if (search) {
      const q = search.toLowerCase();
      events = events.filter(e => {
        const ev = new EC.EventModel(e);
        // Name, date/time, and location (venue only — not the street address).
        const haystack = [e.title, e.date, e.time, ev.formattedDate, ev.shortDate, e.location]
          .join(' ')
          .toLowerCase();
        return haystack.includes(q);
      });
    }

    if (category && category !== 'all') {
      events = events.filter(e => e.category.toLowerCase() === category.toLowerCase());
    }

    return this._sort(events, sort || 'date', order || 'asc');
  }

  getById(id) {
    const ev = this._events.find(e => e.id === id);
    return ev ? { ...ev, capacity: { ...ev.capacity } } : null;
  }

  getCategories() {
    const cats = [...new Set(this._events.map(e => e.category))];
    cats.sort((a, b) => a.localeCompare(b));
    return cats;
  }

  /** delta: +1 on registration, -1 on cancellation. Mirrors Event.registerOne/unregisterOne. */
  updateCapacity(id, delta) {
    const ev = this._events.find(e => e.id === id);
    if (!ev) return null;

    if (delta > 0) {
      if (ev.capacity.registered >= ev.capacity.total) {
        throw new Error(`Event "${ev.title}" is sold out.`);
      }
      ev.capacity.registered += 1;
      const remaining = ev.capacity.total - ev.capacity.registered;
      if (ev.capacity.registered >= ev.capacity.total) {
        ev.status = 'soldout';
      } else if (remaining <= Math.ceil(ev.capacity.total * 0.15)) {
        ev.status = 'limited';
      }
    } else if (delta < 0 && ev.capacity.registered > 0) {
      ev.capacity.registered -= 1;
      const remaining = ev.capacity.total - ev.capacity.registered;
      if (ev.status === 'soldout') {
        ev.status = 'limited';
      } else if (remaining > Math.ceil(ev.capacity.total * 0.15)) {
        ev.status = 'available';
      }
    }

    this._persist();
    return { ...ev, capacity: { ...ev.capacity } };
  }

  _sort(events, field, order) {
    const dir = order === 'desc' ? -1 : 1;
    const sorters = {
      date:   (a, b) => a.date.localeCompare(b.date) * dir,
      price:  (a, b) => (a.price - b.price) * dir,
      title:  (a, b) => a.title.localeCompare(b.title) * dir,
      status: (a, b) => {
        const rank = { available: 0, limited: 1, soldout: 2 };
        return ((rank[a.status] ?? 3) - (rank[b.status] ?? 3)) * dir;
      },
    };
    const sortFn = sorters[field] || sorters.date;
    return [...events].sort(sortFn);
  }
};
})();
