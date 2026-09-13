/**
 * माऊली – E-Commerce Application Logic
 * Cart, products, ordering, WhatsApp/SMS integration
 */

(function () {
  'use strict';

  // ===== PRODUCT DATA =====
  const PRODUCTS = [
    {
      id: 'green-thali',
      name: 'ग्रीन थाळी',
      category: 'Disposable Plate',
      image: 'images/green-thali.jpg',
      description: 'पारंपारिक पानांच्या थाळी. पर्यावरणपूरक आणि दैनंदिन वापरासाठी उत्तम. मोठ्या कार्यक्रम, हॉटेल आणि कॅटरिंगसाठी योग्य.',
      sizes: ['8 इंच', '10 इंच', '12 इंच'],
      defaultSize: '10 इंच',
      unit: 'पॅकेट'
    },
    {
      id: 'silver-plate',
      name: 'सिल्वर प्लेट थाळी',
      category: 'Disposable Plate',
      image: 'images/silver-plate.jpg',
      description: 'सिल्वर फॉइल कोटेड डिस्पोजेबल प्लेट. लग्न, कार्यक्रम, पार्टी आणि हॉटेलसाठी योग्य. आकर्षक दिसणारी आणि मजबूत.',
      sizes: ['8 इंच', '10 इंच', '12 इंच'],
      defaultSize: '10 इंच',
      unit: 'पॅकेट'
    },
    {
      id: 'kappa-thali',
      name: 'कप्पा थाळी',
      category: 'Compartment Plate',
      image: 'images/kappa-thali.jpg',
      description: 'भोजन वेगवेगळे ठेवण्यासाठी योग्य कंपार्टमेंट डिस्पोजेबल थाळी. मोठ्या कार्यक्रम, हॉटेल, कॅटरिंग आणि होलसेल वापरासाठी उपयुक्त.',
      sizes: ['3 कप्पा', '4 कप्पा'],
      defaultSize: '3 कप्पा',
      unit: 'पॅकेट'
    },
    {
      id: 'dron-bowl',
      name: 'द्रोण',
      category: 'Disposable Bowl',
      image: 'images/dron-bowl.jpg',
      description: 'पारंपारिक पानांचा द्रोण. भाजी, आमटी, श्रीखंड इत्यादी ठेवण्यासाठी उपयुक्त. कार्यक्रम आणि कॅटरिंगसाठी योग्य.',
      sizes: ['200 ml', '300 ml'],
      defaultSize: '300 ml',
      unit: 'पॅकेट'
    }
  ];

  const WHATSAPP_NUMBER = '917498359446';
  const SMS_NUMBER = '7498359446';

  // ===== STATE =====
  let cart = loadCart();

  // ===== DOM ELEMENTS =====
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // ===== INITIALIZE =====
  function init() {
    renderProducts();
    setupNavigation();
    setupCart();
    setupOrderForm();
    updateCartUI();
    setupHeaderScroll();
    setupMobileNav();
  }

  // ===== PRODUCT RENDERING =====
  function renderProducts() {
    const grid = $('#products-grid');
    grid.innerHTML = PRODUCTS.map(product => createProductCard(product)).join('');

    // Attach events
    grid.querySelectorAll('.product-card-image, .product-card-name').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.closest('.product-card').dataset.productId;
        openProductModal(id);
      });
    });

    grid.querySelectorAll('.size-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = e.target.closest('.product-card');
        card.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
      });
    });

    grid.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = e.target.closest('.product-card');
        const input = card.querySelector('.qty-value');
        let val = parseInt(input.value) || 1;
        if (e.target.dataset.action === 'inc') val++;
        if (e.target.dataset.action === 'dec' && val > 1) val--;
        input.value = val;
      });
    });

    grid.querySelectorAll('.btn-add-order').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = e.target.closest('.product-card');
        const productId = card.dataset.productId;
        const product = PRODUCTS.find(p => p.id === productId);
        const activeSize = card.querySelector('.size-btn.active');
        const size = activeSize ? activeSize.textContent : product.defaultSize;
        const qty = parseInt(card.querySelector('.qty-value').value) || 1;
        addToCart(productId, size, qty);
        // Button feedback
        const originalText = btn.innerHTML;
        btn.innerHTML = '✓ ऑर्डरमध्ये जोडले';
        btn.classList.add('added');
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.classList.remove('added');
        }, 1500);
      });
    });
  }

  function createProductCard(product) {
    const sizeBtns = product.sizes.map(size =>
      `<button class="size-btn${size === product.defaultSize ? ' active' : ''}">${size}</button>`
    ).join('');

    return `
      <article class="product-card" data-product-id="${product.id}">
        <div class="product-card-image">
          <span class="product-category-tag">${product.category}</span>
          <img src="${product.image}" alt="${product.name} - ${product.category}" loading="lazy">
        </div>
        <div class="product-card-body">
          <h3 class="product-card-name">${product.name}</h3>
          <div class="size-selector">${sizeBtns}</div>
          <div class="quantity-selector">
            <button class="qty-btn" data-action="dec" aria-label="Decrease quantity">−</button>
            <input type="number" class="qty-value" value="1" min="1" max="999" aria-label="Quantity">
            <button class="qty-btn" data-action="inc" aria-label="Increase quantity">+</button>
          </div>
          <button class="btn-add-order">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add to Order
          </button>
        </div>
      </article>
    `;
  }

  // ===== PRODUCT DETAIL MODAL =====
  function openProductModal(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const modal = $('#product-modal');
    const body = $('#modal-body');

    const sizeBtns = product.sizes.map(size =>
      `<button class="size-btn${size === product.defaultSize ? ' active' : ''}">${size}</button>`
    ).join('');

    body.innerHTML = `
      <div class="modal-image">
        <img src="${product.image}" alt="${product.name}">
      </div>
      <div class="modal-info">
        <span class="modal-category">${product.category}</span>
        <h2 class="modal-product-name">${product.name}</h2>
        <p class="modal-description">${product.description}</p>
        <div>
          <label class="form-label" style="margin-bottom: 8px; display: block;">उपलब्ध आकार</label>
          <div class="modal-sizes">${sizeBtns}</div>
        </div>
        <div>
          <label class="form-label" style="margin-bottom: 8px; display: block;">प्रमाण (${product.unit})</label>
          <div class="quantity-selector">
            <button class="qty-btn" data-action="dec" aria-label="Decrease quantity">−</button>
            <input type="number" class="qty-value" value="1" min="1" max="999" aria-label="Quantity">
            <button class="qty-btn" data-action="inc" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <div class="modal-wholesale-note">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          होलसेल दर quantity वर अवलंबून आहे. ऑर्डर पाठवल्यावर मालक किंमत कळवतील.
        </div>
        <div class="modal-actions">
          <button class="btn-add-order" id="modal-add-btn" data-product-id="${product.id}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add to Order
          </button>
          <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('नमस्कार, मला ' + product.name + ' बद्दल माहिती हवी आहे. कृपया दर आणि उपलब्धता कळवा.')}" target="_blank" class="btn-whatsapp-inquiry">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WhatsApp Inquiry
          </a>
        </div>
      </div>
    `;

    // Modal events
    body.querySelectorAll('.size-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        body.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
      });
    });

    body.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const input = body.querySelector('.qty-value');
        let val = parseInt(input.value) || 1;
        if (e.target.dataset.action === 'inc') val++;
        if (e.target.dataset.action === 'dec' && val > 1) val--;
        input.value = val;
      });
    });

    const addBtn = $('#modal-add-btn');
    addBtn.addEventListener('click', () => {
      const activeSize = body.querySelector('.size-btn.active');
      const size = activeSize ? activeSize.textContent : product.defaultSize;
      const qty = parseInt(body.querySelector('.qty-value').value) || 1;
      addToCart(product.id, size, qty);
      const originalText = addBtn.innerHTML;
      addBtn.innerHTML = '✓ ऑर्डरमध्ये जोडले';
      addBtn.classList.add('added');
      setTimeout(() => {
        addBtn.innerHTML = originalText;
        addBtn.classList.remove('added');
      }, 1500);
    });

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeProductModal() {
    $('#product-modal').classList.remove('active');
    document.body.style.overflow = '';
  }

  // ===== CART LOGIC =====
  function addToCart(productId, size, qty) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const existingIndex = cart.findIndex(item => item.id === productId && item.size === size);
    if (existingIndex > -1) {
      cart[existingIndex].qty += qty;
    } else {
      cart.push({
        id: productId,
        name: product.name,
        image: product.image,
        category: product.category,
        size: size,
        qty: qty,
        unit: product.unit
      });
    }

    saveCart();
    updateCartUI();
    showToast(`${product.name} ऑर्डरमध्ये जोडले`);
  }

  function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
    renderCartItems();
  }

  function updateCartItemQty(index, newQty) {
    if (newQty < 1) {
      removeFromCart(index);
      return;
    }
    cart[index].qty = newQty;
    saveCart();
    updateCartUI();
    renderCartItems();
  }

  function saveCart() {
    try {
      localStorage.setItem('mauli_cart', JSON.stringify(cart));
    } catch (e) {
      // localStorage might be unavailable
    }
  }

  function loadCart() {
    try {
      const data = localStorage.getItem('mauli_cart');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function getCartCount() {
    return cart.reduce((sum, item) => sum + item.qty, 0);
  }

  function updateCartUI() {
    const count = cart.length;
    const badges = $$('.cart-badge');
    badges.forEach(badge => {
      badge.textContent = count;
      badge.classList.toggle('hidden', count === 0);
    });

    // Show/hide cart footer
    const footer = $('#cart-footer');
    if (footer) {
      footer.style.display = count > 0 ? 'block' : 'none';
      $('#cart-total-items').textContent = `${count} उत्पादने`;
    }
  }

  function renderCartItems() {
    const container = $('#cart-items');

    if (cart.length === 0) {
      container.innerHTML = `
        <div class="cart-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          <p>तुमची ऑर्डर रिक्त आहे</p>
          <p style="font-size: 0.82rem; margin-top: 8px; color: var(--gray-400);">उत्पादने निवडून ऑर्डरमध्ये जोडा.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = cart.map((item, index) => `
      <div class="cart-item">
        <div class="cart-item-image">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-detail">${item.size} — ${item.qty} ${item.unit}</div>
        </div>
        <div class="cart-item-qty">
          <button class="qty-btn" data-cart-index="${index}" data-action="dec" aria-label="Decrease">−</button>
          <input type="number" class="qty-value" value="${item.qty}" min="1" data-cart-index="${index}" aria-label="Quantity">
          <button class="qty-btn" data-cart-index="${index}" data-action="inc" aria-label="Increase">+</button>
        </div>
        <button class="cart-item-remove" data-cart-index="${index}" aria-label="Remove item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    `).join('');

    // Cart item events
    container.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        removeFromCart(parseInt(btn.dataset.cartIndex));
      });
    });

    container.querySelectorAll('.cart-item-qty .qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.cartIndex);
        const currentQty = cart[index].qty;
        if (btn.dataset.action === 'inc') {
          updateCartItemQty(index, currentQty + 1);
        } else {
          updateCartItemQty(index, currentQty - 1);
        }
      });
    });

    container.querySelectorAll('.cart-item-qty .qty-value').forEach(input => {
      input.addEventListener('change', () => {
        const index = parseInt(input.dataset.cartIndex);
        const newQty = parseInt(input.value) || 1;
        updateCartItemQty(index, newQty);
      });
    });
  }

  // ===== CART DRAWER =====
  function setupCart() {
    // Toggle cart
    const toggleCart = () => {
      openCartDrawer();
    };

    $('#cart-toggle').addEventListener('click', toggleCart);
    $('#cart-toggle-mobile').addEventListener('click', toggleCart);

    $('#cart-close').addEventListener('click', closeCartDrawer);
    $('#cart-overlay').addEventListener('click', closeCartDrawer);

    // Checkout
    $('#btn-checkout').addEventListener('click', () => {
      closeCartDrawer();
      openOrderForm();
    });
  }

  function openCartDrawer() {
    renderCartItems();
    $('#cart-drawer').classList.add('active');
    $('#cart-overlay').classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCartDrawer() {
    $('#cart-drawer').classList.remove('active');
    $('#cart-overlay').classList.remove('active');
    document.body.style.overflow = '';
  }

  // ===== ORDER FORM =====
  function setupOrderForm() {
    $('#btn-whatsapp-send').addEventListener('click', (e) => {
      e.preventDefault();
      if (!validateForm()) return;
      sendViaWhatsApp();
    });

    $('#btn-sms-send').addEventListener('click', (e) => {
      e.preventDefault();
      if (!validateForm()) return;
      sendViaSMS();
    });

    $('#order-modal-close').addEventListener('click', closeOrderForm);
    $('#order-overlay').addEventListener('click', (e) => {
      if (e.target === $('#order-overlay')) closeOrderForm();
    });

    $('#btn-copy').addEventListener('click', () => {
      const area = $('#copy-area');
      area.select();
      try {
        document.execCommand('copy');
        showToast('ऑर्डर सारांश कॉपी झाले!');
      } catch (e) {
        // fallback: user will manually copy
      }
    });

    // Modal close
    $('#modal-close').addEventListener('click', closeProductModal);
    $('#product-modal').addEventListener('click', (e) => {
      if (e.target === $('#product-modal')) closeProductModal();
    });
  }

  function openOrderForm() {
    // Render order summary
    const summary = $('#order-items-summary');
    summary.innerHTML = cart.map(item =>
      `<div class="order-item-row">
        <span>${item.name} (${item.size})</span>
        <span>${item.qty} ${item.unit}</span>
      </div>`
    ).join('');

    $('#copy-fallback').classList.remove('show');
    $('#order-overlay').classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeOrderForm() {
    $('#order-overlay').classList.remove('active');
    document.body.style.overflow = '';
  }

  function validateForm() {
    let valid = true;

    const name = $('#customer-name');
    const mobile = $('#customer-mobile');
    const address = $('#customer-address');

    // Reset errors
    [name, mobile, address].forEach(el => el.classList.remove('error'));
    $$('.form-error').forEach(el => el.classList.remove('show'));

    if (!name.value.trim()) {
      name.classList.add('error');
      $('#error-name').classList.add('show');
      valid = false;
    }

    const mobileVal = mobile.value.trim();
    if (!mobileVal || !/^[6-9]\d{9}$/.test(mobileVal.replace(/\D/g, '').slice(-10))) {
      mobile.classList.add('error');
      $('#error-mobile').classList.add('show');
      valid = false;
    }

    if (!address.value.trim()) {
      address.classList.add('error');
      $('#error-address').classList.add('show');
      valid = false;
    }

    return valid;
  }

  function generateOrderMessage() {
    const name = $('#customer-name').value.trim();
    const mobile = $('#customer-mobile').value.trim();
    const address = $('#customer-address').value.trim();
    const city = $('#customer-city').value.trim();
    const message = $('#customer-message').value.trim();

    let items = cart.map((item, i) =>
      `${i + 1}. ${item.name} (${item.size}) — ${item.qty} ${item.unit}`
    ).join('\n');

    let msg = `नमस्कार माऊली,\n\nमला खालील उत्पादनांची ऑर्डर करायची आहे:\n\n${items}\n\nग्राहकाचे नाव: ${name}\nमोबाईल: ${mobile}\nडिलिव्हरी ठिकाण: ${address}`;

    if (city) msg += `\nशहर / गाव: ${city}`;
    if (message) msg += `\nअतिरिक्त संदेश: ${message}`;

    msg += '\n\nकृपया उपलब्धता आणि होलसेल दर कळवावा.\n\nधन्यवाद.';

    return msg;
  }

  function sendViaWhatsApp() {
    const msg = generateOrderMessage();
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    showToast('WhatsApp उघडत आहे...');
  }

  function sendViaSMS() {
    const msg = generateOrderMessage();
    const smsUrl = `sms:${SMS_NUMBER}?body=${encodeURIComponent(msg)}`;

    // Try to open SMS
    const link = document.createElement('a');
    link.href = smsUrl;
    link.click();

    // Also show copy fallback
    setTimeout(() => {
      $('#copy-area').value = msg;
      $('#copy-fallback').classList.add('show');
    }, 500);
  }

  // ===== NAVIGATION =====
  function setupNavigation() {
    // Smooth scroll for all anchor links
    $$('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const target = link.getAttribute('href');
        if (target === '#') return;
        const el = document.querySelector(target);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: 'smooth' });
          closeMobileNav();
        }
      });
    });
  }

  function setupMobileNav() {
    const hamburger = $('#hamburger');
    const mobileNav = $('#nav-mobile');
    const mobileActions = $('#mobile-actions');

    // Show mobile actions on small screens
    function checkMobile() {
      if (window.innerWidth <= 768) {
        mobileActions.style.display = 'flex';
      } else {
        mobileActions.style.display = 'none';
        mobileNav.classList.remove('active');
        hamburger.classList.remove('active');
      }
    }

    checkMobile();
    window.addEventListener('resize', checkMobile);

    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileNav.classList.toggle('active');
      document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile nav on link click
    mobileNav.querySelectorAll('.nav-mobile-link').forEach(link => {
      link.addEventListener('click', closeMobileNav);
    });
  }

  function closeMobileNav() {
    $('#hamburger').classList.remove('active');
    $('#nav-mobile').classList.remove('active');
    document.body.style.overflow = '';
  }

  function setupHeaderScroll() {
    const header = $('#header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
      const scroll = window.pageYOffset;
      header.classList.toggle('scrolled', scroll > 10);
      lastScroll = scroll;
    }, { passive: true });
  }

  // ===== TOAST =====
  let toastTimeout;
  function showToast(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

  // ===== KEYBOARD SHORTCUTS =====
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeProductModal();
      closeCartDrawer();
      closeOrderForm();
    }
  });

  // ===== START =====
  document.addEventListener('DOMContentLoaded', init);

})();
