/**
 * Frequently asked questions — the app's one piece of real documentation,
 * linked from the footer. It replaces the "Privacy Policy / Terms of Use /
 * Contact" links, which pointed at href="#" and quietly dumped the user back
 * on the event listing.
 *
 * Answers are grouped so the two most-asked practical questions — what
 * happens after ticking "parking needed", and when money changes hands —
 * sit at the top.
 */
EC.FaqView = class FaqView {
  constructor(container) {
    this.container = container;
  }

  render() {
    this.container.innerHTML = `
      <main class="s1-body">
        <div class="s1-hero">
          <h1>Frequently Asked Questions</h1>
          <p>Answers to the questions we get most often about registering for events.</p>
        </div>

        <div class="about-content">
          <div class="faq-list">
            ${this._entries().map(({ q, a }) => `
              <details class="faq-item">
                <summary class="faq-question">${q}</summary>
                <div class="faq-answer">${a}</div>
              </details>`).join('')}
          </div>

          <p class="faq-footnote">
            Still stuck? Ask the event organizer named on the event's detail page —
            they answer questions about their own event directly.
          </p>
        </div>
      </main>
    `;
  }

  destroy() {}

  _entries() {
    return [
      {
        q: 'I said I need parking. What happens next?',
        a: `Nothing more to do for now. Everyone who ticked <strong>Yes, I&rsquo;ll need parking</strong>
            is added to the event&rsquo;s social media group chat, and the organizer posts
            the parking arrangements there in the week before the event — where to park,
            which entrance to use, and whether a permit is needed. Watch for the invite
            at the email address you registered with.`,
      },
      {
        q: 'When and how do I pay?',
        a: `You pay <strong>on the day, at check-in</strong> — nothing is charged when you
            register. The price shown on the event card is per person, and the full amount
            is due up front when you arrive, before the event starts. Events listed as
            <strong>Free</strong> cost nothing at any point.`,
      },
      {
        q: 'How do I register for an event?',
        a: `Open the event from the listing, choose <strong>Register Now</strong>, and complete
            the three steps: your contact information, your preferences, then a review of
            everything you entered before you submit.`,
      },
      {
        q: 'How do I know my registration went through?',
        a: `After you submit, a confirmation page shows your <strong>confirmation reference</strong>
            (for example <code>EC-4F2A9B</code>). Keep that reference — you can quote it at
            check-in. Everything you have signed up for also appears under
            <a href="#/my-registrations">My Registrations</a>.`,
      },
      {
        q: 'What do Available, Limited, and Sold Out mean?',
        a: `<strong>Available</strong> means plenty of spots remain. <strong>Limited</strong> means
            fewer than 15% of spots are left, so register soon. <strong>Sold Out</strong> means
            every spot has been taken and registration is closed — you can still open the
            event to read the details.`,
      },
      {
        q: 'Can I register more than once for the same event?',
        a: `No. Each email address can hold one registration per event. If you try to register
            again with the same address, the form will tell you and point you to the
            registration you already have. To bring someone else along, register them
            separately with their own email address.`,
      },
      {
        q: 'How do I cancel a registration?',
        a: `Go to <a href="#/my-registrations">My Registrations</a> and choose
            <strong>Cancel</strong> on the event you no longer plan to attend. Your spot is
            released straight away so someone else can take it. Since nothing is paid until
            check-in, there is no refund to process.`,
      },
      {
        q: 'Who sees my dietary restrictions and accessibility needs?',
        a: `Only the organizer of the event you registered for. They use them to plan catering
            and arrange access on the day. Leave the accessibility field blank if there is
            nothing you need — it is optional.`,
      },
      {
        q: 'What happens to the information I enter?',
        a: `EventConnect is a prototype. Your registrations are stored in your own browser on
            this device only, and are not sent to a server or shared with anyone else. Clearing
            your browser data will remove them.`,
      },
    ];
  }
};
