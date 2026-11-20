#!/usr/bin/env python3
"""
Generates static HTML files with complete pre-rendered SEO content,
meta tags, and Schema.org JSON-LD for Twingle's programmatic SEO pages.
"""

import os
import json

PAGES_DATA = {
    'mallu-dating-app': {
        'keyword': 'Mallu Dating App',
        'h1': 'The #1 Mallu Dating App for Malayalis in Kerala & Worldwide',
        'title': 'Mallu Dating App | #1 Kerala Dating App for Malayalis - Twingle',
        'description': 'Looking for the best Mallu dating app? Twingle connects Malayali singles with verified profiles, Kerala district matching, private voice calls, and safe chat.',
        'canonical': 'https://twingle.online/mallu-dating-app',
        'badge': 'Kerala’s Top Rated Dating App',
        'snippet': 'Twingle is the premier Mallu dating app tailored specifically for Malayalis in Kerala and the global diaspora. It features mandatory 18+ photo selfie verification, district-specific matching (Ernakulam, Trivandrum, Kozhikode, and all 14 districts), free mutual matching and chat, and budget-friendly premium upgrades starting at ₹199.'
    },
    'mallu-dating-website': {
        'keyword': 'Mallu Dating Website',
        'h1': 'The Official Mallu Dating Website for Malayali Singles',
        'title': 'Mallu Dating Website | Free Kerala Dating Site for Malayalis - Twingle',
        'description': 'Looking for a reliable Mallu dating website? Twingle Web lets you browse, match, and chat with verified Kerala singles right from your browser with no download needed.',
        'canonical': 'https://twingle.online/mallu-dating-website',
        'badge': '100% Web & Mobile Friendly',
        'snippet': 'Twingle Web (twingle.online) is the official online Mallu dating website offering a full browser-based dating platform for Malayalis. Users can sign up with Google or email, customize their bio and Kerala district, swipe on verified profiles, and chat with mutual matches with zero app download required.'
    },
    'malayalis-dating-app': {
        'keyword': 'Malayalis Dating App',
        'h1': 'The Dedicated Malayalis Dating App for Meaningful Connections',
        'title': 'Malayalis Dating App | Where Kerala Singles Find Love - Twingle',
        'description': 'The premier dating app created exclusively for Malayalis. Meet cultured, genuine Malayali singles for dating, romance, and marriage in Kerala and across the globe.',
        'canonical': 'https://twingle.online/malayalis-dating-app',
        'badge': 'Exclusive Malayali Community',
        'snippet': 'Twingle is an exclusive Malayalis dating app designed to unite Keralite singles residing in India and overseas. Featuring shared interest tags, relationship intent alignment (Casual, Serious Dating, Marriage), and verified photo safeguards, it provides an authentic cultural dating environment for modern Malayalis.'
    },
    'malayalam-dating-app': {
        'keyword': 'Malayalam Dating App',
        'h1': 'Malayalam Dating App | Connect with Kerala Singles with Shared Values',
        'title': 'Malayalam Dating App | Safe & Modern Dating for Kerala Singles - Twingle',
        'description': 'Experience genuine romance on Twingle, the modern Malayalam dating app. Verified profiles, seamless chat, voice calling, and district matching for Malayalis.',
        'canonical': 'https://twingle.online/malayalam-dating-app',
        'badge': 'Kerala’s Trusted Platform',
        'snippet': 'Twingle is the leading Malayalam dating app providing a modern, respectful dating ecosystem for Malayalam speakers. With support for bilingual conversations, verified user badges, and transparent subscription pricing, Twingle makes meeting like-minded Keralites effortless.'
    },
    'best-mallu-dating-app': {
        'keyword': 'Best Mallu Dating App',
        'h1': 'The Best Mallu Dating App in 2026: Why Twingle Ranks #1',
        'title': 'Best Mallu Dating App in 2026 | Twingle vs Arike, Tinder & Bumble',
        'description': 'Ranked the best Mallu dating app in Kerala. Compare Twingle vs Arike, Tinder, and Bumble on pricing, verified profiles, voice calls, and district matching.',
        'canonical': 'https://twingle.online/best-mallu-dating-app',
        'badge': 'Ranked #1 for Malayalis',
        'snippet': 'Twingle is ranked the best Mallu dating app in 2026 due to its superior feature-to-price ratio: Gold plans at ₹199/month (vs Arike and Tinder at ₹800–₹1,500/month), built-in audio calling, mandatory photo verification, and dedicated matching algorithms tuned for Kerala’s 14 districts.'
    },
    'affordable-dating-app-for-mallus': {
        'keyword': 'Affordable Dating App for Mallus',
        'h1': 'The Most Affordable Dating App for Mallus | Plans Starting at ₹199',
        'title': 'Affordable Dating App for Mallus | Plans from ₹199 - Twingle',
        'description': 'Looking for a cheap and affordable dating app for Mallus? Twingle offers free matching and chat, plus Gold plans from just ₹199/month with unlimited swipes.',
        'canonical': 'https://twingle.online/affordable-dating-app-for-mallus',
        'badge': 'Best Value for Kerala Singles',
        'snippet': 'Twingle is Kerala’s most affordable dating app for Mallu singles, offering free mutual matching and messaging, plus an ultra-low Gold subscription at ₹199 for 30 days and Platinum at ₹499 for 90 days. Users pay securely with Google Pay, PhonePe, or Paytm without recurring credit card charges.'
    }
}

HTML_TEMPLATE = """<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <link rel="icon" href="/favicon.ico" sizes="any" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="apple-touch-icon" href="/twingle-logo.png" />
  <link rel="manifest" href="/manifest.json" />

  <title>{title}</title>
  <meta name="description" content="{description}" />
  <meta name="keywords" content="{keyword}, mallu dating app, mallu dating website, malayalis dating app, malayalam dating app, best mallu dating app, affordable dating app for mallus, kerala dating, kochi dating, malayali matrimony" />
  <link rel="canonical" href="{canonical}" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="{canonical}" />
  <meta property="og:title" content="{title}" />
  <meta property="og:description" content="{description}" />
  <meta property="og:image" content="https://twingle.online/twingle-logo.png" />
  <meta property="og:site_name" content="Twingle" />
  <meta property="og:locale" content="en_IN" />

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content="{canonical}" />
  <meta property="twitter:title" content="{title}" />
  <meta property="twitter:description" content="{description}" />
  <meta property="twitter:image" content="https://twingle.online/twingle-logo.png" />

  <meta name="theme-color" content="#ec4899" />

  <script type="application/ld+json">
  [
    {{
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "{title}",
      "description": "{description}",
      "url": "{canonical}",
      "inLanguage": ["en-IN", "ml-IN"],
      "isPartOf": {{
        "@type": "WebSite",
        "name": "Twingle",
        "url": "https://twingle.online"
      }}
    }},
    {{
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Twingle - Mallu Dating App",
      "operatingSystem": "Android, iOS, Web",
      "applicationCategory": "DatingApplication",
      "url": "https://twingle.online",
      "image": "https://twingle.online/twingle-logo.png",
      "downloadUrl": "https://twingle.online/download",
      "aggregateRating": {{
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "14280",
        "bestRating": "5"
      }},
      "offers": [
        {{
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "INR",
          "name": "Free Tier"
        }},
        {{
          "@type": "Offer",
          "price": "199",
          "priceCurrency": "INR",
          "name": "Gold Monthly"
        }}
      ]
    }}
  ]
  </script>
</head>
<body>
  <div id="root"></div>
  <noscript>
    <div style="font-family: sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6;">
      <p style="color: #ec4899; font-weight: bold; text-transform: uppercase;">{badge}</p>
      <h1>{h1}</h1>
      <p style="font-size: 1.1em; color: #444;">{snippet}</p>
      <div style="margin: 30px 0;">
        <a href="/register" style="background: #ec4899; color: white; padding: 12px 24px; border-radius: 50px; text-decoration: none; font-weight: bold;">Start Free Dating</a>
        <a href="/download" style="margin-left: 10px; background: #1e293b; color: white; padding: 12px 24px; border-radius: 50px; text-decoration: none; font-weight: bold;">Download Android App</a>
      </div>
      <h2>Key Dating Features for Malayalis</h2>
      <ul>
        <li><strong>Kerala District Matching:</strong> Match with verified singles across Ernakulam, Trivandrum, Kozhikode, and all 14 districts.</li>
        <li><strong>In-App Voice Calling:</strong> High quality private audio calls without exchanging personal phone numbers.</li>
        <li><strong>Photo Selfie Verification:</strong> 100% verified Blue Tick badges to eliminate bots and catfish.</li>
        <li><strong>Affordable Subscriptions:</strong> Free matching with optional Gold plan at only ₹199/month.</li>
      </ul>
      <p><a href="/">Back to Twingle Homepage</a> | <a href="/terms">Terms</a> | <a href="/privacy">Privacy</a></p>
    </div>
  </noscript>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
"""

def generate():
    output_dir = 'frontend/public'
    os.makedirs(output_dir, exist_ok=True)

    for slug, data in PAGES_DATA.items():
        html = HTML_TEMPLATE.format(
            title=data['title'],
            description=data['description'],
            keyword=data['keyword'],
            canonical=data['canonical'],
            badge=data['badge'],
            h1=data['h1'],
            snippet=data['snippet']
        )
        file_path = os.path.join(output_dir, f"{slug}.html")
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f"Generated {file_path}")

if __name__ == '__main__':
    generate()
