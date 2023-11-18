import { z, defineCollection } from 'astro:content';

const articlesCollection = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        summary: z.string(),
        timestamp: z.date(),
        tags: z.array(z.string()),
    }),
});

export const collections = {
    articles: articlesCollection,
};
