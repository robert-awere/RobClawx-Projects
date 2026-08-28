import data from './articles.json';

export interface Article {
  slug: string;
  title: string;
  description: string;
  published: string;
  updated?: string;
  models: string[];
  sections: Array<{ heading: string; paragraphs: string[]; bullets?: string[] }>;
  sources: Array<{ label: string; url: string }>;
}

export const ARTICLES = data as Article[];
