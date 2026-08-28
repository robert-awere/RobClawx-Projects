# FrontierAI editorial rules

## Purpose

Keep the model directory accurate and publish useful analysis about models in the catalog. Integrity is more important than frequency.

## Catalog updates

Add a model only when it is frontier-class, materially changes price/performance, or is a meaningful open-weight release. Update existing entries when verified specifications, pricing, licensing, availability, or benchmark standing changes.

Use primary sources first: official model cards, API/pricing documentation, release notes, repositories, and lab announcements. Independent benchmark claims should link to the benchmark publisher. Never copy a vendor claim as an independent conclusion.

## Articles

- Publish no more than two articles in any Monday–Sunday week.
- One or zero is correct when the material does not justify two.
- Every article must be tied to at least one model in `src/data/models.ts`, answer a real reader question, cite at least two credible sources, and contain at least 700 substantive words.
- Prefer comparisons, verified price/performance changes, benchmark interpretation, upgrade implications, and practical model selection.
- Do not publish announcement rewrites, generic AI commentary, unsupported predictions, keyword-stuffed copy, or filler created to meet a schedule.
- Distinguish vendor-reported results from independent evaluations. Include limitations and material counter-evidence.

Articles live in `src/data/articles.json`. The build validates editorial minimums and generates crawlable pages under `/articles/`, plus the sitemap. A failed validation means the article must not ship.

## Publication checklist

1. Pull `main` with `git pull --ff-only` and stop if the worktree is not clean.
2. Research the current catalog and recent sources; check existing article titles and angles to avoid duplication.
3. Make only verified, meaningful changes.
4. Update `LAST_UPDATED` only when catalog facts changed.
5. Run `npm run lint` and `npm run build`.
6. Review the diff for unsupported claims, accidental deletions, secrets, and generated-page correctness.
7. Commit and push only when checks pass. If nothing meets the bar, make no commit.
