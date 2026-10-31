/* BONZ storefront preview: page logic */
(function () {
  'use strict';
  const B = window.BONZ; if (!B) return;
  const { PRODUCTS, $, $$, inr, bySlug, icon, stars, card, State, toast } = B;
  const q = new URLSearchParams(location.search);
  const page = document.body.dataset.page;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const catName = (slug) => (B.CATS.find((c) => c[0] === slug) || [])[1] || '';
  const FEATURED = ['bonz-maverick-400', 'bonz-earbud-k03', 'bonz-nexora-neckband', 'bonz-echos-beats-240', 'bonz-earbud-vortex', 'bonz-aero-c', 'bonz-vibex-pulse', 'bonz-earbud-k51'];
  const featured = () => FEATURED.map(bySlug).filter(Boolean);

  const SUM = {
    'bonz-charger': 'A fast USB wall charger for everyday charging at home, at work or on the go.',
    'bonz-cables': 'Data transfer and fast-charging cables for your phone, tablet and accessories.',
    'bonz-aero-c': 'Wired Type-C earphones with an in-line microphone, 12 mm drivers and magnetic earbuds.'
  };
  const nice = (p) => {
    if (SUM[p.slug]) return SUM[p.slug];
    const g = (k) => { const s = p.specs.find((x) => x[0].toLowerCase().indexOf(k) >= 0); return s ? s[1] : ''; };
    if (p.cat === 'earbuds') return 'True wireless earbuds with up to ' + g('battery life').replace('Up to ', '') + ' of battery, ' + g('driver size') + ' drivers, ENC noise cancellation, a low-latency gaming mode and ' + g('water resistance') + ' water resistance.';
    if (p.cat === 'neckbands') return 'A wireless neckband with up to ' + g('battery').replace(/^Up to /, '').replace(/ Long Battery Life/, '') + ' of battery, Bluetooth 5.3, ' + g('driver size') + ' drivers, ' + (g('water resistance').split(' ')[0] || 'IPX5') + ' water resistance and Type-C charging.';
    return p.summary.replace(/\s*–\s*/g, ' · ');
  };
  const R = {};

  /* ---------------- HOME ---------------- */
  R.home = function () {
    const cats = B.CATS.map((c) => {
      const list = PRODUCTS.filter((p) => p.cat === c[0]); if (!list.length) return '';
      const pic = list.slice().sort((a, b) => b.price - a.price)[0].images[0];
      return '<a class="cat" href="shop.html?cat=' + c[0] + '"><div><h3>' + c[1] + '</h3><small>' + list.length + (list.length > 1 ? ' products' : ' product') + '</small></div><img loading="lazy" src="' + pic + '" alt=""></a>';
    }).join('');
    $('#home-cats').innerHTML = cats;

    const tabs = [['all', 'Featured'], ['earbuds', 'Earbuds'], ['neckbands', 'Neckbands'], ['soundbars', 'Soundbars'], ['power-banks', 'Power banks']];
    $('#home-chips').innerHTML = tabs.map((t, i) => '<button class="chip' + (i ? '' : ' on') + '" data-tab="' + t[0] + '">' + t[1] + '</button>').join('');
    const draw = (k) => {
      const list = k === 'all' ? featured() : PRODUCTS.filter((p) => p.cat === k).slice(0, 8);
      $('#home-grid').innerHTML = list.map(card).join('');
    };
    draw('all');
    $('#home-chips').addEventListener('click', (e) => {
      const b = e.target.closest('[data-tab]'); if (!b) return;
      $$('#home-chips .chip').forEach((c) => c.classList.toggle('on', c === b)); draw(b.dataset.tab);
    });

    const m = bySlug('bonz-maverick-400');
    if (m) {
      $('#promo-price').innerHTML = '<b>' + inr(m.price) + '</b><s>' + inr(m.mrp) + '</s><span>' + m.off + '% off</span>';
      $('#promo-link').href = 'product.html?p=' + m.slug;
      $('#promo-add').dataset.add = m.slug;
    }
    $('#home-value').innerHTML = PRODUCTS.filter((p) => p.price <= 999).sort((a, b) => a.price - b.price).slice(0, 4).map(card).join('');
    document.addEventListener('bonz:refresh', () => { /* wish state handled globally */ });
  };

  /* ---------------- SHOP ---------------- */
  R.shop = function () {
    const S = { cat: q.get('cat') ? q.get('cat').split(',') : [], q: (q.get('q') || '').trim(), sort: q.get('sort') || 'featured', min: q.get('min') || '', max: q.get('max') || '', color: q.get('color') ? q.get('color').split(',') : [] };
    const allColors = {};
    PRODUCTS.forEach((p) => p.colors.forEach((c) => { allColors[c.name] = c.hex; }));
    const colorNames = Object.keys(allColors).sort();
    const maxPrice = Math.max.apply(null, PRODUCTS.map((p) => p.price));

    const sorters = {
      featured: (a, b) => (FEATURED.indexOf(a.slug) + 100) % 100 - (FEATURED.indexOf(b.slug) + 100) % 100 || b.off - a.off,
      'price-asc': (a, b) => a.price - b.price, 'price-desc': (a, b) => b.price - a.price,
      discount: (a, b) => b.off - a.off || a.price - b.price, rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews, newest: (a, b) => b.id - a.id
    };
    const filtered = () => PRODUCTS.filter((p) => {
      if (S.cat.length && S.cat.indexOf(p.cat) < 0) return false;
      if (S.q) { const hay = (p.name + ' ' + p.catName + ' ' + p.specs.map((s) => s.join(' ')).join(' ')).toLowerCase(); if (!S.q.toLowerCase().split(/\s+/).every((w) => hay.indexOf(w) >= 0)) return false; }
      if (S.min !== '' && p.price < +S.min) return false;
      if (S.max !== '' && p.price > +S.max) return false;
      if (S.color.length && !p.colors.some((c) => S.color.indexOf(c.name) >= 0)) return false;
      return true;
    }).sort(sorters[S.sort] || sorters.featured);

    const url = () => {
      const p = new URLSearchParams();
      if (S.cat.length) p.set('cat', S.cat.join(',')); if (S.q) p.set('q', S.q); if (S.sort !== 'featured') p.set('sort', S.sort);
      if (S.min !== '') p.set('min', S.min); if (S.max !== '') p.set('max', S.max); if (S.color.length) p.set('color', S.color.join(','));
      history.replaceState(null, '', 'shop.html' + (p.toString() ? '?' + p : ''));
    };

    const filtersHtml = () => {
      const counts = {}; PRODUCTS.forEach((p) => { counts[p.cat] = (counts[p.cat] || 0) + 1; });
      return '<button class="btn btn-dark btn-sm fclose only-tablet" data-fclose>' + icon('close') + ' Close</button>' +
        '<div class="fgroup"><h3>Category</h3>' + B.CATS.filter((c) => counts[c[0]]).map((c) => '<label class="check"><input type="checkbox" data-f="cat" value="' + c[0] + '"' + (S.cat.indexOf(c[0]) >= 0 ? ' checked' : '') + '>' + c[1] + '<small>' + counts[c[0]] + '</small></label>').join('') + '</div>' +
        '<div class="fgroup"><h3>Price (₹)</h3><div class="range"><input type="number" inputmode="numeric" min="0" placeholder="Min" aria-label="Minimum price" data-f="min" value="' + esc(S.min) + '"><span>to</span><input type="number" inputmode="numeric" min="0" placeholder="' + maxPrice + '" aria-label="Maximum price" data-f="max" value="' + esc(S.max) + '"></div>' +
        '<div class="swatches" style="margin-top:12px">' + [['Under ₹500', '', 499], ['₹500 – ₹1,000', 500, 1000], ['Above ₹5,000', 5000, '']].map((r) => '<button class="chip" data-range="' + r[1] + ',' + r[2] + '">' + r[0] + '</button>').join('') + '</div></div>' +
        '<div class="fgroup"><h3>Colour</h3><div class="swatches">' + colorNames.map((n) => '<button class="sw' + (S.color.indexOf(n) >= 0 ? ' on' : '') + '" data-color="' + n + '" style="background:' + allColors[n] + '" title="' + n + '" aria-label="' + n + '" aria-pressed="' + (S.color.indexOf(n) >= 0) + '"></button>').join('') + '</div></div>' +
        '<button class="btn btn-red fapply only-tablet" data-fclose>Show results</button><button class="btn btn-ghost btn-sm" data-clear>Clear all filters</button>';
    };

    const draw = () => {
      const list = filtered();
      const title = S.q ? 'Results for "' + esc(S.q) + '"' : (S.cat.length === 1 ? catName(S.cat[0]) : 'All products');
      document.title = title.replace(/&quot;/g, '"') + ' | BONZ';
      $('#shop-title').innerHTML = title;
      $('#shop-sub').textContent = S.q ? 'Showing matches across all categories.' : 'Audio and charging essentials, made in India.';
      $('#shop-count').innerHTML = 'Showing <b>' + list.length + '</b> of ' + PRODUCTS.length + ' products';
      const pills = [];
      S.cat.forEach((c) => pills.push(['cat', c, catName(c)])); S.color.forEach((c) => pills.push(['color', c, c]));
      if (S.min !== '' || S.max !== '') pills.push(['price', '', (S.min !== '' ? inr(S.min) : '₹0') + ' – ' + (S.max !== '' ? inr(S.max) : 'any')]);
      if (S.q) pills.push(['q', '', '"' + S.q + '"']);
      $('#shop-pills').innerHTML = pills.map((p) => '<span class="pill">' + esc(p[2]) + '<button data-rm="' + p[0] + '" data-v="' + esc(p[1]) + '" aria-label="Remove filter ' + esc(p[2]) + '">' + icon('close') + '</button></span>').join('');
      $('#shop-grid').innerHTML = list.length ? list.map(card).join('') :
        '<div class="nores" style="grid-column:1/-1"><h3>No products match your filters</h3><p>Try removing a filter, or browse everything.</p><button class="btn btn-red" data-clear>Clear all filters</button></div>';
      $('#shop-sort').value = S.sort;
      $('#filters').innerHTML = filtersHtml();
      url();
    };

    document.addEventListener('change', (e) => {
      const t = e.target;
      if (t.matches('#shop-sort')) { S.sort = t.value; draw(); return; }
      if (t.dataset.f === 'cat') { S.cat = t.checked ? S.cat.concat(t.value) : S.cat.filter((c) => c !== t.value); draw(); }
      if (t.dataset.f === 'min') { S.min = t.value; draw(); }
      if (t.dataset.f === 'max') { S.max = t.value; draw(); }
    });
    document.addEventListener('click', (e) => {
      const t = e.target.closest('button'); if (!t) return;
      if (t.dataset.color) { const n = t.dataset.color; S.color = S.color.indexOf(n) >= 0 ? S.color.filter((c) => c !== n) : S.color.concat(n); draw(); }
      if (t.dataset.range !== undefined) { const r = t.dataset.range.split(','); S.min = r[0]; S.max = r[1]; draw(); }
      if (t.dataset.clear !== undefined) { S.cat = []; S.q = ''; S.min = ''; S.max = ''; S.color = []; draw(); }
      if (t.dataset.rm) { const k = t.dataset.rm; if (k === 'cat') S.cat = S.cat.filter((c) => c !== t.dataset.v); if (k === 'color') S.color = S.color.filter((c) => c !== t.dataset.v); if (k === 'price') { S.min = ''; S.max = ''; } if (k === 'q') S.q = ''; draw(); }
      if (t.dataset.fopen !== undefined) $('#filters').classList.add('open');
      if (t.dataset.fclose !== undefined) $('#filters').classList.remove('open');
    });
    draw();
  };

  /* ---------------- PRODUCT ---------------- */
  R.product = function () {
    const p = bySlug(q.get('p'));
    const root = $('#pdp-root');
    if (!p) { root.innerHTML = '<div class="empty" style="padding:90px 0"><h2>We couldn\'t find that product</h2><p>It may have been moved or renamed.</p><a class="btn btn-red" href="shop.html">Browse all products</a></div>'; return; }
    document.title = p.name + ' | BONZ';
    let color = p.colors.length ? p.colors[0].name : '', qty = 1, imgs = p.images, cur = 0;
    const spec = (k) => { const s = p.specs.find((x) => x[0].toLowerCase().indexOf(k) >= 0); return s ? s[1] : ''; };
    const hl = [];
    if (spec('battery life')) hl.push(['battery', spec('battery life'), 'Battery life']);
    if (spec('water')) hl.push(['drop', spec('water resistance').split(' ')[0], 'Water resistance']);
    if (spec('peak output')) hl.push(['bolt', spec('peak output'), 'Peak output']);
    if (spec('bluetooth')) hl.push(['bolt', 'Bluetooth ' + spec('bluetooth version').replace(/^Wireless Bluetooth /, ''), 'Connectivity']);
    else if (spec('connectivity')) hl.push(['bolt', spec('connectivity').replace('Wireless ', ''), 'Connectivity']);
    if (spec('driver size')) hl.push(['bolt', spec('driver size'), 'Driver size']);
    if (spec('charging port')) hl.push(['bolt', spec('charging port').replace(' Fast Charging', ''), 'Charging port']);
    if (p.specs.some((s) => /made in india/i.test(s[0] + s[1]))) hl.push(['flag', 'Made in India', 'Proudly']);
    const hlHtml = hl.slice(0, 4).map((h) => '<div>' + icon(h[0]) + '<span><b>' + esc(h[1]) + '</b><small>' + h[2] + '</small></span></div>').join('');

    const faqs = [
      ['How long does delivery take?', 'Most orders arrive in 3–7 working days. Enter your PIN code above for an estimate. <mark class="tbc">timeline to confirm</mark>'],
      ['Is cash on delivery available?', 'Yes. You can pay online with UPI or card, or choose cash on delivery at checkout.'],
      ['What if I need to return it?', 'You can request a return from our Returns &amp; refunds page. See <a href="policy.html?p=returns" style="color:var(--red);font-weight:600">the full policy</a>.'],
      ['Does it come with a warranty?', 'Yes, warranty support is included with every BONZ product. See <a href="policy.html?p=warranty" style="color:var(--red);font-weight:600">warranty details</a>.']
    ];
    if (p.cat === 'soundbars') faqs.unshift(['Can I connect it to my TV?', 'Yes. ' + (spec('inputs') ? 'It has ' + esc(spec('inputs')) + ' inputs, plus Bluetooth.' : 'It supports Bluetooth and wired inputs.') + ' The subwoofer is wired.']);
    if (/IPX/.test(spec('water'))) faqs.unshift(['What does ' + (spec('water').match(/IPX\d/) || ['IPX'])[0] + ' mean?', 'It is a water-resistance rating. IPX4 handles splashes and sweat; IPX5 handles water jets. It is not meant for swimming.']);

    const related = PRODUCTS.filter((x) => x.cat === p.cat && x.slug !== p.slug).concat(featured().filter((x) => x.cat !== p.cat)).slice(0, 4);
    const wished = () => State.wish.indexOf(p.slug) >= 0;

    const render = () => {
      imgs = p.variants ? (p.variants.find((v) => v.name === color) || p.variants[0]).images : p.images;
      root.innerHTML =
        '<nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span><a href="shop.html">Shop</a></span><span><a href="shop.html?cat=' + p.cat + '">' + p.catName + '</a></span><span>' + esc(p.name) + '</span></nav>' +
        '<div class="pdp"><div class="gallery"><div class="thumbs">' + imgs.map((s, i) => '<button class="' + (i === cur ? 'on' : '') + '" data-th="' + i + '" aria-label="View image ' + (i + 1) + '"><img src="' + s + '" alt=""></button>').join('') + '</div>' +
        '<div class="stage" id="stage">' + (p.off ? '<span class="badge badge-red">' + p.off + '% off</span>' : '') + '<img id="stage-img" src="' + imgs[cur] + '" alt="' + esc(p.name) + (color ? ' in ' + color : '') + '"></div></div>' +
        '<div class="pinfo"><span class="eyebrow">' + p.catName + '</span><h1>' + esc(p.name) + '</h1>' +
        '<div class="meta">' + (p.reviews ? stars(p.rating) + '<a href="#reviews" data-gotab="reviews">' + p.reviews + ' review' + (p.reviews > 1 ? 's' : '') + '</a>' : '<a href="#reviews" data-gotab="reviews">Be the first to review</a>') + '<span>SKU ' + p.sku + '</span><span style="color:var(--green);font-weight:600">● In stock</span></div>' +
        '<div class="pprice"><b>' + inr(p.price) + '</b>' + (p.mrp > p.price ? '<s>' + inr(p.mrp) + '</s><span>Save ' + inr(p.mrp - p.price) + ' (' + p.off + '%)</span>' : '') + '</div><p class="tax">Inclusive of all taxes. Free shipping across India.</p>' +
        '<p style="color:var(--ink-2)">' + esc(nice(p)) + '</p>' +
        (hlHtml ? '<div class="hl">' + hlHtml + '</div>' : '') +
        (p.colors.length ? '<div class="opt-l">Colour: <span id="color-name">' + color + '</span></div><div class="opt-sw">' + p.colors.map((c) => '<button class="' + (c.name === color ? 'on' : '') + '" data-pick="' + c.name + '" style="background:' + c.hex + '" title="' + c.name + '" aria-label="' + c.name + '" aria-pressed="' + (c.name === color) + '"></button>').join('') + '</div>' : '') +
        '<div class="buy"><div class="qty"><button data-q="-1" aria-label="Decrease quantity">' + icon('minus') + '</button><span id="q">' + qty + '</span><button data-q="1" aria-label="Increase quantity">' + icon('plus') + '</button></div>' +
        '<button class="btn btn-red" id="add">' + icon('bag') + ' Add to cart</button><button class="btn btn-dark" id="buy">Buy now</button>' +
        '<button class="wish-l ' + (wished() ? 'on' : '') + '" id="wl" aria-label="Save to wishlist" aria-pressed="' + wished() + '">' + icon('heart') + '</button></div>' +
        '<div class="pin"><h3>' + icon('pin') + ' Check delivery</h3><form id="pin-f"><input inputmode="numeric" maxlength="6" placeholder="Enter 6-digit PIN code" aria-label="PIN code" id="pin-i"><button class="btn btn-dark btn-sm">Check</button></form><p id="pin-m"></p></div>' +
        '<div class="assure"><div>' + icon('truck') + 'Free shipping</div><div>' + icon('shield') + 'Warranty support</div><div>' + icon('return') + 'Easy returns</div></div></div></div>' +
        '<div class="tabs" id="tabs"><div class="tab-btns" role="tablist">' + [['specs', 'Specifications'], ['about', 'Overview'], ['reviews', 'Reviews' + (p.reviews ? ' (' + p.reviews + ')' : '')], ['faq', 'FAQs']].map((t, i) => '<button role="tab" class="' + (i ? '' : 'on') + '" data-tab="' + t[0] + '">' + t[1] + '</button>').join('') + '</div>' +
        '<div class="tab on" id="t-specs">' + (p.specs.length ? '<table class="spec">' + p.specs.map((s) => '<tr><th>' + esc(s[0]) + '</th><td>' + esc(s[1]) + '</td></tr>').join('') + '</table>' : '<p>Specifications will be added soon.</p>') + '</div>' +
        '<div class="tab" id="t-about"><div class="prose"><p>' + esc(nice(p)) + '</p>' + (p.features.length ? '<ul>' + p.features.map((f) => '<li>' + esc(f) + '</li>').join('') + '</ul>' : '') + '</div></div>' +
        '<div class="tab" id="t-reviews">' + (p.reviews ? '<div class="rev-sum"><b>' + p.rating.toFixed(1) + '</b><div>' + stars(p.rating) + '<p style="margin-top:6px;color:var(--muted)">Based on ' + p.reviews + ' review' + (p.reviews > 1 ? 's' : '') + '</p></div></div>' : '<div class="rev-sum"><div><b style="font-size:24px">No reviews yet</b><p style="color:var(--muted);margin-top:6px">Bought this? Share your experience to help others.</p></div></div>') +
        '<form class="panel" id="rev-f" style="max-width:560px;margin-top:20px"><h3>Write a review</h3><div class="fld" style="margin-bottom:12px"><label for="rv-n">Your name</label><input id="rv-n" required></div><div class="fld" style="margin-bottom:12px"><label for="rv-t">Your review</label><textarea id="rv-t" required></textarea></div><button class="btn btn-dark">Submit review</button><p id="rev-m" class="coupon-msg ok" hidden>Thanks! Reviews are moderated, so yours will appear after approval (preview only).</p></form></div>' +
        '<div class="tab faq" id="t-faq">' + faqs.map((f) => '<details><summary>' + f[0] + icon('chevron') + '</summary><p>' + f[1] + '</p></details>').join('') + '</div></div>' +
        '<section class="sec-sm" style="padding-top:56px"><div class="sec-head"><h2 style="font-size:28px">You may also like</h2><a class="link-arrow" href="shop.html?cat=' + p.cat + '">View all ' + icon('arrow') + '</a></div><div class="grid">' + related.map(card).join('') + '</div></section>' +
        '<div class="sticky-atc" id="satc"><div><b>' + inr(p.price) + '</b><small>' + esc(p.name) + '</small></div><button class="btn btn-red" data-add="' + p.slug + '" data-color="' + color + '">Add to cart</button></div>';
      bind();
    };
    const bind = () => {
      $$('[data-th]').forEach((b) => b.addEventListener('click', () => { cur = +b.dataset.th; render(); }));
      $$('[data-pick]').forEach((b) => b.addEventListener('click', () => { color = b.dataset.pick; cur = 0; render(); }));
      $$('[data-q]').forEach((b) => b.addEventListener('click', () => { qty = Math.max(1, Math.min(10, qty + (+b.dataset.q))); $('#q').textContent = qty; }));
      $('#add').addEventListener('click', () => B.addToCart(p.slug, qty, color));
      $('#buy').addEventListener('click', () => { B.addToCart(p.slug, qty, color); location.href = 'checkout.html'; });
      $('#wl').addEventListener('click', () => { B.toggleWish(p.slug); $('#wl').classList.toggle('on', wished()); });
      const st = $('#stage'); st.addEventListener('click', () => st.classList.toggle('zoom'));
      st.addEventListener('mousemove', (e) => { if (!st.classList.contains('zoom')) return; const r = st.getBoundingClientRect(); $('#stage-img').style.transformOrigin = ((e.clientX - r.left) / r.width * 100) + '% ' + ((e.clientY - r.top) / r.height * 100) + '%'; });
      st.addEventListener('mouseleave', () => st.classList.remove('zoom'));
      $('#pin-f').addEventListener('submit', (e) => { e.preventDefault(); const v = $('#pin-i').value.trim(), m = $('#pin-m'); if (!/^[1-9][0-9]{5}$/.test(v)) { m.className = 'bad'; m.textContent = 'Please enter a valid 6-digit PIN code.'; return; } m.className = 'ok'; m.innerHTML = 'Delivery available to ' + v + '. Estimated 3–7 working days. <mark class="tbc">timeline to confirm</mark>'; });
      const tabTo = (k) => { $$('.tab-btns button').forEach((b) => b.classList.toggle('on', b.dataset.tab === k)); $$('.tab').forEach((t) => t.classList.toggle('on', t.id === 't-' + k)); };
      $$('.tab-btns button').forEach((b) => b.addEventListener('click', () => tabTo(b.dataset.tab)));
      $$('[data-gotab]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); tabTo(a.dataset.gotab); $('#tabs').scrollIntoView({ behavior: 'smooth' }); }));
      $('#rev-f').addEventListener('submit', (e) => { e.preventDefault(); $('#rev-m').hidden = false; e.target.reset(); });
      const sat = $('#satc'), buy = $('#add');
      if ('IntersectionObserver' in window) new IntersectionObserver((en) => { sat.classList.toggle('show', !en[0].isIntersecting && en[0].boundingClientRect.top < 0); }).observe(buy);
    };
    render();
  };

  /* ---------------- CART ---------------- */
  R.cart = function () {
    const draw = () => {
      const t = B.totals(); const root = $('#cart-root');
      if (!t.items.length) {
        root.innerHTML = '<div class="empty" style="padding:70px 0"><div class="empty-ic">' + icon('bag') + '</div><h2>Your cart is empty</h2><p>Add something you love, and it will show up here.</p><a class="btn btn-red" href="shop.html">Start shopping</a></div>' +
          '<section class="sec-sm"><div class="sec-head"><h2 style="font-size:26px">Popular right now</h2></div><div class="grid">' + featured().slice(0, 4).map(card).join('') + '</div></section>';
        return;
      }
      const cp = State.coupon && B.COUPONS[State.coupon];
      root.innerHTML = '<div class="cart-lay"><div><div class="panel" style="padding:8px 24px">' + t.items.map((l) => B.lineHtml(l)).join('') + '</div><p style="margin-top:18px"><a class="link-arrow" href="shop.html">' + icon('arrow').replace('<svg', '<svg style="transform:rotate(180deg)"') + ' Continue shopping</a></p></div>' +
        '<aside class="panel sum"><h2>Order summary</h2>' +
        '<div class="sum-row"><span>Total MRP (' + t.count + ' item' + (t.count > 1 ? 's' : '') + ')</span><b>' + inr(t.mrp) + '</b></div>' +
        (t.savings ? '<div class="sum-row save"><span>Discount on MRP</span><b>−' + inr(t.savings) + '</b></div>' : '') +
        (t.discount ? '<div class="sum-row save"><span>Coupon ' + State.coupon + '</span><b>−' + inr(t.discount) + '</b></div>' : '') +
        '<div class="sum-row"><span>Shipping</span><b style="color:var(--green)">FREE</b></div>' +
        '<div class="sum-row total"><span>Total</span><span>' + inr(t.total) + '</span></div>' +
        '<form class="coupon" id="cf"><input placeholder="Coupon code" aria-label="Coupon code" id="ci" value=""><button class="btn btn-dark btn-sm">Apply</button></form>' +
        '<p class="coupon-msg ' + (cp ? 'ok' : '') + '" id="cm">' + (cp ? 'Applied: ' + cp.label + ' <button data-rmc style="text-decoration:underline">Remove</button>' : 'Try the demo code <b>BONZ10</b>.') + '</p>' +
        '<a class="btn btn-red btn-block" href="checkout.html">Proceed to checkout ' + icon('arrow') + '</a>' +
        '<p class="ship-note">' + icon('lock') + ' Secure checkout · COD available</p></aside></div>';
      $('#cf').addEventListener('submit', (e) => { e.preventDefault(); const ok = B.applyCoupon($('#ci').value); if (!ok) { const m = $('#cm'); m.className = 'coupon-msg bad'; m.textContent = 'That code isn\'t valid.'; } });
      const rm = $('[data-rmc]'); if (rm) rm.addEventListener('click', B.removeCoupon);
    };
    draw(); document.addEventListener('bonz:refresh', draw);
  };

  /* ---------------- CHECKOUT ---------------- */
  const STATES = ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Jammu and Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry'];
  R.checkout = function () {
    const root = $('#co-root');
    const fld = (id, label, attrs, full) => '<div class="fld' + (full ? ' full' : '') + '" data-fld="' + id + '"><label for="' + id + '">' + label + ' <i>*</i></label><input id="' + id + '" ' + (attrs || '') + '><span class="err">Please check this field.</span></div>';
    const draw = () => {
      const t = B.totals();
      if (!t.items.length) { root.innerHTML = '<div class="empty" style="padding:80px 0"><div class="empty-ic">' + icon('bag') + '</div><h2>Nothing to check out yet</h2><p>Your cart is empty.</p><a class="btn btn-red" href="shop.html">Browse products</a></div>'; return; }
      root.innerHTML = '<div class="steps"><span>Cart</span><i>›</i><b>Details &amp; payment</b><i>›</i><span>Confirmation</span></div>' +
        '<div class="cart-lay"><form id="co" novalidate><div class="demo-note"><b>Preview mode.</b> No real payment is taken and no order is sent.</div>' +
        '<div class="panel" style="margin-bottom:16px"><h2>Contact</h2><div class="form-grid">' + fld('em', 'Email', 'type="email" autocomplete="email" placeholder="you@example.com"') + fld('ph', 'Mobile number', 'type="tel" inputmode="numeric" maxlength="10" autocomplete="tel" placeholder="10-digit mobile number"') + '</div><p style="font-size:13px;color:var(--muted);margin-top:10px">No account needed. We\'ll send order updates by email and SMS.</p></div>' +
        '<div class="panel" style="margin-bottom:16px"><h2>Delivery address</h2><div class="form-grid">' + fld('fn', 'First name', 'autocomplete="given-name"') + fld('ln', 'Last name', 'autocomplete="family-name"') +
        fld('ad', 'Address', 'autocomplete="street-address" placeholder="House no., street, area"', true) + fld('ct', 'City', 'autocomplete="address-level2"') +
        '<div class="fld" data-fld="st"><label for="st">State <i>*</i></label><select id="st" autocomplete="address-level1"><option value="">Select state</option>' + STATES.map((s) => '<option' + (s === 'Telangana' ? ' selected' : '') + '>' + s + '</option>').join('') + '</select><span class="err">Please select a state.</span></div>' +
        fld('pn', 'PIN code', 'inputmode="numeric" maxlength="6" autocomplete="postal-code"') + '</div></div>' +
        '<div class="panel" style="margin-bottom:16px"><h2>Delivery</h2><label class="opt"><input type="radio" name="ship" checked><span><b>Standard delivery · FREE</b><small>Estimated 3–7 working days <mark class="tbc">to confirm</mark></small></span></label></div>' +
        '<div class="panel"><h2>Payment</h2>' +
        '<label class="opt"><input type="radio" name="pay" value="upi" checked><span><b>UPI</b><small>Google Pay, PhonePe, Paytm, BHIM</small></span></label><div class="opt-fields on" data-pf="upi"><div class="fld"><label for="upiid">UPI ID</label><input id="upiid" placeholder="name@bank"></div></div>' +
        '<label class="opt"><input type="radio" name="pay" value="card"><span><b>Credit / debit card</b><small>Visa, Mastercard, RuPay</small></span></label><div class="opt-fields" data-pf="card"><div class="fld"><label for="cn">Card number</label><input id="cn" inputmode="numeric" placeholder="1234 5678 9012 3456"></div><div class="form-grid"><div class="fld"><label for="cx">Expiry</label><input id="cx" placeholder="MM / YY"></div><div class="fld"><label for="cv">CVV</label><input id="cv" inputmode="numeric" placeholder="•••"></div></div></div>' +
        '<label class="opt"><input type="radio" name="pay" value="nb"><span><b>Net banking</b><small>All major Indian banks</small></span></label>' +
        '<label class="opt"><input type="radio" name="pay" value="cod"><span><b>Cash on delivery</b><small>Pay when your order arrives</small></span></label></div>' +
        '<p style="font-size:13px;color:var(--muted);margin:16px 0">By placing your order you agree to our <a href="policy.html?p=terms" style="text-decoration:underline">Terms &amp; conditions</a> and <a href="policy.html?p=privacy" style="text-decoration:underline">Privacy policy</a>.</p>' +
        '<button class="btn btn-red btn-block" style="height:56px;font-size:17px" type="submit">' + icon('lock') + ' Place order · ' + inr(t.total) + '</button></form>' +
        '<aside class="panel sum"><h2>Order summary</h2>' + t.items.map((l) => '<div class="mini"><div class="line-img"><img src="' + l.p.images[0] + '" alt=""></div><span>' + esc(l.p.name) + (l.color ? '<br><small class="q">' + l.color + '</small>' : '') + '<br><small class="q">Qty ' + l.qty + '</small></span><b>' + inr(l.p.price * l.qty) + '</b></div>').join('') +
        '<div class="sum-row" style="margin-top:8px"><span>Subtotal</span><b>' + inr(t.subtotal) + '</b></div>' + (t.discount ? '<div class="sum-row save"><span>Coupon ' + State.coupon + '</span><b>−' + inr(t.discount) + '</b></div>' : '') +
        '<div class="sum-row"><span>Shipping</span><b style="color:var(--green)">FREE</b></div><div class="sum-row total"><span>Total</span><span>' + inr(t.total) + '</span></div>' +
        (t.savings ? '<p class="ship-note">You\'re saving ' + inr(t.savings + t.discount) + ' on this order</p>' : '') + '<a href="cart.html" class="link-arrow" style="justify-self:start">Edit cart</a></aside></div>';
      $$('input[name=pay]').forEach((r) => r.addEventListener('change', () => $$('.opt-fields').forEach((f) => f.classList.toggle('on', f.dataset.pf === r.value))));
      $('#co').addEventListener('submit', place);
    };
    const checks = { em: (v) => /^\S+@\S+\.\S+$/.test(v), ph: (v) => /^[6-9]\d{9}$/.test(v), fn: (v) => v.trim().length > 0, ln: (v) => v.trim().length > 0, ad: (v) => v.trim().length > 5, ct: (v) => v.trim().length > 1, st: (v) => !!v, pn: (v) => /^[1-9]\d{5}$/.test(v) };
    function place(e) {
      e.preventDefault(); let first = null;
      Object.keys(checks).forEach((id) => { const el = $('#' + id), ok = checks[id](el.value); $('[data-fld=' + id + ']').classList.toggle('bad', !ok); if (!ok && !first) first = el; });
      if (first) { first.focus(); first.scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }
      const t = B.totals(), pay = $('input[name=pay]:checked').value;
      const order = { id: 'BZ' + Date.now().toString().slice(-8), date: new Date().toISOString(), items: t.items.map((l) => ({ name: l.p.name, qty: l.qty, color: l.color, price: l.p.price, img: l.p.images[0] })), total: t.total, pay: { upi: 'UPI', card: 'Card', nb: 'Net banking', cod: 'Cash on delivery' }[pay], name: $('#fn').value + ' ' + $('#ln').value, city: $('#ct').value, state: $('#st').value, pin: $('#pn').value, email: $('#em').value };
      const orders = B.load('bonz_orders', []); orders.unshift(order); B.save('bonz_orders', orders);
      B.clearCart(); done(order);
    }
    function done(o) {
      document.title = 'Order placed | BONZ';
      root.innerHTML = '<div class="done"><div class="tick">' + icon('check') + '</div><h1 style="font-size:34px">Thank you, ' + esc(o.name.split(' ')[0]) + '!</h1><p style="color:var(--muted)">Your order has been placed. A confirmation would be sent to <b>' + esc(o.email) + '</b>.</p><div class="ono">Order ' + o.id + '</div>' +
        '<div class="panel" style="width:100%;text-align:left">' + o.items.map((i) => '<div class="mini"><div class="line-img"><img src="' + i.img + '" alt=""></div><span>' + esc(i.name) + '<br><small class="q">Qty ' + i.qty + '</small></span><b>' + inr(i.price * i.qty) + '</b></div>').join('') + '<div class="sum-row total" style="margin-top:10px;border-top:1px solid var(--line);padding-top:14px"><span>Total paid via ' + o.pay + '</span><b>' + inr(o.total) + '</b></div><p style="color:var(--muted);font-size:14px;margin-top:10px">Delivering to ' + esc(o.city) + ', ' + esc(o.state) + ' ' + esc(o.pin) + '</p></div>' +
        '<p class="demo-note" style="width:100%">Preview only. This demo order was saved in your browser, not sent to BONZ.</p><div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center"><a class="btn btn-red" href="shop.html">Continue shopping</a><a class="btn btn-ghost" href="account.html">View my orders</a></div></div>';
      window.scrollTo(0, 0);
    }
    draw();
  };

  /* ---------------- WISHLIST ---------------- */
  R.wishlist = function () {
    const draw = () => {
      const list = State.wish.map(bySlug).filter(Boolean);
      $('#wl-root').innerHTML = list.length ? '<div class="grid">' + list.map(card).join('') + '</div>' :
        '<div class="empty" style="padding:70px 0"><div class="empty-ic">' + icon('heart') + '</div><h2>Nothing saved yet</h2><p>Tap the heart on any product to keep it here for later.</p><a class="btn btn-red" href="shop.html">Browse products</a></div>';
    };
    draw(); document.addEventListener('bonz:refresh', draw);
  };

  /* ---------------- ACCOUNT ---------------- */
  R.account = function () {
    const root = $('#acc-root');
    const draw = () => {
      const u = B.load('bonz_user', null);
      if (u) {
        const orders = B.load('bonz_orders', []);
        root.innerHTML = '<div class="page-title"><div><h1>Hi, ' + esc(u.name || 'there') + '</h1><p>' + esc(u.id) + '</p></div><button class="btn btn-ghost" id="lo">Sign out</button></div>' +
          '<div class="orders" style="max-width:760px;padding-bottom:70px"><h2 style="font-size:22px;margin-bottom:14px">Your orders</h2>' +
          (orders.length ? orders.map((o) => '<div class="panel"><div class="sum-row"><b>' + o.id + '</b><span class="pill-g">Placed</span></div><p style="color:var(--muted);font-size:14px;margin:6px 0 12px">' + new Date(o.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ' · ' + o.pay + '</p>' + o.items.map((i) => '<div class="mini"><div class="line-img"><img src="' + i.img + '" alt=""></div><span>' + esc(i.name) + ' <small class="q">× ' + i.qty + '</small></span><b>' + inr(i.price * i.qty) + '</b></div>').join('') + '<div class="sum-row total" style="margin-top:8px"><span>Total</span><b>' + inr(o.total) + '</b></div></div>').join('')
            : '<div class="panel"><p style="color:var(--muted)">No orders yet. <a href="shop.html" style="color:var(--red);font-weight:600">Start shopping</a></p></div>') + '</div>';
        $('#lo').addEventListener('click', () => { B.save('bonz_user', null); draw(); });
        return;
      }
      root.innerHTML = '<div class="auth"><h1 style="font-size:32px;margin-bottom:6px">Welcome to BONZ</h1><p style="color:var(--muted);margin-bottom:22px">Sign in to track orders and save your wishlist.</p>' +
        '<div class="demo-note">Preview mode: any details will work. Nothing is sent or stored on a server.</div>' +
        '<div class="seg" role="tablist"><button class="on" data-m="otp">OTP login</button><button data-m="pw">Password</button><button data-m="reg">Create account</button></div><div id="am"></div></div>';
      const mode = (m) => {
        $$('.seg button').forEach((b) => b.classList.toggle('on', b.dataset.m === m));
        const f = (id, l, a) => '<div class="fld" style="margin-bottom:14px"><label for="' + id + '">' + l + '</label><input id="' + id + '" ' + (a || '') + ' required></div>';
        $('#am').innerHTML = m === 'otp' ? '<form id="af">' + f('a1', 'Mobile number', 'type="tel" inputmode="numeric" maxlength="10" placeholder="10-digit mobile number"') + '<div id="otpbox" hidden><p style="text-align:center;color:var(--muted);margin-bottom:12px">Enter the 4-digit code sent to your phone</p><div class="otp">' + [0, 1, 2, 3].map((i) => '<input inputmode="numeric" maxlength="1" aria-label="Digit ' + (i + 1) + '">').join('') + '</div></div><button class="btn btn-red btn-block" style="margin-top:18px" id="otpgo">Send OTP</button></form>'
          : m === 'pw' ? '<form id="af">' + f('a1', 'Email or mobile', 'autocomplete="username"') + f('a2', 'Password', 'type="password" autocomplete="current-password"') + '<button class="btn btn-red btn-block">Sign in</button></form>'
            : '<form id="af">' + f('a0', 'Full name', 'autocomplete="name"') + f('a1', 'Mobile number', 'type="tel" inputmode="numeric" maxlength="10"') + f('a3', 'Email', 'type="email"') + f('a2', 'Password', 'type="password" autocomplete="new-password" minlength="8"') + '<button class="btn btn-red btn-block">Create account</button></form>';
        const form = $('#af'); let sent = false;
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          if (m === 'otp' && !sent) { if (!/^[6-9]\d{9}$/.test($('#a1').value)) { toast('Enter a valid 10-digit mobile number'); return; } sent = true; $('#otpbox').hidden = false; $('#otpgo').textContent = 'Verify & sign in'; $('.otp input').focus(); return; }
          B.save('bonz_user', { id: $('#a1').value, name: m === 'reg' ? $('#a0').value.split(' ')[0] : '' }); draw();
        });
        $$('.otp input').forEach((i, n, all) => i.addEventListener('input', () => { if (i.value && all[n + 1]) all[n + 1].focus(); }));
      };
      $$('.seg button').forEach((b) => b.addEventListener('click', () => mode(b.dataset.m))); mode('otp');
    };
    draw();
  };

  /* ---------------- CONTACT ---------------- */
  R.contact = function () {
    $('#cform').addEventListener('submit', (e) => { e.preventDefault(); $('#cok').hidden = false; e.target.reset(); $('#cok').scrollIntoView({ block: 'center', behavior: 'smooth' }); });
  };

  /* ---------------- POLICY ---------------- */
  const POL = {
    shipping: ['Shipping policy', '<h2>Free shipping across India</h2><p>Every BONZ order ships free anywhere in India.</p><h2>Delivery times</h2><p>Orders are dispatched within <mark class="tbc">1–2 working days</mark> and usually arrive in <mark class="tbc">3–7 working days</mark>, depending on your location.</p><h2>Tracking</h2><p>You will receive tracking details by email and SMS once your order is dispatched.</p><h2>Cash on delivery</h2><p>Cash on delivery is available on eligible PIN codes.</p>'],
    returns: ['Returns & refunds', '<h2>Easy returns</h2><p>If you are not happy with your purchase, you can request a return within <mark class="tbc">7 days</mark> of delivery.</p><h2>Conditions</h2><ul><li>The product must be unused and in its original packaging with all accessories.</li><li>Earbuds and earphones can only be returned if the seal is unbroken, for hygiene reasons. <mark class="tbc">to confirm</mark></li><li>Damaged or wrong items are always eligible.</li></ul><h2>How to return</h2><p>Contact us with your order number and photos if needed. We will arrange a pickup.</p><h2>Refunds</h2><p>Refunds are issued to your original payment method within <mark class="tbc">5–7 working days</mark> after we receive the item. For cash on delivery orders, we will refund to your bank account or UPI.</p>'],
    warranty: ['Warranty', '<h2>Warranty support on every product</h2><p>All BONZ products include warranty support for <mark class="tbc">12 months</mark> from the date of purchase, covering manufacturing defects.</p><h2>What is not covered</h2><ul><li>Physical damage, liquid damage beyond the product\'s IP rating, or misuse.</li><li>Repairs done by anyone other than BONZ.</li></ul><h2>How to claim</h2><p>Contact us with your order number and a short description or photo of the problem. Keep your invoice handy.</p>'],
    privacy: ['Privacy policy', '<h2>What we collect</h2><p>When you place an order or contact us, we collect your name, contact details, delivery address and order details.</p><h2>How we use it</h2><p>We use your information to process and deliver orders, provide support and, if you opt in, send you offers. We do not sell your personal data.</p><h2>Payments</h2><p>Payments are handled by secure payment partners. We do not store your card details.</p><h2>Your choices</h2><p>You can ask us to access, correct or delete your data at any time by contacting us.</p>'],
    terms: ['Terms & conditions', '<h2>Using this website</h2><p>By using bonz.in you agree to these terms. Product prices and availability may change without notice.</p><h2>Orders</h2><p>An order is confirmed once we send you an order confirmation. We may cancel orders in case of pricing errors or stock issues, and you will be fully refunded.</p><h2>Pricing</h2><p>All prices are in Indian rupees and include applicable taxes.</p><h2>Contact</h2><p>Sruthisagara Innovations Pvt Ltd, H.No 1-5-1055/102/2, Nr Sai Baba Nagar, Alwal, Secunderabad, Telangana 500010.</p>']
  };
  R.policy = function () {
    const k = POL[q.get('p')] ? q.get('p') : 'shipping';
    document.title = POL[k][0] + ' | BONZ';
    $('#pol-title').textContent = POL[k][0];
    $('#pol-body').innerHTML = POL[k][1];
    $$('#pol-nav a').forEach((a) => { a.style.fontWeight = a.dataset.k === k ? '700' : '500'; a.style.color = a.dataset.k === k ? 'var(--red)' : ''; });
  };

  /* ---------------- FAQ ---------------- */
  R.faq = function () {
    const G = [
      ['Orders & delivery', [['How long does delivery take?', 'Most orders arrive in 3–7 working days. <mark class="tbc">to confirm</mark>'], ['Is shipping really free?', 'Yes. Shipping is free on every order across India.'], ['Can I pay cash on delivery?', 'Yes. Choose cash on delivery at checkout. You can also pay by UPI, card or net banking.'], ['How do I track my order?', 'We send tracking details by email and SMS once your order ships. You can also see your orders in your account.']]],
      ['Returns & warranty', [['What is your return policy?', 'You can return eligible products within 7 days of delivery. <mark class="tbc">to confirm</mark> Read the <a href="policy.html?p=returns" style="color:var(--red);font-weight:600">full policy</a>.'], ['Do BONZ products have a warranty?', 'Yes, warranty support is included with every product. See <a href="policy.html?p=warranty" style="color:var(--red);font-weight:600">warranty details</a>.'], ['How do I claim warranty?', 'Contact us with your order number and a short description of the issue.']]],
      ['Products', [['What do IPX4 and IPX5 mean?', 'They are water-resistance ratings. IPX4 protects against splashes and sweat. IPX5 protects against low-pressure water jets. Neither is made for swimming.'], ['Are BONZ products made in India?', 'Yes. BONZ is proudly made in India.'], ['Can I connect a BONZ soundbar to my TV?', 'Yes. Our soundbars support Bluetooth and wired inputs such as AUX, USB and, on some models, optical. Check the specifications on each product page.'], ['Are the soundbar subwoofers wireless?', 'No. The subwoofers in our soundbars are wired.']]]
    ];
    $('#faq-root').innerHTML = G.map((g) => '<h2 style="font-size:22px;margin:36px 0 6px">' + g[0] + '</h2><div class="faq">' + g[1].map((f) => '<details><summary>' + f[0] + icon('chevron') + '</summary><p>' + f[1] + '</p></details>').join('') + '</div>').join('');
  };

  if (R[page]) { const run = () => R[page](); if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run(); }
})();
