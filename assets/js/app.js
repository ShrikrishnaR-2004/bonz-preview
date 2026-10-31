/* BONZ storefront preview: shared core (header, footer, cart, wishlist, search) */
(function () {
  'use strict';
  const PRODUCTS = window.BONZ_PRODUCTS || [];
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
  const bySlug = (s) => PRODUCTS.find((p) => p.slug === s);

  /* ---------- storage (falls back to memory if blocked) ---------- */
  const mem = {};
  const load = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return mem[k] !== undefined ? mem[k] : d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { mem[k] = v; } };

  const State = { cart: load('bonz_cart', []), wish: load('bonz_wish', []), coupon: load('bonz_coupon', null) };
  const persist = () => { save('bonz_cart', State.cart); save('bonz_wish', State.wish); save('bonz_coupon', State.coupon); };

  /* ---------- icons ---------- */
  const IC = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
    heart: '<path d="M12 20.5s-8-5-8-11a4.5 4.5 0 0 1 8-2.8 4.5 4.5 0 0 1 8 2.8c0 6-8 11-8 11z"/>',
    bag: '<path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    truck: '<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/><path d="m9 12 2 2 4-4"/>',
    return: '<path d="M4 12a8 8 0 1 0 3-6.2"/><path d="M4 4v5h5"/>',
    headset: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    check: '<path d="m5 12 5 5 9-10"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    chat: '<path d="M21 12a9 9 0 1 1-3.4-7L21 3l-1 4.3A9 9 0 0 1 21 12z"/><path d="M8.5 9.5c.5 2.5 2.5 4.5 5 5l1.5-1.5-2-1-1 .8c-1-.4-1.800-1.200-2.200-2.200l.8-1-1-2z"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    bolt: '<path d="M13 3 5 14h6l-1 7 8-11h-6l1-7z"/>',
    home: '<path d="M4 11 12 4l8 7v9h-5v-6H9v6H4z"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
    pin: '<path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.800 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    phone: '<path d="M5 4h4l2 5-2.500 1.500a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    battery: '<rect x="3" y="8" width="16" height="9" rx="2"/><path d="M21 11v3M7 11v3M11 11v3"/>',
    drop: '<path d="M12 3s6 6.500 6 11a6 6 0 0 1-12 0c0-4.500 6-11 6-11z"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    tag: '<path d="M3 12V4h8l10 10-8 8L3 12z"/><circle cx="7.500" cy="8.500" r="1.200"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    package: '<path d="M3 8l9-5 9 5v8l-9 5-9-5V8z"/><path d="M3 8l9 5 9-5M12 13v8"/>'
  };
  const icon = (n, cls) => '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true">' + IC[n] + '</svg>';
  const starSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>';
  const stars = (r) => '<span class="stars" role="img" aria-label="Rated ' + r + ' out of 5">' + [1, 2, 3, 4, 5].map((i) => '<i class="' + (r >= i - 0.25 ? 'on' : '') + '">' + starSvg + '</i>').join('') + '</span>';

  /* ---------- cart maths ---------- */
  const COUPONS = { BONZ10: { type: 'pct', value: 10, label: '10% off (demo code)' } };
  function lineItems() {
    return State.cart.map((l) => { const p = bySlug(l.slug); return p ? Object.assign({ p }, l) : null; }).filter(Boolean);
  }
  function totals() {
    const items = lineItems();
    const subtotal = items.reduce((s, l) => s + l.p.price * l.qty, 0);
    const mrp = items.reduce((s, l) => s + l.p.mrp * l.qty, 0);
    let discount = 0;
    const c = State.coupon && COUPONS[State.coupon];
    if (c) discount = Math.round(subtotal * c.value / 100);
    return { items, count: items.reduce((s, l) => s + l.qty, 0), subtotal, mrp, savings: mrp - subtotal, discount, shipping: 0, total: subtotal - discount };
  }
  const key = (slug, color) => slug + '|' + (color || '');
  function addToCart(slug, qty, color) {
    qty = qty || 1;
    const l = State.cart.find((x) => key(x.slug, x.color) === key(slug, color));
    if (l) l.qty = Math.min(10, l.qty + qty); else State.cart.push({ slug, qty, color: color || '' });
    persist(); refresh(); openDrawer();
  }
  function setQty(slug, color, qty) {
    const l = State.cart.find((x) => key(x.slug, x.color) === key(slug, color));
    if (!l) return;
    l.qty = Math.max(1, Math.min(10, qty)); persist(); refresh();
  }
  function removeLine(slug, color) {
    State.cart = State.cart.filter((x) => key(x.slug, x.color) !== key(slug, color)); persist(); refresh();
  }
  function toggleWish(slug) {
    const i = State.wish.indexOf(slug);
    if (i >= 0) { State.wish.splice(i, 1); toast('Removed from wishlist'); } else { State.wish.push(slug); toast('Saved to wishlist'); }
    persist(); refresh();
  }
  function clearCart() { State.cart = []; State.coupon = null; persist(); refresh(); }
  function applyCoupon(code) {
    code = (code || '').trim().toUpperCase();
    if (!COUPONS[code]) return false;
    State.coupon = code; persist(); refresh(); return true;
  }
  function removeCoupon() { State.coupon = null; persist(); refresh(); }

  /* ---------- product card ---------- */
  function card(p) {
    const wished = State.wish.indexOf(p.slug) >= 0;
    const colors = p.colors.slice(0, 5).map((c) => '<i style="background:' + c.hex + '" title="' + c.name + '"></i>').join('');
    const more = p.colors.length > 5 ? '<em>+' + (p.colors.length - 5) + '</em>' : '';
    return '<article class="card">' +
      '<a class="card-media" href="product.html?p=' + p.slug + '" aria-label="' + p.name + '">' +
      (p.off >= 50 ? '<span class="badge badge-red">' + p.off + '% off</span>' : (p.off ? '<span class="badge">' + p.off + '% off</span>' : '')) +
      '<img loading="lazy" src="' + p.images[0] + '" alt="' + p.name + '"></a>' +
      '<button class="wish ' + (wished ? 'on' : '') + '" data-wish="' + p.slug + '" aria-label="' + (wished ? 'Remove from' : 'Add to') + ' wishlist" aria-pressed="' + wished + '">' + icon('heart') + '</button>' +
      '<div class="card-body">' +
      '<span class="card-cat">' + p.catName + '</span>' +
      '<h3 class="card-title"><a href="product.html?p=' + p.slug + '">' + p.name + '</a></h3>' +
      (p.reviews ? '<div class="card-rate">' + stars(p.rating) + '<small>(' + p.reviews + ')</small></div>' : '<div class="card-rate none"><small>Be the first to review</small></div>') +
      '<div class="card-foot"><div class="price"><b>' + inr(p.price) + '</b>' + (p.mrp > p.price ? '<s>' + inr(p.mrp) + '</s>' : '') + '</div>' +
      (colors ? '<div class="dots" aria-label="' + p.colors.length + ' colours">' + colors + more + '</div>' : '') + '</div>' +
      '<button class="btn btn-ghost btn-sm card-add" data-add="' + p.slug + '">' + icon('bag') + ' Add to cart</button>' +
      '</div></article>';
  }

  /* ---------- header / footer ---------- */
  const CATS = [
    ['earbuds', 'Earbuds'], ['neckbands', 'Neckbands'], ['earphones', 'Earphones'], ['soundbars', 'Soundbars'],
    ['party-speakers', 'Party Speakers'], ['power-banks', 'Power Banks'], ['chargers', 'Chargers'], ['cables', 'Cables']
  ];
  function header() {
    const page = document.body.dataset.page || '';
    const nav = CATS.map((c) => '<a href="shop.html?cat=' + c[0] + '"' + (new URLSearchParams(location.search).get('cat') === c[0] ? ' aria-current="page"' : '') + '>' + c[1] + '</a>').join('');
    return '<div class="announce"><div class="wrap"><span>' + icon('truck') + ' Free shipping across India</span><span class="hide-sm">Made in India · Warranty support on every product</span><a href="shop.html?sort=discount">See today\'s offers ' + icon('arrow') + '</a></div></div>' +
      '<header class="hdr"><div class="wrap hdr-row">' +
      '<button class="icon-btn only-mobile" data-open="menu" aria-label="Open menu">' + icon('menu') + '</button>' +
      '<a class="logo" href="index.html" aria-label="BONZ home"><img src="assets/img/logo.jpg" alt="BONZ" width="120" height="40"></a>' +
      '<form class="search" role="search" action="shop.html" autocomplete="off">' + icon('search') +
      '<input type="search" name="q" placeholder="Search earbuds, soundbars, power banks…" aria-label="Search products" value="' + (page === 'shop' ? (new URLSearchParams(location.search).get('q') || '').replace(/"/g, '&quot;') : '') + '">' +
      '<div class="suggest" hidden></div></form>' +
      '<div class="hdr-actions">' +
      '<button class="icon-btn only-mobile" data-open="search" aria-label="Search">' + icon('search') + '</button>' +
      '<a class="icon-btn hide-sm" href="account.html" aria-label="Account">' + icon('user') + '<span class="lbl">Account</span></a>' +
      '<a class="icon-btn hide-sm" href="wishlist.html" aria-label="Wishlist">' + icon('heart') + '<span class="lbl">Wishlist</span><b class="count" data-count="wish"></b></a>' +
      '<button class="icon-btn" data-open="cart" aria-label="Open cart">' + icon('bag') + '<span class="lbl hide-sm">Cart</span><b class="count" data-count="cart"></b></button>' +
      '</div></div>' +
      '<nav class="catnav hide-sm" aria-label="Categories"><div class="wrap"><a href="shop.html"' + (page === 'shop' && !location.search ? ' aria-current="page"' : '') + '>All products</a>' + nav + '<a class="hot" href="shop.html?sort=discount">Offers</a></div></nav>' +
      '</header>';
  }
  function mobileBits() {
    const page = document.body.dataset.page || '';
    const a = (p, href, ic, label) => '<a href="' + href + '"' + (page === p ? ' aria-current="page"' : '') + '>' + icon(ic) + '<span>' + label + '</span></a>';
    return '<nav class="tabbar only-mobile" aria-label="Quick navigation">' + a('home', 'index.html', 'home', 'Home') + a('shop', 'shop.html', 'grid', 'Shop') +
      a('wishlist', 'wishlist.html', 'heart', 'Wishlist') + '<button data-open="cart" aria-label="Cart">' + icon('bag') + '<span>Cart</span><b class="count" data-count="cart"></b></button>' + a('account', 'account.html', 'user', 'Account') + '</nav>' +
      '<aside class="drawer drawer-left" id="menu" aria-hidden="true" aria-label="Menu"><div class="drawer-head"><img src="assets/img/logo.jpg" alt="BONZ" width="96" height="32"><button class="icon-btn" data-close aria-label="Close menu">' + icon('close') + '</button></div><div class="drawer-body menu-list">' +
      '<a href="shop.html">All products</a>' + CATS.map((c) => '<a href="shop.html?cat=' + c[0] + '">' + c[1] + '</a>').join('') + '<a class="hot" href="shop.html?sort=discount">Offers</a><hr>' +
      '<a href="about.html">About BONZ</a><a href="faq.html">FAQs</a><a href="contact.html">Contact us</a><a href="policy.html?p=returns">Returns &amp; refunds</a><a href="policy.html?p=shipping">Shipping</a></div></aside>' +
      '<div class="searchsheet" id="searchsheet" aria-hidden="true"><form action="shop.html" autocomplete="off">' + icon('search') + '<input type="search" name="q" placeholder="Search products" aria-label="Search products"><button type="button" class="icon-btn" data-close aria-label="Close search">' + icon('close') + '</button><div class="suggest" hidden></div></form></div>';
  }
  function drawerHtml() {
    return '<aside class="drawer drawer-right" id="cart" aria-hidden="true" aria-label="Shopping cart"><div class="drawer-head"><h2>Your cart <small data-count-text="cart"></small></h2><button class="icon-btn" data-close aria-label="Close cart">' + icon('close') + '</button></div>' +
      '<div class="drawer-body" id="cart-lines"></div><div class="drawer-foot" id="cart-foot"></div></aside><div class="scrim" data-close hidden></div>';
  }
  function footer() {
    return '<section class="newsletter"><div class="wrap nl-row"><div><h2>Get early access to new launches &amp; offers</h2><p>One email a month. No spam, unsubscribe anytime.</p></div>' +
      '<form class="nl-form" id="nl"><label class="sr" for="nl-email">Email address</label><input id="nl-email" type="email" placeholder="Enter your email" required><button class="btn btn-red" type="submit">Subscribe</button><p class="nl-msg" role="status" hidden></p></form></div></section>' +
      '<footer class="ftr"><div class="wrap ftr-grid">' +
      '<div class="ftr-brand"><img src="assets/img/logo.jpg" alt="BONZ" width="120" height="40"><p>Sound for every moment. Audio and charging essentials, proudly made in India.</p>' +
      '<div class="social"><a href="https://www.instagram.com/bonz.lifestyle" target="_blank" rel="noopener" aria-label="BONZ on Instagram">Instagram</a><a href="https://www.facebook.com/people/bonz/61591663240203/" target="_blank" rel="noopener" aria-label="BONZ on Facebook">Facebook</a></div></div>' +
      '<div><h3>Shop</h3><ul>' + CATS.slice(0, 6).map((c) => '<li><a href="shop.html?cat=' + c[0] + '">' + c[1] + '</a></li>').join('') + '<li><a href="shop.html?sort=discount">Offers</a></li></ul></div>' +
      '<div><h3>Help</h3><ul><li><a href="faq.html">FAQs</a></li><li><a href="policy.html?p=shipping">Shipping</a></li><li><a href="policy.html?p=returns">Returns &amp; refunds</a></li><li><a href="policy.html?p=warranty">Warranty</a></li><li><a href="account.html">Track an order</a></li><li><a href="contact.html">Contact us</a></li></ul></div>' +
      '<div><h3>Company</h3><ul><li><a href="about.html">About BONZ</a></li><li><a href="policy.html?p=privacy">Privacy policy</a></li><li><a href="policy.html?p=terms">Terms &amp; conditions</a></li></ul>' +
      '<h3 class="mt">We accept</h3><div class="pay"><span>UPI</span><span>Cards</span><span>Net banking</span><span>COD</span></div></div>' +
      '</div><div class="wrap ftr-legal"><span>© 2026 BONZ. All rights reserved.</span><span>Sruthisagara Innovations Pvt Ltd · GST 36ABRCS2581F1ZY · CIN U47414TS2025PTC203698</span></div></footer>' +
      '<a class="wa" href="https://wa.me/919848454549" target="_blank" rel="noopener" aria-label="Chat with BONZ on WhatsApp">' + icon('chat') + '<span>Chat with us</span></a>' +
      '<div class="toast" id="toast" role="status" aria-live="polite"></div>';
  }

  /* ---------- UI plumbing ---------- */
  let toastT;
  function toast(msg) {
    const t = $('#toast'); if (!t) return;
    t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2200);
  }
  function openDrawer(id) {
    const d = $('#' + (id || 'cart')); if (!d) return;
    d.classList.add('open'); d.setAttribute('aria-hidden', 'false');
    const s = $('.scrim'); s.hidden = false; requestAnimationFrame(() => s.classList.add('show'));
    document.body.classList.add('lock');
  }
  function closeAll() {
    $$('.drawer.open').forEach((d) => { d.classList.remove('open'); d.setAttribute('aria-hidden', 'true'); });
    const ss = $('#searchsheet'); if (ss) { ss.classList.remove('open'); ss.setAttribute('aria-hidden', 'true'); }
    const s = $('.scrim'); if (s) { s.classList.remove('show'); setTimeout(() => { s.hidden = true; }, 200); }
    document.body.classList.remove('lock');
  }
  function lineHtml(l, compact) {
    return '<div class="line">' +
      '<a class="line-img" href="product.html?p=' + l.p.slug + '"><img src="' + l.p.images[0] + '" alt="' + l.p.name + '"></a>' +
      '<div class="line-info"><a class="line-name" href="product.html?p=' + l.p.slug + '">' + l.p.name + '</a>' +
      (l.color ? '<span class="line-meta">Colour: ' + l.color + '</span>' : '') +
      '<div class="line-row"><div class="qty" role="group" aria-label="Quantity"><button data-qty="-1" data-slug="' + l.slug + '" data-color="' + l.color + '" aria-label="Decrease">' + icon('minus') + '</button><span>' + l.qty + '</span><button data-qty="1" data-slug="' + l.slug + '" data-color="' + l.color + '" aria-label="Increase">' + icon('plus') + '</button></div>' +
      '<div class="line-price"><b>' + inr(l.p.price * l.qty) + '</b>' + (l.p.mrp > l.p.price ? '<s>' + inr(l.p.mrp * l.qty) + '</s>' : '') + '</div></div></div>' +
      '<button class="line-x" data-remove data-slug="' + l.slug + '" data-color="' + l.color + '" aria-label="Remove ' + l.p.name + '">' + icon('trash') + '</button></div>';
  }
  function refresh() {
    const t = totals();
    $$('[data-count="cart"]').forEach((e) => { e.textContent = t.count; e.hidden = !t.count; });
    $$('[data-count="wish"]').forEach((e) => { e.textContent = State.wish.length; e.hidden = !State.wish.length; });
    $$('[data-count-text="cart"]').forEach((e) => { e.textContent = t.count ? '(' + t.count + ')' : ''; });
    const lines = $('#cart-lines'), foot = $('#cart-foot');
    if (lines) {
      if (!t.items.length) {
        lines.innerHTML = '<div class="empty"><div class="empty-ic">' + icon('bag') + '</div><h3>Your cart is empty</h3><p>Looks like you haven\'t added anything yet.</p><a class="btn btn-red" href="shop.html">Start shopping</a></div>';
        foot.innerHTML = '';
      } else {
        lines.innerHTML = t.items.map((l) => lineHtml(l)).join('');
        foot.innerHTML = '<div class="sum-row"><span>Subtotal</span><b>' + inr(t.subtotal) + '</b></div>' +
          (t.savings ? '<div class="sum-row save"><span>You save</span><b>' + inr(t.savings) + '</b></div>' : '') +
          '<p class="ship-note">' + icon('truck') + ' Free shipping on this order</p>' +
          '<a class="btn btn-red btn-block" href="checkout.html">Checkout ' + icon('arrow') + '</a><a class="btn btn-ghost btn-block" href="cart.html">View full cart</a>';
      }
    }
    $$('[data-wish]').forEach((b) => { const on = State.wish.indexOf(b.dataset.wish) >= 0; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    document.dispatchEvent(new CustomEvent('bonz:refresh', { detail: t }));
  }

  /* ---------- search suggestions ---------- */
  function suggestions(q) {
    q = q.trim().toLowerCase(); if (q.length < 2) return [];
    return PRODUCTS.filter((p) => (p.name + ' ' + p.catName).toLowerCase().indexOf(q) >= 0).slice(0, 6);
  }
  function wireSearch(form) {
    const input = $('input', form), box = $('.suggest', form);
    input.addEventListener('input', () => {
      const r = suggestions(input.value);
      if (input.value.trim().length < 2) { box.hidden = true; return; }
      box.innerHTML = r.length ? r.map((p) => '<a href="product.html?p=' + p.slug + '"><img src="' + p.images[0] + '" alt=""><span><b>' + p.name + '</b><small>' + p.catName + '</small></span><em>' + inr(p.price) + '</em></a>').join('') +
        '<a class="all" href="shop.html?q=' + encodeURIComponent(input.value.trim()) + '">See all results for "' + input.value.trim().replace(/</g, '&lt;') + '" ' + icon('arrow') + '</a>'
        : '<div class="none">No matches for "' + input.value.trim().replace(/</g, '&lt;') + '". Try "earbuds", "soundbar" or "power bank".</div>';
      box.hidden = false;
    });
    document.addEventListener('click', (e) => { if (!form.contains(e.target)) box.hidden = true; });
    input.addEventListener('keydown', (e) => { if (e.key === 'Escape') box.hidden = true; });
  }

  function init() {
    const h = $('#site-header'), f = $('#site-footer');
    if (h) h.innerHTML = header() + mobileBits() + drawerHtml();
    if (f) f.innerHTML = footer();
    $$('.search, #searchsheet form').forEach(wireSearch);

    document.addEventListener('click', (e) => {
      const t = e.target.closest('button,a,[data-open],[data-close]'); if (!t) return;
      if (t.matches('[data-add]')) { e.preventDefault(); addToCart(t.dataset.add, 1, t.dataset.color || ''); return; }
      if (t.matches('[data-wish]')) { e.preventDefault(); toggleWish(t.dataset.wish); return; }
      if (t.matches('[data-qty]')) { const l = State.cart.find((x) => key(x.slug, x.color) === key(t.dataset.slug, t.dataset.color)); if (l) { if (l.qty + (+t.dataset.qty) < 1) removeLine(t.dataset.slug, t.dataset.color); else setQty(t.dataset.slug, t.dataset.color, l.qty + (+t.dataset.qty)); } return; }
      if (t.matches('[data-remove]')) { removeLine(t.dataset.slug, t.dataset.color); toast('Removed from cart'); return; }
      if (t.matches('[data-open]')) {
        const w = t.dataset.open;
        if (w === 'search') { const s = $('#searchsheet'); s.classList.add('open'); s.setAttribute('aria-hidden', 'false'); setTimeout(() => $('input', s).focus(), 50); const sc = $('.scrim'); sc.hidden = false; requestAnimationFrame(() => sc.classList.add('show')); }
        else openDrawer(w);
        return;
      }
      if (t.matches('[data-close]')) closeAll();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAll(); });

    const nl = $('#nl');
    if (nl) nl.addEventListener('submit', (e) => { e.preventDefault(); const m = $('.nl-msg', nl); m.hidden = false; m.textContent = 'Thanks! You\'re on the list (preview only, nothing was sent).'; nl.reset(); });

    refresh();
    document.dispatchEvent(new CustomEvent('bonz:ready'));
  }

  window.BONZ = { PRODUCTS, $, $$, inr, bySlug, icon, stars, card, State, totals, addToCart, setQty, removeLine, clearCart, toggleWish, applyCoupon, removeCoupon, COUPONS, lineHtml, lineItems, toast, refresh, persist, CATS, load, save };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
