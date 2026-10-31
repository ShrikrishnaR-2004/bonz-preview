# BONZ store: redesign preview

A clickable preview of the redesigned BONZ online store. It uses BONZ's real products, prices and photos.

## How to view

1. Unzip the folder.
2. Double-click **index.html**. It opens in any modern browser. No install or internet connection is needed, except for the web fonts (Inter and Sora), which fall back to system fonts when offline.

## What you can try

- Browse the home page, then **Shop** (filters, sort, search, price ranges, colours).
- Open any product: photo gallery, colour choice (the Nexora neckband switches photos), PIN-code check, specifications, FAQs, reviews.
- Add to cart (slide-out cart), change quantities, use the coupon code **BONZ10** (demo code).
- Check out as a guest. UPI, card, net banking and cash on delivery are shown. Nothing is charged or sent.
- Wishlist, account sign-in (OTP / password / register), contact form, FAQs and policy pages.
- Resize the window, or open on a phone, to see the mobile version.

All data (cart, wishlist, orders) is stored only in your own browser.

## What changed compared with the current site

| Area | Before | Now |
|---|---|---|
| Look and feel | Mixed styles, heavy banners | One clean design system, strong hero, consistent cards |
| Navigation | 9 items, missing Power Bank / Chargers, dead "Support" link | 8 clear categories plus Offers, search suggestions, mobile tab bar |
| Product cards | "SALE!" on everything, mixed buttons | Real discount % badges, one "Add to cart" button, ratings, colour dots |
| Product names | "Power Bank-1", 4 separate Nexora products | Four Nexora colours merged into one product with a colour picker |
| Product page | One photo, one-line description | Gallery, highlights, spec table, delivery check, FAQs, sticky mobile buy bar |
| Cart and checkout | Added 2 per click, ₹60 shipping despite "free shipping", only COD | Correct quantities, free shipping shown consistently, UPI / card / COD options, guest checkout |
| Trust pages | Missing (Privacy, Returns, Shipping, Terms, FAQ) | All created (see "Draft copy" below) |
| Typos | "Yelllow", "Charges", "Ear Phone", "Made for Every Moments" | Fixed |
| Phone | Menu items overlapping content | Bottom tab bar, filter sheet, sticky add-to-cart |

## Draft copy and items BONZ must confirm

Yellow-highlighted text in the preview marks placeholder content. Please confirm before launch:

- Delivery times (3–7 working days) and dispatch time
- Return window (7 days) and refund time (5–7 working days)
- Warranty period (12 months)
- Support hours and reply time
- Business email (support@bonz.in is a proposal; the live site currently uses a Gmail address)
- Whether shipping is free on **all** orders (the preview follows the site's current promise)
- Final prices: Charger and Cables at ₹90 (MRP ₹100) and the power banks at ₹800 (MRP ₹1,000)
- Product names for Power Bank-1/2/3 and the Patterned Black Power Bank (capacity in mAh should be added)
- Whether BONZ wants the demo coupon BONZ10 (it is not a real offer)

The Privacy policy, Terms and the other policy texts are **draft** content and should be reviewed by a legal professional.

## What this preview is not

It is a front-end design preview. The cart, checkout, payments, accounts and reviews are simulated and are not connected to a server. To go live, this design would be built into the existing WordPress / WooCommerce store (or a new storefront connected to it).

## Files

- `index.html`, `shop.html`, `product.html`, `cart.html`, `checkout.html`, `wishlist.html`, `account.html`, `about.html`, `contact.html`, `faq.html`, `policy.html`, `404.html`
- `assets/css/style.css`: design system
- `assets/js/`: `data.js` (product catalogue), `app.js` (header, cart, search), `pages.js` (page logic)
- `assets/products/`, `assets/img/`: BONZ photos and logo (from bonz.in)
