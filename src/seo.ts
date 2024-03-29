// @ts-ignore-next-line This is a false error, it compiles just fine.
import type { Props as SEOProps } from 'astro-seo';

function overrideObjects<T extends Object>(a: T, b: Partial<T>): T {
    const obj = { ...a } as T;

    for (const key in b) {
        if (typeof b[key] === 'object') {
            if (Array.isArray(b[key]))
                obj[key] = [...(b[key] as Array<unknown>)] as T[Extract<
                    keyof T,
                    string
                >];
            else
                obj[key] = overrideObjects(
                    obj[key] as Object,
                    b[key] as Object,
                ) as T[Extract<keyof T, string>];
        } else if (typeof b[key] !== 'undefined') {
            obj[key] = b[key] as T[Extract<keyof T, string>];
        }
    }

    return obj;
}

/**
 * Creates a new properties object for `astro-seo` by using set defaults and
 * applying custom property overrides if wanted.
 *
 * @param overides Optional custom SEO properties
 * @returns New properties object with reasonable defaults applied
 */
export const MakeSEO = (overrides: Partial<SEOProps> = {}): SEOProps =>
    overrideObjects<SEOProps>(
        {
            title: 'Chris Pikul',
            description: 'Portfolio site for Chris Pikul, developer for hire',
            openGraph: {
                basic: {
                    title: 'Portfolio of Chris Pikul',
                    type: 'website',
                    image: '/chris-logo-512.png',
                },
                image: {
                    url: '/chris-logo-1024.png',
                    type: 'image/png',
                    alt: 'Logo for Chris Pikul featuring the monogram C and P',
                },
                optional: {
                    description:
                        'Personal portfolio site for Chris Pikul, developer for hire.',
                    locale: 'en-US',
                    siteName: 'Chris Pikul',
                },
            },
            twitter: {
                card: 'summary',
                site: '@ChrisPikul510',
                creator: '@ChrisPikul510',
            },
            extend: {
                link: [{ rel: 'icon', href: '/favicon.svg' }],
                meta: [
                    {
                        name: 'viewport',
                        content: 'width=device-width, initial-scale=1',
                    },
                ],
            },
        },
        overrides,
    );
export default MakeSEO;
