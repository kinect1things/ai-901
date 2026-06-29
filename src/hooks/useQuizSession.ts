import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ALL_QUESTIONS } from '../data/questions'
import { buildQuiz, emptyResponse, gradeQuiz, isAnswered } from '../lib/quiz'
import type { PreparedQuestion, QuizConfig, QuizResult, Response } from '../lib/types'

export interface QuizSession {
  prepared: PreparedQuestion[]
  index: number
  current: PreparedQuestion | undefined
  responses: Record<string, Response>
  flagged: Set<string>
  elapsed: number
  submitted: boolean
  result: QuizResult | null
  answeredCount: number
  goTo: (i: number) => void
  next: () => void
  prev: () => void
  setResponse: (questionId: string, response: Response) => void
  toggleFlag: (questionId: string) => void
  isAnswered: (questionId: string) => boolean
  submit: () => QuizResult
}

/**
 * Drives a single practice-exam session. The quiz is built once from `config`
 * and `seed`; pass the same seed to reproduce an identical exam (retake).
 */
export function useQuizSession(config: QuizConfig, seed: number): QuizSession {
  const prepared = useMemo(() => buildQuiz(config, ALL_QUESTIONS, seed), [config, seed])

  const [index, setIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, Response>>({})
  const [flagged, setFlagged] = useState<Set<string>>(() => new Set())
  const [elapsed, setElapsed] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<QuizResult | null>(null)
  const startRef = useRef<number>(0)

  // Timer: tick every second until submitted.
  useEffect(() => {
    if (startRef.current === 0) startRef.current = performance.now()
  }, [])

  useEffect(() => {
    if (submitted) return
    const id = window.setInterval(() => {
      setElapsed(Math.floor((performance.now() - startRef.current) / 1000))
    }, 1000)
    return () => window.clearInterval(id)
  }, [submitted])

  const goTo = useCallback(
    (i: number) => {
      setIndex(Math.max(0, Math.min(i, prepared.length - 1)))
    },
    [prepared.length],
  )

  const next = useCallback(() => goTo(index + 1), [goTo, index])
  const prev = useCallback(() => goTo(index - 1), [goTo, index])

  const setResponse = useCallback((questionId: string, response: Response) => {
    setResponses((prevR) => ({ ...prevR, [questionId]: response }))
  }, [])

  const toggleFlag = useCallback((questionId: string) => {
    setFlagged((prevF) => {
      const nextF = new Set(prevF)
      if (nextF.has(questionId)) nextF.delete(questionId)
      else nextF.add(questionId)
      return nextF
    })
  }, [])

  const answeredCheck = useCallback(
    (questionId: string) => {
      const pq = prepared.find((p) => p.question.id === questionId)
      if (!pq) return false
      return isAnswered(pq, responses[questionId] ?? emptyResponse())
    },
    [prepared, responses],
  )

  const answeredCount = useMemo(
    () => prepared.filter((pq) => isAnswered(pq, responses[pq.question.id] ?? emptyResponse())).length,
    [prepared, responses],
  )

  const submit = useCallback(() => {
    const finalElapsed = Math.floor((performance.now() - startRef.current) / 1000)
    const r = gradeQuiz(prepared, responses, config, finalElapsed, Date.now())
    setElapsed(finalElapsed)
    setSubmitted(true)
    setResult(r)
    return r
  }, [prepared, responses, config])

  return {
    prepared,
    index,
    current: prepared[index],
    responses,
    flagged,
    elapsed,
    submitted,
    result,
    answeredCount,
    goTo,
    next,
    prev,
    setResponse,
    toggleFlag,
    isAnswered: answeredCheck,
    submit,
  }
}
