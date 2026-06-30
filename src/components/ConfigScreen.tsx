import { useMemo, useState } from 'react'
import {
  BookOpen,
  ChevronDown,
  GraduationCap,
  History,
  Play,
  Sliders,
  Sparkles,
  Timer,
  Trash2,
} from 'lucide-react'
import { DOMAINS, EXAM_ORDER } from '../data/exams'
import { ALL_QUESTIONS } from '../data/questions'
import { filterPool } from '../lib/quiz'
import { formatDate, formatDuration } from '../lib/format'
import {
  clearHistory,
  getHistory,
  getLastConfig,
  type AttemptSummary,
} from '../lib/storage'
import type {
  Difficulty,
  QuestionCount,
  QuizConfig,
  QuizMode,
} from '../lib/types'

interface ConfigScreenProps {
  onStart: (config: QuizConfig) => void
}

const COUNTS: QuestionCount[] = [10, 20, 40]
// A practice test targets a single difficulty — mixing levels would defeat the
// purpose of choosing one.
const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
]

// Every practice test draws from both the AI-901 and AI-900 banks as a single
// unified pool — there is no per-exam selection.
const EXAMS = EXAM_ORDER

export function ConfigScreen({ onStart }: ConfigScreenProps) {
  const last = useMemo(getLastConfig, [])
  const [count, setCount] = useState<QuestionCount>(last?.count ?? 10)
  const [difficulty, setDifficulty] = useState<Difficulty>(
    last?.difficulty && last.difficulty !== 'mixed' ? last.difficulty : 'medium',
  )
  const [mode, setMode] = useState<QuizMode>(last?.mode ?? 'exam')
  const [timed, setTimed] = useState<boolean>(last?.timed ?? true)
  const [domainIds, setDomainIds] = useState<string[] | 'all'>('all')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [history, setHistory] = useState<AttemptSummary[]>(() => getHistory())

  const config: QuizConfig = useMemo(
    () => ({ exams: EXAMS, domainIds, difficulty, count, mode, timed }),
    [domainIds, difficulty, count, mode, timed],
  )

  const poolSize = useMemo(() => filterPool(config, ALL_QUESTIONS).length, [config])

  const effectiveCount = Math.min(count, poolSize)
  const noDomain = domainIds !== 'all' && domainIds.length === 0
  const canStart = !noDomain && poolSize > 0

  function toggleDomain(id: string) {
    setDomainIds((prev) => {
      const base = prev === 'all' ? DOMAINS.map((d) => d.id) : prev
      const next = base.includes(id) ? base.filter((d) => d !== id) : [...base, id]
      return next.length === DOMAINS.length ? 'all' : next
    })
  }

  const domainSelected = (id: string) => domainIds === 'all' || domainIds.includes(id)

  return (
    <div className="animate-fade-in space-y-8">
      {/* Hero */}
      <section className="text-center">
        <span className="chip mx-auto mb-3 w-fit bg-azure-100 text-azure-700 dark:bg-azure-500/15 dark:text-azure-300">
          <Sparkles className="h-3.5 w-3.5" /> Current exam · replaces AI-900 on 30 Jun 2026
        </span>
        <h1 className="text-balance text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          <span className="text-azure-600 dark:text-azure-400">Azure AI Fundamentals</span>
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-pretty text-sm text-slate-600 sm:text-base dark:text-slate-300">
          Build a randomized, exam-style practice test from a bank of {ALL_QUESTIONS.length}+ original
          questions across the AI-901 and AI-900 skills outlines. Pick your length, difficulty, and
          focus — every answer comes with a rationale and a Microsoft Learn link.
        </p>
      </section>

      {/* Builder */}
      <section className="card p-5 sm:p-7">
        {/* Count + Difficulty */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
              Number of questions
            </p>
            <Segmented
              options={COUNTS.map((c) => ({ value: String(c), label: String(c) }))}
              value={String(count)}
              onChange={(v) => setCount(Number(v) as QuestionCount)}
            />
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Difficulty</p>
            <Segmented
              options={DIFFICULTIES.map((d) => ({ value: d.value, label: d.label }))}
              value={difficulty}
              onChange={(v) => setDifficulty(v as Difficulty)}
            />
          </div>
        </div>

        <div className="my-6 h-px bg-slate-200 dark:bg-slate-800" />

        {/* Mode + Timed */}
        <div className="grid gap-4 sm:grid-cols-2">
          <ModeCard
            icon={<BookOpen className="h-4 w-4" />}
            title="Study mode"
            desc="Check each answer instantly and read the rationale as you go."
            active={mode === 'study'}
            onClick={() => setMode('study')}
          />
          <ModeCard
            icon={<GraduationCap className="h-4 w-4" />}
            title="Exam mode"
            desc="Answer everything first, then get a scored report at the end."
            active={mode === 'exam'}
            onClick={() => setMode('exam')}
          />
        </div>

        <label className="mt-4 flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-700">
          <span className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            <Timer className="h-4 w-4 text-azure-500" /> Track time
          </span>
          <Switch checked={timed} onChange={() => setTimed((t) => !t)} label="Track time" />
        </label>

        {/* Advanced: domain focus */}
        <button
          onClick={() => setShowAdvanced((s) => !s)}
          className="mt-4 flex w-full items-center justify-between rounded-xl px-1 py-2 text-sm font-medium text-slate-600 hover:text-azure-600 dark:text-slate-300 dark:hover:text-azure-400"
          aria-expanded={showAdvanced}
        >
          <span className="flex items-center gap-2">
            <Sliders className="h-4 w-4" /> Focus on specific domains
            {domainIds !== 'all' && (
              <span className="chip bg-azure-100 text-azure-700 dark:bg-azure-500/15 dark:text-azure-300">
                {domainIds.length} selected
              </span>
            )}
          </span>
          <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
        </button>

        {showAdvanced && (
          <div className="mt-2 space-y-1.5 rounded-xl bg-slate-50 p-4 dark:bg-slate-900/60">
            {DOMAINS.map((d) => (
              <label
                key={d.id}
                className="flex cursor-pointer items-start gap-2.5 rounded-lg p-2 hover:bg-white dark:hover:bg-slate-800/60"
              >
                <input
                  type="checkbox"
                  checked={domainSelected(d.id)}
                  onChange={() => toggleDomain(d.id)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-azure-600 focus:ring-azure-500"
                />
                <span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {d.name}
                  </span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">{d.blurb}</span>
                </span>
              </label>
            ))}
            {noDomain && (
              <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
                Select at least one domain.
              </p>
            )}
          </div>
        )}

        {/* Start */}
        <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {poolSize === 0 ? (
              <span className="text-rose-600 dark:text-rose-400">
                No questions match these filters.
              </span>
            ) : (
              <>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {effectiveCount}
                </span>{' '}
                question{effectiveCount === 1 ? '' : 's'} ready
                {effectiveCount < count && (
                  <span className="text-amber-600 dark:text-amber-400">
                    {' '}
                    — only {poolSize} available for this filter
                  </span>
                )}
              </>
            )}
          </p>
          <button
            onClick={() => onStart({ ...config, count: effectiveCount as QuestionCount })}
            disabled={!canStart}
            className="btn-primary px-6 py-3 text-base"
          >
            <Play className="h-4 w-4" /> Start practice exam
          </button>
        </div>
      </section>

      {/* History */}
      {history.length > 0 && (
        <section className="card p-5 sm:p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <History className="h-4 w-4 text-azure-500" /> Recent attempts
            </h2>
            <button
              onClick={() => {
                clearHistory()
                setHistory([])
              }}
              className="btn-ghost gap-1.5 !px-2 !py-1 text-xs"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear
            </button>
          </div>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {history.slice(0, 6).map((h) => (
              <li key={h.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <div className="min-w-0">
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {h.count}-question exam
                  </span>
                  <span className="text-slate-400">
                    {' '}
                    · {h.difficulty} · {formatDate(h.completedAt)}
                  </span>
                </div>
                <span
                  className={`chip shrink-0 ${
                    h.passed
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
                  }`}
                >
                  {h.scaledScore}/1000 · {h.passed ? 'Pass' : 'Fail'}
                  {h.elapsedSeconds > 0 && (
                    <span className="hidden text-current/70 sm:inline">
                      {' '}
                      · {formatDuration(h.elapsedSeconds)}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

// ----------------------------- sub-components ------------------------------

interface SegmentedProps {
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
}

function Segmented({ options, value, onChange }: SegmentedProps) {
  return (
    <div className="inline-flex w-full rounded-xl bg-slate-100 p-1 dark:bg-slate-800/80" role="group">
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            aria-pressed={active}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
              active
                ? 'bg-white text-azure-700 shadow-sm dark:bg-slate-950 dark:text-azure-300'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

interface ModeCardProps {
  icon: React.ReactNode
  title: string
  desc: string
  active: boolean
  onClick: () => void
}

function ModeCard({ icon, title, desc, active, onClick }: ModeCardProps) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-xl border p-4 text-left transition-all ${
        active
          ? 'border-azure-400 bg-azure-50/70 ring-1 ring-azure-300 dark:border-azure-500 dark:bg-azure-500/10 dark:ring-azure-500/40'
          : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
      }`}
    >
      <span className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
        <span className="text-azure-500">{icon}</span> {title}
      </span>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{desc}</p>
    </button>
  )
}

interface SwitchProps {
  checked: boolean
  onChange: () => void
  label: string
}

function Switch({ checked, onChange, label }: SwitchProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
        checked ? 'bg-azure-600' : 'bg-slate-300 dark:bg-slate-700'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}
