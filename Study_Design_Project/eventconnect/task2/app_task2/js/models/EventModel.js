// Single source of truth for the availability vocabulary. The event cards,
// the detail sidebar, and the About page's status guide all render from this,
// so the legend can never drift from the badges it is meant to explain.
EC.STATUS_BADGES = {
  available: {
    className: 'badge-available',
    icon: '✓',
    label: 'Available',
    help: 'Plenty of spots remaining. Register at your convenience.',
  },
  limited: {
    className: 'badge-limited',
    icon: '⚠',
    label: 'Limited',
    help: 'Fewer than 15% of spots remain. Register soon.',
  },
  soldout: {
    className: 'badge-soldout',
    icon: '✕',
    label: 'Sold Out',
    help: 'All spots have been taken. Registration is closed.',
  },
};

EC.EventModel = class EventModel {
  constructor(data) {
    Object.assign(this, data);
  }

  get isFree() {
    return this.price === 0;
  }

  get isSoldOut() {
    return this.status === 'soldout';
  }

  get spotsRemaining() {
    return Math.max(0, this.capacity.total - this.capacity.registered);
  }

  get capacityPercent() {
    return Math.min(100, Math.round((this.capacity.registered / this.capacity.total) * 100));
  }

  get priceDisplay() {
    return this.isFree ? 'Free' : `$${this.price}`;
  }

  get _badge() {
    return EC.STATUS_BADGES[this.status] || null;
  }

  get badgeClass() {
    return this._badge ? this._badge.className : `badge-${this.status}`;
  }

  /** Icon + label, e.g. "✓ Available" — what the badge chip shows. */
  get badgeText() {
    return this._badge ? `${this._badge.icon} ${this._badge.label}` : this.status;
  }

  /** Label alone, for aria-labels — the icon is decorative and reads badly aloud. */
  get statusLabel() {
    return this._badge ? this._badge.label : this.status;
  }

  get formattedDate() {
    const d = new Date(this.date + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  get shortDate() {
    const d = new Date(this.date + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }
};
