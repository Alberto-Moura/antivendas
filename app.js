/* ============================================
   ANTIVENDAS — Application Logic
   ============================================ */

// ──────────────────────────────────────────────
// Product Data
// ──────────────────────────────────────────────
const products = [
  {
    id: 1,
    name: 'Silêncio Absoluto',
    category: 'bem-estar',
    price: 199.90,
    badge: 'new',
    emoji: '🔇',
    description: 'Uma cápsula de silêncio puro. Elimine todo o ruído do mundo por tempo indeterminado.',
    image: 'assets/silencio_absoluto.png',
    hasImage: true
  },
  {
    id: 2,
    name: 'Detox Digital',
    category: 'tecnologia',
    price: 149.90,
    badge: 'hot',
    emoji: '📵',
    description: 'Um passe mágico que desconecta você de todas as telas. Inclui abstinência garantida.',
    image: 'assets/detox_digital.png',
    hasImage: true,
    colors: ['#8b5cf6', '#6d28d9', '#1e1b4b']
  },
  {
    id: 3,
    name: 'Escudo Anti-Anúncios',
    category: 'tecnologia',
    price: 89.90,
    badge: 'eco',
    emoji: '🛡️',
    description: 'Campo de força invisível que repele qualquer anúncio, pop-up ou propaganda subliminar.',
    image: 'assets/escuto_anti_anuncio.png',
    hasImage: true,
    colors: ['#06b6d4', '#0891b2', '#0e1b2e']
  },
  {
    id: 4,
    name: 'Expansor de Tempo',
    category: 'existencial',
    price: 999.90,
    badge: 'hot',
    emoji: '⏳',
    description: 'Cada hora dura o equivalente a três. Perfeito para quem quer viver mais sem pressa.',
    image: 'assets/expansor_tempo.png',
    hasImage: true,
    colors: ['#f59e0b', '#d97706', '#1a1208']
  },
  {
    id: 5,
    name: 'Caixa de Nada',
    category: 'filosófico',
    price: 0.01,
    badge: 'new',
    emoji: '📦',
    description: 'Contém exatamente nada. A experiência definitiva do minimalismo radical.',
    image: null,
    hasImage: false,
    colors: ['#64748b', '#475569', '#0f172a']
  },
  {
    id: 6,
    name: 'Gravidade Zero',
    category: 'existencial',
    price: 459.90,
    badge: 'eco',
    emoji: '🪐',
    description: 'Suspenda as leis da física por um dia. Flutue livremente, sem compromisso com o chão.',
    image: null,
    hasImage: false,
    colors: ['#a78bfa', '#7c3aed', '#0c0a1a']
  }
];

// ──────────────────────────────────────────────
// Anti-marketing Messages
// ──────────────────────────────────────────────
const antiMessages = [
  {
    icon: '🤔',
    title: 'Espera um segundo...',
    text: 'Você realmente precisa disso? Ou é só o capitalismo falando? Respire fundo antes de continuar.',
    type: 'breathe'
  },
  {
    icon: '🧘',
    title: 'Momento de reflexão',
    text: 'Feche os olhos por 3 segundos e pense: "Eu existia feliz antes de saber que isso existia?"',
    type: 'breathe'
  },
  {
    icon: '🌍',
    title: 'Alerta de consumo',
    text: 'Cada compra é um voto no tipo de mundo que você quer. Tem certeza que quer votar agora?',
    type: 'confirm'
  },
  {
    icon: '💡',
    title: 'Dica anti-venda',
    text: 'Sabia que 73% das compras por impulso geram arrependimento? Não inventamos esse número, mas soa verdadeiro.',
    type: 'confirm'
  },
  {
    icon: '🎯',
    title: 'Desafio proposto!',
    text: 'Se você conseguir esperar 30 segundos sem clicar, é um sinal de que tem autocontrole. Ou não.',
    type: 'timer'
  },
  {
    icon: '🐢',
    title: 'Devagar e sempre',
    text: 'As melhores decisões são tomadas com calma. Respire fundo... inspira... expira...',
    type: 'breathe'
  }
];

// ──────────────────────────────────────────────
// State
// ──────────────────────────────────────────────
let cart = JSON.parse(localStorage.getItem('antivendas-cart') || '[]');
let activeCategory = 'todos';
let searchQuery = '';
let pendingProduct = null;
let antiMessageCount = 0;
let checkoutStep = 0;

// ──────────────────────────────────────────────
// DOM References
// ──────────────────────────────────────────────
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ──────────────────────────────────────────────
// Initialize
// ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  updateCartUI();
  setupNavScroll();
  setupScrollReveal();
  setupMobileMenu();
  animateStats();

  // Search
  const searchInput = $('#search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderProducts();
    });
  }

  // Category tabs
  $$('.category-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      activeCategory = tab.dataset.category;
      $$('.category-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderProducts();
    });
  });

  // Cart buttons
  $('#cart-toggle')?.addEventListener('click', toggleCart);
  $('#cart-overlay')?.addEventListener('click', toggleCart);
  $('#close-cart')?.addEventListener('click', toggleCart);

  // Anti-modal
  $('#anti-cancel')?.addEventListener('click', closeAntiModal);
  $('#anti-overlay')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeAntiModal();
  });

  // Checkout
  $('#checkout-btn')?.addEventListener('click', openCheckout);
  $('#checkout-overlay')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeCheckout();
  });
  $('#checkout-back')?.addEventListener('click', prevCheckoutStep);
  $('#checkout-next')?.addEventListener('click', nextCheckoutStep);
});

// ──────────────────────────────────────────────
// Generate SVG product visuals
// ──────────────────────────────────────────────
function generateProductSVG(product) {
  const [c1, c2, c3] = product.colors || ['#06b6d4', '#0891b2', '#0e1b2e'];
  return `
    <svg class="product-visual" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="glow-${product.id}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style="stop-color:${c1};stop-opacity:0.6" />
          <stop offset="100%" style="stop-color:${c3};stop-opacity:0" />
        </radialGradient>
        <linearGradient id="grad-${product.id}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${c1}" />
          <stop offset="100%" style="stop-color:${c2}" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="${c3}"/>
      <circle cx="200" cy="150" r="120" fill="url(#glow-${product.id})" opacity="0.5"/>
      <circle cx="200" cy="150" r="55" fill="url(#grad-${product.id})" opacity="0.9"/>
      <circle cx="200" cy="150" r="30" fill="${c3}" opacity="0.6"/>
      <text x="200" y="160" text-anchor="middle" font-size="36" fill="white" dominant-baseline="central">${product.emoji}</text>
      <!-- Decorative rings -->
      <circle cx="200" cy="150" r="70" fill="none" stroke="${c1}" stroke-width="0.5" opacity="0.4"/>
      <circle cx="200" cy="150" r="90" fill="none" stroke="${c1}" stroke-width="0.3" opacity="0.2"/>
      <circle cx="200" cy="150" r="110" fill="none" stroke="${c1}" stroke-width="0.2" opacity="0.1"/>
      <!-- Particles -->
      <circle cx="120" cy="80" r="2" fill="${c1}" opacity="0.6"><animate attributeName="opacity" values="0.6;0.1;0.6" dur="3s" repeatCount="indefinite"/></circle>
      <circle cx="300" cy="90" r="1.5" fill="${c1}" opacity="0.4"><animate attributeName="opacity" values="0.4;0.1;0.4" dur="4s" repeatCount="indefinite"/></circle>
      <circle cx="80" cy="200" r="1" fill="${c2}" opacity="0.5"><animate attributeName="opacity" values="0.5;0.1;0.5" dur="2.5s" repeatCount="indefinite"/></circle>
      <circle cx="320" cy="220" r="2" fill="${c2}" opacity="0.3"><animate attributeName="opacity" values="0.3;0.1;0.3" dur="3.5s" repeatCount="indefinite"/></circle>
      <circle cx="160" cy="250" r="1.5" fill="${c1}" opacity="0.4"><animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite"/></circle>
    </svg>
  `;
}

// ──────────────────────────────────────────────
// Render Products
// ──────────────────────────────────────────────
function renderProducts() {
  const grid = $('#products-grid');
  if (!grid) return;

  const filtered = products.filter(p => {
    const matchCat = activeCategory === 'todos' || p.category === activeCategory;
    const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery) || p.description.toLowerCase().includes(searchQuery);
    return matchCat && matchSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 4rem 0; color: var(--text-muted);">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
        <p>Nenhum anti-produto encontrado. Talvez isso seja um sinal.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(product => {
    const badgeClass = product.badge === 'new' ? 'badge-new' : product.badge === 'hot' ? 'badge-hot' : 'badge-eco';
    const badgeLabel = product.badge === 'new' ? 'Novo' : product.badge === 'hot' ? '🔥 Quente' : '🌿 Eco';

    const imageContent = product.hasImage
      ? `<img src="${product.image}" alt="${product.name}" loading="lazy">`
      : generateProductSVG(product);

    return `
      <div class="product-card reveal" id="product-${product.id}">
        <div class="card-image">
          ${imageContent}
          <span class="card-badge ${badgeClass}">${badgeLabel}</span>
        </div>
        <div class="card-body">
          <div class="card-category">${product.category}</div>
          <h4 class="card-title">${product.name}</h4>
          <p class="card-desc">${product.description}</p>
          <div class="card-footer">
            <span class="card-price">R$ ${product.price.toFixed(2).replace('.', ',')}<small>/un</small></span>
            <button class="add-to-cart-btn" onclick="handleAddToCart(${product.id})" title="Adicionar ao carrinho" id="add-btn-${product.id}">+</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Re-trigger scroll reveal for new elements
  setTimeout(() => {
    $$('.product-card.reveal').forEach(el => {
      if (isInViewport(el)) el.classList.add('visible');
    });
  }, 50);
}

// ──────────────────────────────────────────────
// Add to Cart with Anti-Marketing
// ──────────────────────────────────────────────
function handleAddToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  // Show anti-marketing modal every 2nd add (first time always shows)
  antiMessageCount++;
  if (antiMessageCount <= 2 || antiMessageCount % 3 === 0) {
    pendingProduct = product;
    showAntiModal();
    return;
  }

  addToCart(product);
}

function addToCart(product) {
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart();
  updateCartUI();

  // Animate button
  const btn = $(`#add-btn-${product.id}`);
  if (btn) {
    btn.classList.add('added');
    btn.textContent = '✓';
    setTimeout(() => {
      btn.classList.remove('added');
      btn.textContent = '+';
    }, 600);
  }

  showToast(`${product.emoji} ${product.name} adicionado ao carrinho!`);
}

// ──────────────────────────────────────────────
// Anti-Marketing Modal
// ──────────────────────────────────────────────
function showAntiModal() {
  const msg = antiMessages[Math.floor(Math.random() * antiMessages.length)];
  const overlay = $('#anti-overlay');

  $('#anti-icon').textContent = msg.icon;
  $('#anti-title').textContent = msg.title;
  $('#anti-text').textContent = msg.text;

  const confirmBtn = $('#anti-confirm');
  const breatheBar = $('#breathe-bar');
  const breatheFill = $('#breathe-fill');

  // Reset
  breatheBar.style.display = 'none';
  confirmBtn.disabled = false;
  confirmBtn.textContent = 'Comprar mesmo assim';

  if (msg.type === 'breathe') {
    breatheBar.style.display = 'block';
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Respire...';

    let progress = 0;
    const interval = setInterval(() => {
      progress += 1;
      breatheFill.style.width = progress + '%';
      if (progress >= 100) {
        clearInterval(interval);
        confirmBtn.disabled = false;
        confirmBtn.textContent = '😤 Comprar mesmo assim';
      }
    }, 30);
  } else if (msg.type === 'timer') {
    confirmBtn.disabled = true;
    let count = 5;
    confirmBtn.textContent = `Aguarde ${count}s...`;
    const interval = setInterval(() => {
      count--;
      confirmBtn.textContent = `Aguarde ${count}s...`;
      if (count <= 0) {
        clearInterval(interval);
        confirmBtn.disabled = false;
        confirmBtn.textContent = '⏱️ Comprar agora!';
      }
    }, 1000);
  }

  confirmBtn.onclick = () => {
    if (pendingProduct) {
      addToCart(pendingProduct);
      pendingProduct = null;
    }
    closeAntiModal();
  };

  overlay.classList.add('active');
}

function closeAntiModal() {
  $('#anti-overlay').classList.remove('active');
  pendingProduct = null;
}

// ──────────────────────────────────────────────
// Cart UI
// ──────────────────────────────────────────────
function updateCartUI() {
  const countEl = $('.cart-count');
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  if (countEl) {
    countEl.textContent = totalItems;
    countEl.classList.toggle('visible', totalItems > 0);
  }

  renderCartItems();
}

function renderCartItems() {
  const container = $('#cart-items');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <div class="empty-icon">🛒</div>
        <p>Seu carrinho está vazio.<br><small>E talvez devesse ficar assim...</small></p>
      </div>
    `;
    updateCartTotals();
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item" id="cart-item-${item.id}">
      <div class="item-thumb">${item.emoji}</div>
      <div class="item-info">
        <div class="item-name">${item.name}</div>
        <div class="item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</div>
        <div class="item-controls">
          <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
          <span class="item-qty">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
          <button class="remove-item-btn" onclick="removeItem(${item.id})" title="Remover">🗑️</button>
        </div>
      </div>
    </div>
  `).join('');

  updateCartTotals();
}

function updateCartTotals() {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const subtotalEl = $('#cart-subtotal');
  const taxEl = $('#cart-tax');
  const totalEl = $('#cart-total');

  if (subtotalEl) subtotalEl.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
  if (taxEl) taxEl.textContent = `R$ ${tax.toFixed(2).replace('.', ',')}`;
  if (totalEl) totalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;

  const checkoutBtn = $('#checkout-btn');
  if (checkoutBtn) checkoutBtn.disabled = cart.length === 0;
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== id);
  }

  saveCart();
  updateCartUI();
}

function removeItem(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  updateCartUI();
  showToast('🗑️ Item removido do carrinho');
}

function toggleCart() {
  const drawer = $('#cart-drawer');
  const overlay = $('#cart-overlay');
  const isOpen = drawer.classList.contains('active');

  if (isOpen) {
    drawer.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  } else {
    drawer.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function saveCart() {
  localStorage.setItem('antivendas-cart', JSON.stringify(cart));
}

// ──────────────────────────────────────────────
// Checkout
// ──────────────────────────────────────────────
function openCheckout() {
  if (cart.length === 0) return;
  toggleCart(); // close cart drawer
  setTimeout(() => {
    checkoutStep = 0;
    updateCheckoutStep();
    $('#checkout-overlay').classList.add('active');
    document.body.style.overflow = 'hidden';
  }, 300);
}

function closeCheckout() {
  $('#checkout-overlay').classList.remove('active');
  document.body.style.overflow = '';
}

function updateCheckoutStep() {
  // Update step indicators
  $$('.checkout-step').forEach((step, i) => {
    step.classList.remove('active', 'completed');
    if (i < checkoutStep) step.classList.add('completed');
    if (i === checkoutStep) step.classList.add('active');
  });

  $$('.step-line').forEach((line, i) => {
    line.classList.toggle('active', i < checkoutStep);
  });

  // Show/hide forms
  $$('.checkout-form').forEach((form, i) => {
    form.classList.toggle('active', i === checkoutStep);
  });

  // Navigation buttons
  const backBtn = $('#checkout-back');
  const nextBtn = $('#checkout-next');

  if (backBtn) {
    backBtn.style.visibility = checkoutStep === 0 ? 'hidden' : 'visible';
    backBtn.textContent = '← Voltar';
  }

  if (nextBtn) {
    if (checkoutStep === 2) {
      nextBtn.textContent = '🎉 Finalizar Pedido';
    } else {
      nextBtn.textContent = 'Continuar →';
    }
  }
}

function nextCheckoutStep() {
  if (checkoutStep < 2) {
    checkoutStep++;
    updateCheckoutStep();
  } else {
    completeCheckout();
  }
}

function prevCheckoutStep() {
  if (checkoutStep > 0) {
    checkoutStep--;
    updateCheckoutStep();
  }
}

function completeCheckout() {
  const orderId = 'AV-' + Date.now().toString(36).toUpperCase();

  // Show success
  $$('.checkout-form').forEach(f => f.classList.remove('active'));
  $$('.checkout-step').forEach(s => s.classList.add('completed'));
  $$('.step-line').forEach(l => l.classList.add('active'));

  const successEl = $('#checkout-success');
  successEl.classList.add('active');
  $('#order-id').textContent = orderId;

  // Hide nav buttons
  $('#checkout-back').style.display = 'none';
  $('#checkout-next').style.display = 'none';

  // Show close button
  const closeBtn = document.createElement('button');
  closeBtn.className = 'btn btn-primary';
  closeBtn.textContent = '✨ Voltar à loja';
  closeBtn.style.margin = '0 auto';
  closeBtn.style.display = 'flex';
  closeBtn.onclick = () => {
    closeCheckout();
    cart = [];
    saveCart();
    updateCartUI();
    successEl.classList.remove('active');
    closeBtn.remove();
    $('#checkout-back').style.display = '';
    $('#checkout-next').style.display = '';
  };
  successEl.appendChild(closeBtn);

  showToast('🎉 Pedido realizado com sucesso!');
}

// ──────────────────────────────────────────────
// Toast Notifications
// ──────────────────────────────────────────────
function showToast(message) {
  const container = $('#toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span class="toast-icon">✨</span>
    <span class="toast-text">${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => toast.remove(), 3200);
}

// ──────────────────────────────────────────────
// Navigation Scroll Effect
// ──────────────────────────────────────────────
function setupNavScroll() {
  const navbar = $('.navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });
}

// ──────────────────────────────────────────────
// Scroll Reveal
// ──────────────────────────────────────────────
function isInViewport(el) {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight - 80;
}

function setupScrollReveal() {
  const revealOnScroll = () => {
    $$('.reveal').forEach(el => {
      if (isInViewport(el)) el.classList.add('visible');
    });
  };

  window.addEventListener('scroll', revealOnScroll);
  revealOnScroll();
}

// ──────────────────────────────────────────────
// Mobile Menu
// ──────────────────────────────────────────────
function setupMobileMenu() {
  const btn = $('.mobile-menu-btn');
  const links = $('.nav-links');
  if (!btn || !links) return;

  btn.addEventListener('click', () => {
    links.classList.toggle('open');
  });
}

// ──────────────────────────────────────────────
// Animated Stats Counter
// ──────────────────────────────────────────────
function animateStats() {
  const stats = $$('.stat-number');
  stats.forEach(stat => {
    const target = parseInt(stat.dataset.target);
    if (isNaN(target)) return;

    let current = 0;
    const increment = Math.ceil(target / 60);
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      stat.textContent = current.toLocaleString('pt-BR');
    }, 30);
  });
}

// Smooth scroll for nav links
document.addEventListener('click', (e) => {
  if (e.target.matches('a[href^="#"]')) {
    e.preventDefault();
    const target = document.querySelector(e.target.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Close mobile menu if open
      $('.nav-links')?.classList.remove('open');
    }
  }
});
