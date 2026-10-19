/**
 * PAK AIR GUNS - Core Application Logic
 * Pure vanilla JavaScript with zero dependencies
 */

(function() {
  'use strict';

  // ---------------- Cart State Management (with safe localStorage) ----------------
  const CART_STORAGE_KEY = "pak_air_guns_cart";

  function getCart() {
    try {
      const data = localStorage.getItem(CART_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn("Storage access restricted or unavailable:", e);
      return window.__memoryCart || [];
    }
  }

  function saveCart(cart) {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn("Storage save failed; fallback to session memory:", e);
      window.__memoryCart = cart;
    }
    updateCartCountBadge();
  }

  function getCartItemCount() {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.quantity || 1), 0);
  }

  function addToCart(productId, quantity = 1) {
    const product = getProductById(productId);
    if (!product) {
      console.error("Product not found:", productId);
      return;
    }

    const cart = getCart();
    const existingIndex = cart.findIndex(item => item.id === productId);

    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({ id: productId, quantity: quantity });
    }

    saveCart(cart);
    showToast(`Added to cart: ${product.name}`);
  }

  function updateCartQuantity(productId, delta) {
    let cart = getCart();
    const itemIndex = cart.findIndex(item => item.id === productId);

    if (itemIndex > -1) {
      cart[itemIndex].quantity += delta;
      if (cart[itemIndex].quantity <= 0) {
        cart.splice(itemIndex, 1);
      }
      saveCart(cart);
      if (typeof window.renderCartPage === 'function') {
        window.renderCartPage();
      }
      if (typeof window.renderCheckoutSummary === 'function') {
        window.renderCheckoutSummary();
      }
    }
  }

  function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    if (typeof window.renderCartPage === 'function') {
      window.renderCartPage();
    }
    if (typeof window.renderCheckoutSummary === 'function') {
      window.renderCheckoutSummary();
    }
    showToast("Item removed from cart");
  }

  function clearCart() {
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (e) {
      console.warn("Could not clear localStorage:", e);
    }
    window.__memoryCart = [];
    updateCartCountBadge();
  }

  function calculateCartTotals() {
    const cart = getCart();
    let subtotal = 0;
    let totalItems = 0;
    const itemsDetailed = [];

    cart.forEach(item => {
      const product = getProductById(item.id);
      if (product) {
        const itemPrice = typeof product.price === 'number' ? product.price : 0;
        const lineTotal = itemPrice * item.quantity;
        subtotal += lineTotal;
        totalItems += item.quantity;
        itemsDetailed.push({
          ...product,
          quantity: item.quantity,
          lineTotal: lineTotal
        });
      }
    });

    const delivery = totalItems > 0 ? DELIVERY_CHARGES : 0;
    const grandTotal = subtotal + delivery;

    return {
      subtotal,
      delivery,
      grandTotal,
      totalItems,
      items: itemsDetailed
    };
  }

  function updateCartCountBadge() {
    const badges = document.querySelectorAll('.cart-badge');
    const count = getCartItemCount();
    badges.forEach(badge => {
      badge.textContent = count;
      badge.setAttribute('aria-label', `${count} items in cart`);
    });
  }

  // ---------------- UI Toast System ----------------
  function showToast(message) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <div class="toast-icon">✓</div>
      <span>${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'toastOut 0.3s forwards';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 2800);
  }

  function escapeHtml(text) {
    if (!text) return '';
    return text.toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // ---------------- Shared Header & Footer Rendering ----------------
  function renderHeader() {
    const headerEl = document.getElementById('site-header');
    if (!headerEl) return;

    // Detect current page filename
    const currentPath = window.location.pathname;
    let pageName = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html';
    if (!pageName.endsWith('.html') && pageName !== '') {
      pageName += '.html';
    }

    const isHome = pageName === '' || pageName === 'index.html';
    const isAirGuns = pageName === 'air-guns.html';
    const isScopes = pageName === 'scopes-accessories.html';
    const isContact = pageName === 'contact.html';

    headerEl.className = 'site-header';
    headerEl.innerHTML = `
      <div class="header-container">
        <a href="index.html" class="brand-logo" aria-label="PAK AIR GUNS Homepage">
          <div class="brand-crest" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22">
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8" fill="none"/>
              <line x1="12" y1="2" x2="12" y2="7" stroke="currentColor" stroke-width="1.8"/>
              <line x1="12" y1="17" x2="12" y2="22" stroke="currentColor" stroke-width="1.8"/>
              <line x1="2" y1="12" x2="7" y2="12" stroke="currentColor" stroke-width="1.8"/>
              <line x1="17" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="1.8"/>
              <circle cx="12" cy="12" r="2.5" fill="currentColor"/>
            </svg>
          </div>
          <div class="brand-text-block">
            <span class="brand-name">PAK <span>AIR GUNS</span></span>
            <span class="brand-tag">Lahore • Main Wagah Road</span>
          </div>
        </a>

        <nav class="main-nav" aria-label="Main Navigation">
          <a href="index.html" class="nav-link ${isHome ? 'active' : ''}">Home</a>
          <a href="air-guns.html" class="nav-link ${isAirGuns ? 'active' : ''}">Air Guns</a>
          <a href="scopes-accessories.html" class="nav-link ${isScopes ? 'active' : ''}">Scopes & Accessories</a>
          <a href="contact.html" class="nav-link ${isContact ? 'active' : ''}">Contact Us</a>
        </nav>

        <div class="header-actions">
          <a href="cart.html" class="cart-btn" aria-label="View Shopping Cart">
            <span class="cart-icon-wrap" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            </span>
            <span class="cart-label">Cart</span>
            <span class="cart-badge" id="cart-count">0</span>
          </a>

          <button class="mobile-toggle" id="mobile-toggle" aria-label="Open mobile navigation menu" aria-expanded="false">
            <svg viewBox="0 0 24 24" width="26" height="26" stroke="currentColor" stroke-width="2" fill="none">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Navigation Drawer -->
      <div class="mobile-nav-drawer" id="mobile-drawer" aria-hidden="true">
        <div class="mobile-nav-links">
          <a href="index.html" class="nav-link ${isHome ? 'active' : ''}">Home</a>
          <a href="air-guns.html" class="nav-link ${isAirGuns ? 'active' : ''}">Air Guns</a>
          <a href="scopes-accessories.html" class="nav-link ${isScopes ? 'active' : ''}">Scopes & Accessories</a>
          <a href="contact.html" class="nav-link ${isContact ? 'active' : ''}">Contact Us</a>
          <a href="cart.html" class="nav-link">Shopping Cart (<span class="cart-badge" style="display:inline-flex;">0</span>)</a>
        </div>
        <div class="mobile-drawer-contact">
          <p><strong>Shop # 16, Main Wagah Road, Lahore</strong></p>
          <p style="margin-top:6px;">WhatsApp: <a href="https://wa.me/${WHATSAPP_NUMBER}" class="gold-link">+92 310 2157098</a></p>
        </div>
      </div>
    `;

    // Mobile nav toggle events
    const toggleBtn = document.getElementById('mobile-toggle');
    const drawer = document.getElementById('mobile-drawer');

    if (toggleBtn && drawer) {
      toggleBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        const isOpen = drawer.classList.toggle('open');
        toggleBtn.setAttribute('aria-expanded', isOpen);
        drawer.setAttribute('aria-hidden', !isOpen);
        if (isOpen) {
          toggleBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="26" height="26" stroke="currentColor" stroke-width="2" fill="none">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          `;
        } else {
          toggleBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="26" height="26" stroke="currentColor" stroke-width="2" fill="none">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          `;
        }
      });

      // Close when clicking outside
      document.addEventListener('click', function(e) {
        if (drawer.classList.contains('open') && !drawer.contains(e.target) && !toggleBtn.contains(e.target)) {
          drawer.classList.remove('open');
          toggleBtn.setAttribute('aria-expanded', 'false');
          drawer.setAttribute('aria-hidden', 'true');
          toggleBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="26" height="26" stroke="currentColor" stroke-width="2" fill="none">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          `;
        }
      });

      // Close drawer when clicking any link
      drawer.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function() {
          drawer.classList.remove('open');
          toggleBtn.setAttribute('aria-expanded', 'false');
          drawer.setAttribute('aria-hidden', 'true');
          toggleBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="26" height="26" stroke="currentColor" stroke-width="2" fill="none">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          `;
        });
      });
    }

    // Header scroll background effect
    window.addEventListener('scroll', function() {
      if (window.scrollY > 30) {
        headerEl.classList.add('scrolled');
      } else {
        headerEl.classList.remove('scrolled');
      }
    }, { passive: true });

    updateCartCountBadge();
  }

  function renderFooter() {
    const footerEl = document.getElementById('site-footer');
    if (!footerEl) return;

    footerEl.className = 'site-footer';
    footerEl.innerHTML = `
      <div class="container">
        <div class="footer-grid">
          <!-- Column 1: Shop Brand & Quick Links -->
          <div class="footer-col">
            <h3>PAK AIR GUNS</h3>
            <p class="footer-desc">
              Pakistan's trusted destination for high-power air rifles, optical scopes, heavy-duty gun slips, and hunting accessories. Engineered for marksmanship, precision, and endurance.
            </p>
            <ul class="footer-nav-list">
              <li><a href="index.html" class="footer-nav-link"><span>›</span> Home</a></li>
              <li><a href="air-guns.html" class="footer-nav-link"><span>›</span> Air Guns Collection</a></li>
              <li><a href="scopes-accessories.html" class="footer-nav-link"><span>›</span> Scopes & Accessories</a></li>
              <li><a href="cart.html" class="footer-nav-link"><span>›</span> View Cart</a></li>
              <li><a href="contact.html" class="footer-nav-link"><span>›</span> Contact & Location</a></li>
            </ul>
          </div>

          <!-- Column 2: Delivery & Customer Trust -->
          <div class="footer-col">
            <h3>Delivery & Trust</h3>
            <div class="footer-policy-item">
              <span>🚚</span>
              <div>
                <strong>Delivery all over Pakistan: Rs 1,500.</strong>
                <p style="margin-top:4px; font-size:0.85rem; color:var(--text-muted);">Fast, safe courier delivery across all cities and towns.</p>
              </div>
            </div>
            <div class="footer-policy-item">
              <span>📦</span>
              <div>
                <strong>Open the parcel first, then pay.</strong>
                <p style="margin-top:4px; font-size:0.85rem; color:var(--text-muted);">Inspect your parcel upon delivery before paying the remaining amount.</p>
              </div>
            </div>
          </div>

          <!-- Column 3: Store & WhatsApp -->
          <div class="footer-col">
            <h3>Visit Our Shop</h3>
            <p style="color:var(--text-secondary); font-size:0.92rem; line-height:1.6; margin-bottom:12px;">
              📍 <strong>Shop # 16, Main Wagah Road</strong><br>
              Lahore, Punjab, Pakistan
            </p>
            <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:16px;">
              Open 7 Days a week &bull; Orders & Inquiries via WhatsApp
            </p>
            <a href="https://wa.me/${WHATSAPP_NUMBER}" target="_blank" rel="noopener noreferrer" class="btn btn-outline-gold btn-sm">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.276-.1-.476-.15-.676.15s-.777.98-.953 1.18c-.175.2-.351.226-.652.075s-1.27-.468-2.42-1.493c-.894-.799-1.498-1.787-1.674-2.088-.175-.3-.019-.462.132-.612.136-.135.301-.351.451-.527.151-.175.2-.301.301-.501.1-.2.05-.376-.025-.526-.075-.15-.676-1.63-.927-2.232-.244-.588-.492-.508-.676-.517l-.576-.01c-.2 0-.526.075-.802.376s-1.053 1.028-1.053 2.508 1.078 2.909 1.228 3.11c.151.2 2.122 3.24 5.142 4.544.718.31 1.279.496 1.716.634.721.23 1.378.198 1.897.12.578-.088 1.78-.727 2.03-1.43.25-.702.25-1.304.175-1.43-.075-.125-.276-.2-.576-.35z"/>
              </svg>
              WhatsApp: +92 310 2157098
            </a>
          </div>
        </div>

        <!-- Footer Bottom Credit -->
        <div class="footer-bottom">
          <p class="footer-copyright">
            &copy; ${new Date().getFullYear()} PAK AIR GUNS. All rights reserved. Shop # 16, Main Wagah Road, Lahore.
          </p>
          <div class="developer-credit">
            Developed by <span>Aayan Khan</span>
          </div>
        </div>
      </div>
    `;
  }

  // ---------------- Product Card Component ----------------
  function renderProductCard(product, isHeroItem = false) {
    const categoryLabels = {
      gun: "Air Rifle",
      scope: "Precision Scope",
      cover: "Gun Slip / Cover",
      accessory: "Hunting Gear & Pellets"
    };
    const catLabel = categoryLabels[product.category] || "Air Gun Accessory";

    return `
      <article class="product-card" data-id="${product.id}" data-category="${product.category}">
        <!-- 4/3 Aspect Ratio Container with Soft Light Warm Backdrop & Vignette -->
        <div class="product-img-box">
          <img 
            src="${product.image}" 
            alt="${escapeHtml(product.name)}" 
            width="400" 
            height="300"
            loading="${isHeroItem ? 'eager' : 'lazy'}" 
            decoding="async" 
            ${isHeroItem ? 'fetchpriority="high"' : ''}
            class="product-img"
          />
          <!-- Price Badge on top of image (bottom-left) -->
          <div class="product-price-badge">${formatPrice(product.price)}</div>
        </div>

        <div class="product-info">
          <span class="product-category-tag">${escapeHtml(catLabel)}</span>
          <h3 class="product-title">${escapeHtml(product.name)}</h3>
          <p class="product-desc">${escapeHtml(product.description)}</p>
          <div class="product-actions">
            <button class="btn btn-gold btn-add-cart" onclick="window.addToCart('${product.id}')" aria-label="Add ${escapeHtml(product.name)} to cart">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              Add to Cart
            </button>
          </div>
        </div>
      </article>
    `;
  }

  // ---------------- Product Card Slide-In Animation System ----------------
  function initCardSlideAnimations() {
    const cards = Array.from(document.querySelectorAll('.product-card'));
    if (!cards.length) return;

    // Accessibility check: prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      cards.forEach(card => card.classList.add('animate-in'));
      return;
    }

    // Assign alternating slide directions and stagger delays
    cards.forEach((card, index) => {
      // 0-indexed: index 0 (1st card, odd) slides from left; index 1 (2nd card, even) slides from right
      if (index % 2 === 0) {
        card.classList.add('slide-left');
      } else {
        card.classList.add('slide-right');
      }
      // Stagger neighbouring cards by 70ms
      const stagger = index % 4;
      card.style.transitionDelay = `${stagger * 70}ms`;
    });

    // IntersectionObserver to animate cards as they enter view
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          obs.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '40px 0px -20px 0px',
      threshold: 0.05
    });

    cards.forEach(card => observer.observe(card));

    // Safety fallback: reveal all remaining cards after 3 seconds
    setTimeout(() => {
      cards.forEach(card => {
        if (!card.classList.contains('animate-in')) {
          card.classList.add('animate-in');
        }
      });
    }, 3000);
  }

  // ---------------- Page Initializers ----------------

  // 1. Home Page Init
  function initHomePage() {
    const gunsContainer = document.getElementById('home-guns-grid');
    const scopesContainer = document.getElementById('home-scopes-grid');
    const coversContainer = document.getElementById('home-covers-grid');

    if (gunsContainer) {
      const guns = getProductsByCategory('gun');
      gunsContainer.innerHTML = guns.map((p, idx) => renderProductCard(p, idx === 0)).join('');
    }

    if (scopesContainer) {
      const scopes = getProductsByCategory('scope');
      scopesContainer.innerHTML = scopes.map(p => renderProductCard(p, false)).join('');
    }

    if (coversContainer) {
      const covers = getProductsByCategory('cover');
      coversContainer.innerHTML = covers.map(p => renderProductCard(p, false)).join('');
    }

    initCardSlideAnimations();
  }

  // 2. Air Guns Page Init
  function initAirGunsPage() {
    const gunsContainer = document.getElementById('air-guns-grid');
    if (gunsContainer) {
      const guns = getProductsByCategory('gun');
      gunsContainer.innerHTML = guns.map((p, idx) => renderProductCard(p, idx === 0)).join('');
      const countEl = document.getElementById('air-guns-count');
      if (countEl) countEl.textContent = `${guns.length} Models Available`;
    }

    initCardSlideAnimations();
  }

  // 3. Scopes & Accessories Page Init
  function initScopesAccessoriesPage() {
    const scopesContainer = document.getElementById('scopes-grid');
    const coversContainer = document.getElementById('covers-grid');
    const accessoriesContainer = document.getElementById('accessories-grid');

    if (scopesContainer) {
      const scopes = getProductsByCategory('scope');
      scopesContainer.innerHTML = scopes.map(p => renderProductCard(p, false)).join('');
    }

    if (coversContainer) {
      const covers = getProductsByCategory('cover');
      coversContainer.innerHTML = covers.map(p => renderProductCard(p, false)).join('');
    }

    if (accessoriesContainer) {
      const accessories = getProductsByCategory('accessory');
      accessoriesContainer.innerHTML = accessories.map(p => renderProductCard(p, false)).join('');
    }

    initCardSlideAnimations();
  }

  // 4. Cart Page Init
  function initCartPage() {
    window.renderCartPage = function() {
      const cartContainer = document.getElementById('cart-view-container');
      if (!cartContainer) return;

      const { subtotal, delivery, grandTotal, totalItems, items } = calculateCartTotals();

      if (items.length === 0) {
        cartContainer.innerHTML = `
          <div class="empty-cart-view">
            <div class="empty-cart-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            </div>
            <h2>Your Shopping Cart is Empty</h2>
            <p>Explore our premium air rifles, scopes, and tactical hunting accessories to add items to your cart.</p>
            <a href="air-guns.html" class="btn btn-gold">Explore Air Guns</a>
          </div>
        `;
        return;
      }

      let rowsHtml = items.map(item => `
        <div class="cart-row">
          <div class="cart-thumb-box">
            <img src="${item.image}" alt="${escapeHtml(item.name)}" width="80" height="60" loading="lazy">
          </div>
          <div class="cart-item-info">
            <div class="cart-item-title">${escapeHtml(item.name)}</div>
            <div class="cart-item-cat">${escapeHtml(item.category)}</div>
          </div>
          <div class="cart-item-price">
            ${item.price > 0 ? 'Rs ' + item.price.toLocaleString('en-PK') : 'Price on request'}
          </div>
          <div class="cart-qty-ctrl">
            <button class="qty-btn" onclick="window.updateCartQuantity('${item.id}', -1)" aria-label="Decrease quantity">−</button>
            <span class="qty-val">${item.quantity}</span>
            <button class="qty-btn" onclick="window.updateCartQuantity('${item.id}', 1)" aria-label="Increase quantity">+</button>
          </div>
          <button class="cart-remove-btn" onclick="window.removeFromCart('${item.id}')" aria-label="Remove ${escapeHtml(item.name)} from cart">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      `).join('');

      cartContainer.innerHTML = `
        <div class="cart-layout">
          <div class="cart-items-card">
            <h2 style="font-size:1.5rem; margin-bottom:20px;">Review Cart (${totalItems} ${totalItems === 1 ? 'item' : 'items'})</h2>
            <div class="cart-table-head">
              <span>Item</span>
              <span>Description</span>
              <span>Unit Price</span>
              <span>Quantity</span>
              <span></span>
            </div>
            <div class="cart-items-list">
              ${rowsHtml}
            </div>
          </div>

          <div class="cart-summary-card">
            <h3 class="summary-title">Order Summary</h3>
            <div class="summary-line">
              <span>Items Subtotal:</span>
              <span>Rs ${subtotal.toLocaleString('en-PK')}</span>
            </div>
            <div class="summary-line">
              <span>Delivery Charges (Pakistan):</span>
              <span>Rs ${delivery.toLocaleString('en-PK')}</span>
            </div>
            <div class="summary-line total">
              <span>Grand Total:</span>
              <span class="gold-amount">Rs ${grandTotal.toLocaleString('en-PK')}</span>
            </div>

            <div class="summary-policy-box">
              <p>🚚 <strong>Delivery all over Pakistan: Rs 1,500.</strong></p>
              <p>📦 <strong>Open the parcel first, then send the remaining payment.</strong></p>
            </div>

            <a href="checkout.html" class="btn btn-gold btn-block" style="font-size:1.05rem;">
              Proceed to Checkout &rarr;
            </a>

            <a href="air-guns.html" class="gold-link" style="display:block; text-align:center; margin-top:16px;">
              ← Continue Shopping
            </a>
          </div>
        </div>
      `;
    };

    window.renderCartPage();
  }

  // 5. Checkout Page Init
  function initCheckoutPage() {
    const summaryContainer = document.getElementById('checkout-summary-container');
    const form = document.getElementById('checkout-form');
    const layout = document.getElementById('checkout-layout-view');

    window.renderCheckoutSummary = function() {
      const { subtotal, delivery, grandTotal, totalItems, items } = calculateCartTotals();

      if (items.length === 0) {
        if (layout) {
          layout.innerHTML = `
            <div class="empty-cart-view" style="grid-column: 1 / -1;">
              <div class="empty-cart-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </div>
              <h2>Your Cart is Empty</h2>
              <p>Please add products before checking out.</p>
              <a href="air-guns.html" class="btn btn-gold">Browse Air Guns</a>
            </div>
          `;
        }
        return;
      }

      if (summaryContainer) {
        const itemsListHtml = items.map(item => `
          <div class="checkout-item-preview">
            <div class="checkout-item-info">
              <img src="${item.image}" alt="${escapeHtml(item.name)}" class="checkout-item-thumb">
              <div>
                <strong style="color:#fff; display:block;">${escapeHtml(item.name)}</strong>
                <span style="color:var(--text-muted); font-size:0.8rem;">Qty: ${item.quantity} × ${item.price > 0 ? 'Rs ' + item.price.toLocaleString('en-PK') : 'Price on request'}</span>
              </div>
            </div>
            <span style="font-weight:600; color:var(--gold-light);">
              ${item.price > 0 ? 'Rs ' + (item.price * item.quantity).toLocaleString('en-PK') : 'On request'}
            </span>
          </div>
        `).join('');

        summaryContainer.innerHTML = `
          <h3 class="summary-title">Order Overview (${totalItems} items)</h3>
          <div class="checkout-items-preview-list" style="margin-bottom:20px;">
            ${itemsListHtml}
          </div>
          <div class="summary-line">
            <span>Subtotal:</span>
            <span>Rs ${subtotal.toLocaleString('en-PK')}</span>
          </div>
          <div class="summary-line">
            <span>Delivery Charges:</span>
            <span>Rs ${delivery.toLocaleString('en-PK')}</span>
          </div>
          <div class="summary-line total">
            <span>Grand Total:</span>
            <span class="gold-amount">Rs ${grandTotal.toLocaleString('en-PK')}</span>
          </div>

          <div class="summary-policy-box">
            <p>🚚 <strong>Delivery all over Pakistan: Rs 1,500.</strong></p>
            <p>📦 <strong>Open the parcel first, then send the remaining payment.</strong></p>
          </div>
        `;
      }
    };

    window.renderCheckoutSummary();

    if (form) {
      // Inline validation helpers
      const nameInput = document.getElementById('cust-name');
      const phoneInput = document.getElementById('cust-phone');
      const addressInput = document.getElementById('cust-address');
      const cityInput = document.getElementById('cust-city');

      function validatePhone(phone) {
        // Pakistani mobile regex: 03XXXXXXXXX or +923XXXXXXXXX or 923XXXXXXXXX (11 digits local, 12-13 with prefix)
        const cleaned = phone.replace(/[\s\-]/g, '');
        return /^(\+92|92|0)?3[0-9]{9}$/.test(cleaned);
      }

      function showFieldError(input, errorId, show, customMsg) {
        const errorEl = document.getElementById(errorId);
        if (show) {
          input.classList.add('error');
          if (errorEl) {
            if (customMsg) errorEl.textContent = customMsg;
            errorEl.classList.add('visible');
          }
        } else {
          input.classList.remove('error');
          if (errorEl) errorEl.classList.remove('visible');
        }
      }

      if (nameInput) {
        nameInput.addEventListener('blur', function() {
          showFieldError(nameInput, 'cust-name-error', !nameInput.value.trim());
        });
        nameInput.addEventListener('input', function() {
          if (nameInput.value.trim()) showFieldError(nameInput, 'cust-name-error', false);
        });
      }

      if (phoneInput) {
        phoneInput.addEventListener('blur', function() {
          const val = phoneInput.value.trim();
          if (!val) {
            showFieldError(phoneInput, 'cust-phone-error', true, "Phone number is required");
          } else if (!validatePhone(val)) {
            showFieldError(phoneInput, 'cust-phone-error', true, "Please enter a valid Pakistani number (e.g. 03102157098 or +923102157098)");
          } else {
            showFieldError(phoneInput, 'cust-phone-error', false);
          }
        });
        phoneInput.addEventListener('input', function() {
          const val = phoneInput.value.trim();
          if (val && validatePhone(val)) showFieldError(phoneInput, 'cust-phone-error', false);
        });
      }

      if (addressInput) {
        addressInput.addEventListener('blur', function() {
          showFieldError(addressInput, 'cust-address-error', !addressInput.value.trim());
        });
        addressInput.addEventListener('input', function() {
          if (addressInput.value.trim()) showFieldError(addressInput, 'cust-address-error', false);
        });
      }

      if (cityInput) {
        cityInput.addEventListener('blur', function() {
          showFieldError(cityInput, 'cust-city-error', !cityInput.value.trim());
        });
        cityInput.addEventListener('input', function() {
          if (cityInput.value.trim()) showFieldError(cityInput, 'cust-city-error', false);
        });
      }

      form.addEventListener('submit', function(e) {
        e.preventDefault();

        const { subtotal, delivery, grandTotal, totalItems, items } = calculateCartTotals();
        if (items.length === 0) {
          alert("Your cart is empty. Please add items before checking out.");
          return;
        }

        const name = nameInput.value.trim();
        const phone = phoneInput.value.trim();
        const address = addressInput.value.trim();
        const city = cityInput.value.trim();

        let hasError = false;
        if (!name) {
          showFieldError(nameInput, 'cust-name-error', true);
          hasError = true;
        }
        if (!phone) {
          showFieldError(phoneInput, 'cust-phone-error', true, "Phone number is required");
          hasError = true;
        } else if (!validatePhone(phone)) {
          showFieldError(phoneInput, 'cust-phone-error', true, "Please enter a valid Pakistani number (e.g. 03102157098 or +923102157098)");
          hasError = true;
        }
        if (!address) {
          showFieldError(addressInput, 'cust-address-error', true);
          hasError = true;
        }
        if (!city) {
          showFieldError(cityInput, 'cust-city-error', true);
          hasError = true;
        }

        if (hasError) {
          const firstError = form.querySelector('.form-input.error, .form-textarea.error');
          if (firstError) firstError.focus();
          return;
        }

        // Build WhatsApp Order Message
        const now = new Date();
        const dateTimeStr = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        let itemsText = "";
        items.forEach((item, index) => {
          // Runtime photo link using new URL(imagePath, location.href).href
          const photoUrl = new URL(item.image, window.location.href).href;
          const unitPriceStr = item.price > 0 ? `Rs ${item.price.toLocaleString('en-PK')}` : "Price on request";
          const lineTotalStr = item.price > 0 ? `Rs ${(item.price * item.quantity).toLocaleString('en-PK')}` : "On request";

          itemsText += `${index + 1}. *${item.name}*\n`;
          itemsText += `   • Qty: ${item.quantity} × ${unitPriceStr} = ${lineTotalStr}\n`;
          itemsText += `   • Photo: ${photoUrl}\n`;
        });

        const subtotalStr = `Rs ${subtotal.toLocaleString('en-PK')}`;
        const deliveryStr = `Rs ${delivery.toLocaleString('en-PK')}`;
        const grandTotalStr = `Rs ${grandTotal.toLocaleString('en-PK')}`;

        const fullMessage = 
`*NEW ORDER - PAK AIR GUNS*
📅 Date: ${dateTimeStr}

*ITEMS ORDERED:*
${itemsText}
*ORDER SUMMARY:*
• Subtotal: ${subtotalStr}
• Delivery: ${deliveryStr}
• Grand Total: ${grandTotalStr}

*CUSTOMER DETAILS:*
• Name: ${name}
• Phone: ${phone}
• Address: ${address}
• City: ${city}

*DELIVERY & PAYMENT:*
Delivery all over Pakistan Rs 1,500. Customer will open the parcel first, then send the remaining payment.`;

        const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(fullMessage)}`;

        // Open WhatsApp
        const newWindow = window.open(waUrl, '_blank');

        // Clear cart after order
        clearCart();

        // Render Success Screen with Fallback Link
        if (layout) {
          layout.innerHTML = `
            <div class="success-card">
              <div class="success-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h2>Order Generated Successfully!</h2>
              <p>
                <strong>Please press "Send" in WhatsApp to confirm your order.</strong> The shop will contact you shortly to confirm your delivery.
              </p>

              <div class="order-fallback-link-box">
                <p style="margin-bottom:10px; color:var(--text-secondary); font-size:0.92rem;">
                  Did WhatsApp not open automatically?
                </p>
                <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-gold btn-sm">
                  Click Here to Open WhatsApp &rarr;
                </a>
              </div>

              <div style="margin-top:20px;">
                <a href="index.html" class="btn btn-outline-gold">
                  Continue Shopping
                </a>
              </div>
            </div>
          `;
        }
      });
    }
  }

  // 6. Contact Page Init
  function initContactPage() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
      e.preventDefault();

      const name = document.getElementById('contact-name').value.trim();
      const phone = document.getElementById('contact-phone').value.trim();
      const message = document.getElementById('contact-message').value.trim();

      if (!name || !phone || !message) {
        alert("Please fill in all contact fields.");
        return;
      }

      const inquiryMsg = 
`*NEW INQUIRY - PAK AIR GUNS*
• Name: ${name}
• Phone: ${phone}
• Message: ${message}`;

      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(inquiryMsg)}`;
      window.open(waUrl, '_blank');
      showToast("Opening WhatsApp...");
    });
  }

  // ---------------- DOM Ready Bootstrap ----------------
  document.addEventListener('DOMContentLoaded', function() {
    renderHeader();
    renderFooter();

    // Route based on data-page or element presence
    const bodyPage = document.body.getAttribute('data-page');

    if (bodyPage === 'home') {
      initHomePage();
    } else if (bodyPage === 'air-guns') {
      initAirGunsPage();
    } else if (bodyPage === 'scopes-accessories') {
      initScopesAccessoriesPage();
    } else if (bodyPage === 'cart') {
      initCartPage();
    } else if (bodyPage === 'checkout') {
      initCheckoutPage();
    } else if (bodyPage === 'contact') {
      initContactPage();
    }
  });

  // Expose global helpers to window
  window.addToCart = addToCart;
  window.updateCartQuantity = updateCartQuantity;
  window.removeFromCart = removeFromCart;
  window.clearCart = clearCart;
  window.getCartItemCount = getCartItemCount;
  window.showToast = showToast;

})();
