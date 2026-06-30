import { ArrowRight, BookMarked, Check, ChevronDown, ChevronUp, X } from 'lucide-react'
import { DOMAINS_BY_ID } from '../data/exams'
import { difficultyMeta } from '../lib/format'
import type {
  Choice,
  PreparedQuestion,
  Response,
  Statement,
} from '../lib/types'

interface QuestionViewProps {
  prepared: PreparedQuestion
  response: Response
  onChange: (response: Response) => void
  /** Reveal correctness, rationale and reference. */
  reveal: boolean
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

export function QuestionView({ prepared, response, onChange, reveal }: QuestionViewProps) {
  const { question } = prepared
  const domain = DOMAINS_BY_ID[question.domainId]
  const diff = difficultyMeta(question.difficulty)

  return (
    <div className="animate-fade-in">
      {/* Meta row — only revealed after answering (review / study feedback),
          never during the live exam, so difficulty/topic don't hint the answer. */}
      {reveal && (
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
          <span className={`chip ${diff.chip}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${diff.dot}`} /> {diff.label}
          </span>
          <span className="chip bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {question.exam}
          </span>
          {domain && (
            <span className="text-slate-400 dark:text-slate-500">{domain.name}</span>
          )}
        </div>
      )}

      {/* Prompt */}
      <h2 className="text-pretty text-lg font-semibold leading-snug text-slate-900 dark:text-white">
        {question.prompt}
      </h2>

      {/* Body */}
      <div className="mt-5">
        {question.type === 'single' && (
          <SingleChoice
            prepared={prepared}
            response={response}
            onChange={onChange}
            reveal={reveal}
          />
        )}
        {question.type === 'multi' && (
          <MultiChoice
            prepared={prepared}
            response={response}
            onChange={onChange}
            reveal={reveal}
          />
        )}
        {question.type === 'statements' && (
          <Statements
            prepared={prepared}
            response={response}
            onChange={onChange}
            reveal={reveal}
          />
        )}
        {question.type === 'build-list' && (
          <BuildList prepared={prepared} response={response} onChange={onChange} reveal={reveal} />
        )}
        {question.type === 'match' && (
          <Matching prepared={prepared} response={response} onChange={onChange} reveal={reveal} />
        )}
      </div>

      {/* Rationale */}
      {reveal && (
        <div className="mt-5 rounded-xl border border-azure-200 bg-azure-50/60 p-4 dark:border-azure-500/30 dark:bg-azure-500/10">
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            <span className="font-semibold text-azure-700 dark:text-azure-300">Why: </span>
            {question.explanation}
          </p>
          {question.reference && (
            <a
              href={question.reference.url}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-azure-600 hover:underline dark:text-azure-400"
            >
              <BookMarked className="h-3.5 w-3.5" /> {question.reference.label}
            </a>
          )}
        </div>
      )}
    </div>
  )
}

// --------------------------- single choice ---------------------------------

function orderedChoices(prepared: PreparedQuestion): Choice[] {
  const q = prepared.question
  if (q.type !== 'single' && q.type !== 'multi') return []
  const byId = new Map(q.choices.map((c) => [c.id, c]))
  return prepared.displayChoiceOrder.map((id) => byId.get(id)!).filter(Boolean)
}

function optionClasses(state: 'idle' | 'selected' | 'correct' | 'wrong'): string {
  switch (state) {
    case 'correct':
      return 'border-emerald-400 bg-emerald-50 dark:border-emerald-500/50 dark:bg-emerald-500/10'
    case 'wrong':
      return 'border-rose-400 bg-rose-50 dark:border-rose-500/50 dark:bg-rose-500/10'
    case 'selected':
      return 'border-azure-400 bg-azure-50/70 ring-1 ring-azure-300 dark:border-azure-500 dark:bg-azure-500/10 dark:ring-azure-500/40'
    default:
      return 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
  }
}

function Marker({ state, letter }: { state: 'idle' | 'selected' | 'correct' | 'wrong'; letter: string }) {
  if (state === 'correct')
    return (
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-500 text-white">
        <Check className="h-3.5 w-3.5" />
      </span>
    )
  if (state === 'wrong')
    return (
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-rose-500 text-white">
        <X className="h-3.5 w-3.5" />
      </span>
    )
  return (
    <span
      className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs font-bold ${
        state === 'selected'
          ? 'border-azure-500 bg-azure-500 text-white'
          : 'border-slate-300 text-slate-500 dark:border-slate-600 dark:text-slate-400'
      }`}
    >
      {letter}
    </span>
  )
}

function SingleChoice({ prepared, response, onChange, reveal }: QuestionViewProps) {
  const q = prepared.question
  if (q.type !== 'single') return null
  const choices = orderedChoices(prepared)
  const selected = response.selectedChoiceIds[0]

  return (
    <ul className="space-y-2.5">
      {choices.map((c, i) => {
        const isSelected = selected === c.id
        const isCorrect = c.id === q.answer
        let state: 'idle' | 'selected' | 'correct' | 'wrong' = isSelected ? 'selected' : 'idle'
        if (reveal) {
          if (isCorrect) state = 'correct'
          else if (isSelected) state = 'wrong'
        }
        return (
          <li key={c.id}>
            <label
              className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-all ${optionClasses(
                state,
              )} ${reveal ? 'cursor-default' : ''}`}
            >
              <input
                type="radio"
                name={q.id}
                className="sr-only"
                checked={isSelected}
                disabled={reveal}
                onChange={() => onChange({ selectedChoiceIds: [c.id], statementAnswers: {} })}
              />
              <Marker state={state} letter={LETTERS[i]} />
              <span className="text-sm text-slate-700 dark:text-slate-200">{c.text}</span>
            </label>
          </li>
        )
      })}
    </ul>
  )
}

// --------------------------- multiple response -----------------------------

function MultiChoice({ prepared, response, onChange, reveal }: QuestionViewProps) {
  const q = prepared.question
  if (q.type !== 'multi') return null
  const choices = orderedChoices(prepared)
  const selectedSet = new Set(response.selectedChoiceIds)
  const correctSet = new Set(q.answers)

  function toggle(id: string) {
    const next = new Set(selectedSet)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onChange({ selectedChoiceIds: [...next], statementAnswers: {} })
  }

  return (
    <ul className="space-y-2.5">
      {choices.map((c, i) => {
        const isSelected = selectedSet.has(c.id)
        const isCorrect = correctSet.has(c.id)
        let state: 'idle' | 'selected' | 'correct' | 'wrong' = isSelected ? 'selected' : 'idle'
        if (reveal) {
          if (isCorrect) state = 'correct'
          else if (isSelected) state = 'wrong'
        }
        return (
          <li key={c.id}>
            <label
              className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-all ${optionClasses(
                state,
              )} ${reveal ? 'cursor-default' : ''}`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={isSelected}
                disabled={reveal}
                onChange={() => toggle(c.id)}
              />
              <span
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border text-xs font-bold ${
                  state === 'correct'
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : state === 'wrong'
                      ? 'border-rose-500 bg-rose-500 text-white'
                      : state === 'selected'
                        ? 'border-azure-500 bg-azure-500 text-white'
                        : 'border-slate-300 text-slate-500 dark:border-slate-600 dark:text-slate-400'
                }`}
              >
                {state === 'correct' ? (
                  <Check className="h-3.5 w-3.5" />
                ) : state === 'wrong' ? (
                  <X className="h-3.5 w-3.5" />
                ) : (
                  LETTERS[i]
                )}
              </span>
              <span className="text-sm text-slate-700 dark:text-slate-200">{c.text}</span>
            </label>
          </li>
        )
      })}
    </ul>
  )
}

// --------------------------- statement series ------------------------------

function Statements({ prepared, response, onChange, reveal }: QuestionViewProps) {
  const q = prepared.question
  if (q.type !== 'statements') return null
  const byId = new Map(q.statements.map((s) => [s.id, s]))
  const statements = prepared.displayStatementOrder.map((id) => byId.get(id)!).filter(Boolean) as Statement[]

  function set(id: string, value: boolean) {
    onChange({
      selectedChoiceIds: [],
      statementAnswers: { ...response.statementAnswers, [id]: value },
    })
  }

  return (
    <div>
      <p className="mb-3 text-sm italic text-slate-500 dark:text-slate-400">
        For each of the following statements, select <strong>Yes</strong> if the statement is true.
        Otherwise, select <strong>No</strong>.
      </p>
      <ul className="space-y-2.5">
        {statements.map((s) => {
          const answered = response.statementAnswers[s.id]
          const isCorrect = reveal && answered === s.correct
          const isWrong = reveal && answered !== undefined && answered !== s.correct
          return (
            <li
              key={s.id}
              className={`rounded-xl border p-3.5 transition-all ${
                isCorrect
                  ? 'border-emerald-400 bg-emerald-50 dark:border-emerald-500/50 dark:bg-emerald-500/10'
                  : isWrong
                    ? 'border-rose-400 bg-rose-50 dark:border-rose-500/50 dark:bg-rose-500/10'
                    : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-sm text-slate-700 dark:text-slate-200">{s.text}</span>
                <div className="flex shrink-0 gap-1.5">
                  {([true, false] as const).map((val) => {
                    const active = answered === val
                    const showCorrect = reveal && s.correct === val
                    return (
                      <button
                        key={String(val)}
                        disabled={reveal}
                        onClick={() => set(s.id, val)}
                        className={`rounded-lg px-3 py-1 text-xs font-bold transition-colors ${
                          showCorrect
                            ? 'bg-emerald-500 text-white'
                            : active
                              ? 'bg-azure-600 text-white'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                        }`}
                      >
                        {val ? 'Yes' : 'No'}
                      </button>
                    )
                  })}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// ----------------------------- build list ----------------------------------

function BuildList({ prepared, response, onChange, reveal }: QuestionViewProps) {
  const q = prepared.question
  if (q.type !== 'build-list') return null
  const byId = new Map(q.items.map((it) => [it.id, it]))
  const order = response.orderedIds ?? prepared.displayItemOrder

  function move(index: number, dir: -1 | 1) {
    const target = index + dir
    if (target < 0 || target >= order.length) return
    const next = [...order]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange({ ...response, orderedIds: next })
  }

  return (
    <div>
      <p className="mb-3 text-sm italic text-slate-500 dark:text-slate-400">
        Arrange the items in the correct order using the arrows.
      </p>
      <ol className="space-y-2.5">
        {order.map((id, i) => {
          const item = byId.get(id)
          if (!item) return null
          const correctHere = reveal && q.correctOrder[i] === id
          const wrongHere = reveal && q.correctOrder[i] !== id
          return (
            <li
              key={id}
              className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
                correctHere
                  ? 'border-emerald-400 bg-emerald-50 dark:border-emerald-500/50 dark:bg-emerald-500/10'
                  : wrongHere
                    ? 'border-rose-400 bg-rose-50 dark:border-rose-500/50 dark:bg-rose-500/10'
                    : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                {i + 1}
              </span>
              <span className="flex-1 text-sm text-slate-700 dark:text-slate-200">{item.text}</span>
              {!reveal && (
                <span className="flex shrink-0 flex-col">
                  <button
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    aria-label="Move up"
                    className="rounded p-0.5 text-slate-400 hover:text-azure-600 disabled:opacity-30 dark:hover:text-azure-400"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => move(i, 1)}
                    disabled={i === order.length - 1}
                    aria-label="Move down"
                    className="rounded p-0.5 text-slate-400 hover:text-azure-600 disabled:opacity-30 dark:hover:text-azure-400"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </span>
              )}
            </li>
          )
        })}
      </ol>
      {reveal && response.orderedIds && !q.correctOrder.every((id, i) => order[i] === id) && (
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Correct order:{' '}
          <span className="font-medium text-emerald-600 dark:text-emerald-400">
            {q.correctOrder.map((id) => byId.get(id)?.text).join(' → ')}
          </span>
        </p>
      )}
    </div>
  )
}

// ------------------------------- matching -----------------------------------

function Matching({ prepared, response, onChange, reveal }: QuestionViewProps) {
  const q = prepared.question
  if (q.type !== 'match') return null
  const byId = new Map(q.pairs.map((p) => [p.id, p]))
  const matches = response.matches ?? {}

  function set(pairId: string, value: string) {
    onChange({ ...response, matches: { ...matches, [pairId]: value } })
  }

  return (
    <div>
      <p className="mb-3 text-sm italic text-slate-500 dark:text-slate-400">
        Match each item on the left to the correct option.
      </p>
      <ul className="space-y-2.5">
        {prepared.displayItemOrder.map((pairId) => {
          const pair = byId.get(pairId)
          if (!pair) return null
          const chosen = matches[pairId] ?? ''
          const isCorrect = reveal && chosen === pair.right
          const isWrong = reveal && chosen !== '' && chosen !== pair.right
          return (
            <li
              key={pairId}
              className={`flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center sm:gap-3 ${
                isCorrect
                  ? 'border-emerald-400 bg-emerald-50 dark:border-emerald-500/50 dark:bg-emerald-500/10'
                  : isWrong
                    ? 'border-rose-400 bg-rose-50 dark:border-rose-500/50 dark:bg-rose-500/10'
                    : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                {pair.left}
              </span>
              <ArrowRight className="hidden h-4 w-4 shrink-0 text-slate-300 sm:block dark:text-slate-600" />
              <div className="sm:w-1/2">
                <select
                  value={chosen}
                  disabled={reveal}
                  onChange={(e) => set(pairId, e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-azure-500 focus:ring-azure-500 disabled:opacity-80 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="" disabled>
                    Choose…
                  </option>
                  {prepared.displayOptionOrder.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                {isWrong && (
                  <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                    Correct: {pair.right}
                  </p>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
