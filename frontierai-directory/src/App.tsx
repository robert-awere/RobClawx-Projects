import { useMemo, useState } from 'react';
import {
  Search, X, ExternalLink, ArrowUpDown, Check, Minus,
  Brain, Code2, MessageSquare, Layers, Image as ImageIcon, Clapperboard, AudioLines,
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  MODELS, PROVIDERS, CATEGORY_LABELS, LAST_UPDATED, formatContext, formatPrice, formatReleased,
  type AIModel, type Category,
} from '@/data/models';
import { ARTICLES } from '@/data/articles';

const CATEGORY_ICONS: Record<Category, React.ReactNode> = {
  language: <MessageSquare className="w-3 h-3" />,
  reasoning: <Brain className="w-3 h-3" />,
  coding: <Code2 className="w-3 h-3" />,
  multimodal: <Layers className="w-3 h-3" />,
  image: <ImageIcon className="w-3 h-3" />,
  video: <Clapperboard className="w-3 h-3" />,
  audio: <AudioLines className="w-3 h-3" />,
};

type SortKey = 'released' | 'context' | 'price';
const SORT_LABELS: Record<SortKey, string> = { released: 'Newest first', context: 'Context length', price: 'Price, low to high' };

export default function App() {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<Category | 'all'>('all');
  const [prov, setProv] = useState<string | 'all'>('all');
  const [openOnly, setOpenOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>('released');
  const [selected, setSelected] = useState<AIModel | null>(null);

  const filtered = useMemo(() => {
    const list = MODELS.filter((m) => {
      if (cat !== 'all' && !m.category.includes(cat)) return false;
      if (prov !== 'all' && m.provider !== prov) return false;
      if (openOnly && !m.openWeight) return false;
      if (query) {
        const hay = `${m.name} ${m.provider} ${m.tagline} ${m.description} ${m.bestFor.join(' ')}`.toLowerCase();
        if (!hay.includes(query.toLowerCase())) return false;
      }
      return true;
    });
    return [...list].sort((a, b) => {
      if (sort === 'released') return b.released.localeCompare(a.released);
      if (sort === 'context') return (b.context ?? 0) - (a.context ?? 0);
      return (a.pricing.input ?? 0.05) - (b.pricing.input ?? 0.05);
    });
  }, [query, cat, prov, openOnly, sort]);

  const openCount = MODELS.filter((m) => m.openWeight).length;

  return (
    <div className="min-h-screen bg-[#faf9f7] text-neutral-800 antialiased">
      {/* ── Masthead ── */}
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 pt-14 pb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
            frontierai.directory — Updated {formatReleased(LAST_UPDATED.slice(0, 7))}
          </p>
          <h1 className="mt-3 font-serif text-[42px] leading-[1.05] sm:text-[54px] font-semibold tracking-tight text-neutral-900">
            Frontier <span className="italic">AI</span>
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-neutral-500">
            A curated directory of the models that matter right now — closed frontier systems from OpenAI,
            Anthropic, and Google; the open-weight field led by Llama, DeepSeek, GLM, and Kimi;
            and the current state of the art in image, video, and audio generation.
          </p>
          <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-3 border-t border-neutral-200 pt-5 text-sm">
            {[
              ['Models tracked', MODELS.length],
              ['Labs & vendors', PROVIDERS.length],
              ['Open weight', openCount],
              ['Capability classes', 7],
            ].map(([label, n]) => (
              <div key={label as string} className="flex items-baseline gap-2">
                <dd className="font-serif text-2xl font-semibold text-neutral-900">{n}</dd>
                <dt className="text-neutral-400">{label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </header>

      {/* ── Controls ── */}
      <div className="sticky top-0 z-30 border-b border-neutral-200 bg-[#faf9f7]/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-3.5 space-y-2.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search models, vendors, use cases"
                className="w-full rounded-md border border-neutral-300 bg-white py-1.5 pl-9 pr-7 text-[13px] outline-none placeholder:text-neutral-400 focus:border-neutral-500 transition"
              />
              {query && (
                <button onClick={() => setQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[12px]">
              <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
              <div className="flex rounded-md border border-neutral-300 bg-white overflow-hidden">
                {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => setSort(k)}
                    className={`px-2.5 py-1.5 transition ${sort === k ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:bg-neutral-100'}`}
                  >
                    {SORT_LABELS[k]}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex cursor-pointer items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-[12px] text-neutral-600 select-none">
              <input
                type="checkbox"
                checked={openOnly}
                onChange={(e) => setOpenOnly(e.target.checked)}
                className="accent-neutral-900"
              />
              Open weight only
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Chip active={cat === 'all'} onClick={() => setCat('all')}>All capabilities</Chip>
            {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => (
              <Chip key={c} active={cat === c} onClick={() => setCat(cat === c ? 'all' : c)}>
                <span className="flex items-center gap-1">{CATEGORY_ICONS[c]}{CATEGORY_LABELS[c]}</span>
              </Chip>
            ))}
            <span className="mx-1.5 h-3.5 w-px bg-neutral-300" />
            <Chip active={prov === 'all'} onClick={() => setProv('all')}>All vendors</Chip>
            {PROVIDERS.map((p) => (
              <Chip key={p} active={prov === p} onClick={() => setProv(prov === p ? 'all' : p)}>{p}</Chip>
            ))}
          </div>
        </div>
      </div>

      {/* ── Listing ── */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        <p className="mb-4 text-[12px] uppercase tracking-wider text-neutral-400">
          {filtered.length} model{filtered.length === 1 ? '' : 's'}
        </p>
        {filtered.length === 0 ? (
          <div className="border border-dashed border-neutral-300 rounded-lg py-20 text-center text-sm text-neutral-400">
            No models match the current filters.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white divide-y divide-neutral-100">
            {filtered.map((m) => (
              <ModelRow key={m.id} m={m} onClick={() => setSelected(m)} />
            ))}
          </div>
        )}
      </main>

      {ARTICLES.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-12" aria-labelledby="analysis-heading">
          <div className="border-t border-neutral-200 pt-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Evidence-led editorial</p>
            <h2 id="analysis-heading" className="mt-2 font-serif text-3xl font-semibold text-neutral-900">Model analysis</h2>
            <div className="mt-5 grid gap-px overflow-hidden rounded-lg border border-neutral-200 bg-neutral-200 md:grid-cols-2">
              {ARTICLES.slice().sort((a, b) => b.published.localeCompare(a.published)).slice(0, 4).map((article) => (
                <a key={article.slug} href={`/articles/${article.slug}/`} className="bg-white p-5 transition hover:bg-neutral-50">
                  <p className="text-[10px] uppercase tracking-wider text-neutral-400">{formatReleased(article.published.slice(0, 7))}</p>
                  <h3 className="mt-2 font-serif text-xl font-semibold text-neutral-900">{article.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-neutral-500">{article.description}</p>
                </a>
              ))}
            </div>
            <a href="/articles/" className="mt-4 inline-block text-[13px] font-medium underline underline-offset-4">All analysis →</a>
          </div>
        </section>
      )}

      <footer className="border-t border-neutral-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-6 text-[11.5px] leading-relaxed text-neutral-400">
          Figures are compiled from vendor documentation and public evaluations, last reviewed {formatReleased(LAST_UPDATED.slice(0, 7))}
          (SWE-bench, LMArena, Artificial Analysis, and others). Prices are in US dollars per million tokens
          and subject to change. Benchmark scores are approximate and intended for orientation only.
        </div>
      </footer>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl border-neutral-200 bg-white p-0 overflow-hidden">
          {selected && <ModelDetail m={selected} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-2.5 py-1 text-[12px] transition ${
        active
          ? 'border-neutral-900 bg-neutral-900 text-white'
          : 'border-neutral-300 bg-white text-neutral-500 hover:border-neutral-500 hover:text-neutral-800'
      }`}
    >
      {children}
    </button>
  );
}

function ModelRow({ m, onClick }: { m: AIModel; onClick: () => void }) {
  return (
    <button onClick={onClick} className="group flex w-full items-start gap-5 px-5 py-4 text-left transition hover:bg-neutral-50 sm:items-center">
      {/* identity */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          <h3 className="font-serif text-[17px] font-semibold text-neutral-900 group-hover:underline underline-offset-4 decoration-neutral-300">
            {m.name}
          </h3>
          <span className="text-[12px] text-neutral-400">{m.provider}</span>
          {m.hot && (
            <span className="rounded-sm border border-amber-300 bg-amber-50 px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-amber-700">
              Notable
            </span>
          )}
        </div>
        <p className="mt-1 text-[13px] leading-relaxed text-neutral-500 line-clamp-1">{m.tagline} · {m.description}</p>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {m.category.map((c) => (
            <span key={c} className="flex items-center gap-1 rounded-sm bg-neutral-100 px-1.5 py-0.5 text-[10.5px] text-neutral-500">
              {CATEGORY_ICONS[c]}{CATEGORY_LABELS[c]}
            </span>
          ))}
          <span className={`rounded-sm px-1.5 py-0.5 text-[10.5px] font-medium ${
            m.openWeight ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-100 text-neutral-400'
          }`}>
            {m.openWeight ? 'Open weight' : 'Proprietary'}
          </span>
        </div>
      </div>
      {/* facts */}
      <div className="hidden shrink-0 grid-cols-4 gap-6 text-right sm:grid">
        <Fact label="Context" value={formatContext(m)} />
        <Fact label="Price in/out" value={formatPrice(m)} />
        <Fact label="Released" value={formatReleased(m.released)} />
        <span className="self-center text-[12px] text-neutral-300 transition group-hover:text-neutral-900 group-hover:translate-x-0.5 duration-150">→</span>
      </div>
    </button>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-neutral-400">{label}</div>
      <div className="mt-0.5 whitespace-nowrap text-[12.5px] font-medium text-neutral-700">{value}</div>
    </div>
  );
}

function ModelDetail({ m }: { m: AIModel }) {
  return (
    <div className="max-h-[82vh] overflow-y-auto p-7 sm:p-9">
      <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
        {m.provider} — {formatReleased(m.released)}
      </p>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
        <h2 className="font-serif text-3xl font-semibold text-neutral-900">{m.name}</h2>
        {m.hot && (
          <span className="rounded-sm border border-amber-300 bg-amber-50 px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-amber-700">Notable</span>
        )}
        <span className={`rounded-sm px-1.5 py-0.5 text-[11px] font-medium ${m.openWeight ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-100 text-neutral-500'}`}>
          {m.openWeight ? 'Open weight' : 'Proprietary'}
        </span>
      </div>
      <p className="mt-1.5 text-[15px] text-neutral-500 italic font-serif">{m.tagline}</p>
      <p className="mt-4 text-[13.5px] leading-relaxed text-neutral-600">{m.description}</p>

      <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-neutral-200 bg-neutral-200 sm:grid-cols-4">
        {[
          ['Context', formatContext(m)],
          ['Price (in / out)', formatPrice(m)],
          ['Parameters', m.params ?? 'Undisclosed'],
          ['License', m.license ?? 'Proprietary'],
        ].map(([l, v]) => (
          <div key={l} className="bg-white p-3.5">
            <div className="text-[10px] uppercase tracking-wider text-neutral-400">{l}</div>
            <div className="mt-1 text-[13px] font-medium text-neutral-800 break-words">{v}</div>
          </div>
        ))}
      </div>

      {m.benchmark && (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
          <span className="text-[12.5px] text-neutral-500">{m.benchmark.label}</span>
          <span className="font-serif text-xl font-semibold text-neutral-900">{m.benchmark.score}</span>
        </div>
      )}

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <h4 className="border-b border-neutral-200 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">Strengths</h4>
          <ul className="mt-2.5 space-y-2">
            {m.strengths.map((s) => (
              <li key={s} className="flex items-start gap-2 text-[13px] leading-snug text-neutral-600">
                <Check className="mt-0.5 w-3.5 h-3.5 shrink-0 text-emerald-600" />{s}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="border-b border-neutral-200 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">Limitations</h4>
          <ul className="mt-2.5 space-y-2">
            {m.weaknesses.map((s) => (
              <li key={s} className="flex items-start gap-2 text-[13px] leading-snug text-neutral-600">
                <Minus className="mt-0.5 w-3.5 h-3.5 shrink-0 text-neutral-400" />{s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="border-b border-neutral-200 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">Best suited for</h4>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {m.bestFor.map((b) => (
            <span key={b} className="rounded-sm bg-neutral-100 px-2 py-1 text-[12px] text-neutral-600">{b}</span>
          ))}
        </div>
      </div>

      <a
        href={m.website}
        target="_blank"
        rel="noreferrer"
        className="mt-7 inline-flex items-center gap-1.5 border-b border-neutral-900 pb-0.5 text-[13px] font-medium text-neutral-900 transition hover:gap-2.5"
      >
        Official site <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}
