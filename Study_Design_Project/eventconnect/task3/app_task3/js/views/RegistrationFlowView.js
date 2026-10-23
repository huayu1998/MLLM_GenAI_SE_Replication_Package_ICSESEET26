// Routed registration flow page (replaces the old RegistrationFormView.js,
// which rendered into the modal body). Matches task1/task2's Screen 3
// design: a full page with a step indicator and form card, navigated to via
// /register/:id instead of opened as a modal.
EC.RegistrationFlowView = class RegistrationFlowView {
  constructor(container, eventStore, registrationStore, router, eventId, stepParam) {
    this.container         = container;
    this.eventStore        = eventStore;
    this.registrationStore = registrationStore;
    this.router            = router;
    this.eventId           = eventId;
    this.stepParam         = stepParam;   // "step-2" from /register/:id/:step
    this.formData          = {};
    this._destroyed        = false;
    this._currentStep      = 1;
  }

  render() {
    const raw = this.eventStore.getById(this.eventId);

    if (!raw) {
      this.container.innerHTML = `
        <main class="s3-body">
          <div class="empty-state">
            <div class="empty-state-icon">🔍</div>
            <h3>Event not found</h3>
            <p>It may have been removed, or the link is incorrect.</p>
            <a href="#/" class="btn btn-primary" style="margin-top:16px">Browse Events</a>
          </div>
        </main>`;
      return;
    }

    this.event = new EC.EventModel(raw);

    if (this.event.isSoldOut) {
      this.container.innerHTML = `
        <main class="s3-body">
          <div class="empty-state">
            <div class="empty-state-icon">✕</div>
            <h3>This event is sold out</h3>
            <p>Registration is closed for ${this._esc(this.event.title)}.</p>
            <a href="#/event/${this.event.id}" class="btn btn-primary" style="margin-top:16px">Back to Event</a>
          </div>
        </main>`;
      return;
    }

    // Resume an in-progress draft, so reloading on any step comes back to
    // that step with the answers already given (see _saveDraft).
    const draft = this._loadDraft();
    if (draft && draft.formData) this.formData = draft.formData;

    // The address alone decides which step is shown; the draft only carries
    // the answers. If the draft could override it, pressing Back from
    // /register/:id/step-2 to a bare /register/:id would re-render step 2 and
    // look like Back had done nothing.
    this._renderStep(this._stepFromParam(this.stepParam) || 1);
  }

  destroy() {
    this._destroyed = true;
  }

  // ── Shared shell ──────────────────────────────────────────

  _shell(bodyHtml) {
    this.container.innerHTML = `
      <main class="s3-body">
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a href="#/">Events</a>
          <span class="breadcrumb-sep" aria-hidden="true">&#8250;</span>
          <a href="#/event/${this.event.id}">${this._esc(this.event.title)}</a>
          <span class="breadcrumb-sep" aria-hidden="true">&#8250;</span>
          <span aria-current="page">Register</span>
        </nav>
        <div class="s3-inner">
          <h2 class="s3-page-heading">Register for ${this._esc(this.event.title)}</h2>
          <p class="s3-page-sub">Complete all three steps to confirm your spot. Fields marked <abbr title="required">*</abbr> are required.</p>
          ${bodyHtml}
        </div>
      </main>
    `;
  }

  /** "step-2" → 2, anything else → null. */
  _stepFromParam(param) {
    const match = /^step-([123])$/.exec(String(param || ''));
    return match ? Number(match[1]) : null;
  }

  /**
   * Move between steps by changing the address rather than swapping the DOM
   * in place. Each step becomes its own history entry, so browser Back walks
   * back through the form instead of throwing the user out of it. The router
   * rebuilds the view, and the sessionStorage draft carries the answers over.
   */
  _goToStep(n) {
    this.router.navigateTo(`/register/${this.eventId}/step-${n}`);
  }

  _renderStep(n) {
    if (this._destroyed) return;
    this._currentStep = n;
    const renderers = { 1: () => this._step1(), 2: () => this._step2(), 3: () => this._step3() };
    (renderers[n] || renderers[1])();
    this._bindAutosave();
    this._saveDraft();
  }

  // ── Step 1: Personal Info ────────────────────────────────

  _step1() {
    this._shell(`
      ${this._stepTrack(1)}
      <form class="form-card" id="reg-form-1" novalidate>
        <h3 class="form-section-heading">Your Contact Information</h3>

        <div class="form-field">
          <label for="reg-name">Name <abbr title="required" aria-label="required">*</abbr></label>
          <input id="reg-name" class="field-input" type="text" placeholder="e.g. Jane Smith"
                 autocomplete="name" required aria-required="true" maxlength="80"
                 value="${this._esc(this.formData.name || '')}" />
          <span class="field-error" id="err-name" role="alert" aria-live="assertive"></span>
        </div>

        <div class="form-field">
          <label for="reg-email">Email Address <abbr title="required" aria-label="required">*</abbr></label>
          <input id="reg-email" class="field-input" type="email" placeholder="e.g. jane@example.com"
                 autocomplete="email" required aria-required="true" maxlength="120"
                 value="${this._esc(this.formData.email || '')}" />
          <span class="field-error" id="err-email" role="alert" aria-live="assertive"></span>
        </div>

        <div class="form-field">
          <label for="reg-phone">Phone Number <span class="optional-label">(optional)</span></label>
          <input id="reg-phone" class="field-input" type="tel" placeholder="e.g. (555) 555-0100"
                 autocomplete="tel" inputmode="tel" maxlength="20"
                 pattern="[0-9()+.\\-\\s]{7,20}"
                 value="${this._esc(this.formData.phone || '')}" />
          <p class="field-hint">We&rsquo;ll only contact you about this event.</p>
          <span class="field-error" id="err-phone" role="alert" aria-live="assertive"></span>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-ghost" id="btn-cancel">Cancel</button>
          <button type="submit" class="btn btn-primary" id="btn-next-1">Next: Preferences &#8594;</button>
        </div>
      </form>
    `);

    this._on('btn-cancel', 'click', () => this._cancelFlow());

    // Check each field as it is left, rather than banking every problem up
    // until the user commits by pressing Next.
    document.getElementById('reg-email')?.addEventListener('blur', () => {
      const email = this._val('reg-email');
      if (!email) return this._clearFieldError('reg-email', 'err-email');
      if (!this._isValidEmail(email)) {
        return this._setFieldError('reg-email', 'err-email', 'Please enter a valid email address.');
      }
      // An already-used address, caught here rather than two steps later.
      if (this._isDuplicateEmail(email)) {
        return this._setFieldError('reg-email', 'err-email', this._duplicateMsg());
      }
      this._clearFieldError('reg-email', 'err-email');
    });

    document.getElementById('reg-phone')?.addEventListener('blur', () => {
      const phone = this._val('reg-phone');
      if (phone && !this._isValidPhone(phone)) {
        this._setFieldError('reg-phone', 'err-phone',
          'Use digits, spaces, and ( ) + - . only — for example (555) 555-0100.');
      } else {
        this._clearFieldError('reg-phone', 'err-phone');
      }
    });

    // Arriving back here from the duplicate-email banner: re-flag the field
    // the user was sent to fix, and restore focus if that was the intent.
    if (this._isDuplicateEmail(this.formData.email)) {
      this._setFieldError('reg-email', 'err-email', this._duplicateMsg());
    }
    const focusId = this._consumePendingFocus();
    if (focusId) {
      const el = document.getElementById(focusId);
      if (el) { el.focus(); el.select?.(); }
    }

    // Bound to the form's submit rather than the button's click, so pressing
    // Enter in any field advances the step the way every other web form does.
    this._onSubmit('reg-form-1', () => {
      const name  = this._val('reg-name');
      const email = this._val('reg-email');
      const phone = this._val('reg-phone');
      const errors = [];

      this._clearFieldError('reg-name', 'err-name');
      this._clearFieldError('reg-email', 'err-email');
      this._clearFieldError('reg-phone', 'err-phone');

      if (!name) {
        errors.push(this._setFieldError('reg-name', 'err-name', 'Name is required.'));
      }
      if (!email || !this._isValidEmail(email)) {
        errors.push(this._setFieldError('reg-email', 'err-email', 'Please enter a valid email address.'));
      } else if (this._isDuplicateEmail(email)) {
        errors.push(this._setFieldError('reg-email', 'err-email', this._duplicateMsg()));
      }
      if (phone && !this._isValidPhone(phone)) {
        errors.push(this._setFieldError('reg-phone', 'err-phone',
          'Use digits, spaces, and ( ) + - . only — for example (555) 555-0100.'));
      }

      if (this._reportStepErrors(errors)) return;

      this.formData.name  = name;
      this.formData.email = email;
      this.formData.phone = phone;
      this._goToStep(2);
    });
  }

  // ── Step 2: Preferences ──────────────────────────────────

  _step2() {
    const dietaryChecked = val => (this.formData.dietaryRestrictions || []).includes(val) ? 'checked' : '';
    const parkingChecked = val => this.formData.parkingNeeded === val ? 'checked' : '';

    this._shell(`
      ${this._stepTrack(2)}
      <form class="form-card" id="reg-form-2" novalidate>
        <h3 class="form-section-heading">Event Preferences</h3>

        <fieldset class="form-fieldset">
          <legend class="fieldset-legend">Dietary Restrictions</legend>
          <div class="checkbox-group">
            <label class="checkbox-label"><input type="checkbox" name="dietary" value="vegetarian" ${dietaryChecked('vegetarian')} /> Vegetarian</label>
            <label class="checkbox-label"><input type="checkbox" name="dietary" value="vegan" ${dietaryChecked('vegan')} /> Vegan</label>
            <label class="checkbox-label"><input type="checkbox" name="dietary" value="gluten-free" ${dietaryChecked('gluten-free')} /> Gluten-Free</label>
            <label class="checkbox-label"><input type="checkbox" name="dietary" value="nut-allergy" ${dietaryChecked('nut-allergy')} /> Nut Allergy</label>
            <label class="checkbox-label"><input type="checkbox" name="dietary" value="none" ${dietaryChecked('none')} /> None</label>
          </div>
        </fieldset>

        <div class="form-field">
          <label for="reg-accessibility">Accessibility Needs <span class="optional-label">(optional)</span></label>
          <textarea id="reg-accessibility" class="field-input field-textarea" rows="3"
                    placeholder="Let us know how we can accommodate you">${this._esc(this.formData.accessibilityNeeds || '')}</textarea>
        </div>

        <fieldset class="form-fieldset">
          <legend class="fieldset-legend">Parking Needed <abbr title="required" aria-label="required">*</abbr></legend>
          <div class="radio-group">
            <label class="radio-label"><input type="radio" id="parking-yes" name="parking" value="yes" ${parkingChecked('yes')} /> Yes, I&rsquo;ll need parking</label>
            <label class="radio-label"><input type="radio" name="parking" value="no" ${parkingChecked('no')} /> No, I won&rsquo;t need parking</label>
          </div>
          <span class="field-error" id="err-parking" role="alert" aria-live="assertive"></span>
        </fieldset>

        <div class="form-actions">
          <div class="form-actions-group">
            <button type="button" class="btn btn-ghost" id="btn-back-2">&#8592; Back</button>
            <button type="button" class="btn btn-ghost" id="btn-cancel-2">Cancel</button>
          </div>
          <button type="submit" class="btn btn-primary" id="btn-next-2">Next: Review &#8594;</button>
        </div>
      </form>
    `);

    this._on('btn-back-2', 'click', () => this._goToStep(1));
    this._on('btn-cancel-2', 'click', () => this._cancelFlow());
    this._onSubmit('reg-form-2', () => {
      const dietary = [...document.querySelectorAll('input[name="dietary"]:checked')].map(el => el.value);
      const accessibility = this._val('reg-accessibility');
      const parking = document.querySelector('input[name="parking"]:checked')?.value;

      this._showErr('err-parking', '');
      this._clearStepErrors();

      if (!parking) {
        const message = 'Please let us know if you need parking.';
        this._showErr('err-parking', message);
        this._reportStepErrors([{ fieldId: 'parking-yes', message }]);
        return;
      }

      this.formData.dietaryRestrictions = dietary;
      this.formData.accessibilityNeeds  = accessibility;
      this.formData.parkingNeeded       = parking;
      this._goToStep(3);
    });
  }

  // ── Step 3: Confirmation ─────────────────────────────────

  _step3() {
    const ev = this.event;
    const dietaryLabels = { vegetarian: 'Vegetarian', vegan: 'Vegan', 'gluten-free': 'Gluten-Free', 'nut-allergy': 'Nut Allergy', none: 'None' };
    const dietaryDisplay = (this.formData.dietaryRestrictions || []).length
      ? this.formData.dietaryRestrictions.map(v => dietaryLabels[v] || v).join(', ')
      : 'None specified';
    const parkingLabels = { yes: 'Yes', no: 'No' };
    const parkingDisplay = parkingLabels[this.formData.parkingNeeded] || '—';

    this._shell(`
      ${this._stepTrack(3)}
      <form class="form-card" id="reg-form-3" novalidate>
        <h3 class="form-section-heading">Review Your Registration</h3>
        <dl class="summary-list">
          <div class="summary-row"><dt>Event</dt><dd>${this._esc(ev.title)}</dd></div>
          <div class="summary-row"><dt>Date</dt><dd>${this._esc(ev.formattedDate)}, ${this._esc(ev.time)}</dd></div>
          <div class="summary-row"><dt>Location</dt><dd>${this._esc(ev.location)}</dd></div>
          <div class="summary-row"><dt>Name</dt><dd>${this._esc(this.formData.name)}</dd></div>
          <div class="summary-row"><dt>Email</dt><dd>${this._esc(this.formData.email)}</dd></div>
          <div class="summary-row"><dt>Phone</dt><dd>${this._esc(this.formData.phone) || '—'}</dd></div>
          <div class="summary-row"><dt>Dietary Restrictions</dt><dd>${this._esc(dietaryDisplay)}</dd></div>
          <div class="summary-row"><dt>Accessibility Needs</dt><dd>${this._esc(this.formData.accessibilityNeeds) || '—'}</dd></div>
          <div class="summary-row"><dt>Parking Needed</dt><dd>${this._esc(parkingDisplay)}</dd></div>
          <div class="summary-row"><dt>Price</dt><dd>${ev.priceDisplay}</dd></div>
        </dl>
        <p class="confirm-note">By clicking Submit you reserve your spot for this event.
          Payment is taken at check-in on the day &mdash; see the
          <a href="#/faq" class="inline-link">FAQ</a> for how payment, parking, and
          cancellations work.</p>
        <div class="form-actions">
          <div class="form-actions-group">
            <button type="button" class="btn btn-ghost" id="btn-back-3">&#8592; Back</button>
            <button type="button" class="btn btn-ghost" id="btn-cancel-3">Cancel</button>
          </div>
          <button type="submit" class="btn btn-primary" id="btn-submit">Submit Registration</button>
        </div>
      </form>
    `);

    this._on('btn-back-3', 'click', () => this._goToStep(2));
    this._on('btn-cancel-3', 'click', () => this._cancelFlow());
    this._onSubmit('reg-form-3', () => this._submit());
  }

  // ── Submit ────────────────────────────────────────────────

  _submit() {
    const btn = document.getElementById('btn-submit');
    btn.disabled = true;
    btn.textContent = 'Submitting…';
    this._clearSubmitError();

    const result = this.registrationStore.create({
      eventId:             this.event.id,
      name:                this.formData.name,
      email:               this.formData.email,
      phone:               this.formData.phone || null,
      dietaryRestrictions: this.formData.dietaryRestrictions || [],
      accessibilityNeeds:  this.formData.accessibilityNeeds || '',
      parkingNeeded:       this.formData.parkingNeeded || 'no',
    });

    if (!result.success) {
      btn.disabled = false;
      btn.textContent = 'Submit Registration';
      this._showSubmitError(result);
      return;
    }

    // The draft is spent, and the confirmation lives at its own route so it
    // survives a reload instead of dumping the user back into an empty form.
    this._clearDraft();
    this.router.navigateTo(`/registration/${result.registration.id}`);
  }

  // ── Submit errors ─────────────────────────────────────────
  //
  // Shown inline in the form card rather than through a native alert(), so
  // the message stays next to the thing that failed, matches the styling of
  // the field-level errors, and can offer a concrete way forward.

  _clearSubmitError() {
    document.getElementById('submit-error')?.remove();
  }

  _showSubmitError({ code, errors }) {
    const actions = this.container.querySelector('.form-card .form-actions');
    if (!actions) return;

    const copy = {
      duplicate: {
        heading: 'You have already registered for this event',
        body: `A registration for <strong>${this._esc(this.formData.email)}</strong> already exists for `
            + `<strong>${this._esc(this.event.title)}</strong>. You can view it under My Registrations, `
            + `or go back and register a different email address.`,
      },
      soldout: {
        heading: 'This event filled up while you were registering',
        body: 'The last spot was taken before your registration went through. Nothing has been charged or saved — browse other events to find another one.',
      },
      'not-found': {
        heading: 'This event is no longer available',
        body: 'It looks like the event was removed while you were registering. Your details were not saved.',
      },
      invalid: {
        heading: 'Some details still need fixing',
        body: this._esc(errors.join(' ')),
      },
    }[code] || {
      heading: 'We could not complete your registration',
      body: this._esc(errors.join(' ')),
    };

    const buttons = {
      duplicate: `<a href="#/my-registrations" class="btn btn-outline btn-sm">View My Registrations</a>
                  <button type="button" class="btn btn-ghost btn-sm" id="btn-fix-email">Use a different email</button>`,
      soldout:   `<a href="#/" class="btn btn-outline btn-sm">Browse other events</a>`,
      'not-found': `<a href="#/" class="btn btn-outline btn-sm">Browse other events</a>`,
      invalid:   `<button type="button" class="btn btn-outline btn-sm" id="btn-fix-details">Back to your details</button>`,
    }[code] || `<button type="button" class="btn btn-outline btn-sm" id="btn-fix-details">Back to your details</button>`;

    const banner = document.createElement('div');
    banner.id = 'submit-error';
    banner.className = 'form-error-banner';
    banner.setAttribute('role', 'alert');
    banner.innerHTML = `
      <span class="form-error-icon" aria-hidden="true">!</span>
      <div class="form-error-text">
        <strong>${copy.heading}</strong>
        <p>${copy.body}</p>
        <div class="form-error-actions">${buttons}</div>
      </div>`;

    actions.parentNode.insertBefore(banner, actions);

    // Both recovery buttons drop the user back on Step 1 with their details
    // intact; the email one also re-flags the field that caused the problem.
    this._on('btn-fix-details', 'click', () => this._goToStep(1));
    this._on('btn-fix-email', 'click', () => {
      // Step 1 is a separate address now, so the intent to focus the email
      // field has to survive the navigation; _step1 picks it up on arrival.
      this._setPendingFocus('reg-email');
      this._goToStep(1);
    });

    banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // ── Field-level errors ───────────────────────────────────

  /** Flag a field as invalid: inline message, red border, and the ARIA wiring
   *  that lets a screen reader read the message when focus lands there. */
  _setFieldError(fieldId, errId, message) {
    this._showErr(errId, message);
    const field = document.getElementById(fieldId);
    if (field) {
      field.classList.add('has-error');
      field.setAttribute('aria-invalid', 'true');
      field.setAttribute('aria-describedby', errId);
    }
    return { fieldId, message };
  }

  _clearFieldError(fieldId, errId) {
    this._showErr(errId, '');
    const field = document.getElementById(fieldId);
    if (field) {
      field.classList.remove('has-error');
      field.removeAttribute('aria-invalid');
      field.removeAttribute('aria-describedby');
    }
  }

  _clearStepErrors() {
    document.getElementById('step-error-summary')?.remove();
  }

  /**
   * On a failed step: summarise the problems at the top of the card and put
   * the cursor in the first offending field. Without this the user is left
   * on the Next button with the errors somewhere above, out of view on a
   * long form. Returns true when the step should not advance.
   */
  _reportStepErrors(errors) {
    this._clearStepErrors();
    if (!errors.length) return false;

    const heading = this.container.querySelector('.form-card .form-section-heading');
    if (heading) {
      const summary = document.createElement('div');
      summary.id = 'step-error-summary';
      summary.className = 'form-error-banner';
      summary.setAttribute('role', 'alert');
      summary.innerHTML = `
        <span class="form-error-icon" aria-hidden="true">!</span>
        <div class="form-error-text">
          <strong>${errors.length === 1
            ? 'One field needs your attention'
            : `${errors.length} fields need your attention`}</strong>
          <ul class="form-error-list">
            ${errors.map(e =>
              `<li><a href="#${e.fieldId}" data-focus="${e.fieldId}">${this._esc(e.message)}</a></li>`
            ).join('')}
          </ul>
        </div>`;
      heading.insertAdjacentElement('afterend', summary);

      summary.querySelectorAll('[data-focus]').forEach(link => {
        link.addEventListener('click', e => {
          e.preventDefault();
          document.getElementById(link.dataset.focus)?.focus();
        });
      });
    }

    document.getElementById(errors[0].fieldId)?.focus();
    return true;
  }

  // ── Draft persistence ────────────────────────────────────
  //
  // Kept in sessionStorage rather than memory so a reload part-way through
  // the form comes back to the same step with the same answers instead of an
  // empty Step 1. sessionStorage (not localStorage) means the draft belongs
  // to this tab and disappears when it closes — an abandoned half-filled form
  // shouldn't greet the next person to open the app.

  _draftKey() {
    return `eventconnect3:registration-draft:${this.eventId}`;
  }

  /** Pull whatever the visible step currently holds into formData, so a
   *  reload mid-typing keeps the characters entered since the last step. */
  _captureStepFields() {
    if (document.getElementById('reg-name')) {
      this.formData.name  = this._val('reg-name');
      this.formData.email = this._val('reg-email');
      this.formData.phone = this._val('reg-phone');
    }
    if (document.getElementById('reg-accessibility')) {
      this.formData.dietaryRestrictions =
        [...document.querySelectorAll('input[name="dietary"]:checked')].map(el => el.value);
      this.formData.accessibilityNeeds = this._val('reg-accessibility');
      const parking = document.querySelector('input[name="parking"]:checked')?.value;
      if (parking) this.formData.parkingNeeded = parking;
    }
  }

  _bindAutosave() {
    const card = this.container.querySelector('.form-card');
    if (!card) return;
    // 'input' catches typing; 'change' catches the checkboxes and radios.
    card.addEventListener('input',  () => this._saveDraft());
    card.addEventListener('change', () => this._saveDraft());
  }

  _saveDraft() {
    this._captureStepFields();
    try {
      sessionStorage.setItem(this._draftKey(), JSON.stringify({
        step: this._currentStep,
        formData: this.formData,
      }));
    } catch { /* sessionStorage unavailable — drafts just won't persist */ }
  }

  _loadDraft() {
    try {
      const raw = sessionStorage.getItem(this._draftKey());
      const draft = raw ? JSON.parse(raw) : null;
      return draft && typeof draft === 'object' ? draft : null;
    } catch {
      return null;
    }
  }

  _clearDraft() {
    try { sessionStorage.removeItem(this._draftKey()); } catch { /* nothing to clear */ }
  }

  /** Park a "focus this field on arrival" intent alongside the draft, so it
   *  survives the navigation between steps. */
  _setPendingFocus(fieldId) {
    try {
      const draft = this._loadDraft() || {};
      draft.focus = fieldId;
      sessionStorage.setItem(this._draftKey(), JSON.stringify(draft));
    } catch { /* sessionStorage unavailable — focus just won't be restored */ }
  }

  _consumePendingFocus() {
    const draft = this._loadDraft();
    if (!draft || !draft.focus) return null;
    const fieldId = draft.focus;
    delete draft.focus;
    try {
      sessionStorage.setItem(this._draftKey(), JSON.stringify(draft));
    } catch { /* best effort */ }
    return fieldId;
  }

  // ── Leaving the flow ─────────────────────────────────────

  /** Anything typed so far — either already banked into formData or sitting
   *  in a field on the step currently on screen. */
  _hasEnteredData() {
    const d = this.formData;
    const typedNow = ['reg-name', 'reg-email', 'reg-phone', 'reg-accessibility']
      .some(id => this._val(id));
    return typedNow
      || !!(d.name || d.email || d.phone || d.accessibilityNeeds || d.parkingNeeded)
      || (d.dietaryRestrictions || []).length > 0;
  }

  /**
   * The marked exit available on every step. Confirms first, but only when
   * there is actually something to lose — prompting on an untouched Step 1
   * would just be noise.
   */
  _cancelFlow() {
    const ok = !this._hasEnteredData()
      || confirm('Discard your registration details and return to the event page?');
    if (!ok) return;
    this._clearDraft();
    this.router.navigateTo(`/event/${this.event.id}`);
  }

  // ── Step indicator ───────────────────────────────────────

  _stepTrack(active) {
    const steps = [{ n: 1, l: 'Personal Info' }, { n: 2, l: 'Preferences' }, { n: 3, l: 'Confirm' }];
    const nodes = steps.map((s, i) => {
      const cls = s.n < active ? 'done' : s.n === active ? 'active' : 'pending';
      const icon = s.n < active ? '✓' : s.n;
      const conn = i < 2 ? `<div class="step-line${s.n < active ? ' done' : ''}"></div>` : '';
      const ariaPart = s.n === active ? ', current step' : s.n < active ? ', completed' : ', not yet reached';
      return `<div class="step-node ${cls}" role="listitem" aria-label="Step ${s.n}: ${s.l}${ariaPart}"${s.n === active ? ' aria-current="step"' : ''}>${icon}</div>${conn}`;
    }).join('');
    const labels = steps.map(s => `<span class="${s.n === active ? 'active-label' : ''}">${s.l}</span>`).join('');
    return `
      <div class="step-track" role="list" aria-label="Registration progress">${nodes}</div>
      <div class="step-labels" aria-hidden="true">${labels}</div>`;
  }

  // ── Helpers ───────────────────────────────────────────────

  _duplicateMsg() {
    return 'This email is already registered for this event. Use a different email address, or view the existing registration under My Registrations.';
  }

  _isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  /** Digits plus the punctuation phone numbers are normally written with. */
  _isValidPhone(value) {
    return /^[0-9()+.\-\s]{7,20}$/.test(value);
  }

  _isDuplicateEmail(email) {
    return !!email
      && this._isValidEmail(email)
      && this.registrationStore.isDuplicate(this.event.id, email);
  }

  _on(id, evt, fn) { document.getElementById(id)?.addEventListener(evt, fn); }

  /** Each step is a real <form>, so Enter submits it like any other web form.
   *  `novalidate` on the markup keeps the browser's own constraint UI out of
   *  the way — this app reports its problems through the inline field errors. */
  _onSubmit(id, fn) {
    document.getElementById(id)?.addEventListener('submit', e => {
      e.preventDefault();
      fn();
    });
  }

  _val(id) { return document.getElementById(id)?.value.trim() || ''; }
  _showErr(id, msg) { const el = document.getElementById(id); if (el) el.textContent = msg; }
  _esc(str) { const d = document.createElement('div'); d.textContent = String(str ?? ''); return d.innerHTML; }
};
