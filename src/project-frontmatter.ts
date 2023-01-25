import type { MarkdownLayoutProps } from 'astro';

export interface ProjectFrontmatter {
  title : string;
  summary : string;
  timestamp : string;
  tags : Array<string>;
};
export type MarkdownArticle = MarkdownLayoutProps<ProjectFrontmatter>;
