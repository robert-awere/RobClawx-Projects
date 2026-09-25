import assert from 'node:assert/strict';
import { MODELS, CATEGORY_LABELS } from '../src/data/models.ts';
import { matchesModel } from '../src/lib/model-search.ts';

const opus = MODELS.find(m => m.id === 'claude-opus-5-5');
const astra = MODELS.find(m => m.id === 'gpt-6-astra');
assert.ok(opus && astra);
assert.ok(matchesModel(opus, 'claude'));
assert.ok(matchesModel(opus, '  CLAUDE   Opus  '));
assert.ok(matchesModel(astra, 'OpenAI coding'));
assert.ok(matchesModel(astra, 'gpt 6'));
assert.ok(matchesModel(astra, 'GPT–6'));
assert.ok(matchesModel(opus, 'debugging'));
assert.ok(!matchesModel(opus, 'claude nonexistent-query'));
for (const model of MODELS) {
  assert.ok(matchesModel(model, ''));
  assert.ok(matchesModel(model, '   '));
  assert.ok(matchesModel(model, model.name));
  assert.ok(matchesModel(model, model.provider));
  for (const category of model.category) {
    assert.ok(matchesModel(model, CATEGORY_LABELS[category]));
  }
}
console.log('Search regression checks passed across the full catalog.');
