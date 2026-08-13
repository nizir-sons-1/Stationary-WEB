/*
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT EACH PAGE SAYS ABOUT ITSELF
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * One record per route: the title a search result shows, the description under
 * it, and a short prose summary of what is actually on the page.
 *
 * The summary matters more than it looks. It is what gets written into the
 * static HTML by scripts/prerender.js, into llms.txt, and into the page's own
 * structured data — so it is the text an answer engine has to work with when it
 * decides whether this site can answer "where do I buy 300gsm art card in
 * Lahore". Everything here is drawn from what the pages genuinely say; nothing
 * is aspirational copy.
 *
 * React-free and browser-free on purpose: the build script imports it under
 * plain Node.
 */

import { BUSINESS } from '../lib/site.js';

/*
 * Titles are kept under ~60 characters and descriptions under ~155, which is
 * roughly where Google truncates. Longer is not penalised, it is just not shown.
 */
export const ROUTES = {
  '/': {
    title: 'Nazir & Sons — Premium Paper, Fine Arts & Stationery, Lahore',
    description:
      'Direct paper importers in Lahore since 1993. Art card, ivory card, offset, copy and matte paper, canvases, fine-art materials and stationery — wholesale and retail.',
    h1: 'Your Ultimate Paper & Stationery Hub',
    summary:
      'Nazir & Sons is a paper importer and wholesaler in Lahore’s paper market, Anarkali Bazaar, trading since 1993. The catalogue runs to more than 500 products across five departments — Paper & Canvas, Fine Arts, Stationery, Notebooks and Accessories — sold both by the sheet and by the ream to printers, publishers, artists, schools and businesses across Pakistan.',
    bullets: [
      'Paper & Canvas: bleach card, art card, art paper, matte paper, copy paper, offset paper, ivory card, colour card, carbonless, kraft card, book paper and news print.',
      'Fine Arts: canvases, paints, brushes, art pencils, markers and modelling materials.',
      'Stationery, Notebooks and Accessories for offices, schools and studios.',
      'Live per-kilogram rates, with a calculator for any non-standard sheet size.',
      'Wholesale collection from the Anarkali store, or delivery anywhere in Pakistan.',
    ],
    priority: 1.0,
    changefreq: 'daily',
  },

  '/shop': {
    title: 'Shop Paper, Fine Arts & Stationery Online | Nazir & Sons',
    description:
      'Browse the full Nazir & Sons catalogue by department and category — paper stock by size and GSM, fine-art materials, stationery and notebooks, with live prices in PKR.',
    h1: 'Shop Departments',
    summary:
      'The full catalogue, organised into five departments and around 170 categories. Paper is listed by brand, sheet size and GSM, with the price shown per ream or per kilogram depending on how the stock is packed, and live stock status on every variation.',
    bullets: [
      'Five departments: Paper & Canvas, Fine Arts, Stationery, Notebooks, Accessories.',
      'Paper priced by weight — pick a size and a GSM and the price updates.',
      'Instalment requests (3 months) available on paper categories.',
      'In-stock and out-of-stock marked on every item.',
    ],
    priority: 0.9,
    changefreq: 'daily',
  },

  '/calculator': {
    title: 'Paper Weight & Price Calculator (GSM to Kg) | Nazir & Sons',
    description:
      'Work out the weight and price of any custom paper size. Enter length, width, GSM and sheet count to get kilograms and the PKR cost at live market rates.',
    h1: 'Custom Size Calculator',
    summary:
      'A calculator for non-standard sheet sizes. Enter the length and width in inches, the GSM and the number of sheets, and it returns the weight in kilograms and the price in rupees using the current per-kilogram rate for the chosen paper category and brand.',
    bullets: [
      'Formula used: weight in kg = (length in inches × width in inches × GSM × number of sheets) ÷ 1,550,000.',
      'Price = weight in kg × the live per-kilogram rate for that brand and category.',
      'Rates are the same ones the shop charges, taken from the live catalogue.',
      'Works for any size — the calculator is not limited to stocked dimensions.',
    ],
    priority: 0.8,
    changefreq: 'weekly',
  },

  '/faq': {
    title: 'Frequently Asked Questions | Nazir & Sons, Lahore',
    description:
      'Answers about ordering, wholesale paper, GSM and sizes, delivery across Pakistan, returns, instalments and visiting the Nazir & Sons store in Anarkali, Lahore.',
    h1: 'Frequently Asked Questions',
    summary:
      'Direct answers to the questions customers ask most often: what Nazir & Sons stocks, how paper is priced, how delivery works inside and outside Lahore, what can be returned, and how to reach the shop.',
    priority: 0.8,
    changefreq: 'monthly',
  },

  '/about': {
    title: 'Our Story — Lahore’s Paper House Since 1993 | Nazir & Sons',
    description:
      'From a trading post in Anarkali Bazaar to a direct importer supplying Pakistan’s printers, publishers and artists with premium paper, fine arts and stationery.',
    h1: 'The Story of Nazir & Sons',
    summary:
      'Nazir & Sons began as a trading post in Anarkali Bazaar and has been rooted in Lahore’s paper market ever since, serving the printing industry since 1993. Today it supplies creators, publishers and businesses across Pakistan with premium paper stocks, fine-art materials and stationery, both in person and through nazirandsons.shop.',
    bullets: [
      'Serving Pakistan’s printing industry since 1993.',
      'Based in Lahore’s paper market, Abkari Road, Anarkali Bazaar.',
      'Direct importers — paper stock is brought in rather than bought on locally.',
      'Supplies printers, publishers, artists, schools and businesses nationwide.',
    ],
    priority: 0.7,
    changefreq: 'yearly',
  },

  '/contact': {
    title: 'Contact Nazir & Sons — Paper Market, Anarkali, Lahore',
    description:
      'Call or WhatsApp +92 320 2220001, email support@nazirandsons.shop, or visit the store on Abkari Road, Anarkali Bazaar, Lahore. Open Monday to Saturday, 10am–7pm.',
    h1: 'Contact Us',
    summary:
      `Nazir & Sons is at ${BUSINESS.street}, ${BUSINESS.city}, ${BUSINESS.countryName}. Phone and WhatsApp: ${BUSINESS.phone}. Email: ${BUSINESS.email}. ${BUSINESS.openingHoursText} Enquiries sent through the contact form are answered within 24 hours.`,
    bullets: [
      `Address: ${BUSINESS.street}, ${BUSINESS.city}.`,
      `Phone and WhatsApp: ${BUSINESS.phone}.`,
      `Email: ${BUSINESS.email}.`,
      BUSINESS.openingHoursText,
    ],
    priority: 0.8,
    changefreq: 'monthly',
  },

  '/shipping': {
    title: 'Shipping Policy — Delivery Across Pakistan | Nazir & Sons',
    description:
      'Flat Rs 200 retail delivery in 3–5 business days, free self-pickup in Lahore, and bulk paper freight by Adda transport to any city in Pakistan.',
    h1: 'Shipping Policy',
    summary:
      'Retail orders ship flat-rate at Rs 200 and arrive in 3–5 business days by courier. Bulk paper is either collected free from the Lahore store, delivered directly for a minimum of Rs 350, or sent out of city as a bundle through Adda transport with a bilty shared over WhatsApp. Orders placed before 2:00 PM PKT are processed the same business day.',
    bullets: [
      'Retail (B2C): flat Rs 200, 3–5 business days, doorstep courier delivery.',
      'Wholesale self-pickup from the Lahore paper market store: free.',
      'Wholesale direct delivery: minimum Rs 350.',
      'Out of city: Adda transport, freight paid to the transporter on collection.',
      'Orders before 2:00 PM PKT are processed the same business day; wholesale paper may need 24 hours more for weighing, cutting and packing.',
    ],
    priority: 0.7,
    changefreq: 'monthly',
  },

  '/returns': {
    title: 'Returns & Refunds Policy | Nazir & Sons',
    description:
      '7-day returns on retail stationery and art supplies in original condition. Refunds by bank transfer or EasyPaisa within 3–5 business days of receipt.',
    h1: 'Returns & Refunds',
    summary:
      'Retail stationery and art items can be returned within 7 days of delivery, unused and in original packaging, with proof of purchase. Wholesale paper cannot be returned once cut or unpacked unless there is a confirmed manufacturing defect. Approved refunds are paid by bank transfer or EasyPaisa within 3–5 business days of the item being received.',
    bullets: [
      '7-day return window on retail stationery and fine-art items.',
      'Items must be unused, in original packaging, with an Order ID as proof of purchase.',
      'Sealed art supplies must still be sealed — opened ones are non-refundable.',
      'Custom-cut paper, clearance purchases and gift cards cannot be returned.',
      'Refunds by bank transfer or EasyPaisa within 3–5 business days.',
    ],
    priority: 0.6,
    changefreq: 'monthly',
  },

  '/reviews': {
    title: 'Customer Reviews | Nazir & Sons, Lahore',
    description:
      'What printers, artists and businesses say about Nazir & Sons paper, fine-art materials and service — and a place to leave your own review.',
    h1: 'Customer Reviews',
    summary:
      'Customer feedback on paper quality, pricing and delivery, with the option to leave a review of your own order.',
    priority: 0.6,
    changefreq: 'weekly',
  },

  '/track-order': {
    title: 'Track Your Order | Nazir & Sons',
    description:
      'Check the status of a Nazir & Sons order using your Order ID or the phone number the order was placed with.',
    h1: 'Track Your Order',
    summary:
      'Enter an Order ID or the phone number used at checkout to see the current status of a delivery.',
    priority: 0.4,
    changefreq: 'monthly',
    noindex: true,
  },

  '/careers': {
    title: 'Careers at Nazir & Sons — Lahore',
    description:
      'Work with Lahore’s paper house. Learn supply chain, e-commerce and premium retail alongside the materials Pakistan’s publishers and artists build on.',
    h1: 'Careers',
    summary:
      'Open applications to join the Nazir & Sons team in Lahore, across supply chain, e-commerce and retail.',
    priority: 0.4,
    changefreq: 'monthly',
  },

  '/privacy': {
    title: 'Privacy Policy | Nazir & Sons',
    description:
      'How Nazir & Sons collects, uses and protects the personal information you share when you browse, order or contact us.',
    h1: 'Privacy Policy',
    summary: 'How personal information is collected, used and protected on nazirandsons.shop.',
    priority: 0.3,
    changefreq: 'yearly',
  },

  '/terms': {
    title: 'Terms of Service | Nazir & Sons',
    description:
      'The terms that apply when you buy paper, fine-art materials or stationery from Nazir & Sons, including instalment purchases.',
    h1: 'Terms of Service',
    summary: 'The terms governing orders, pricing, instalments and use of nazirandsons.shop.',
    priority: 0.3,
    changefreq: 'yearly',
  },

  '/cart': {
    title: 'Your Cart | Nazir & Sons',
    description: 'Review the items in your Nazir & Sons cart before sending your order.',
    h1: 'Your Cart',
    summary: 'The items currently in your basket.',
    noindex: true,
  },
};

/*
 * ─────────────────────────────────────────────────────────────────────────────
 * ANSWERS
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Every answer below is a restatement of something the site already commits to
 * elsewhere — the shipping page, the returns page, the contact block, the
 * calculator's own formula. Nothing here is a new promise, because this list is
 * simultaneously the /faq page, the FAQPage structured data, and the section of
 * llms.txt a model is most likely to quote verbatim.
 *
 * They are written as complete sentences that stand on their own. An answer
 * engine lifts one paragraph, not the page around it, so "Yes, within 7 days"
 * is useless where "Retail stationery and art supplies can be returned within
 * 7 days of delivery" is quotable.
 */
export const FAQS = [
  {
    question: 'What does Nazir & Sons sell?',
    answer:
      'Nazir & Sons is a paper importer and wholesaler in Lahore that sells premium paper, fine-art materials and stationery. The catalogue covers five departments: Paper & Canvas (bleach card, art card, art paper, matte paper, copy paper, offset paper, ivory card, colour card, carbonless, kraft card, book paper and news print), Fine Arts, Stationery, Notebooks and Accessories — more than 500 products in total.',
  },
  {
    question: 'Where is the Nazir & Sons shop in Lahore?',
    answer:
      `The shop is at ${BUSINESS.street}, ${BUSINESS.city}, ${BUSINESS.countryName}. ${BUSINESS.openingHoursText}`,
  },
  {
    question: 'How do I contact Nazir & Sons?',
    answer:
      `Call or message ${BUSINESS.phone} — the same number works on WhatsApp — or email ${BUSINESS.email}. Messages sent through the contact form are answered within 24 hours.`,
  },
  {
    question: 'Does Nazir & Sons sell paper wholesale?',
    answer:
      'Yes. Paper is sold both retail and wholesale. Wholesale stock is priced by weight at a per-kilogram rate, and bulk orders can either be collected free from the Lahore paper market store or delivered by dedicated transport.',
  },
  {
    question: 'How is paper priced — by sheet or by weight?',
    answer:
      'Most paper is priced by weight rather than per sheet. The price of a ream is its weight in kilograms multiplied by the per-kilogram rate for that brand and category, so the same sheet size costs more at a higher GSM. Items packed by count are priced per pack instead, and each product page states which applies.',
  },
  {
    question: 'How do I calculate the weight of a custom paper size?',
    answer:
      'Weight in kilograms = (length in inches × width in inches × GSM × number of sheets) ÷ 1,550,000. Multiply that weight by the per-kilogram rate to get the price. The calculator at nazirandsons.shop/calculator does both steps using live rates, and works for sizes that are not held in stock.',
  },
  {
    question: 'What GSM should I choose?',
    answer:
      'GSM is the weight of one square metre of the paper in grams, and it is the main lever on thickness and stiffness. As a rough guide from what the catalogue is bought for: 70–100 GSM for copy and offset printing, 130–170 GSM for brochures and posters, 210–300 GSM for business cards, covers and packaging, and 300 GSM and above for rigid boxes and heavy card. Tell us the job on WhatsApp and we will confirm the stock that suits it.',
  },
  {
    question: 'Do you deliver outside Lahore?',
    answer:
      'Yes, across Pakistan. Retail orders ship flat-rate at Rs 200 and arrive within 3–5 business days by courier. Bulk paper going out of city travels as a bundle through Adda transport: a bilty (receipt) is sent over WhatsApp when the stock is dispatched, and the customer collects from their local transport hub and pays the freight to the transporter.',
  },
  {
    question: 'How much does delivery cost?',
    answer:
      'Retail delivery is a flat Rs 200. Self-pickup from the Lahore paper market store is free. Direct delivery of bulk paper starts at Rs 350, and out-of-city freight through Adda transport is paid to the transporter on collection.',
  },
  {
    question: 'How long does an order take to process?',
    answer:
      'Orders placed before 2:00 PM Pakistan Standard Time are processed the same business day. Orders placed after that, or on Sundays and public holidays, are processed the next business day. Wholesale paper orders may need an additional 24 hours for weighing, cutting to size if requested, and secure packing.',
  },
  {
    question: 'Can I return an order?',
    answer:
      'Retail stationery and fine-art items can be returned within 7 days of delivery, unused, in original packaging, with an Order ID as proof of purchase. Sealed art supplies must still be sealed. Wholesale paper cannot be returned once it has been cut or unpacked unless there is a confirmed manufacturing defect, and custom-cut paper, clearance purchases and gift cards are non-returnable.',
  },
  {
    question: 'How are refunds paid?',
    answer:
      'Approved refunds are paid by bank transfer or EasyPaisa within 3–5 business days of the returned item being received. Shipping costs are not refunded, and return postage is paid by the customer.',
  },
  {
    question: 'Can I buy paper in instalments?',
    answer:
      'Yes. Paper categories can be bought on a 3-month instalment plan. The option appears on paper products in the shop and on the product page, and requires agreeing to the instalment terms before the item is added to the cart.',
  },
  {
    question: 'How do I track my order?',
    answer:
      'Enter your Order ID, or the phone number the order was placed with, at nazirandsons.shop/track-order to see its current status. You can also ask on WhatsApp at ' + BUSINESS.phone + '.',
  },
  {
    question: 'How long has Nazir & Sons been in business?',
    answer:
      'Nazir & Sons has served Pakistan’s printing industry since 1993, starting as a trading post in Anarkali Bazaar and growing into a direct paper importer supplying printers, publishers, artists and businesses nationwide.',
  },
];

/** The breadcrumb trail for a route, home first. */
export function trailFor(path, label) {
  const home = { name: 'Home', path: '/' };
  if (path === '/') return [home];
  return [home, { name: label || ROUTES[path]?.h1 || path, path }];
}
