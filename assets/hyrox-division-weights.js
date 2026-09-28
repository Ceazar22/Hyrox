class HyroxDivisionWeights extends HTMLElement {
  connectedCallback() {
    this.tabs = Array.from(this.querySelectorAll('[data-division-tab]'));
    this.panels = Array.from(this.querySelectorAll('[data-division-panel]'));
    this.addEventListener('click', this.handleClick);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.handleClick);
  }

  handleClick = (event) => {
    const tab = event.target.closest('[data-division-tab]');
    if (!tab || !this.contains(tab)) return;
    this.showDivision(tab.dataset.divisionTab);
  };

  showDivision(id) {
    this.panels.forEach((panel) => {
      const active = panel.dataset.divisionPanel === id;
      panel.hidden = !active;
      panel.classList.toggle('is-active', active);
    });

    this.tabs.forEach((tab) => {
      const active = tab.dataset.divisionTab === id;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }
}

if (!customElements.get('hyrox-division-weights')) {
  customElements.define('hyrox-division-weights', HyroxDivisionWeights);
}
