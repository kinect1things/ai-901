import { describe, expect, it } from 'vitest'
import {
  buildQuiz,
  emptyResponse,
  filterPool,
  gradeOne,
  gradeQuiz,
  isAnswered,
  prepareQuestion,
} from './quiz'
import { createRng } from './rng'
import { ALL_QUESTIONS } from '../data/questions'
import type {
  MultipleResponseQuestion,
  QuizConfig,
  SingleChoiceQuestion,
  StatementSeriesQuestion,
} from './types'

const baseConfig: QuizConfig = {
  exams: ['AI-901'],
  domainIds: 'all',
  difficulty: 'mixed',
  count: 20,
  mode: 'exam',
  timed: true,
}

const single: SingleChoiceQuestion = {
  id: 't-single',
  exam: 'AI-901',
  domainId: 'ai901-d1',
  difficulty: 'easy',
  type: 'single',
  prompt: 'Pick the right one for the scenario described here.',
  explanation: 'Because B is the correct service for the task.',
  reference: { label: 'x', url: 'https://learn.microsoft.com/x' },
  choices: [
    { id: 'a', text: 'A' },
    { id: 'b', text: 'B' },
    { id: 'c', text: 'C' },
    { id: 'd', text: 'D' },
  ],
  answer: 'b',
}

const multi: MultipleResponseQuestion = {
  id: 't-multi',
  exam: 'AI-901',
  domainId: 'ai901-d1',
  difficulty: 'medium',
  type: 'multi',
  prompt: 'Select two that apply to the scenario.',
  explanation: 'A and C are both part of the solution.',
  reference: { label: 'x', url: 'https://learn.microsoft.com/x' },
  choices: [
    { id: 'a', text: 'A' },
    { id: 'b', text: 'B' },
    { id: 'c', text: 'C' },
    { id: 'd', text: 'D' },
  ],
  answers: ['a', 'c'],
}

const statements: StatementSeriesQuestion = {
  id: 't-stmt',
  exam: 'AI-901',
  domainId: 'ai901-d1',
  difficulty: 'hard',
  type: 'statements',
  prompt: 'Evaluate the following statements about the scenario.',
  explanation: 'Two are true, one is false.',
  reference: { label: 'x', url: 'https://learn.microsoft.com/x' },
  statements: [
    { id: 's1', text: 'true one', correct: true },
    { id: 's2', text: 'false one', correct: false },
    { id: 's3', text: 'true two', correct: true },
  ],
}

describe('filterPool', () => {
  it('respects exam filter', () => {
    const pool = filterPool(baseConfig, ALL_QUESTIONS)
    expect(pool.length).toBeGreaterThan(0)
    expect(pool.every((q) => q.exam === 'AI-901')).toBe(true)
  })

  it('respects difficulty filter', () => {
    const pool = filterPool({ ...baseConfig, difficulty: 'hard' }, ALL_QUESTIONS)
    expect(pool.every((q) => q.difficulty === 'hard')).toBe(true)
  })

  it('respects domain filter', () => {
    const pool = filterPool({ ...baseConfig, domainIds: ['ai901-d2'] }, ALL_QUESTIONS)
    expect(pool.every((q) => q.domainId === 'ai901-d2')).toBe(true)
  })
})

describe('buildQuiz', () => {
  it('is deterministic for a given seed', () => {
    const a = buildQuiz(baseConfig, ALL_QUESTIONS, 42).map((p) => p.question.id)
    const b = buildQuiz(baseConfig, ALL_QUESTIONS, 42).map((p) => p.question.id)
    expect(a).toEqual(b)
  })

  it('returns the requested count with no duplicates', () => {
    const quiz = buildQuiz({ ...baseConfig, count: 20 }, ALL_QUESTIONS, 7)
    expect(quiz).toHaveLength(20)
    const ids = quiz.map((p) => p.question.id)
    expect(new Set(ids).size).toBe(20)
  })

  it('never exceeds the available pool', () => {
    const quiz = buildQuiz({ ...baseConfig, domainIds: ['ai901-d2'], count: 40 }, ALL_QUESTIONS, 1)
    const poolSize = filterPool({ ...baseConfig, domainIds: ['ai901-d2'], count: 40 }, ALL_QUESTIONS).length
    expect(quiz.length).toBe(Math.min(40, poolSize))
  })
})

describe('prepareQuestion', () => {
  it('shuffles choices but preserves the set', () => {
    const prepared = prepareQuestion(single, createRng(3))
    expect([...prepared.displayChoiceOrder].sort()).toEqual(['a', 'b', 'c', 'd'])
  })
})

describe('gradeOne', () => {
  it('grades single choice', () => {
    expect(gradeOne(prepareQuestion(single, createRng(1)), { selectedChoiceIds: ['b'], statementAnswers: {} })).toBe(true)
    expect(gradeOne(prepareQuestion(single, createRng(1)), { selectedChoiceIds: ['a'], statementAnswers: {} })).toBe(false)
  })

  it('grades multi strictly (all and only correct)', () => {
    const pq = prepareQuestion(multi, createRng(1))
    expect(gradeOne(pq, { selectedChoiceIds: ['a', 'c'], statementAnswers: {} })).toBe(true)
    expect(gradeOne(pq, { selectedChoiceIds: ['a'], statementAnswers: {} })).toBe(false)
    expect(gradeOne(pq, { selectedChoiceIds: ['a', 'c', 'd'], statementAnswers: {} })).toBe(false)
  })

  it('grades statements (all must match)', () => {
    const pq = prepareQuestion(statements, createRng(1))
    expect(gradeOne(pq, { selectedChoiceIds: [], statementAnswers: { s1: true, s2: false, s3: true } })).toBe(true)
    expect(gradeOne(pq, { selectedChoiceIds: [], statementAnswers: { s1: true, s2: true, s3: true } })).toBe(false)
  })
})

describe('isAnswered', () => {
  it('detects partial vs complete statement answers', () => {
    const pq = prepareQuestion(statements, createRng(1))
    expect(isAnswered(pq, { selectedChoiceIds: [], statementAnswers: { s1: true } })).toBe(false)
    expect(isAnswered(pq, { selectedChoiceIds: [], statementAnswers: { s1: true, s2: false, s3: true } })).toBe(true)
  })

  it('treats empty single as unanswered', () => {
    const pq = prepareQuestion(single, createRng(1))
    expect(isAnswered(pq, emptyResponse())).toBe(false)
  })
})

describe('gradeQuiz', () => {
  it('scales score and computes pass/fail at 700', () => {
    const prepared = [single, multi, statements].map((q) => prepareQuestion(q, createRng(1)))
    const allCorrect = gradeQuiz(
      prepared,
      {
        't-single': { selectedChoiceIds: ['b'], statementAnswers: {} },
        't-multi': { selectedChoiceIds: ['a', 'c'], statementAnswers: {} },
        't-stmt': { selectedChoiceIds: [], statementAnswers: { s1: true, s2: false, s3: true } },
      },
      baseConfig,
    )
    expect(allCorrect.correctCount).toBe(3)
    expect(allCorrect.scaledScore).toBe(1000)
    expect(allCorrect.passed).toBe(true)
    expect(allCorrect.domainScores[0].total).toBe(3)
  })

  it('marks unanswered as incorrect', () => {
    const prepared = [single, multi].map((q) => prepareQuestion(q, createRng(1)))
    const r = gradeQuiz(prepared, {}, baseConfig)
    expect(r.correctCount).toBe(0)
    expect(r.passed).toBe(false)
  })
})
