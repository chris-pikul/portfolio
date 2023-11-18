import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET() {
    const articles = (await getCollection('articles')).sort((a, b) => {
        const dateA = a.data.timestamp;
        const dateB = b.data.timestamp;
        return dateA < dateB ? 1 : dateA > dateB ? -1 : 0;
    });

    return rss({
        title: 'Chris Pikul',
        description: 'Articles from Chris Pikul, software engineer.',
        site: 'https://chris-pikul.com',
        items: articles.map((post) => ({
            title: post.data.title,
            pubDate: post.data.timestamp,
            description: post.data.summary,
            link: `/articles/${post.slug}/`,
            author: 'Chris Pikul',
        })),
        customData: `<language>en-US</language>`,
    });
}
