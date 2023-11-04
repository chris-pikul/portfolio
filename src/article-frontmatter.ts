import type { MarkdownLayoutProps } from 'astro';

export interface ArticleFrontmatter {
    title: string;
    heading?: string;
    subheading?: string;
    part?: number;
    summary: string;
    timestamp: string;
    tags: Array<string>;
    draft?: boolean;
}
export type MarkdownArticle = MarkdownLayoutProps<ArticleFrontmatter>;
