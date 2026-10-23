EC.RegistrationModel = class RegistrationModel {
  constructor(data) {
    Object.assign(this, data);
  }

  get formattedDate() {
    const d = new Date(this.createdAt);
    return d.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit',
    });
  }

  get parkingNeededDisplay() {
    const map = { yes: 'Yes', no: 'No' };
    return map[this.parkingNeeded] || this.parkingNeeded || '—';
  }
};
