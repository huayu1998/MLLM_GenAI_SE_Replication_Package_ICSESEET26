// Wrapped in an IIFE so STORAGE_KEY/generateId/validate get their own scope
// — classic (non-module) scripts share one global scope, so bare top-level
// declarations here would otherwise collide with EventStore.js's own
// STORAGE_KEY constant.
(function () {
const STORAGE_KEY = 'eventconnect3:registrations:v2';

function generateId() {
  return `reg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function validate(data) {
  const errors = [];
  if (!data.eventId) errors.push('Event ID is required.');
  if (!data.name || data.name.trim().length === 0) errors.push('Full name is required.');
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('A valid email address is required.');
  }
  return { valid: errors.length === 0, errors };
}

/**
 * Client-only replacement for the registrations JSON file +
 * RegistrationController.js. Same validation / duplicate-check /
 * sold-out-check rules, persisted to localStorage.
 */
EC.RegistrationStore = class RegistrationStore {
  constructor(eventStore) {
    this.eventStore = eventStore;
    this._regs = this._load();
  }

  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  _persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._regs));
    } catch { /* localStorage unavailable — fail silently */ }
  }

  getAll() {
    return this._regs.map(r => ({ ...r }));
  }

  /** The registration held for this event, or null. Single-user prototype:
   *  there is no sign-in, so any stored registration is "yours". Lets the
   *  listing and detail pages show registered state instead of making the
   *  user remember which events they already signed up for. */
  getForEvent(eventId) {
    const reg = this._regs.find(r => r.eventId === eventId);
    return reg ? { ...reg } : null;
  }

  /** Look up one registration — lets the confirmation page rebuild itself
   *  from storage after a reload instead of relying on in-memory state. */
  getById(id) {
    const reg = this._regs.find(r => r.id === id);
    return reg ? { ...reg } : null;
  }

  /**
   * True if this email already holds a registration for this event
   * (case-insensitive). Public so the registration form can warn at the
   * point the email is entered instead of only at final submit.
   */
  isDuplicate(eventId, email) {
    if (!email) return false;
    const needle = String(email).toLowerCase();
    return this._regs.some(r => r.eventId === eventId && r.email.toLowerCase() === needle);
  }

  create(data) {
    const reg = {
      id: generateId(),
      eventId: data.eventId,
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      dietaryRestrictions: Array.isArray(data.dietaryRestrictions) ? data.dietaryRestrictions : [],
      accessibilityNeeds: data.accessibilityNeeds || '',
      parkingNeeded: data.parkingNeeded || 'no',
      createdAt: new Date().toISOString(),
    };

    // Each failure carries a `code` so the form can show a message and a
    // recovery action that actually fit the problem.
    const { valid, errors } = validate(reg);
    if (!valid) return { success: false, code: 'invalid', errors };

    const event = this.eventStore.getById(reg.eventId);
    if (!event) return { success: false, code: 'not-found', errors: ['Event not found.'] };
    if (event.status === 'soldout') return { success: false, code: 'soldout', errors: ['This event is sold out.'] };

    if (this.isDuplicate(reg.eventId, reg.email)) {
      return { success: false, code: 'duplicate', errors: ['You are already registered for this event.'] };
    }

    this._regs.push(reg);
    this._persist();
    this.eventStore.updateCapacity(reg.eventId, +1);

    return { success: true, registration: { ...reg } };
  }

  delete(id) {
    const idx = this._regs.findIndex(r => r.id === id);
    if (idx === -1) return { success: false, errors: ['Registration not found.'] };

    const [reg] = this._regs.splice(idx, 1);
    this._persist();
    this.eventStore.updateCapacity(reg.eventId, -1);

    return { success: true };
  }
};
})();
