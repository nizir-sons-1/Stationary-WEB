/*
 * ─────────────────────────────────────────────────────────────────────────────
 * STRUCTURED DATA
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Schema.org JSON-LD, built from the facts in site.js.
 *
 * This is the part of the site that answer engines read rather than render.
 * Google uses it for rich results; ChatGPT, Perplexity and Claude's browsing
 * tools use it because it is the only place on a page where "the phone number
 * is +92 320 2220001" is stated as data instead of as a string that happens to
 * sit next to a phone icon.
 *
 * Every node carries a stable `@id` so the graph joins up: the store, the
 * website and each page all point at one another instead of being restated
 * from scratch on every URL.
 */

import { SITE_URL, SITE_NAME, BUSINESS, DEFAULT_OG_IMAGE, absoluteUrl } from './site.js';

export const ORG_ID = `${SITE_URL}/#organization`;
export const STORE_ID = `${SITE_URL}/#store`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

const postalAddress = () => ({
  '@type': 'PostalAddress',
  streetAddress: BUSINESS.street,
  addressLocality: BUSINESS.city,
  addressRegion: BUSINESS.region,
  postalCode: BUSINESS.postalCode,
  addressCountry: BUSINESS.country,
});

const openingHoursSpecification = () =>
  BUSINESS.openingHours.map((slot) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: slot.days,
    opens: slot.opens,
    closes: slot.closes,
  }));

const contactPoints = () => [
  {
    '@type': 'ContactPoint',
    telephone: BUSINESS.phoneE164,
    contactType: 'customer service',
    email: BUSINESS.email,
    areaServed: BUSINESS.country,
    availableLanguage: ['English', 'Urdu'],
  },
  {
    '@type': 'ContactPoint',
    telephone: BUSINESS.phoneE164,
    contactType: 'sales',
    contactOption: 'TollFree',
    areaServed: BUSINESS.country,
    availableLanguage: ['English', 'Urdu'],
  },
];

/**
 * The company. Kept separate from the storefront node below so that
 * `publisher` / `seller` references resolve to a legal entity, which is what
 * Google's merchant and organisation guidelines expect.
 */
export function organizationSchema() {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE_NAME,
    alternateName: BUSINESS.alternateName,
    legalName: BUSINESS.legalName,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl('/ns-logo.webp'),
      width: 512,
      height: 512,
    },
    image: absoluteUrl(DEFAULT_OG_IMAGE),
    email: BUSINESS.email,
    telephone: BUSINESS.phoneE164,
    foundingDate: BUSINESS.founded,
    address: postalAddress(),
    contactPoint: contactPoints(),
    areaServed: {
      '@type': 'Country',
      name: BUSINESS.countryName,
    },
    sameAs: [BUSINESS.whatsapp, BUSINESS.mapUrl],
  };
}

/**
 * The physical shop in Anarkali. `Store` is the narrowest type that fits and
 * is the one that feeds the local pack, so it is used in preference to the
 * generic LocalBusiness.
 */
export function localBusinessSchema() {
  return {
    '@type': ['Store', 'LocalBusiness'],
    '@id': STORE_ID,
    name: SITE_NAME,
    parentOrganization: { '@id': ORG_ID },
    url: SITE_URL,
    image: absoluteUrl(DEFAULT_OG_IMAGE),
    logo: absoluteUrl('/ns-logo.webp'),
    telephone: BUSINESS.phoneE164,
    email: BUSINESS.email,
    priceRange: '$',
    currenciesAccepted: BUSINESS.currency,
    paymentAccepted: BUSINESS.paymentAccepted.join(', '),
    address: postalAddress(),
    hasMap: BUSINESS.mapUrl,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: BUSINESS.latitude,
      longitude: BUSINESS.longitude,
    },
    openingHoursSpecification: openingHoursSpecification(),
    areaServed: {
      '@type': 'Country',
      name: BUSINESS.countryName,
    },
    knowsLanguage: ['en', 'ur'],
    description:
      'Importer and wholesaler of premium paper, fine arts materials and stationery in Lahore’s paper market, serving Pakistan’s printing, publishing and art supply trade since 1993.',
    sameAs: [BUSINESS.whatsapp, BUSINESS.mapUrl],
  };
}

/**
 * The site itself, plus the search action. The `SearchAction` is what lets a
 * result for the domain carry its own search box, and it is the machine-readable
 * statement that the catalogue is searchable at all.
 */
export function websiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    inLanguage: 'en',
    publisher: { '@id': ORG_ID },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/shop?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/** The page currently being served, tied back to the site and the organisation. */
export function webPageSchema({ path, title, description, type = 'WebPage' }) {
  return {
    '@type': type,
    '@id': `${absoluteUrl(path)}#webpage`,
    url: absoluteUrl(path),
    name: title,
    description,
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORG_ID },
    inLanguage: 'en',
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '.lede', '[data-speakable]'],
    },
  };
}

/**
 * @param {Array<{name: string, path: string}>} trail  Home first, current page last.
 */
export function breadcrumbSchema(trail) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

/**
 * @param {Array<{question: string, answer: string}>} faqs
 *
 * Only ever emitted for question / answer pairs that are also visible on the
 * page. Schema that describes content a visitor cannot see is a manual-action
 * risk, and every caller of this function renders the same list in the DOM.
 */
export function faqSchema(faqs) {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * A catalogue product and its size / GSM variations.
 *
 * Modelled as a `ProductGroup` when there is more than one variation, because
 * that is precisely what the page shows: one product, many sizes and weights,
 * each with its own price and stock. Collapsing them into a single Product with
 * one price would misstate the catalogue.
 *
 * @param {object} p
 * @param {string} p.name
 * @param {string} [p.description]
 * @param {string} [p.category]
 * @param {string} [p.image]
 * @param {Array<{size?: string, gsm?: string|number, price?: number, stock?: number, sku?: string, packingType?: string}>} p.variations
 */
export function productSchema({ name, description, category, image, path, variations = [] }) {
  const url = absoluteUrl(path);
  const priced = variations.filter((v) => Number(v.price) > 0);

  const offers = priced.map((v) => ({
    '@type': 'Offer',
    '@id': `${url}#offer-${v.sku || `${v.size || ''}-${v.gsm || ''}`}`,
    sku: v.sku,
    name: [name, v.size, v.gsm ? `${v.gsm}gsm` : null].filter(Boolean).join(' '),
    price: Number(v.price).toFixed(2),
    priceCurrency: BUSINESS.currency,
    availability:
      Number(v.stock) > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    itemCondition: 'https://schema.org/NewCondition',
    url,
    seller: { '@id': ORG_ID },
  }));

  const base = {
    '@type': priced.length > 1 ? 'ProductGroup' : 'Product',
    '@id': `${url}#product`,
    name,
    url,
    description: description || `${name} available from Nazir & Sons, Lahore.`,
    category,
    brand: { '@type': 'Brand', name: SITE_NAME },
    ...(image ? { image: [image] } : {}),
  };

  if (priced.length > 1) {
    base.productGroupID = name;
    base.variesBy = ['https://schema.org/size', 'https://schema.org/weight'];
    base.hasVariant = priced.map((v, i) => ({
      '@type': 'Product',
      '@id': `${url}#variant-${v.sku || i}`,
      name: [name, v.size, v.gsm ? `${v.gsm}gsm` : null].filter(Boolean).join(' '),
      sku: v.sku,
      ...(v.size ? { size: v.size } : {}),
      ...(v.gsm
        ? { weight: { '@type': 'QuantitativeValue', value: Number(v.gsm), unitCode: 'GM' } }
        : {}),
      offers: offers[i],
    }));
  } else if (offers.length === 1) {
    base.offers = offers[0];
  }

  return base;
}

/**
 * A procedure the page teaches — used by the paper calculator.
 *
 * "How do I work out what a ream of 300gsm 20x30 costs" is a question people
 * type into search engines and now ask chatbots, and the answer is a formula
 * this site already implements. Stating it as a HowTo is what makes the page
 * eligible to be the thing that gets quoted back.
 *
 * @param {Array<{name: string, text: string}>} steps
 */
export function howToSchema({ name, description, path, steps, supply = [], tool = [] }) {
  return {
    '@type': 'HowTo',
    '@id': `${absoluteUrl(path)}#howto`,
    name,
    description,
    supply: supply.map((s) => ({ '@type': 'HowToSupply', name: s })),
    tool: tool.map((t) => ({ '@type': 'HowToTool', name: t })),
    step: steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
      url: `${absoluteUrl(path)}#step-${i + 1}`,
    })),
  };
}

/** A category listing: the products on it, in the order the grid shows them. */
export function itemListSchema({ name, path, items }) {
  return {
    '@type': 'ItemList',
    '@id': `${absoluteUrl(path)}#itemlist`,
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      url: absoluteUrl(item.path),
    })),
  };
}

/**
 * Wraps a set of nodes in the `@graph` envelope. One script tag per page, one
 * connected graph inside it — parsers handle that far more reliably than a
 * dozen loose top-level objects.
 */
export function graph(nodes) {
  return {
    '@context': 'https://schema.org',
    '@graph': nodes.filter(Boolean),
  };
}

/** The nodes every page carries, whatever else it adds. */
export function baseGraphNodes() {
  return [organizationSchema(), localBusinessSchema(), websiteSchema()];
}
