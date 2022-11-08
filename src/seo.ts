// @ts-ignore-next-line This is a false error, it compiles just fine.
import type { Props as SEOProps } from 'astro-seo';

/**
 * Creates a new properties object for `astro-seo` by using set defaults and
 * applying custom property overrides if wanted.
 * 
 * @param overides Optional custom SEO properties
 * @returns New properties object with reasonable defaults applied
 */
export const MakeSEO = (overrides:SEOProps = {}):SEOProps => ({
  title: 'Chris Pikul',
  description: 'Portfolio site for Chris Pikul, developer for hire',
  openGraph: {
    basic: {
      title: 'Portfolio of Chris Pikul',
      type: 'website',
      image: '/dummy.png',
    },
    image: {
      url: '/dummy.png',
      type: 'image/png',
      alt: 'dummy image',
    },
    optional: {
      description: 'Personal portfolio site for Chris Pikul, developer for hire.',
      locale: 'en-US',
      siteName: 'Chris Pikul',
    }
  },
  twitter: {
    card: 'summary',
    site: '@ChrisPikul510',
    creator: '@ChrisPikul510',
  },
  extend: {
    link: [
      { rel: 'icon', href: '/favicon.ico' },
    ],
    meta: [
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ],
  },

  ...overrides,
});
export default MakeSEO;
