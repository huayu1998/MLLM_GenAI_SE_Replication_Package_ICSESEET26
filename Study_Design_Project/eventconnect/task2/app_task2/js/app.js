class App {
  constructor() {
    this.eventStore        = new EC.EventStore();
    this.registrationStore = new EC.RegistrationStore(this.eventStore);
    this.router             = new EC.Router();
    this.main               = document.getElementById('main-content');
  }

  init() {
    this.router
      .addRoute('/',                    () => this._showEventList())
      .addRoute('/event/:id',           params => this._showEventDetail(params))
      .addRoute('/register/:id',        params => this._showRegister(params))
      .addRoute('/registration/:regId', params => this._showConfirmation(params))
      .addRoute('/my-registrations',    () => this._showMyRegistrations())
      .addRoute('/about',               () => this._showAbout())
      .addRoute('/faq',                 () => this._showFaq())
      .setNotFound(path => this._showNotFound(path));

    this.router.start();
  }

  _showEventList() {
    const view = new EC.EventListView(this.main, this.eventStore, this.router);
    view.render();
    return () => view.destroy();
  }

  _showEventDetail(params) {
    const view = new EC.EventDetailView(this.main, this.eventStore, this.router, Number(params.id));
    view.render();
    return () => view.destroy();
  }

  _showRegister(params) {
    const view = new EC.RegistrationFlowView(
      this.main, this.eventStore, this.registrationStore, this.router, Number(params.id)
    );
    view.render();
    return () => view.destroy();
  }

  _showConfirmation(params) {
    const view = new EC.ConfirmationView(
      this.main, this.eventStore, this.registrationStore, params.regId
    );
    view.render();
    return () => view.destroy();
  }

  _showMyRegistrations() {
    const view = new EC.MyRegistrationsView(this.main, this.eventStore, this.registrationStore);
    view.render();
    return () => view.destroy();
  }

  _showAbout() {
    const view = new EC.AboutView(this.main);
    view.render();
    return () => view.destroy();
  }

  _showFaq() {
    const view = new EC.FaqView(this.main);
    view.render();
    return () => view.destroy();
  }

  _showNotFound(path) {
    const view = new EC.NotFoundView(this.main, path);
    view.render();
    return () => view.destroy();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
