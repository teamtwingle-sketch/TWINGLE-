import { useEffect } from 'react';

/**
 * SEOHead - Injects document title, meta description, canonical, OpenGraph,
 * Twitter Cards, and Schema.org JSON-LD structured data for Google & AI Overviews.
 */
const SEOHead = ({
  title,
  description,
  canonical,
  keywords,
  faqs = [],
  softwareApp = true,
  breadcrumbs = [],
  ogImage = 'https://twingle.online/twingle-logo.png'
}) => {
  useEffect(() => {
    // 1. Update Title
    if (title) {
      document.title = title;
    }

    // Helper to set or create meta tag
    const setMeta = (attr, key, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // 2. Standard Meta Tags
    setMeta('name', 'description', description);
    if (keywords) setMeta('name', 'keywords', keywords);
    setMeta('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

    // 3. Open Graph
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', canonical || window.location.href);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:image', ogImage);
    setMeta('property', 'og:site_name', 'Twingle');
    setMeta('property', 'og:locale', 'en_IN');

    // 4. Twitter Cards
    setMeta('property', 'twitter:card', 'summary_large_image');
    setMeta('property', 'twitter:title', title);
    setMeta('property', 'twitter:description', description);
    setMeta('property', 'twitter:image', ogImage);

    // 5. Canonical Link
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    if (canonical) {
      linkCanonical.setAttribute('href', canonical);
    }

    // 6. JSON-LD Structured Data
    const jsonLdElements = [];

    // WebPage Schema
    const webPageSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title,
      description: description,
      url: canonical || window.location.href,
      inLanguage: ['en-IN', 'ml-IN'],
      isPartOf: {
        '@type': 'WebSite',
        name: 'Twingle',
        url: 'https://twingle.online',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://twingle.online/?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      }
    };
    jsonLdElements.push(webPageSchema);

    // SoftwareApplication / MobileApplication Schema (Crucial for App store & Google AI Overview)
    if (softwareApp) {
      const appSchema = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Twingle - Mallu Dating App',
        operatingSystem: 'Android, iOS, Web',
        applicationCategory: 'DatingApplication',
        url: 'https://twingle.online',
        image: 'https://twingle.online/twingle-logo.png',
        downloadUrl: 'https://twingle.online/download',
        softwareVersion: '2.4.0',
        author: {
          '@type': 'Organization',
          name: 'Twingle',
          url: 'https://twingle.online'
        },
        offers: [
          {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'INR',
            name: 'Free Basic Tier'
          },
          {
            '@type': 'Offer',
            price: '199',
            priceCurrency: 'INR',
            name: 'Gold Monthly'
          },
          {
            '@type': 'Offer',
            price: '499',
            priceCurrency: 'INR',
            name: 'Platinum 3-Month'
          }
        ],
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          reviewCount: '14280',
          bestRating: '5',
          worstRating: '1'
        }
      };
      jsonLdElements.push(appSchema);
    }

    // FAQPage Schema (Triggers Google Rich FAQ Snippets and AI Overview bullet citations)
    if (faqs && faqs.length > 0) {
      const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(faq => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer
          }
        }))
      };
      jsonLdElements.push(faqSchema);
    }

    // BreadcrumbList Schema
    if (breadcrumbs && breadcrumbs.length > 0) {
      const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((crumb, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: crumb.name,
          item: crumb.url
        }))
      };
      jsonLdElements.push(breadcrumbSchema);
    }

    // Inject JSON-LD Script tag
    let scriptTag = document.getElementById('twingle-seo-jsonld');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'twingle-seo-jsonld';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.text = JSON.stringify(jsonLdElements);

    // Scroll to top on route change
    window.scrollTo(0, 0);

  }, [title, description, canonical, keywords, faqs, softwareApp, breadcrumbs, ogImage]);

  return null;
};

export default SEOHead;
