import { useMemo, useState } from 'react'
import {
  Check,
  CircleCheck,
  CircleX,
  Copy,
  Download,
  Printer,
  RotateCcw,
  Shuffle,
  Sliders,
  Target,
  Timer,
  Trophy,
} from 'lucide-react'
import { QuestionView } from './QuestionView'
import { DOMAINS_BY_ID } from '../data/exams'
import { formatDuration, scoreColor } from '../lib/format'
import { buildExportObject, buildSummaryText, copyText, downloadJson } from '../lib/share'
import type { GradedQuestion, QuizResult } from '../lib/types'

interface ResultsScreenProps {
  result: QuizResult
  onRetakeSame: () => void
  onNewSimilar: () => void
  onNewQuiz: () => void
}

export function ResultsScreen({ result, onRetakeSame, onNewSimilar, onNewQuiz }: ResultsScreenProps) {
  const [filter, setFilter] = useState<'all' | 'incorrect'>('all')
  const [copied, setCopied] = useState(false)
  const accuracy = result.total === 0 ? 0 : result.correctCount / result.total

  async function handleCopy() {
    const ok = await copyText(buildSummaryText(result))
    if (ok) {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    }
  }

  function handleDownload() {
    const stamp = new Date(result.completedAt).toISOString().slice(0, 10)
    downloadJson(`azure-ai-fundamentals-result-${stamp}.json`, buildExportObject(result))
  }

  function handlePrint() {
    // Force light theme while printing so white-on-dark text stays legible.
    const root = document.documentElement
    const wasDark = root.classList.contains('dark')
    const restore = () => {
      if (wasDark) root.classList.add('dark')
      window.removeEventListener('afterprint', restore)
    }
    if (wasDark) root.classList.remove('dark')
    window.addEventListener('afterprint', restore)
    window.print()
    window.setTimeout(restore, 1500)
  }

  const visible = useMemo(
    () => (filter === 'incorrect' ? result.graded.filter((g) => !g.correct) : result.graded),
    [filter, result.graded],
  )

  return (
    <div className="animate-fade-in space-y-6">
      {/* Score hero */}
      <section className="card overflow-hidden">
        <div
          className={`px-6 py-7 text-center ${
            result.passed
              ? 'bg-gradient-to-br from-emerald-500/10 to-emerald-500/0'
              : 'bg-gradient-to-br from-rose-500/10 to-rose-500/0'
          }`}
        >
          <div className="mx-auto mb-3 flex w-fit items-center gap-2">
            {result.passed ? (
              <span className="chip bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                <Trophy className="h-3.5 w-3.5" /> Passed
              </span>
            ) : (
              <span className="chip bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300">
                Keep practicing
              </span>
            )}
          </div>

          <ScoreRing score={result.scaledScore} passing={result.passingScore} passed={result.passed} />

          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            Passing score is <strong>{result.passingScore}/1000</strong>. This practice score scales
            your raw result and is an estimate, not an official Microsoft score.
          </p>
        </div>

        {/* Stat strip */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100 dark:divide-slate-800 dark:border-slate-800">
          <Stat
            icon={<Target className="h-4 w-4" />}
            label="Accuracy"
            value={`${Math.round(accuracy * 100)}%`}
            sub={`${result.correctCount}/${result.total} correct`}
          />
          <Stat
            icon={<CircleCheck className="h-4 w-4" />}
            label="Correct"
            value={String(result.correctCount)}
            sub={`of ${result.total}`}
          />
          <Stat
            icon={<Timer className="h-4 w-4" />}
            label="Time"
            value={result.elapsedSeconds > 0 ? formatDuration(result.elapsedSeconds) : '—'}
            sub={result.config.timed ? 'tracked' : 'untimed'}
          />
        </div>
      </section>

      {/* Share / export toolbar */}
      <div className="flex flex-wrap items-center justify-center gap-2 print:hidden">
        <button onClick={handleCopy} className="btn-outline gap-1.5 !py-2 text-xs">
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied!' : 'Copy summary'}
        </button>
        <button onClick={handleDownload} className="btn-outline gap-1.5 !py-2 text-xs">
          <Download className="h-3.5 w-3.5" /> Download .json
        </button>
        <button onClick={handlePrint} className="btn-outline gap-1.5 !py-2 text-xs">
          <Printer className="h-3.5 w-3.5" /> Print / Save PDF
        </button>
      </div>

      {/* Domain breakdown */}
      <section className="card p-5 sm:p-6">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
          <Sliders className="h-4 w-4 text-azure-500" /> Performance by domain
        </h2>
        <div className="space-y-4">
          {result.domainScores.map((d) => {
            const ratio = d.total === 0 ? 0 : d.correct / d.total
            const domain = DOMAINS_BY_ID[d.domainId]
            return (
              <div key={d.domainId}>
                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {d.name}
                    {domain && (
                      <span className="ml-1.5 text-xs font-normal text-slate-400">
                        {domain.exam} · {domain.weight}
                      </span>
                    )}
                  </span>
                  <span className={`text-sm font-bold tabular-nums ${scoreColor(ratio)}`}>
                    {d.correct}/{d.total}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      ratio >= 0.7 ? 'bg-emerald-500' : ratio >= 0.5 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.round(ratio * 100)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Actions */}
      <section className="grid gap-3 sm:grid-cols-3 print:hidden">
        <button onClick={onRetakeSame} className="btn-outline py-3">
          <RotateCcw className="h-4 w-4" /> Retake this exam
        </button>
        <button onClick={onNewSimilar} className="btn-outline py-3">
          <Shuffle className="h-4 w-4" /> New questions, same setup
        </button>
        <button onClick={onNewQuiz} className="btn-primary py-3">
          <Sliders className="h-4 w-4" /> Build a new exam
        </button>
      </section>

      {/* Review */}
      <section className="card p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Review answers</h2>
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-semibold print:hidden dark:bg-slate-800">
            {(['all', 'incorrect'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-md px-3 py-1.5 transition-colors ${
                  filter === f
                    ? 'bg-white text-azure-700 shadow-sm dark:bg-slate-950 dark:text-azure-300'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {f === 'all' ? `All (${result.total})` : `Incorrect (${result.total - result.correctCount})`}
              </button>
            ))}
          </div>
        </div>

        {visible.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Nothing to show here — great job! 🎉
          </p>
        ) : (
          <ol className="space-y-4">
            {visible.map((g) => (
              <ReviewItem key={g.prepared.question.id} graded={g} index={result.graded.indexOf(g)} />
            ))}
          </ol>
        )}
      </section>
    </div>
  )
}

// ----------------------------- sub-components ------------------------------

function ScoreRing({ score, passing, passed }: { score: number; passing: number; passed: boolean }) {
  const ratio = Math.min(score / 1000, 1)
  const r = 52
  const c = 2 * Math.PI * r
  const offset = c * (1 - ratio)
  return (
    <div className="relative mx-auto h-36 w-36">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10" className="stroke-slate-200 dark:stroke-slate-800" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className={passed ? 'stroke-emerald-500' : 'stroke-rose-500'}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
        {/* Passing threshold tick */}
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10" stroke="transparent" />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-3xl font-extrabold tabular-nums text-slate-900 dark:text-white">{score}</div>
          <div className="text-[11px] font-medium text-slate-400">/ 1000 · pass {passing}</div>
        </div>
      </div>
    </div>
  )
}

function Stat({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
}) {
  return (
    <div className="px-4 py-4 text-center">
      <div className="mx-auto mb-1 flex w-fit items-center gap-1.5 text-xs font-medium text-slate-400">
        {icon} {label}
      </div>
      <div className="text-xl font-bold text-slate-900 dark:text-white">{value}</div>
      <div className="text-[11px] text-slate-400">{sub}</div>
    </div>
  )
}

function ReviewItem({ graded, index }: { graded: GradedQuestion; index: number }) {
  return (
    <li className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xs font-bold text-slate-400">Q{index + 1}</span>
        {graded.correct ? (
          <span className="chip bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
            <CircleCheck className="h-3.5 w-3.5" /> Correct
          </span>
        ) : (
          <span className="chip bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
            <CircleX className="h-3.5 w-3.5" /> {graded.answered ? 'Incorrect' : 'Not answered'}
          </span>
        )}
      </div>
      <QuestionView prepared={graded.prepared} response={graded.response} onChange={() => {}} reveal />
    </li>
  )
}
