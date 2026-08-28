import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const articles = JSON.parse(readFileSync(join(root, 'src/data/articles.json'), 'utf8'))
const catalogUpdated = readFileSync(join(root, 'src/data/models.ts'), 'utf8').match(/export const LAST_UPDATED = '(\d{4}-\d{2}-\d{2})'/)?.[1]
const out = join(root, 'public/articles')
const site = 'https://www.frontierai.directory'

if (!catalogUpdated) throw new Error('LAST_UPDATED must be an ISO date')

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char])

const isoWeek = (dateString) => {
  const date = new Date(`${dateString}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  return `${date.getUTCFullYear()}-${Math.ceil((((date - yearStart) / 86400000) + 1) / 7)}`
}

function validate() {
  if (!Array.isArray(articles)) throw new Error('articles.json must contain an array')
  const slugs = new Set()
  const weeks = new Map()
  for (const article of articles) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug)) throw new Error(`Invalid article slug: ${article.slug}`)
    if (slugs.has(article.slug)) throw new Error(`Duplicate article slug: ${article.slug}`)
    slugs.add(article.slug)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(article.published) || Number.isNaN(Date.parse(article.published))) throw new Error(`Invalid date: ${article.slug}`)
    if (article.title.length < 30 || article.title.length > 90) throw new Error(`Title must be 30–90 characters: ${article.slug}`)
    if (article.description.length < 100 || article.description.length > 180) throw new Error(`Description must be 100–180 characters: ${article.slug}`)
    if (!Array.isArray(article.models) || article.models.length === 0) throw new Error(`Article must name catalog models: ${article.slug}`)
    if (!Array.isArray(article.sources) || article.sources.length < 2 || article.sources.some((source) => !source.url.startsWith('https://'))) throw new Error(`Article needs at least two HTTPS sources: ${article.slug}`)
    if (!Array.isArray(article.sections) || article.sections.length < 3) throw new Error(`Article needs at least three sections: ${article.slug}`)
    const words = article.sections.flatMap((section) => [section.heading, ...section.paragraphs, ...(section.bullets ?? [])]).join(' ').trim().split(/\s+/).length
    if (words < 700) throw new Error(`Article is only ${words} words (700 minimum): ${article.slug}`)
    const week = isoWeek(article.published)
    weeks.set(week, (weeks.get(week) ?? 0) + 1)
    if (weeks.get(week) > 2) throw new Error(`More than two articles in ISO week ${week}`)
  }
}

const css = `body{margin:0;background:#faf9f7;color:#262626;font:16px/1.7 system-ui,-apple-system,sans-serif}main{max-width:760px;margin:auto;padding:48px 24px 80px}a{color:#171717}nav{font-size:14px;margin-bottom:48px}.eyebrow{color:#737373;font-size:12px;letter-spacing:.12em;text-transform:uppercase}h1,h2{font-family:Georgia,serif;line-height:1.15}h1{font-size:clamp(38px,7vw,60px);margin:.25em 0}h2{font-size:28px;margin-top:2em}p,li{color:#404040}.dek{font-size:20px;color:#525252}.meta{border-top:1px solid #ddd;border-bottom:1px solid #ddd;padding:12px 0;margin:28px 0;color:#737373;font-size:14px}.sources{margin-top:56px;border-top:1px solid #ddd}.card{display:block;padding:22px 0;border-bottom:1px solid #ddd;text-decoration:none}.card h2{margin:0 0 6px;font-size:24px}.card p{margin:0}`

const layout = ({ title, description, canonical, body, schema = '' }) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}"><link rel="canonical" href="${canonical}">
<meta property="og:type" content="article"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${canonical}">
<style>${css}</style>${schema}</head><body><main><nav><a href="/">← Frontier AI directory</a></nav>${body}</main></body></html>`

validate()
rmSync(out, { recursive: true, force: true })
mkdirSync(out, { recursive: true })

for (const article of articles) {
  const canonical = `${site}/articles/${article.slug}/`
  const body = `<p class="eyebrow">Analysis · ${escapeHtml(article.published)}</p><h1>${escapeHtml(article.title)}</h1><p class="dek">${escapeHtml(article.description)}</p><p class="meta">Models covered: ${article.models.map(escapeHtml).join(', ')}</p>${article.sections.map((section) => `<section><h2>${escapeHtml(section.heading)}</h2>${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}${section.bullets?.length ? `<ul>${section.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}</ul>` : ''}</section>`).join('')}<section class="sources"><h2>Sources</h2><ul>${article.sources.map((source) => `<li><a href="${escapeHtml(source.url)}" rel="noopener noreferrer">${escapeHtml(source.label)}</a></li>`).join('')}</ul></section>`
  const jsonLd = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Article', headline: article.title, description: article.description, datePublished: article.published, dateModified: article.updated ?? article.published, mainEntityOfPage: canonical, author: { '@type': 'Organization', name: 'Frontier AI' } }).replaceAll('<', '\\u003c')
  const html = layout({ title: `${article.title} — Frontier AI`, description: article.description, canonical, body, schema: `<script type="application/ld+json">${jsonLd}</script>` })
  const directory = join(out, article.slug)
  mkdirSync(directory, { recursive: true })
  writeFileSync(join(directory, 'index.html'), html)
}

const indexBody = `<p class="eyebrow">Frontier AI</p><h1>Model analysis</h1><p class="dek">Evidence-led comparisons, pricing changes, benchmark interpretation, and practical model selection.</p>${articles.slice().sort((a, b) => b.published.localeCompare(a.published)).map((article) => `<a class="card" href="/articles/${article.slug}/"><h2>${escapeHtml(article.title)}</h2><p>${escapeHtml(article.description)}</p></a>`).join('') || '<p>No articles published yet.</p>'}`
writeFileSync(join(out, 'index.html'), layout({ title: 'AI model analysis — Frontier AI', description: 'Evidence-led analysis of frontier AI models, pricing, benchmarks, and practical model selection.', canonical: `${site}/articles/`, body: indexBody }))

const urls = [{ path: '/', modified: catalogUpdated }, ...articles.map((article) => ({ path: `/articles/${article.slug}/`, modified: article.updated ?? article.published }))]
writeFileSync(join(root, 'public/sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(({ path, modified }) => `  <url><loc>${site}${path}</loc><lastmod>${modified}</lastmod></url>`).join('\n')}\n</urlset>\n`)
writeFileSync(join(root, 'public/robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${site}/sitemap.xml\n`)
console.log(`Generated ${articles.length} article page${articles.length === 1 ? '' : 's'}`)
