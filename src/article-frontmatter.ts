import type { MarkdownHeading, MarkdownLayoutProps } from 'astro';

export interface ArticleFrontmatter {
  title : string;
};
export type MarkdownArticle = MarkdownLayoutProps<ArticleFrontmatter>;
