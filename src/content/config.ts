import { z, defineCollection } from 'astro:content';

const articlesCollection = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        summary: z.string(),
        timestamp: z.date(),
        tags: z.array(z.string()),

        heading: z.optional(z.string()),
        subheading: z.optional(z.string()),
        part: z.optional(z.number()),
    }),
});

const projectsCollection = defineCollection({
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
    projects: projectsCollection,
};
