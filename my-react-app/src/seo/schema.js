import { SITE, canonicalFor } from './seo-config.js';

/** WebPage + BreadcrumbList + FAQPage as one @graph, linked to the site-wide graph in index.html. */
export function buildPageSchema(page) {
  const url = canonicalFor(page.path);
  const graph = [
    {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: page.title,
      description: page.description,
      inLanguage: 'en',
      isPartOf: { '@id': `${SITE.url}/#website` },
      about: { '@id': `${SITE.url}/#webapp` },
      primaryImageOfPage: { '@type': 'ImageObject', url: SITE.ogImage },
    },
  ];

  if (page.path !== '/') {
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE.url}/` },
        { '@type': 'ListItem', position: 2, name: page.h1, item: url },
      ],
    });
  }

  if (page.faq?.length) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      mainEntity: page.faq.map(({ question, answer }) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
      })),
    });
  }

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
}
