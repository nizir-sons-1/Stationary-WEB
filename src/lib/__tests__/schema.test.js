import { describe, it, expect } from 'vitest';
import {
  ORG_ID,
  STORE_ID,
  WEBSITE_ID,
  organizationSchema,
  localBusinessSchema,
  websiteSchema,
  webPageSchema,
  breadcrumbSchema,
  faqSchema,
  productSchema,
  howToSchema,
  itemListSchema,
  graph,
  baseGraphNodes,
} from '../schema.js';
import { SITE_URL, SITE_NAME, BUSINESS } from '../site.js';

// ── Stable IDs ───────────────────────────────────────────────────────

describe('schema IDs', () => {
  it('ORG_ID, STORE_ID, WEBSITE_ID are anchored to SITE_URL', () => {
    expect(ORG_ID).toContain(SITE_URL);
    expect(STORE_ID).toContain(SITE_URL);
    expect(WEBSITE_ID).toContain(SITE_URL);
  });
});

// ── organizationSchema ──────────────────────────────────────────────

describe('organizationSchema', () => {
  const schema = organizationSchema();

  it('has @type Organization', () => {
    expect(schema['@type']).toBe('Organization');
  });

  it('has @id matching ORG_ID', () => {
    expect(schema['@id']).toBe(ORG_ID);
  });

  it('includes business name and telephone', () => {
    expect(schema.name).toBe(SITE_NAME);
    expect(schema.telephone).toBe(BUSINESS.phoneE164);
  });

  it('has a PostalAddress', () => {
    expect(schema.address['@type']).toBe('PostalAddress');
    expect(schema.address.addressCountry).toBe(BUSINESS.country);
  });
});

// ── localBusinessSchema ─────────────────────────────────────────────

describe('localBusinessSchema', () => {
  const schema = localBusinessSchema();

  it('@type includes both Store and LocalBusiness', () => {
    expect(schema['@type']).toContain('Store');
    expect(schema['@type']).toContain('LocalBusiness');
  });

  it('has geo coordinates', () => {
    expect(schema.geo['@type']).toBe('GeoCoordinates');
    expect(schema.geo.latitude).toBe(BUSINESS.latitude);
  });

  it('has opening hours', () => {
    expect(schema.openingHoursSpecification.length).toBeGreaterThan(0);
    expect(schema.openingHoursSpecification[0]['@type']).toBe('OpeningHoursSpecification');
  });
});

// ── websiteSchema ────────────────────────────────────────────────────

describe('websiteSchema', () => {
  const schema = websiteSchema();

  it('is a WebSite with SearchAction', () => {
    expect(schema['@type']).toBe('WebSite');
    expect(schema.potentialAction['@type']).toBe('SearchAction');
  });

  it('search target contains SITE_URL', () => {
    expect(schema.potentialAction.target.urlTemplate).toContain(SITE_URL);
  });
});

// ── webPageSchema ────────────────────────────────────────────────────

describe('webPageSchema', () => {
  it('builds correct page node', () => {
    const schema = webPageSchema({ path: '/about', title: 'About', description: 'About us' });
    expect(schema['@type']).toBe('WebPage');
    expect(schema.url).toBe(`${SITE_URL}/about`);
    expect(schema.name).toBe('About');
    expect(schema.isPartOf['@id']).toBe(WEBSITE_ID);
  });

  it('accepts custom type', () => {
    const schema = webPageSchema({ path: '/faq', title: 'FAQ', description: 'FAQs', type: 'FAQPage' });
    expect(schema['@type']).toBe('FAQPage');
  });
});

// ── breadcrumbSchema ─────────────────────────────────────────────────

describe('breadcrumbSchema', () => {
  it('positions are 1-indexed', () => {
    const schema = breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Shop', path: '/shop' },
    ]);
    expect(schema['@type']).toBe('BreadcrumbList');
    expect(schema.itemListElement[0].position).toBe(1);
    expect(schema.itemListElement[1].position).toBe(2);
  });

  it('URLs are absolute', () => {
    const schema = breadcrumbSchema([{ name: 'Home', path: '/' }]);
    expect(schema.itemListElement[0].item).toContain(SITE_URL);
  });
});

// ── faqSchema ────────────────────────────────────────────────────────

describe('faqSchema', () => {
  it('produces correct Question/Answer structure', () => {
    const schema = faqSchema([
      { question: 'Q1?', answer: 'A1' },
      { question: 'Q2?', answer: 'A2' },
    ]);
    expect(schema['@type']).toBe('FAQPage');
    expect(schema.mainEntity).toHaveLength(2);
    expect(schema.mainEntity[0]['@type']).toBe('Question');
    expect(schema.mainEntity[0].acceptedAnswer['@type']).toBe('Answer');
    expect(schema.mainEntity[0].acceptedAnswer.text).toBe('A1');
  });
});

// ── productSchema ────────────────────────────────────────────────────

describe('productSchema', () => {
  it('single variation → Product with single Offer', () => {
    const schema = productSchema({
      name: 'Art Card',
      path: '/product/Art%20Card',
      variations: [{ size: 'A4', price: 100, stock: 5 }],
    });
    expect(schema['@type']).toBe('Product');
    expect(schema.offers['@type']).toBe('Offer');
    expect(schema.offers.price).toBe('100.00');
    expect(schema.offers.availability).toContain('InStock');
  });

  it('multiple variations → ProductGroup with hasVariant', () => {
    const schema = productSchema({
      name: 'Art Card',
      path: '/product/Art%20Card',
      variations: [
        { size: 'A4', price: 100, stock: 5 },
        { size: 'A3', price: 200, stock: 0 },
      ],
    });
    expect(schema['@type']).toBe('ProductGroup');
    expect(schema.hasVariant).toHaveLength(2);
    expect(schema.hasVariant[1].offers.availability).toContain('OutOfStock');
  });

  it('zero-price variations are excluded from offers', () => {
    const schema = productSchema({
      name: 'Free Sample',
      path: '/product/Free%20Sample',
      variations: [
        { size: 'A4', price: 0, stock: 5 },
        { size: 'A3', price: 100, stock: 5 },
      ],
    });
    // Only one priced variation → Product, not ProductGroup
    expect(schema['@type']).toBe('Product');
  });

  it('uses default description when none given', () => {
    const schema = productSchema({
      name: 'Art Card',
      path: '/product/Art%20Card',
      variations: [],
    });
    expect(schema.description).toContain('Art Card');
    expect(schema.description).toContain('Nazir');
  });
});

// ── howToSchema ───────────────────────────────────────────────────────

describe('howToSchema', () => {
  it('builds steps with 1-indexed positions', () => {
    const schema = howToSchema({
      name: 'Calculate',
      description: 'How to calculate',
      path: '/calculator',
      steps: [
        { name: 'Step 1', text: 'Do this' },
        { name: 'Step 2', text: 'Do that' },
      ],
    });
    expect(schema['@type']).toBe('HowTo');
    expect(schema.step[0].position).toBe(1);
    expect(schema.step[1].position).toBe(2);
  });
});

// ── itemListSchema ───────────────────────────────────────────────────

describe('itemListSchema', () => {
  it('has correct numberOfItems and positions', () => {
    const schema = itemListSchema({
      name: 'Art Cards',
      path: '/shop/paper-and-canvas/art-card',
      items: [
        { name: 'Card A', path: '/product/Card%20A' },
        { name: 'Card B', path: '/product/Card%20B' },
      ],
    });
    expect(schema.numberOfItems).toBe(2);
    expect(schema.itemListElement[0].position).toBe(1);
  });
});

// ── graph ────────────────────────────────────────────────────────────

describe('graph', () => {
  it('wraps nodes in @context and @graph', () => {
    const result = graph([{ '@type': 'Thing' }]);
    expect(result['@context']).toBe('https://schema.org');
    expect(result['@graph']).toHaveLength(1);
  });

  it('filters out null/undefined nodes', () => {
    const result = graph([{ '@type': 'Thing' }, null, undefined]);
    expect(result['@graph']).toHaveLength(1);
  });
});

// ── baseGraphNodes ───────────────────────────────────────────────────

describe('baseGraphNodes', () => {
  it('returns org, store and website', () => {
    const nodes = baseGraphNodes();
    expect(nodes).toHaveLength(3);
    const types = nodes.map((n) => n['@type']);
    expect(types).toContain('Organization');
    expect(types).toContain('WebSite');
  });
});
