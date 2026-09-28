class HyroxProductSlider extends HTMLElement {
  connectedCallback() {
    this.scroller = this.querySelector('[data-product-scroller]');
    this.previousButton = this.querySelector('[data-slider-previous]');
    this.nextButton = this.querySelector('[data-slider-next]');

    if (!this.scroller || !this.previousButton || !this.nextButton) return;

    this.previousButton.addEventListener('click', () => this.move(-1));
    this.nextButton.addEventListener('click', () => this.move(1));
    this.scroller.addEventListener('scroll', this.updateControls, { passive: true });
    window.addEventListener('resize', this.updateControls);
    this.updateControls();
  }

  disconnectedCallback() {
    this.scroller?.removeEventListener('scroll', this.updateControls);
    window.removeEventListener('resize', this.updateControls);
  }

  move(direction) {
    const card = this.scroller.querySelector('[data-slider-card]');
    if (!card) return;

    const gap = Number.parseFloat(getComputedStyle(this.scroller).columnGap) || 0;
    this.scroller.scrollBy({ left: direction * (card.getBoundingClientRect().width + gap), behavior: 'smooth' });
  }

  updateControls = () => {
    const maximum = this.scroller.scrollWidth - this.scroller.clientWidth;
    this.previousButton.disabled = this.scroller.scrollLeft <= 2;
    this.nextButton.disabled = this.scroller.scrollLeft >= maximum - 2;
  };
}

if (!customElements.get('hyrox-product-slider')) {
  customElements.define('hyrox-product-slider', HyroxProductSlider);
}
