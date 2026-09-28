class HyroxProduct extends HTMLElement {
  connectedCallback() {
    this.variants = JSON.parse(this.querySelector('[data-variants]')?.textContent || '[]');
    this.track = this.querySelector('[data-track]');
    this.slides = [...this.querySelectorAll('.hyrox-product__slide')];
    this.thumbs = [...this.querySelectorAll('[data-thumb]')];
    this.counter = this.querySelector('[data-counter]');
    this.form = this.querySelector('[data-product-form]');
    this.variantInput = this.querySelector('[data-variant-id]');
    this.addButton = this.querySelector('[data-add]');
    this.addText = this.querySelector('[data-add-text]');
    this.addPrice = this.querySelector('[data-add-price]');
    this.status = this.querySelector('[data-status]');
    this.qty = this.querySelector('[data-qty]');
    this.options = [...this.querySelectorAll('[data-option]')];

    this.setupGallery();
    this.setupOptions();
    this.setupQuantity();
    this.setupTabs();
    this.setupSticky();
    this.form?.addEventListener('submit', this.onSubmit);
  }

  disconnectedCallback() {
    this.stickyObserver?.disconnect();
    document.body.classList.remove('hyrox-sticky-atc-visible');
  }

  /* Floating add to cart */
  setupSticky() {
    this.sticky = this.querySelector('[data-sticky]');
    if (!this.sticky || !this.form) return;

    this.sticky.querySelector('[data-sticky-add]').addEventListener('click', () => this.form.requestSubmit());

    // Show the bar only once the main buy row has scrolled up out of view.
    const buyRow = this.form.querySelector('.hyrox-product__buy') || this.form;
    this.stickyObserver = new IntersectionObserver(([entry]) => {
      const show = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      this.sticky.classList.toggle('is-visible', show);
      this.sticky.inert = !show;
      document.body.classList.toggle('hyrox-sticky-atc-visible', show);
    });
    this.stickyObserver.observe(buyRow);
  }

  updateSticky(variant) {
    if (!this.sticky) return;
    const set = (selector, value) => {
      const el = this.sticky.querySelector(selector);
      if (el && value != null) el.textContent = value;
    };
    set('[data-sticky-qty]', this.qty?.value || '1');
    if (!variant) return;
    set('[data-sticky-variant]', variant.title);
    set('[data-sticky-meta-price]', variant.price);
    const image = this.sticky.querySelector('[data-sticky-image]');
    if (image && variant.image) image.src = variant.image;
  }

  /* Gallery */
  setupGallery() {
    if (!this.track) return;
    this.querySelector('[data-prev]')?.addEventListener('click', () => this.goTo(this.index - 1));
    this.querySelector('[data-next]')?.addEventListener('click', () => this.goTo(this.index + 1));
    this.thumbs.forEach((thumb) => thumb.addEventListener('click', () => this.goTo(Number(thumb.dataset.thumb))));
    this.track.addEventListener('scroll', this.onScroll, { passive: true });
    this.track.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') this.goTo(this.index - 1);
      if (event.key === 'ArrowRight') this.goTo(this.index + 1);
    });
    this.index = 0;
  }

  goTo(index, behavior = 'smooth') {
    if (!this.slides.length) return;
    const count = this.slides.length;
    const next = (index + count) % count;
    this.track.scrollTo({ left: next * this.track.clientWidth, behavior });
    this.setIndex(next);
  }

  onScroll = () => {
    const index = Math.round(this.track.scrollLeft / this.track.clientWidth);
    if (index !== this.index) this.setIndex(index);
  };

  setIndex(index) {
    this.index = index;
    if (this.counter) this.counter.textContent = String(index + 1);
    this.thumbs.forEach((thumb, i) => {
      if (i === index) {
        thumb.setAttribute('aria-current', 'true');
        // Keep the active thumb visible by scrolling only the thumb strip, never the page.
        const list = thumb.closest('ul');
        const item = thumb.parentElement;
        list.scrollTo({
          left: item.offsetLeft - (list.clientWidth - item.offsetWidth) / 2,
          top: item.offsetTop - (list.clientHeight - item.offsetHeight) / 2,
          behavior: 'smooth',
        });
      } else {
        thumb.removeAttribute('aria-current');
      }
    });
  }

  /* Variants */
  setupOptions() {
    this.options.forEach((group) => group.addEventListener('change', this.onOptionChange));
  }

  selectedOptions() {
    return this.options.map((group) => group.querySelector('input:checked')?.value);
  }

  findVariant(options) {
    return this.variants.find((variant) => variant.options.every((value, i) => value === options[i]));
  }

  onOptionChange = () => {
    const selected = this.selectedOptions();
    const variant = this.findVariant(selected);

    // Refresh each tile's price and availability against the rest of the selection.
    this.options.forEach((group, position) => {
      group.querySelector('[data-option-selected]').textContent = selected[position];
      group.querySelectorAll('input').forEach((input) => {
        const candidate = [...selected];
        candidate[position] = input.value;
        const match = this.findVariant(candidate);
        const tile = input.closest('.hyrox-product__value');
        tile.classList.toggle('is-unavailable', !match?.available);
        tile.querySelector('[data-value-price]').textContent = match ? match.price : '';
      });
    });

    if (!variant) {
      this.setButton(false, 'Unavailable', '');
      return;
    }

    this.variantInput.value = variant.id;
    this.updateSticky(variant);
    this.setButton(variant.available, variant.available ? 'Add to Cart' : 'Sold out', variant.price);

    const url = new URL(window.location.href);
    url.searchParams.set('variant', variant.id);
    window.history.replaceState({}, '', url.toString());

    if (variant.media) {
      const slide = this.slides.findIndex((s) => s.dataset.mediaId === String(variant.media));
      if (slide >= 0) this.goTo(slide);
    }
  };

  setButton(enabled, text, price) {
    this.addButton.disabled = !enabled;
    this.addText.textContent = text;
    this.addPrice.textContent = price;

    const stickyButton = this.sticky?.querySelector('[data-sticky-add]');
    if (stickyButton) {
      stickyButton.disabled = !enabled;
      stickyButton.querySelector('[data-sticky-text]').textContent = text;
      stickyButton.querySelector('[data-sticky-price]').textContent = price;
    }
  }

  /* Quantity */
  setupQuantity() {
    if (!this.qty) return;
    const step = (delta) => {
      const value = Math.max(1, (Number.parseInt(this.qty.value, 10) || 1) + delta);
      this.qty.value = String(value);
      this.updateSticky();
    };
    this.qty.addEventListener('change', () => this.updateSticky());
    this.querySelector('[data-qty-minus]')?.addEventListener('click', () => step(-1));
    this.querySelector('[data-qty-plus]')?.addEventListener('click', () => step(1));
  }

  /* Tabs */
  setupTabs() {
    this.tabs = [...this.querySelectorAll('[role="tab"]')];
    this.tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => this.selectTab(i));
      tab.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowRight') this.selectTab((i + 1) % this.tabs.length, true);
        if (event.key === 'ArrowLeft') this.selectTab((i - 1 + this.tabs.length) % this.tabs.length, true);
      });
    });
  }

  selectTab(index, focus = false) {
    this.tabs.forEach((tab, i) => {
      const active = i === index;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !active;
      if (active && focus) tab.focus();
    });
  }

  /* Add to cart */
  onSubmit = async (event) => {
    event.preventDefault();
    if (this.addButton.disabled) return;

    const root = window.Shopify?.routes?.root || '/';
    const label = this.addText.textContent;
    const stickyButton = this.sticky?.querySelector('[data-sticky-add]');
    const stickyText = stickyButton?.querySelector('[data-sticky-text]');
    this.addButton.disabled = true;
    this.addButton.setAttribute('aria-busy', 'true');
    stickyButton?.setAttribute('aria-busy', 'true');
    if (stickyButton) stickyButton.disabled = true;
    this.status.textContent = '';
    this.status.classList.remove('is-error');

    try {
      const response = await fetch(`${root}cart/add.js`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(this.form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.description || data.message || 'Could not add to cart.');

      const cart = await fetch(`${root}cart.js`).then((res) => res.json());
      document.querySelectorAll('.hyrox-header__cart span').forEach((el) => {
        el.textContent = el.textContent.replace(/\(\d+\)/, `(${cart.item_count})`);
      });

      this.addText.textContent = 'Added';
      if (stickyText) stickyText.textContent = 'Added';
      this.status.innerHTML = `Added to cart. <a href="${root}cart">View cart</a>`;
      setTimeout(() => {
        this.addText.textContent = label;
        if (stickyText) stickyText.textContent = label;
      }, 2000);
    } catch (error) {
      this.status.textContent = error.message;
      this.status.classList.add('is-error');
    } finally {
      this.addButton.disabled = false;
      this.addButton.removeAttribute('aria-busy');
      if (stickyButton) stickyButton.disabled = false;
      stickyButton?.removeAttribute('aria-busy');
    }
  };
}

if (!customElements.get('hyrox-product')) {
  customElements.define('hyrox-product', HyroxProduct);
}
