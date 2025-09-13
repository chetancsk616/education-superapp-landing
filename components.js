// Vanilla JS UI Components
// 1. Accessible Modal
// 2. Tabbed Content
// 3. Carousel/Slider

// MODAL COMPONENT
class Modal {
  constructor(options) {
    this.options = Object.assign({
      ariaLabel: 'Dialog',
      closeOnEsc: true,
      closeOnOverlay: true
    }, options);
    this._init();
  }
  _init() {
    this.modal = document.createElement('div');
    this.modal.className = 'modal';
    this.modal.setAttribute('role', 'dialog');
    this.modal.setAttribute('aria-modal', 'true');
    this.modal.setAttribute('aria-label', this.options.ariaLabel);
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay';
    this.overlay.tabIndex = -1;
    this.content = document.createElement('div');
    this.content.className = 'modal-content';
    this.modal.appendChild(this.content);
    document.body.appendChild(this.overlay);
    document.body.appendChild(this.modal);
    this._bindEvents();
    this.hide();
    this._outsideClickHandler = (e) => {
      if (!this.modal.contains(e.target) && this.isOpen() && this._isPopover) {
        this.hide();
      }
    };
  }
  _bindEvents() {
    this.overlay.addEventListener('click', () => {
      if (this.options.closeOnOverlay) this.hide();
    });
    document.addEventListener('keydown', (e) => {
      if (this.options.closeOnEsc && e.key === 'Escape' && this.isOpen()) {
        this.hide();
      }
    });
  }
  // show content. options: { positionTarget: HTMLElement }
  show(html, opts = {}) {
    this.content.innerHTML = html;
    const posTarget = opts.positionTarget || null;
    if (posTarget) {
      // Popover mode: position the modal directly under the target
      this._isPopover = true;
      this.overlay.style.display = 'none';
      this.modal.classList.add('modal-popover');
      this.modal.style.position = 'absolute';
  // set a fallback/popover width so we can position reliably without measuring
  const popWidth = (opts.popWidth && Number(opts.popWidth)) ? Number(opts.popWidth) : 280;
  this.modal.style.width = popWidth + 'px';
  this.modal.style.display = 'block';
  // ensure target is visible and compute position relative to target
  try { posTarget.scrollIntoView({block: 'nearest', inline: 'nearest'}); } catch(e) {}
  const rect = posTarget.getBoundingClientRect();
  const scrollY = window.scrollY || window.pageYOffset;
  const top = rect.bottom + scrollY + 8; // 8px gap
  let calcLeft = Math.round(rect.left + (rect.width / 2) - (popWidth / 2));
  if (calcLeft < 8) calcLeft = 8;
  if (calcLeft + popWidth > window.innerWidth - 8) calcLeft = window.innerWidth - popWidth - 8;
  this.modal.style.top = top + 'px';
  this.modal.style.left = calcLeft + 'px';
  this.modal.style.visibility = 'visible';
  this.modal.style.zIndex = 1400;
  this.modal.style.pointerEvents = 'auto';
  // attach outside click listener after this call stack so the opening click doesn't close it
  setTimeout(() => document.addEventListener('click', this._outsideClickHandler), 0);
    } else {
      this._isPopover = false;
      this.overlay.style.display = 'block';
      this.modal.classList.remove('modal-popover');
      this.modal.style.position = '';
      this.modal.style.left = '';
      this.modal.style.top = '';
      this.modal.style.display = 'block';
    }
    this._trapFocus();
  }
  hide() {
    this.overlay.style.display = 'none';
    this.modal.style.display = 'none';
    if (this._isPopover) {
      document.removeEventListener('click', this._outsideClickHandler);
      this._isPopover = false;
    }
  }
  isOpen() {
    return this.modal.style.display === 'block';
  }
  _trapFocus() {
    const focusable = Array.from(this.modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'));
    if (focusable.length) focusable[0].focus();
    const keyHandler = (e) => {
      if (e.key === 'Tab') {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };
    // remove previous handler if any
    if (this._keyHandler) document.removeEventListener('keydown', this._keyHandler);
    this._keyHandler = keyHandler;
    document.addEventListener('keydown', this._keyHandler);
  }
}

// TABS COMPONENT
class Tabs {
  constructor(options) {
    this.options = Object.assign({
      container: null,
      tablistSelector: '.tablist',
      tabSelector: '.tab',
      panelSelector: '.tabpanel'
    }, options);
    this._init();
  }
  _init() {
    const root = typeof this.options.container === 'string' ? document.querySelector(this.options.container) : this.options.container;
    this.tablist = root.querySelector(this.options.tablistSelector);
    this.tabs = Array.from(root.querySelectorAll(this.options.tabSelector));
    this.panels = Array.from(root.querySelectorAll(this.options.panelSelector));
    this.tabs.forEach((tab, i) => {
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', this.panels[i].id);
      tab.setAttribute('tabindex', i === 0 ? '0' : '-1');
      tab.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      tab.addEventListener('click', () => this.activateTab(i));
      tab.addEventListener('keydown', (e) => this._onKeydown(e, i));
    });
    this.tablist.setAttribute('role', 'tablist');
    this.panels.forEach((panel, i) => {
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', this.tabs[i].id);
      panel.style.display = i === 0 ? 'block' : 'none';
    });
  }
  activateTab(idx) {
    this.tabs.forEach((tab, i) => {
      tab.setAttribute('tabindex', i === idx ? '0' : '-1');
      tab.setAttribute('aria-selected', i === idx ? 'true' : 'false');
      this.panels[i].style.display = i === idx ? 'block' : 'none';
      if (i === idx) tab.focus();
    });
  }
  _onKeydown(e, idx) {
    if (e.key === 'ArrowRight') {
      this.activateTab((idx + 1) % this.tabs.length);
      e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      this.activateTab((idx - 1 + this.tabs.length) % this.tabs.length);
      e.preventDefault();
    }
  }
}

// CAROUSEL COMPONENT
class Carousel {
  constructor(options) {
    this.options = Object.assign({
      container: null,
      slideSelector: '.slide',
      prevSelector: '.carousel-prev',
      nextSelector: '.carousel-next',
      initial: 0
    }, options);
    this._init();
  }
  _init() {
    const root = typeof this.options.container === 'string' ? document.querySelector(this.options.container) : this.options.container;
    this.slides = Array.from(root.querySelectorAll(this.options.slideSelector));
    this.prevBtn = root.querySelector(this.options.prevSelector);
    this.nextBtn = root.querySelector(this.options.nextSelector);
    this.current = this.options.initial;
    this._showSlide(this.current);
    this.prevBtn.addEventListener('click', () => this.prev());
    this.nextBtn.addEventListener('click', () => this.next());
    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.prev();
      if (e.key === 'ArrowRight') this.next();
    });
    root.addEventListener('touchstart', (e) => this._onTouchStart(e), {passive:true});
    root.addEventListener('touchend', (e) => this._onTouchEnd(e), {passive:true});
  }
  _showSlide(idx) {
    this.slides.forEach((slide, i) => {
      slide.style.display = i === idx ? 'block' : 'none';
      slide.setAttribute('aria-hidden', i === idx ? 'false' : 'true');
    });
  }
  prev() {
    this.current = (this.current - 1 + this.slides.length) % this.slides.length;
    this._showSlide(this.current);
  }
  next() {
    this.current = (this.current + 1) % this.slides.length;
    this._showSlide(this.current);
  }
  _onTouchStart(e) {
    this.touchStartX = e.changedTouches[0].screenX;
  }
  _onTouchEnd(e) {
    const dx = e.changedTouches[0].screenX - this.touchStartX;
    if (dx > 40) this.prev();
    if (dx < -40) this.next();
  }
}

// Export for tests
window.Modal = Modal;
window.Tabs = Tabs;
window.Carousel = Carousel;
