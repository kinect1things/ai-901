import { useEffect, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Clock,
  Flag,
  Grid3x3,
  LogOut,
  Search,
} from 'lucide-react'
import { QuestionView } from './QuestionView'
import { useQuizSession } from '../hooks/useQuizSession'
import { emptyResponse } from '../lib/quiz'
import { formatDuration } from '../lib/format'
import type { QuizConfig, QuizResult } from '../lib/types'

interface QuizScreenProps {
  config: QuizConfig
  seed: number
  onComplete: (result: QuizResult) => void
  onExit: () => void
}

export function QuizScreen({ config, seed, onComplete, onExit }: QuizScreenProps) {
  const session = useQuizSession(config, seed)
  const [revealed, setRevealed] = useState<Set<string>>(() => new Set())
  const [showNavigator, setShowNavigator] = useState(false)
  const [confirmSubmit, setConfirmSubmit] = useState(false)

  const total = session.prepared.length
  const current = session.current
  const isStudy = config.mode === 'study'

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'ArrowRight') session.next()
      if (e.key === 'ArrowLeft') session.prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [session])

  if (!current) return null

  const currentId = current.question.id
  const currentResponse = session.responses[currentId] ?? emptyResponse()
  const currentAnswered = session.isAnswered(currentId)
  const isRevealed = isStudy && revealed.has(currentId)
  const isLast = session.index === total - 1
  const progressPct = Math.round(((session.index + 1) / total) * 100)
  const unanswered = total - session.answeredCount

  function revealCurrent() {
    setRevealed((prev) => new Set(prev).add(currentId))
  }

  function handleSubmit() {
    const result = session.submit()
    onComplete(result)
  }

  return (
    <div className="animate-fade-in">
      {/* Progress header */}
      <div className="sticky top-[57px] z-10 -mx-4 mb-5 border-b border-slate-200/70 bg-slate-50/80 px-4 py-3 backdrop-blur sm:top-[61px] sm:-mx-6 sm:px-6 dark:border-slate-800/70 dark:bg-slate-950/80">
        <div className="flex items-center justify-between gap-3 text-sm">
          <button onClick={onExit} className="btn-ghost gap-1.5 !px-2 !py-1 text-xs">
            <LogOut className="h-3.5 w-3.5" /> Exit
          </button>
          <div className="flex items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
            {config.timed && (
              <span className="flex items-center gap-1.5 tabular-nums">
                <Clock className="h-3.5 w-3.5" /> {formatDuration(session.elapsed)}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <CircleCheck className="h-3.5 w-3.5 text-emerald-500" /> {session.answeredCount}/{total}
            </span>
            <button
              onClick={() => setShowNavigator((s) => !s)}
              className="btn-ghost gap-1.5 !px-2 !py-1 text-xs"
              aria-expanded={showNavigator}
            >
              <Grid3x3 className="h-3.5 w-3.5" /> Navigator
            </button>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            {session.index + 1}
            <span className="text-slate-400"> / {total}</span>
          </span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-azure-500 to-sky-400 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Navigator */}
      {showNavigator && (
        <div className="card mb-5 animate-pop-in p-4">
          <p className="mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">Jump to question</p>
          <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-10">
            {session.prepared.map((pq, i) => {
              const answered = session.isAnswered(pq.question.id)
              const flagged = session.flagged.has(pq.question.id)
              const isCurrent = i === session.index
              return (
                <button
                  key={pq.question.id}
                  onClick={() => {
                    session.goTo(i)
                    setShowNavigator(false)
                  }}
                  className={`relative grid h-8 place-items-center rounded-lg text-xs font-semibold transition-colors ${
                    isCurrent
                      ? 'bg-azure-600 text-white'
                      : answered
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {i + 1}
                  {flagged && (
                    <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-amber-400" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Question card */}
      <div className="card p-5 sm:p-7">
        <QuestionView
          prepared={current}
          response={currentResponse}
          onChange={(r) => session.setResponse(currentId, r)}
          reveal={isRevealed}
        />
      </div>

      {/* Footer nav */}
      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          onClick={session.prev}
          disabled={session.index === 0}
          className="btn-outline"
        >
          <ChevronLeft className="h-4 w-4" /> Prev
        </button>

        <button
          onClick={() => session.toggleFlag(currentId)}
          className={`btn-ghost gap-1.5 ${
            session.flagged.has(currentId) ? 'text-amber-600 dark:text-amber-400' : ''
          }`}
        >
          <Flag className="h-4 w-4" fill={session.flagged.has(currentId) ? 'currentColor' : 'none'} />
          {session.flagged.has(currentId) ? 'Flagged' : 'Flag'}
        </button>

        {isStudy && !isRevealed ? (
          <button onClick={revealCurrent} disabled={!currentAnswered} className="btn-primary">
            <Search className="h-4 w-4" /> Check
          </button>
        ) : isLast ? (
          <button onClick={() => setConfirmSubmit(true)} className="btn-primary">
            Finish
          </button>
        ) : (
          <button onClick={session.next} className="btn-primary">
            Next <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Submit confirmation */}
      {confirmSubmit && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="card w-full max-w-md animate-pop-in p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Submit your exam?</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              You answered <strong>{session.answeredCount}</strong> of <strong>{total}</strong>{' '}
              questions.
              {unanswered > 0 && (
                <span className="text-amber-600 dark:text-amber-400">
                  {' '}
                  {unanswered} unanswered question{unanswered === 1 ? '' : 's'} will be marked
                  incorrect.
                </span>
              )}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setConfirmSubmit(false)} className="btn-outline">
                Keep going
              </button>
              <button onClick={handleSubmit} className="btn-primary">
                Submit & score
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Always-available submit for exam mode (not just last question) */}
      {!isStudy && !isLast && (
        <div className="mt-3 text-center">
          <button
            onClick={() => setConfirmSubmit(true)}
            className="text-xs font-medium text-slate-500 hover:text-azure-600 dark:text-slate-400 dark:hover:text-azure-400"
          >
            Finish &amp; submit early
          </button>
        </div>
      )}
    </div>
  )
}
