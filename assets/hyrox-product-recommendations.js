// The section renders fallback products on page load so it appears instantly.
// Shopify only fills `recommendations` when the section is requested from the
// recommendations endpoint, so fetch that in the background and swap it in
// only when Shopify actually returns recommendations.
class HyroxProductRecommendations extends HTMLElement {
  connectedCallback() {
    if (!this.dataset.url || this.loaded) return;
    this.loaded = true;

    const run = () => this.load();
    if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout: 1500 });
    else setTimeout(run, 200);
  }

  async load() {
    try {
      const response = await fetch(this.dataset.url);
      if (!response.ok) return;
      const html = new DOMParser().parseFromString(await response.text(), 'text/html');
      const fresh = html.querySelector('hyrox-product-recommendations');
      if (!fresh?.querySelector('[data-source="recommendations"]')) return;

      // Never recommend the product being viewed.
      fresh.querySelectorAll(`[data-product-id="${this.dataset.productId}"]`).forEach((card) => card.remove());
      if (fresh.querySelector('[data-slider-card]')) this.innerHTML = fresh.innerHTML;
    } catch (error) {
      console.error(error);
    }
  }
}

if (!customElements.get('hyrox-product-recommendations')) {
  customElements.define('hyrox-product-recommendations', HyroxProductRecommendations);
}
