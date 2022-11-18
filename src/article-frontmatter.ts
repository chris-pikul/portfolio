import type { MarkdownHeading, MarkdownLayoutProps } from 'astro';

export interface ArticleFrontmatter {
  title : string;
  summary : string;
  timestamp : string;
  tags : Array<string>;
};
export type MarkdownArticle = MarkdownLayoutProps<ArticleFrontmatter>;
