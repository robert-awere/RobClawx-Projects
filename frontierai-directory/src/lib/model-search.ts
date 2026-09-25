import { CATEGORY_LABELS, type AIModel } from '../data/models.ts';

const normalize = (text: string) => text.toLowerCase().replace(/[\p{Pd}\s]+/gu, ' ').trim();

export function matchesModel(model: AIModel, query: string): boolean {
  const text = normalize(`${model.name} ${model.provider} ${model.tagline} ${model.description} ${model.bestFor.join(' ')} ${model.category.map(c => CATEGORY_LABELS[c]).join(' ')}`);
  // ponytail: match every term across fields; no fuzzy-search dependency needed.
  return normalize(query).split(' ').every(term => text.includes(term));
}
