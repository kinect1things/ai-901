// ---------------------------------------------------------------------------
// The quiz engine: turn a QuizConfig + question bank into a randomized,
// blueprint-weighted practice exam, then grade the learner's responses with
// Microsoft-style scoring (1000-point scale, strict multi-select, per-domain
// breakdown).
// ---------------------------------------------------------------------------

import { DOMAINS_BY_ID } from '../data/exams'
import type {
  DomainScore,
  GradedQuestion,
  PreparedQuestion,
  Question,
  QuizConfig,
  QuizResult,
  Response,
} from './types'
import { createRng, shuffle, weightedSample, type Rng } from './rng'

export const PASSING_SCORE = 700
export const SCALE_MAX = 1000

/** Apply the config's exam/domain/difficulty filters to the full bank. */
export function filterPool(config: QuizConfig, bank: readonly Question[]): Question[] {
  const examSet = new Set(config.exams)
  const domainSet =
    config.domainIds === 'all' ? null : new Set(config.domainIds)
  return bank.filter((q) => {
    if (!examSet.has(q.exam)) return false
    if (domainSet && !domainSet.has(q.domainId)) return false
    if (config.difficulty !== 'mixed' && q.difficulty !== config.difficulty) return false
    return true
  })
}

/** Shuffle a question's choices/statements/items/options for display. */
export function prepareQuestion(question: Question, rng: Rng): PreparedQuestion {
  let displayChoiceOrder: string[] = []
  let displayStatementOrder: string[] = []
  let displayItemOrder: string[] = []
  let displayOptionOrder: string[] = []

  switch (question.type) {
    case 'single':
    case 'multi':
      displayChoiceOrder = shuffle(
        question.choices.map((c) => c.id),
        rng,
      )
      break
    case 'statements':
      displayStatementOrder = shuffle(
        question.statements.map((s) => s.id),
        rng,
      )
      break
    case 'build-list':
      displayItemOrder = shuffle(
        question.items.map((i) => i.id),
        rng,
      )
      break
    case 'match': {
      displayItemOrder = shuffle(
        question.pairs.map((p) => p.id),
        rng,
      )
      const rights = [...question.pairs.map((p) => p.right), ...(question.distractors ?? [])]
      displayOptionOrder = shuffle([...new Set(rights)], rng)
      break
    }
  }

  return { question, displayChoiceOrder, displayStatementOrder, displayItemOrder, displayOptionOrder }
}

/**
 * Build a practice exam. When every domain of a single exam is in scope we
 * sample proportionally to the official blueprint weights so the mix mirrors
 * the real exam; otherwise we sample uniformly.
 */
export function buildQuiz(
  config: QuizConfig,
  bank: readonly Question[],
  seed?: number,
): PreparedQuestion[] {
  const rng = createRng(seed)
  const pool = filterPool(config, bank)

  // Count questions per domain in the pool for weight normalization.
  const perDomainCount = new Map<string, number>()
  for (const q of pool) {
    perDomainCount.set(q.domainId, (perDomainCount.get(q.domainId) ?? 0) + 1)
  }

  const useWeighted = config.domainIds === 'all' && config.exams.length === 1
  let selected: Question[]
  if (useWeighted) {
    selected = weightedSample(
      pool,
      config.count,
      (q) => {
        const domain = DOMAINS_BY_ID[q.domainId]
        const count = perDomainCount.get(q.domainId) ?? 1
        // Expected picks per domain ∝ weightValue, regardless of pool size.
        return (domain?.weightValue ?? 0.1) / count
      },
      rng,
    )
  } else {
    selected = weightedSample(pool, config.count, () => 1, rng)
  }

  return selected.map((q) => prepareQuestion(q, rng))
}

/** An empty response for a prepared question (nothing selected yet). */
export function emptyResponse(): Response {
  return { selectedChoiceIds: [], statementAnswers: {} }
}

/** Has the learner provided any answer to this question? */
export function isAnswered(pq: PreparedQuestion, r: Response): boolean {
  switch (pq.question.type) {
    case 'statements':
      return pq.question.statements.every((s) => s.id in r.statementAnswers)
    case 'build-list':
      return r.orderedIds !== undefined
    case 'match':
      return pq.question.pairs.every((p) => !!r.matches?.[p.id])
    default:
      return r.selectedChoiceIds.length > 0
  }
}

/**
 * Grade a single question. Multi-select uses strict scoring (all correct, no
 * incorrect) exactly like Microsoft's practice assessments; statement series
 * require every statement to be correct to earn the point.
 */
export function gradeOne(pq: PreparedQuestion, r: Response): boolean {
  const q = pq.question
  switch (q.type) {
    case 'single':
      return r.selectedChoiceIds.length === 1 && r.selectedChoiceIds[0] === q.answer
    case 'multi': {
      const want = new Set(q.answers)
      const got = new Set(r.selectedChoiceIds)
      if (want.size !== got.size) return false
      for (const id of want) if (!got.has(id)) return false
      return true
    }
    case 'statements':
      return q.statements.every((s) => r.statementAnswers[s.id] === s.correct)
    case 'build-list': {
      const order = r.orderedIds ?? pq.displayItemOrder
      return (
        order.length === q.correctOrder.length &&
        order.every((id, i) => id === q.correctOrder[i])
      )
    }
    case 'match':
      return q.pairs.every((p) => r.matches?.[p.id] === p.right)
  }
}

export function gradeQuiz(
  prepared: PreparedQuestion[],
  responses: Record<string, Response>,
  config: QuizConfig,
  elapsedSeconds = 0,
  completedAt = 0,
): QuizResult {
  const graded: GradedQuestion[] = prepared.map((pq) => {
    const response = responses[pq.question.id] ?? emptyResponse()
    return {
      prepared: pq,
      response,
      correct: gradeOne(pq, response),
      answered: isAnswered(pq, response),
    }
  })

  const total = graded.length
  const correctCount = graded.filter((g) => g.correct).length
  const scaledScore = total === 0 ? 0 : Math.round((correctCount / total) * SCALE_MAX)

  // Per-domain breakdown.
  const byDomain = new Map<string, DomainScore>()
  for (const g of graded) {
    const domainId = g.prepared.question.domainId
    const existing =
      byDomain.get(domainId) ??
      ({
        domainId,
        name: DOMAINS_BY_ID[domainId]?.name ?? domainId,
        total: 0,
        correct: 0,
      } satisfies DomainScore)
    existing.total += 1
    if (g.correct) existing.correct += 1
    byDomain.set(domainId, existing)
  }

  return {
    config,
    graded,
    total,
    correctCount,
    scaledScore,
    passed: scaledScore >= PASSING_SCORE,
    passingScore: PASSING_SCORE,
    domainScores: [...byDomain.values()].sort((a, b) => a.domainId.localeCompare(b.domainId)),
    elapsedSeconds,
    completedAt,
  }
}
