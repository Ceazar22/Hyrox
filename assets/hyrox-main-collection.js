class HyroxCollection extends HTMLElement {
  connectedCallback() {
    this.sort = this.querySelector('[data-sort]');
    this.toggle = this.querySelector('[data-filter-toggle]');
    this.panel = this.querySelector('[data-filter-panel]');

    this.sort?.addEventListener('change', this.onSort);
    this.toggle?.addEventListener('click', this.onToggle);
  }

  disconnectedCallback() {
    this.sort?.removeEventListener('change', this.onSort);
    this.toggle?.removeEventListener('click', this.onToggle);
  }

  onSort = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('sort_by', this.sort.value);
    url.searchParams.delete('page');
    window.location.assign(url.toString());
  };

  onToggle = () => {
    const open = this.toggle.getAttribute('aria-expanded') !== 'true';
    this.toggle.setAttribute('aria-expanded', String(open));
    this.panel.classList.toggle('is-open', open);
  };
}

if (!customElements.get('hyrox-collection')) {
  customElements.define('hyrox-collection', HyroxCollection);
}
