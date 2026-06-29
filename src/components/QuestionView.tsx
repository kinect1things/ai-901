import { BookMarked, Check, X } from 'lucide-react'
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
  if (q.type === 'statements') return []
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
