# Frontier AI — The AI Model Directory

**[frontierai.directory](https://frontierai.directory)**

A curated, searchable directory of the AI models that matter right now — frontier closed systems
(Claude Fable 5, GPT-5.6, Gemini 3.1), the open-weight field (Kimi K3, DeepSeek V4, GLM-5.2, Llama 4),
and the state of the art in image, video, and audio generation.

**31 models · 19 labs · verified July 2026**

## Features

- Full-text search across models, vendors, and use cases
- Filter by capability class (general / reasoning / coding / multimodal / image / video / audio),
  vendor, and open-weight status
- Sort by release date, context length, or price
- Per-model fact sheet: context window, pricing, parameters, license, benchmark, strengths,
  limitations, best-for scenarios
- Editorial, print-inspired design — no accounts, no backend, fully static

## Tech stack

- React 19 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Newsreader (serif display) + system sans
- All data lives in a single flat file: `src/data/models.ts`

## Run locally

```bash
npm install
npm run dev      # dev server
npm run build    # production build → dist/
```

## Updating the catalog

The directory is only as good as its freshness. Weekly routine (~30 min):

1. Scan LMArena, Artificial Analysis, Hugging Face trending, and vendor blogs
   (OpenAI, Anthropic, Google DeepMind, DeepSeek, Moonshot, Zhipu, Alibaba, Meta).
2. Triage — add a model only if it's frontier-class, a price disruption, or a meaningful
   open-weight release. Keep the list curated, not exhaustive.
3. Copy an existing entry in `src/data/models.ts`, edit the fields, `npm run build`.
4. Re-verify pricing quarterly — it stales fastest.

## License

MIT
