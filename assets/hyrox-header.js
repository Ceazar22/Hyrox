class HyroxAnnouncementSlider extends HTMLElement {
  connectedCallback() {
    this.slides = Array.from(this.querySelectorAll('[data-announcement-slide]'));
    this.delay = Math.max(Number(this.dataset.delay) || 5, 2) * 1000;
    this.index = Math.max(this.slides.findIndex((slide) => slide.classList.contains('is-active')), 0);

    if (this.slides.length < 2 || this.dataset.autoplay !== 'true') return;

    this.addEventListener('mouseenter', () => this.stop());
    this.addEventListener('mouseleave', () => this.start());
    this.addEventListener('focusin', () => this.stop());
    this.addEventListener('focusout', () => this.start());
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    this.start();
  }

  disconnectedCallback() {
    this.stop();
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }

  handleVisibilityChange = () => {
    if (document.hidden) this.stop();
    else this.start();
  };

  start() {
    if (this.timer || this.slides.length < 2) return;
    this.timer = window.setInterval(() => this.show(this.index + 1), this.delay);
  }

  stop() {
    window.clearInterval(this.timer);
    this.timer = undefined;
  }

  show(nextIndex) {
    const next = nextIndex % this.slides.length;
    this.slides[this.index].classList.remove('is-active');
    this.slides[this.index].setAttribute('aria-hidden', 'true');
    this.slides[next].classList.add('is-active');
    this.slides[next].setAttribute('aria-hidden', 'false');
    this.index = next;
  }
}

if (!customElements.get('hyrox-announcement-slider')) {
  customElements.define('hyrox-announcement-slider', HyroxAnnouncementSlider);
}
