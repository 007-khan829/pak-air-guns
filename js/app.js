/**
 * PAK AIR GUNS - Core Application Logic
 * Premium Realistic Hunting Brand Theme & GSAP Animation System
 * Engineered for Marksmanship, Precision, and Performance
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
    const product = typeof getProductById === 'function' ? getProductById(productId) : null;
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
    showAddToCartModal(product);
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
      const product = typeof getProductById === 'function' ? getProductById(item.id) : null;
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

    const delivery = totalItems > 0 ? (typeof DELIVERY_CHARGES !== 'undefined' ? DELIVERY_CHARGES : 1500) : 0;
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

  // ---------------- Clean Modal System (Add-to-Cart & Confirmation) ----------------
  function showAddToCartModal(product) {
    let backdrop = document.getElementById('add-to-cart-modal');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'add-to-cart-modal';
      backdrop.className = 'quickview-backdrop';
      backdrop.setAttribute('role', 'dialog');
      backdrop.setAttribute('aria-modal', 'true');
      backdrop.setAttribute('aria-label', 'Item Added to Cart');
      document.body.appendChild(backdrop);
    }

    const priceText = typeof formatPrice === 'function' ? formatPrice(product.price) : `Rs ${product.price}`;

    backdrop.innerHTML = `
      <div class="quickview-card" style="max-width: 480px; text-align: center;">
        <button class="quickview-close-btn" onclick="window.closeAddToCartModal()" aria-label="Close modal">×</button>
        <div style="width: 52px; height: 52px; border-radius: 50%; background: rgba(37, 211, 102, 0.15); border: 1.5px solid var(--wa-green); color: var(--wa-green); font-size: 26px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">✓</div>
        <h3 style="font-size: 1.6rem; color: #fff; margin-bottom: 6px;">Added to Cart!</h3>
        <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 20px;">Item has been successfully added to your order.</p>
        
        <div style="display: flex; align-items: center; gap: 14px; background: rgba(6, 12, 9, 0.6); border: 1px solid var(--forest-border); border-radius: var(--radius-md); padding: 12px; margin-bottom: 22px; text-align: left;">
          <img src="${product.image}" alt="${escapeHtml(product.name)}" style="width: 70px; height: 52px; object-fit: contain; border-radius: 4px; background: #141f18;" />
          <div>
            <div style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700; color: #fff;">${escapeHtml(product.name)}</div>
            <div style="font-family: var(--font-price); font-size: 1.25rem; font-weight: 700; color: var(--gold-primary);">${priceText}</div>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          <a href="cart.html" class="btn btn-gold btn-block">
            View Cart &amp; Checkout &rarr;
          </a>
          <button class="btn btn-outline-gold btn-block" onclick="window.closeAddToCartModal()">
            Continue Browsing
          </button>
        </div>
      </div>
    `;

    requestAnimationFrame(() => {
      backdrop.classList.add('open');
    });

    backdrop.onclick = function(e) {
      if (e.target === backdrop) {
        closeAddToCartModal();
      }
    };
  }

  function closeAddToCartModal() {
    const backdrop = document.getElementById('add-to-cart-modal');
    if (backdrop) {
      backdrop.classList.remove('open');
    }
  }

  function showOrderConfirmModal(waUrl) {
    let backdrop = document.getElementById('order-confirm-modal');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'order-confirm-modal';
      backdrop.className = 'quickview-backdrop';
      backdrop.setAttribute('role', 'dialog');
      backdrop.setAttribute('aria-modal', 'true');
      backdrop.setAttribute('aria-label', 'Order Generated Successfully');
      document.body.appendChild(backdrop);
    }

    backdrop.innerHTML = `
      <div class="quickview-card" style="max-width: 500px; text-align: center;">
        <button class="quickview-close-btn" onclick="window.closeOrderConfirmModal()" aria-label="Close modal">×</button>
        <div style="width: 56px; height: 56px; border-radius: 50%; background: rgba(37, 211, 102, 0.15); border: 2px solid var(--wa-green); color: var(--wa-green); font-size: 28px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">✓</div>
        <h3 style="font-size: 1.8rem; color: #fff; margin-bottom: 6px;">Order Generated!</h3>
        <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 18px;">
          Opening WhatsApp to finalize your dispatch with PAK AIR GUNS Lahore.
        </p>

        <div style="background: rgba(212, 175, 55, 0.08); border: 1px solid var(--gold-border); border-radius: var(--radius-md); padding: 14px; margin-bottom: 22px; font-size: 0.9rem; color: var(--text-light); text-align: left;">
          <strong style="color: var(--gold-light); display: block; margin-bottom: 4px;">📦 Open parcel first, then pay.</strong>
          Delivery all over Pakistan: Rs 1,500.
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-gold btn-block">
            Open WhatsApp Now &rarr;
          </a>
          <button class="btn btn-outline-gold btn-block" onclick="window.closeOrderConfirmModal()">
            Done / Close
          </button>
        </div>
      </div>
    `;

    requestAnimationFrame(() => {
      backdrop.classList.add('open');
    });

    backdrop.onclick = function(e) {
      if (e.target === backdrop) {
        closeOrderConfirmModal();
      }
    };
  }

  function closeOrderConfirmModal() {
    const backdrop = document.getElementById('order-confirm-modal');
    if (backdrop) {
      backdrop.classList.remove('open');
    }
  }

  // ---------------- Quick-View Modal System ----------------
  function showQuickViewModal(productId) {
    const product = typeof getProductById === 'function' ? getProductById(productId) : null;
    if (!product) return;

    let modal = document.getElementById('quickview-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'quickview-modal';
      modal.className = 'quickview-backdrop';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-label', 'Product Quick View');
      document.body.appendChild(modal);
    }

    const priceText = typeof formatPrice === 'function' ? formatPrice(product.price) : `Rs ${product.price}`;
    const stockTag = deriveStockTag(product);
    const waUrl = buildProductWhatsAppUrl(product, 1);

    modal.innerHTML = `
      <div class="quickview-card">
        <button class="quickview-close-btn" onclick="window.closeQuickViewModal()" aria-label="Close Quick View">×</button>
        <div class="quickview-grid">
          <div class="quickview-img-box">
            <img src="${product.image}" alt="${escapeHtml(product.name)}" class="quickview-img" />
          </div>
          <div class="quickview-details">
            <span class="quickview-tag">${escapeHtml(stockTag)}</span>
            <h2 class="quickview-title">${escapeHtml(product.name)}</h2>
            <div class="quickview-price">${priceText}</div>
            <p class="quickview-desc">${escapeHtml(product.description)}</p>

            <div class="quickview-qty-row">
              <span style="font-family: var(--font-heading); text-transform: uppercase; font-size: 0.95rem; color: var(--text-muted); font-weight: 700;">Quantity:</span>
              <div class="qty-control">
                <button class="qty-btn" id="qv-qty-dec" aria-label="Decrease quantity">−</button>
                <span class="qty-display" id="qv-qty-val">1</span>
                <button class="qty-btn" id="qv-qty-inc" aria-label="Increase quantity">+</button>
              </div>
            </div>

            <div class="quickview-actions">
              <button class="btn btn-gold btn-block" id="qv-add-cart-btn">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                Add to Cart
              </button>
              <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline-gold btn-block" id="qv-wa-btn" style="border-color: var(--wa-green); color: #fff; background: rgba(37, 211, 102, 0.15);">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true" style="color: var(--wa-green);">
                  <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.276-.1-.476-.15-.676.15s-.777.98-.953 1.18c-.175.2-.351.226-.652.075s-1.27-.468-2.42-1.493c-.894-.799-1.498-1.787-1.674-2.088-.175-.3-.019-.462.132-.612.136-.135.301-.351.451-.527.151-.175.2-.301.301-.501.1-.2.05-.376-.025-.526-.075-.15-.676-1.63-.927-2.232-.244-.588-.492-.508-.676-.517l-.576-.01c-.2 0-.526.075-.802.376s-1.053 1.028-1.053 2.508 1.078 2.909 1.228 3.11c.151.2 2.122 3.24 5.142 4.544.718.31 1.279.496 1.716.634.721.23 1.378.198 1.897.12.578-.088 1.78-.727 2.03-1.43.25-.702.25-1.304.175-1.43-.075-.125-.276-.2-.576-.35z"/>
                </svg>
                Order on WhatsApp
              </a>
            </div>

            <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--forest-border); font-size: 0.82rem; color: var(--text-dim); line-height: 1.5;">
              🚚 Delivery all over Pakistan: Rs 1,500 &bull; 📦 Open parcel first, then pay.
            </div>
          </div>
        </div>
      </div>
    `;

    let selectedQty = 1;
    const qtyValEl = modal.querySelector('#qv-qty-val');
    const waBtn = modal.querySelector('#qv-wa-btn');
    const addBtn = modal.querySelector('#qv-add-cart-btn');

    modal.querySelector('#qv-qty-dec').addEventListener('click', () => {
      if (selectedQty > 1) {
        selectedQty--;
        qtyValEl.textContent = selectedQty;
        waBtn.href = buildProductWhatsAppUrl(product, selectedQty);
      }
    });

    modal.querySelector('#qv-qty-inc').addEventListener('click', () => {
      selectedQty++;
      qtyValEl.textContent = selectedQty;
      waBtn.href = buildProductWhatsAppUrl(product, selectedQty);
    });

    addBtn.addEventListener('click', () => {
      addToCart(product.id, selectedQty);
      closeQuickViewModal();
    });

    requestAnimationFrame(() => {
      modal.classList.add('open');
      if (window.gsap) {
        gsap.fromTo(modal.querySelector('.quickview-card'), 
          { scale: 0.9, opacity: 0, y: 20 }, 
          { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
        );
      }
    });

    modal.onclick = function(e) {
      if (e.target === modal) {
        closeQuickViewModal();
      }
    };
  }

  function closeQuickViewModal() {
    const modal = document.getElementById('quickview-modal');
    if (modal) {
      modal.classList.remove('open');
    }
  }

  // Close modals on Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeAddToCartModal();
      closeOrderConfirmModal();
      closeQuickViewModal();
    }
  });

  function escapeHtml(text) {
    if (!text) return '';
    return text.toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function deriveStockTag(product) {
    const name = (product.name || '').toLowerCase();
    const desc = (product.description || '').toLowerCase();
    const cat = product.category;

    if (name.includes('wooden') || desc.includes('wooden')) return 'Wooden Stock';
    if (name.includes('bullpup') || desc.includes('bullpup')) return 'PCP Bullpup';
    if (name.includes('kral') || desc.includes('kral')) return 'Kral Magnum';
    if (name.includes('gamo') || desc.includes('gamo')) return 'Gamo Suppressed';
    if (name.includes('artemis') || desc.includes('artemis')) return 'Artemis Combo';
    if (name.includes('snowpeak') || desc.includes('snowpeak')) return 'Snowpeak PCP';
    if (name.includes('turkey') || desc.includes('turkey')) return 'Made in Turkey';
    if (name.includes('china') || desc.includes('china')) return 'Made in China';
    if (name.includes('lb600')) return 'LB600 Synthetic';
    if (cat === 'gun') return 'Precision Air Rifle';
    if (cat === 'scope') return 'Optical Scope';
    if (cat === 'cover') return 'Heavy Duty Slip';
    if (cat === 'accessory') return 'Hunting Gear';
    return 'In Stock';
  }

  function buildProductWhatsAppUrl(product, quantity = 1) {
    const waNumber = typeof WHATSAPP_NUMBER !== 'undefined' ? WHATSAPP_NUMBER : "923102157098";
    const photoUrl = new URL(product.image, window.location.href).href;
    const priceStr = typeof product.price === 'number' && product.price > 0 ? `Rs ${product.price.toLocaleString('en-PK')}` : 'Price on request';

    const msg = 
`*DIRECT INQUIRY / ORDER - PAK AIR GUNS*
• Product: *${product.name}*
• Quantity: ${quantity}
• Price: ${priceStr}
• Photo: ${photoUrl}

Delivery all over Pakistan Rs 1,500. Open parcel first, then pay.`;

    return `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;
  }

  // ---------------- Living Hunting Background & Particle Engine ----------------
  function initLivingHuntingBackground() {
    let layer = document.getElementById('hunting-bg-layer');
    if (!layer) {
      layer = document.createElement('div');
      layer.id = 'hunting-bg-layer';
      layer.className = 'hunting-bg-layer';
      layer.innerHTML = `
        <div class="hunting-bg-photo" id="hunting-bg-photo"></div>
        <div class="hunting-bg-overlay"></div>
        <div class="hunting-mist-layer"></div>
        <canvas id="hunting-leaves-canvas"></canvas>
        <div class="gliding-bird-ambient" id="ambient-gliding-bird" aria-hidden="true">
          <svg viewBox="0 0 100 50">
            <path d="M 0,25 Q 25,5 50,22 Q 75,5 100,25 Q 75,18 50,25 Q 25,18 0,25 Z"/>
          </svg>
        </div>
      `;
      document.body.prepend(layer);
    }

    // Scroll Parallax on Background Photo
    const bgPhoto = document.getElementById('hunting-bg-photo');
    if (bgPhoto) {
      window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        bgPhoto.style.transform = `translateY(${scrolled * 0.12}px)`;
      }, { passive: true });
    }

    // Periodic Gliding Wild Game Bird across Background (every 35-45s)
    const glidingBird = document.getElementById('ambient-gliding-bird');
    if (glidingBird && window.gsap) {
      function scheduleGlidingBird() {
        const nextDelay = 30 + Math.random() * 15; // 30-45s
        setTimeout(() => {
          const startY = 12 + Math.random() * 25; // 12% to 37% viewport height
          gsap.set(glidingBird, { x: -120, yPercent: startY, opacity: 0, scale: 0.7 });
          
          gsap.timeline()
            .to(glidingBird, { opacity: 0.55, duration: 2, ease: 'power1.in' })
            .to(glidingBird, { 
              x: window.innerWidth + 140, 
              y: '+=35', 
              duration: 16, 
              ease: 'power1.inOut' 
            }, 0)
            .to(glidingBird, { opacity: 0, duration: 3, ease: 'power1.out' }, 13)
            .add(() => {
              scheduleGlidingBird();
            });
        }, nextDelay * 1000);
      }
      scheduleGlidingBird();
    }

    // Lightweight Falling Leaves Canvas
    initFallingLeavesCanvas();
  }

  function initFallingLeavesCanvas() {
    const canvas = document.getElementById('hunting-leaves-canvas');
    if (!canvas) return;

    // Check prefers-reduced-motion or mobile low-power
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      canvas.style.display = 'none';
      return;
    }

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }, { passive: true });

    // 14-16 leaves total for 60fps performance
    const LEAF_COUNT = window.innerWidth < 768 ? 8 : 15;
    const leafColors = ['#a37d35', '#b38234', '#7c5a28', '#8f682d', '#59704c'];
    const leaves = [];

    for (let i = 0; i < LEAF_COUNT; i++) {
      leaves.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 7 + Math.random() * 8,
        speedY: 0.6 + Math.random() * 0.9,
        speedX: -0.3 + Math.random() * 0.6,
        swaySpeed: 0.015 + Math.random() * 0.02,
        swayRange: 20 + Math.random() * 25,
        angle: Math.random() * Math.PI * 2,
        angularSpeed: (Math.random() - 0.5) * 0.03,
        color: leafColors[Math.floor(Math.random() * leafColors.length)],
        opacity: 0.25 + Math.random() * 0.45,
        step: Math.random() * 100
      });
    }

    let isTabVisible = !document.hidden;
    document.addEventListener('visibilitychange', () => {
      isTabVisible = !document.hidden;
    });

    function drawLeaf(ctx, leaf) {
      ctx.save();
      ctx.translate(leaf.x, leaf.y);
      ctx.rotate(leaf.angle);
      ctx.globalAlpha = leaf.opacity;
      ctx.fillStyle = leaf.color;

      ctx.beginPath();
      ctx.moveTo(0, -leaf.size);
      ctx.bezierCurveTo(leaf.size * 0.6, -leaf.size * 0.5, leaf.size * 0.6, leaf.size * 0.5, 0, leaf.size);
      ctx.bezierCurveTo(-leaf.size * 0.6, leaf.size * 0.5, -leaf.size * 0.6, -leaf.size * 0.5, 0, -leaf.size);
      ctx.fill();

      ctx.restore();
    }

    function animate() {
      if (isTabVisible) {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < leaves.length; i++) {
          const l = leaves[i];
          l.step += l.swaySpeed;
          l.y += l.speedY;
          l.x += l.speedX + Math.sin(l.step) * 0.4;
          l.angle += l.angularSpeed;

          if (l.y > height + 20) {
            l.y = -20;
            l.x = Math.random() * width;
          }
          if (l.x > width + 20) l.x = -20;
          if (l.x < -20) l.x = width + 20;

          drawLeaf(ctx, l);
        }
      }
      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }

  // ---------------- Cinematic Intro Overlay & Bird Burst ----------------
  function initCinematicIntro() {
    // Only run on homepage and first session visit
    const isHome = document.body.getAttribute('data-page') === 'home';
    if (!isHome) return;

    const introViewed = sessionStorage.getItem('pak_intro_viewed');
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (introViewed || prefersReducedMotion) {
      // Trigger instant reveal of cards without waiting
      revealProductCardsInstantly();
      return;
    }

    let introEl = document.getElementById('cinematic-intro');
    if (!introEl) {
      introEl = document.createElement('div');
      introEl.id = 'cinematic-intro';
      introEl.innerHTML = `
        <div class="intro-forest-bg"></div>
        <button class="intro-skip-btn" id="intro-skip-btn" aria-label="Skip Introduction">Skip &rarr;</button>
        <div class="intro-center-content" id="intro-center-content">
          <div class="intro-crest">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8" fill="none"/>
              <line x1="12" y1="2" x2="12" y2="7" stroke="currentColor" stroke-width="1.8"/>
              <line x1="12" y1="17" x2="12" y2="22" stroke="currentColor" stroke-width="1.8"/>
              <line x1="2" y1="12" x2="7" y2="12" stroke="currentColor" stroke-width="1.8"/>
              <line x1="17" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="1.8"/>
              <circle cx="12" cy="12" r="2.5" fill="currentColor"/>
            </svg>
          </div>
          <h1 class="intro-brand-title">PAK <span>AIR GUNS</span></h1>
          <p class="intro-tagline">Precision &bull; Hunting &bull; Marksmanship &bull; Lahore</p>
        </div>
      `;
      document.body.appendChild(introEl);
    }

    // Bird Birds SVGs / Image templates
    const birdSVGTeetar = `
      <svg viewBox="0 0 100 65" fill="#302016" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.6))">
        <path d="M 50,40 Q 60,15 75,25 Q 90,32 98,35 Q 85,45 68,46 Q 55,58 35,52 Q 15,48 5,38 Q 25,32 45,36 Z"/>
        <path d="M 45,36 Q 30,5 50,2 Q 65,8 55,35 Z" fill="#4a3525"/>
      </svg>
    `;

    const birdSVGPigeon = `
      <svg viewBox="0 0 100 65" fill="#2c3e38" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.6))">
        <path d="M 50,38 Q 62,12 80,20 Q 95,28 98,32 Q 82,42 66,44 Q 50,56 30,50 Q 10,45 2,34 Q 22,28 42,34 Z"/>
        <path d="M 42,34 Q 26,2 48,1 Q 62,6 52,32 Z" fill="#3e524b"/>
      </svg>
    `;

    // Create 6 startled birds (mix of teetar and pigeon)
    const birds = [];
    const birdConfigs = [
      { type: 'teetar', startX: 0.25, endX: -0.15, scale: 1.4, dur: 3.4, delay: 0.7 },
      { type: 'pigeon', startX: 0.45, endX: 1.15, scale: 1.5, dur: 3.2, delay: 0.9 },
      { type: 'teetar', startX: 0.55, endX: 1.25, scale: 1.3, dur: 3.6, delay: 1.1 },
      { type: 'pigeon', startX: 0.35, endX: -0.20, scale: 1.6, dur: 3.0, delay: 1.2 },
      { type: 'teetar', startX: 0.70, endX: 1.20, scale: 1.2, dur: 3.8, delay: 1.4 },
      { type: 'pigeon', startX: 0.15, endX: 0.65, scale: 1.7, dur: 2.9, delay: 1.6 }
    ];

    birdConfigs.forEach((cfg, idx) => {
      const b = document.createElement('div');
      b.className = 'intro-bird';
      b.innerHTML = cfg.type === 'teetar' ? birdSVGTeetar : birdSVGPigeon;
      introEl.appendChild(b);
      birds.push({ el: b, cfg: cfg });
    });

    let introDismissed = false;

    function finishIntro() {
      if (introDismissed) return;
      introDismissed = true;
      sessionStorage.setItem('pak_intro_viewed', 'true');

      if (window.gsap) {
        gsap.to(introEl, {
          opacity: 0,
          scale: 1.04,
          duration: 0.75,
          ease: 'power2.inOut',
          onComplete: () => {
            if (introEl.parentNode) introEl.parentNode.removeChild(introEl);
            triggerStaggeredProductReveal();
          }
        });
      } else {
        introEl.style.transition = 'opacity 0.6s ease';
        introEl.style.opacity = '0';
        setTimeout(() => {
          if (introEl.parentNode) introEl.parentNode.removeChild(introEl);
          triggerStaggeredProductReveal();
        }, 600);
      }
    }

    const skipBtn = document.getElementById('intro-skip-btn');
    if (skipBtn) {
      skipBtn.addEventListener('click', finishIntro);
    }

    if (window.gsap) {
      const centerContent = document.getElementById('intro-center-content');
      gsap.fromTo(centerContent, 
        { opacity: 0, y: 30, scale: 0.94 }, 
        { opacity: 1, y: 0, scale: 1, duration: 1.4, ease: 'power2.out' }
      );

      // Animate startled birds bursting up from bottom
      const winW = window.innerWidth;
      const winH = window.innerHeight;

      birds.forEach((item) => {
        const { el, cfg } = item;
        const startXPos = winW * cfg.startX;
        const endXPos = winW * cfg.endX;
        const endYPos = -120;

        gsap.set(el, {
          x: startXPos,
          y: winH + 80,
          scale: 0.4,
          rotation: (endXPos > startXPos ? 15 : -15),
          opacity: 0
        });

        gsap.timeline({ delay: cfg.delay })
          .to(el, { opacity: 1, duration: 0.25 })
          .to(el, {
            x: endXPos,
            y: endYPos,
            scale: cfg.scale,
            duration: cfg.dur,
            ease: 'power1.in',
            onUpdate: function() {
              // Wing flap rotation jitter
              const progress = this.progress();
              const jitter = Math.sin(progress * 30) * 8;
              gsap.set(el, { rotation: (endXPos > startXPos ? 20 : -20) + jitter });
            }
          }, 0);
      });

      // Total sequence under 5.5s
      setTimeout(() => {
        finishIntro();
      }, 5200);
    } else {
      setTimeout(finishIntro, 3500);
    }
  }

  function revealProductCardsInstantly() {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
      card.style.opacity = '1';
      card.style.transform = 'none';
      card.classList.add('revealed');
    });
  }

  function triggerStaggeredProductReveal() {
    const cards = document.querySelectorAll('.product-card');
    if (!cards.length) return;

    if (window.gsap) {
      gsap.fromTo(cards, 
        { opacity: 0, y: 35, scale: 0.94 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: 0.6, 
          stagger: 0.1, 
          ease: 'back.out(1.2)',
          onComplete: () => {
            cards.forEach(c => c.classList.add('revealed'));
          }
        }
      );
    } else {
      revealProductCardsInstantly();
    }
  }

  // ---------------- Shared Header Rendering (Slim Sticky Max 68px) ----------------
  function renderHeader() {
    const headerEl = document.getElementById('site-header');
    if (!headerEl) return;

    const currentPath = window.location.pathname;
    let pageName = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html';
    if (!pageName.endsWith('.html') && pageName !== '') {
      pageName += '.html';
    }

    const isHome = pageName === '' || pageName === 'index.html';
    const isAirGuns = pageName === 'air-guns.html';
    const isScopes = pageName === 'scopes-accessories.html';
    const isContact = pageName === 'contact.html';
    const waNumber = typeof WHATSAPP_NUMBER !== 'undefined' ? WHATSAPP_NUMBER : "923102157098";

    headerEl.className = 'site-header';
    headerEl.innerHTML = `
      <div class="header-container">
        <a href="index.html" class="brand-logo" aria-label="PAK AIR GUNS Homepage">
          <div class="brand-crest" aria-hidden="true">
            <svg viewBox="0 0 24 24">
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
          <a href="scopes-accessories.html" class="nav-link ${isScopes ? 'active' : ''}">Scopes &amp; Accessories</a>
          <a href="contact.html" class="nav-link ${isContact ? 'active' : ''}">Contact Us</a>
        </nav>

        <div class="header-actions">
          <a href="https://wa.me/${waNumber}" target="_blank" rel="noopener noreferrer" class="btn-whatsapp-header" aria-label="Chat on WhatsApp">
            <svg viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.276-.1-.476-.15-.676.15s-.777.98-.953 1.18c-.175.2-.351.226-.652.075s-1.27-.468-2.42-1.493c-.894-.799-1.498-1.787-1.674-2.088-.175-.3-.019-.462.132-.612.136-.135.301-.351.451-.527.151-.175.2-.301.301-.501.1-.2.05-.376-.025-.526-.075-.15-.676-1.63-.927-2.232-.244-.588-.492-.508-.676-.517l-.576-.01c-.2 0-.526.075-.802.376s-1.053 1.028-1.053 2.508 1.078 2.909 1.228 3.11c.151.2 2.122 3.24 5.142 4.544.718.31 1.279.496 1.716.634.721.23 1.378.198 1.897.12.578-.088 1.78-.727 2.03-1.43.25-.702.25-1.304.175-1.43-.075-.125-.276-.2-.576-.35z"/>
            </svg>
            <span>WhatsApp</span>
          </a>

          <a href="cart.html" class="cart-btn" aria-label="View Shopping Cart">
            <span class="cart-icon-wrap" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            </span>
            <span class="cart-label">Cart</span>
            <span class="cart-badge" id="cart-count">0</span>
          </a>

          <button class="mobile-toggle" id="mobile-toggle" aria-label="Toggle navigation menu" aria-expanded="false">
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
          <a href="air-guns.html" class="nav-link ${isAirGuns ? 'active' : ''}">Air Guns Collection</a>
          <a href="scopes-accessories.html" class="nav-link ${isScopes ? 'active' : ''}">Scopes &amp; Accessories</a>
          <a href="contact.html" class="nav-link ${isContact ? 'active' : ''}">Contact Us</a>
          <a href="cart.html" class="nav-link">Shopping Cart (<span class="cart-badge" style="display:inline-flex;">0</span>)</a>
        </div>
        <div style="margin-top: auto; padding-top: 20px; border-top: 1px solid var(--forest-border);">
          <p style="color: var(--text-light); font-weight: 700; margin-bottom: 6px;">Shop # 16, Main Wagah Road, Lahore</p>
          <p style="color: var(--text-muted); font-size: 0.9rem;">WhatsApp: +92 310 2157098</p>
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
    }

    // Header scroll background effect
    window.addEventListener('scroll', function() {
      if (window.scrollY > 40) {
        headerEl.classList.add('scrolled');
      } else {
        headerEl.classList.remove('scrolled');
      }
    }, { passive: true });

    updateCartCountBadge();
  }

  // ---------------- Dedicated Trust Strip Directly Above Footer ----------------
  function renderTrustStrip() {
    let strip = document.getElementById('trust-strip-above-footer');
    if (!strip) {
      strip = document.createElement('section');
      strip.id = 'trust-strip-above-footer';
      strip.className = 'trust-strip-above-footer';
      strip.innerHTML = `
        <div class="container">
          <div class="trust-badges-row">
            <div class="trust-badge-pill">
              <div class="trust-badge-icon">🚚</div>
              <div>
                <span>Delivery All Over Pakistan: Rs 1,500</span>
              </div>
            </div>
            <div class="trust-badge-pill">
              <div class="trust-badge-icon">📦</div>
              <div>
                <span>Open Parcel First, Then Send Remaining Payment</span>
              </div>
            </div>
          </div>
        </div>
      `;
      const footerEl = document.getElementById('site-footer');
      if (footerEl && footerEl.parentNode) {
        footerEl.parentNode.insertBefore(strip, footerEl);
      }
    }
  }

  // ---------------- Compact Footer Rendering ----------------
  function renderFooter() {
    const footerEl = document.getElementById('site-footer');
    if (!footerEl) return;

    const waNumber = typeof WHATSAPP_NUMBER !== 'undefined' ? WHATSAPP_NUMBER : "923102157098";

    footerEl.className = 'site-footer';
    footerEl.innerHTML = `
      <div class="container">
        <div class="footer-grid-compact">
          <!-- Col 1: Brand & Bio -->
          <div class="footer-col">
            <h4>PAK AIR GUNS</h4>
            <p class="footer-desc">
              Pakistan's premier destination for high-power precision air rifles, optical scopes, heavy-duty rifle slips, and hunting accessories.
            </p>
          </div>

          <!-- Col 2: Navigation -->
          <div class="footer-col">
            <h4>Catalog &amp; Links</h4>
            <ul class="footer-nav-list">
              <li><a href="index.html" class="footer-nav-link">&rsaquo; Home</a></li>
              <li><a href="air-guns.html" class="footer-nav-link">&rsaquo; Air Guns Collection</a></li>
              <li><a href="scopes-accessories.html" class="footer-nav-link">&rsaquo; Scopes &amp; Accessories</a></li>
              <li><a href="cart.html" class="footer-nav-link">&rsaquo; View Cart</a></li>
              <li><a href="contact.html" class="footer-nav-link">&rsaquo; Contact &amp; Location</a></li>
            </ul>
          </div>

          <!-- Col 3: Visit Our Shop (Fully readable light text) -->
          <div class="footer-col">
            <h4>Visit Our Shop</h4>
            <p class="footer-address">
              📍 <strong>Shop # 16, Main Wagah Road</strong><br>
              Lahore, Punjab, Pakistan<br>
              <span style="font-size: 0.85rem; color: #CBD5E1;">Open 7 Days &bull; Direct WhatsApp Support</span>
            </p>
            <a href="https://wa.me/${waNumber}" target="_blank" rel="noopener noreferrer" class="btn btn-gold btn-sm" aria-label="WhatsApp Support">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.276-.1-.476-.15-.676.15s-.777.98-.953 1.18c-.175.2-.351.226-.652.075s-1.27-.468-2.42-1.493c-.894-.799-1.498-1.787-1.674-2.088-.175-.3-.019-.462.132-.612.136-.135.301-.351.451-.527.151-.175.2-.301.301-.501.1-.2.05-.376-.025-.526-.075-.15-.676-1.63-.927-2.232-.244-.588-.492-.508-.676-.517l-.576-.01c-.2 0-.526.075-.802.376s-1.053 1.028-1.053 2.508 1.078 2.909 1.228 3.11c.151.2 2.122 3.24 5.142 4.544.718.31 1.279.496 1.716.634.721.23 1.378.198 1.897.12.578-.088 1.78-.727 2.03-1.43.25-.702.25-1.304.175-1.43-.075-.125-.276-.2-.576-.35z"/>
              </svg>
              WhatsApp: +92 310 2157098
            </a>
          </div>
        </div>

        <!-- Single Line Bottom Bar with Developer Credit -->
        <div class="footer-bottom-single-line">
          &copy; ${new Date().getFullYear()} PAK AIR GUNS. All rights reserved. Shop # 16, Main Wagah Road, Lahore.
          <span class="dev-credit">Developed by <span>Aayan Khan</span></span>
        </div>
      </div>
    `;
  }

  // ---------------- Product Card Component ----------------
  function renderProductCard(product, isHeroItem = false) {
    const stockTag = deriveStockTag(product);
    const priceText = typeof formatPrice === 'function' ? formatPrice(product.price) : `Rs ${product.price}`;
    const waUrl = buildProductWhatsAppUrl(product, 1);

    return `
      <article class="product-card" data-id="${product.id}" data-category="${product.category}" onclick="window.showQuickViewModal('${product.id}')">
        <!-- 4:3 Image Container with Soft Warm Backdrop -->
        <div class="product-img-box">
          <span class="stock-tag">${escapeHtml(stockTag)}</span>
          <span class="stock-indicator"><span class="dot"></span>In Stock</span>
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
        </div>

        <div class="product-info">
          <h3 class="product-title">${escapeHtml(product.name)}</h3>
          <p class="product-desc">${escapeHtml(product.description)}</p>
          <div class="product-price">${priceText}</div>
          <div class="product-actions-bar">
            <button class="btn btn-gold btn-card-add" onclick="event.stopPropagation(); window.addToCart('${product.id}')" aria-label="Add ${escapeHtml(product.name)} to cart">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              Add to Cart
            </button>
            <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn-card-wa" onclick="event.stopPropagation();" aria-label="Order ${escapeHtml(product.name)} directly on WhatsApp">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.276-.1-.476-.15-.676.15s-.777.98-.953 1.18c-.175.2-.351.226-.652.075s-1.27-.468-2.42-1.493c-.894-.799-1.498-1.787-1.674-2.088-.175-.3-.019-.462.132-.612.136-.135.301-.351.451-.527.151-.175.2-.301.301-.501.1-.2.05-.376-.025-.526-.075-.15-.676-1.63-.927-2.232-.244-.588-.492-.508-.676-.517l-.576-.01c-.2 0-.526.075-.802.376s-1.053 1.028-1.053 2.508 1.078 2.909 1.228 3.11c.151.2 2.122 3.24 5.142 4.544.718.31 1.279.496 1.716.634.721.23 1.378.198 1.897.12.578-.088 1.78-.727 2.03-1.43.25-.702.25-1.304.175-1.43-.075-.125-.276-.2-.576-.35z"/>
              </svg>
            </a>
          </div>
        </div>
      </article>
    `;
  }

  // ---------------- Collection Page Slim Toolbar ----------------
  function initCollectionToolbar(containerId, originalProducts, renderTargetId, countTargetId) {
    const container = document.getElementById(containerId);
    const target = document.getElementById(renderTargetId);
    if (!container || !target) return;

    container.innerHTML = `
      <div class="collection-toolbar">
        <div class="toolbar-controls">
          <div class="toolbar-search-wrap">
            <span class="toolbar-search-icon">🔍</span>
            <input type="text" id="toolbar-search-input" class="toolbar-search" placeholder="Search models, brands, specs..." aria-label="Search collection">
          </div>
          <select id="toolbar-sort-select" class="toolbar-select" aria-label="Sort products">
            <option value="default">Sort: Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
          </select>
          <select id="toolbar-filter-select" class="toolbar-select" aria-label="Filter by type">
            <option value="all">All Models</option>
            <option value="wooden">Wooden Stock</option>
            <option value="synthetic">Synthetic Stock</option>
            <option value="turkey">Made in Turkey</option>
            <option value="china">Made in China</option>
          </select>
        </div>
        <div class="toolbar-count" id="toolbar-count-badge">
          ${originalProducts.length} Models Available
        </div>
      </div>
    `;

    const searchInput = container.querySelector('#toolbar-search-input');
    const sortSelect = container.querySelector('#toolbar-sort-select');
    const filterSelect = container.querySelector('#toolbar-filter-select');
    const countBadge = container.querySelector('#toolbar-count-badge');
    const headerCount = document.getElementById(countTargetId);

    function updateGrid() {
      const query = (searchInput.value || '').trim().toLowerCase();
      const sortVal = sortSelect.value;
      const filterVal = filterSelect.value;

      let filtered = originalProducts.filter(p => {
        const matchesQuery = !query || 
          p.name.toLowerCase().includes(query) || 
          p.description.toLowerCase().includes(query);

        if (!matchesQuery) return false;

        if (filterVal === 'wooden') {
          return p.name.toLowerCase().includes('wooden') || p.description.toLowerCase().includes('wooden');
        }
        if (filterVal === 'synthetic') {
          return !p.name.toLowerCase().includes('wooden') && !p.description.toLowerCase().includes('wooden');
        }
        if (filterVal === 'turkey') {
          return p.name.toLowerCase().includes('turkey') || p.description.toLowerCase().includes('turkey');
        }
        if (filterVal === 'china') {
          return p.name.toLowerCase().includes('china') || p.description.toLowerCase().includes('china');
        }

        return true;
      });

      if (sortVal === 'price-asc') {
        filtered.sort((a, b) => a.price - b.price);
      } else if (sortVal === 'price-desc') {
        filtered.sort((a, b) => b.price - a.price);
      } else if (sortVal === 'name-asc') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
      }

      const countText = `${filtered.length} ${filtered.length === 1 ? 'Model' : 'Models'} Available`;
      countBadge.textContent = countText;
      if (headerCount) headerCount.textContent = countText;

      if (filtered.length === 0) {
        target.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: var(--forest-panel); border: 1px solid var(--forest-border); border-radius: var(--radius-lg);">
            <div style="font-size: 2.4rem; color: var(--gold-primary); margin-bottom: 12px;">🎯</div>
            <h3 style="font-size: 1.4rem; color: #fff; margin-bottom: 8px;">No matching items found</h3>
            <p style="color: var(--text-muted); font-size: 0.95rem;">Try adjusting your search criteria or clearing filters.</p>
          </div>
        `;
      } else {
        target.innerHTML = filtered.map((p, idx) => renderProductCard(p, idx === 0)).join('');
      }
    }

    searchInput.addEventListener('input', updateGrid);
    sortSelect.addEventListener('change', updateGrid);
    filterSelect.addEventListener('change', updateGrid);
  }

  // ---------------- Page Initializers ----------------

  // 1. Home Page
  function initHomePage() {
    const gunsContainer = document.getElementById('home-guns-grid');
    const scopesContainer = document.getElementById('home-scopes-grid');
    const coversContainer = document.getElementById('home-covers-grid');

    if (gunsContainer && typeof getProductsByCategory === 'function') {
      const guns = getProductsByCategory('gun');
      gunsContainer.innerHTML = guns.map((p, idx) => renderProductCard(p, idx === 0)).join('');
    }

    if (scopesContainer && typeof getProductsByCategory === 'function') {
      const scopes = getProductsByCategory('scope');
      scopesContainer.innerHTML = scopes.map(p => renderProductCard(p, false)).join('');
    }

    if (coversContainer && typeof getProductsByCategory === 'function') {
      const covers = getProductsByCategory('cover');
      coversContainer.innerHTML = covers.map(p => renderProductCard(p, false)).join('');
    }
  }

  // 2. Air Guns Collection Page
  function initAirGunsPage() {
    const guns = typeof getProductsByCategory === 'function' ? getProductsByCategory('gun') : [];
    initCollectionToolbar('collection-toolbar-container', guns, 'air-guns-grid', 'air-guns-count');

    const gunsContainer = document.getElementById('air-guns-grid');
    if (gunsContainer && !gunsContainer.innerHTML.trim()) {
      gunsContainer.innerHTML = guns.map((p, idx) => renderProductCard(p, idx === 0)).join('');
    }
  }

  // 3. Scopes & Accessories Page
  function initScopesAccessoriesPage() {
    const scopesContainer = document.getElementById('scopes-grid');
    const coversContainer = document.getElementById('covers-grid');
    const accessoriesContainer = document.getElementById('accessories-grid');

    if (scopesContainer && typeof getProductsByCategory === 'function') {
      const scopes = getProductsByCategory('scope');
      scopesContainer.innerHTML = scopes.map(p => renderProductCard(p, false)).join('');
    }

    if (coversContainer && typeof getProductsByCategory === 'function') {
      const covers = getProductsByCategory('cover');
      coversContainer.innerHTML = covers.map(p => renderProductCard(p, false)).join('');
    }

    if (accessoriesContainer && typeof getProductsByCategory === 'function') {
      const accessories = getProductsByCategory('accessory');
      accessoriesContainer.innerHTML = accessories.map(p => renderProductCard(p, false)).join('');
    }
  }

  // 4. Cart Page
  function initCartPage() {
    window.renderCartPage = function() {
      const cartContainer = document.getElementById('cart-view-container');
      if (!cartContainer) return;

      const { subtotal, delivery, grandTotal, totalItems, items } = calculateCartTotals();

      if (items.length === 0) {
        cartContainer.innerHTML = `
          <div class="empty-cart-view" style="text-align: center; padding: 70px 20px; background: var(--forest-panel); border: 1px solid var(--forest-border); border-radius: var(--radius-lg); max-width: 650px; margin: 0 auto;">
            <div style="font-size: 3.5rem; color: var(--gold-primary); margin-bottom: 16px;">🛒</div>
            <h2 style="font-size: 1.8rem; margin-bottom: 12px; color: #fff;">Your Shopping Cart is Empty</h2>
            <p style="color: var(--text-muted); margin-bottom: 24px;">Explore our precision air rifles, optical scopes, and tactical hunting accessories to add items to your cart.</p>
            <a href="air-guns.html" class="btn btn-gold">Explore Air Guns Collection</a>
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
            <div style="font-size: 0.8rem; color: var(--text-dim); text-transform: uppercase;">${escapeHtml(item.category)}</div>
          </div>
          <div class="cart-item-price">
            ${item.price > 0 ? 'Rs ' + item.price.toLocaleString('en-PK') : 'Price on request'}
          </div>
          <div class="qty-control">
            <button class="qty-btn" onclick="window.updateCartQuantity('${item.id}', -1)" aria-label="Decrease quantity">−</button>
            <span class="qty-display">${item.quantity}</span>
            <button class="qty-btn" onclick="window.updateCartQuantity('${item.id}', 1)" aria-label="Increase quantity">+</button>
          </div>
          <button class="quickview-close-btn" style="position: static; width: 34px; height: 34px;" onclick="window.removeFromCart('${item.id}')" aria-label="Remove item">
            &times;
          </button>
        </div>
      `).join('');

      cartContainer.innerHTML = `
        <div class="cart-layout">
          <div class="cart-items-card">
            <h2 style="font-size: 1.5rem; margin-bottom: 20px; color: #fff;">Review Cart (${totalItems} ${totalItems === 1 ? 'item' : 'items'})</h2>
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

            <div style="background: rgba(212, 175, 55, 0.08); border: 1px solid var(--gold-border); border-radius: var(--radius-sm); padding: 12px; margin: 18px 0; font-size: 0.85rem; color: var(--text-light); line-height: 1.5;">
              <p>🚚 <strong>Delivery all over Pakistan: Rs 1,500.</strong></p>
              <p style="margin-top: 4px;">📦 <strong>Open the parcel first, then send remaining payment.</strong></p>
            </div>

            <a href="checkout.html" class="btn btn-gold btn-block" style="font-size: 1.05rem;">
              Proceed to Checkout &rarr;
            </a>

            <a href="air-guns.html" class="gold-text" style="display: block; text-align: center; margin-top: 16px; font-size: 0.95rem;">
              &larr; Continue Shopping
            </a>
          </div>
        </div>
      `;
    };

    window.renderCartPage();
  }

  // 5. Checkout Page
  function initCheckoutPage() {
    const summaryContainer = document.getElementById('checkout-summary-container');
    const form = document.getElementById('checkout-form');
    const layout = document.getElementById('checkout-layout-view');

    window.renderCheckoutSummary = function() {
      const { subtotal, delivery, grandTotal, totalItems, items } = calculateCartTotals();

      if (items.length === 0) {
        if (layout) {
          layout.innerHTML = `
            <div class="empty-cart-view" style="grid-column: 1 / -1; text-align: center; padding: 70px 20px; background: var(--forest-panel); border: 1px solid var(--forest-border); border-radius: var(--radius-lg);">
              <div style="font-size: 3.5rem; color: var(--gold-primary); margin-bottom: 16px;">🛒</div>
              <h2 style="font-size: 1.8rem; margin-bottom: 12px; color: #fff;">Your Cart is Empty</h2>
              <p style="color: var(--text-muted); margin-bottom: 24px;">Please add products to your cart before checking out.</p>
              <a href="air-guns.html" class="btn btn-gold">Browse Air Guns</a>
            </div>
          `;
        }
        return;
      }

      if (summaryContainer) {
        const itemsListHtml = items.map(item => `
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06);">
            <div style="display: flex; align-items: center; gap: 10px;">
              <img src="${item.image}" alt="${escapeHtml(item.name)}" style="width: 50px; height: 38px; object-fit: contain; background: #141f18; border-radius: 4px;">
              <div>
                <strong style="color: #fff; display: block; font-size: 0.92rem;">${escapeHtml(item.name)}</strong>
                <span style="color: var(--text-muted); font-size: 0.8rem;">Qty: ${item.quantity} &times; ${item.price > 0 ? 'Rs ' + item.price.toLocaleString('en-PK') : 'On request'}</span>
              </div>
            </div>
            <span style="font-family: var(--font-price); font-weight: 700; color: var(--gold-primary);">
              ${item.price > 0 ? 'Rs ' + (item.price * item.quantity).toLocaleString('en-PK') : 'On request'}
            </span>
          </div>
        `).join('');

        summaryContainer.innerHTML = `
          <h3 class="summary-title">Order Overview (${totalItems} items)</h3>
          <div style="margin-bottom: 18px;">
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

          <div style="background: rgba(212, 175, 55, 0.08); border: 1px solid var(--gold-border); border-radius: var(--radius-sm); padding: 12px; margin-top: 18px; font-size: 0.85rem; color: var(--text-light); line-height: 1.5;">
            <p>🚚 <strong>Delivery all over Pakistan: Rs 1,500.</strong></p>
            <p style="margin-top: 4px;">📦 <strong>Open the parcel first, then send remaining payment.</strong></p>
          </div>
        `;
      }
    };

    window.renderCheckoutSummary();

    if (form) {
      const nameInput = document.getElementById('cust-name');
      const phoneInput = document.getElementById('cust-phone');
      const addressInput = document.getElementById('cust-address');
      const cityInput = document.getElementById('cust-city');

      function validatePhone(phone) {
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
        nameInput.addEventListener('blur', () => showFieldError(nameInput, 'cust-name-error', !nameInput.value.trim()));
        nameInput.addEventListener('input', () => { if (nameInput.value.trim()) showFieldError(nameInput, 'cust-name-error', false); });
      }

      if (phoneInput) {
        phoneInput.addEventListener('blur', () => {
          const val = phoneInput.value.trim();
          if (!val) {
            showFieldError(phoneInput, 'cust-phone-error', true, "Phone number is required");
          } else if (!validatePhone(val)) {
            showFieldError(phoneInput, 'cust-phone-error', true, "Please enter a valid Pakistani number (e.g. 03102157098 or +923102157098)");
          } else {
            showFieldError(phoneInput, 'cust-phone-error', false);
          }
        });
        phoneInput.addEventListener('input', () => {
          const val = phoneInput.value.trim();
          if (val && validatePhone(val)) showFieldError(phoneInput, 'cust-phone-error', false);
        });
      }

      if (addressInput) {
        addressInput.addEventListener('blur', () => showFieldError(addressInput, 'cust-address-error', !addressInput.value.trim()));
        addressInput.addEventListener('input', () => { if (addressInput.value.trim()) showFieldError(addressInput, 'cust-address-error', false); });
      }

      if (cityInput) {
        cityInput.addEventListener('blur', () => showFieldError(cityInput, 'cust-city-error', !cityInput.value.trim()));
        cityInput.addEventListener('input', () => { if (cityInput.value.trim()) showFieldError(cityInput, 'cust-city-error', false); });
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
        if (!name) { showFieldError(nameInput, 'cust-name-error', true); hasError = true; }
        if (!phone) {
          showFieldError(phoneInput, 'cust-phone-error', true, "Phone number is required");
          hasError = true;
        } else if (!validatePhone(phone)) {
          showFieldError(phoneInput, 'cust-phone-error', true, "Please enter a valid Pakistani number (e.g. 03102157098 or +923102157098)");
          hasError = true;
        }
        if (!address) { showFieldError(addressInput, 'cust-address-error', true); hasError = true; }
        if (!city) { showFieldError(cityInput, 'cust-city-error', true); hasError = true; }

        if (hasError) {
          const firstErr = form.querySelector('.form-input.error, .form-textarea.error');
          if (firstErr) firstErr.focus();
          return;
        }

        const now = new Date();
        const dateTimeStr = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        let itemsText = "";
        items.forEach((item, index) => {
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

        const waNumber = typeof WHATSAPP_NUMBER !== 'undefined' ? WHATSAPP_NUMBER : "923102157098";
        const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(fullMessage)}`;

        window.open(waUrl, '_blank');
        clearCart();
        showOrderConfirmModal(waUrl);

        if (layout) {
          layout.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: var(--forest-panel); border: 1.5px solid var(--gold-primary); border-radius: var(--radius-lg); max-width: 650px; margin: 0 auto; box-shadow: var(--shadow-hover);">
              <div style="width: 60px; height: 60px; border-radius: 50%; background: rgba(37, 211, 102, 0.15); border: 2px solid var(--wa-green); color: var(--wa-green); font-size: 32px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">✓</div>
              <h2 style="font-size: 2rem; color: #fff; margin-bottom: 12px;">Order Generated Successfully!</h2>
              <p style="color: var(--text-light); font-size: 1.05rem; margin-bottom: 22px;">
                <strong>Please tap "Send" in WhatsApp to confirm your order.</strong> Our shop team in Lahore will confirm dispatch with you promptly.
              </p>
              <div style="margin-bottom: 24px;">
                <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-gold btn-sm">
                  Click Here to Open WhatsApp &rarr;
                </a>
              </div>
              <a href="index.html" class="btn btn-outline-gold">Return to Home</a>
            </div>
          `;
        }
      });
    }
  }

  // 6. Contact Page
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

      const waNumber = typeof WHATSAPP_NUMBER !== 'undefined' ? WHATSAPP_NUMBER : "923102157098";
      const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(inquiryMsg)}`;
      window.open(waUrl, '_blank');
    });
  }

  // ---------------- DOM Ready Bootstrap ----------------
  document.addEventListener('DOMContentLoaded', function() {
    initLivingHuntingBackground();
    renderHeader();
    renderTrustStrip();
    renderFooter();

    const bodyPage = document.body.getAttribute('data-page');

    if (bodyPage === 'home') {
      initHomePage();
      initCinematicIntro();
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

  // Global window helpers
  window.addToCart = addToCart;
  window.updateCartQuantity = updateCartQuantity;
  window.removeFromCart = removeFromCart;
  window.clearCart = clearCart;
  window.getCartItemCount = getCartItemCount;
  window.showAddToCartModal = showAddToCartModal;
  window.closeAddToCartModal = closeAddToCartModal;
  window.showOrderConfirmModal = showOrderConfirmModal;
  window.closeOrderConfirmModal = closeOrderConfirmModal;
  window.showQuickViewModal = showQuickViewModal;
  window.closeQuickViewModal = closeQuickViewModal;

})();
