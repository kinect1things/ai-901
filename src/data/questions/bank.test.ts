import { describe, expect, it } from 'vitest'
import { ALL_QUESTIONS } from './index'
import { DOMAINS_BY_ID } from '../exams'

describe('question bank', () => {
  it('loads a substantial bank', () => {
    expect(ALL_QUESTIONS.length).toBeGreaterThanOrEqual(100)
  })

  it('has unique ids', () => {
    const ids = ALL_QUESTIONS.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('resolves every reference to a Microsoft Learn URL', () => {
    for (const q of ALL_QUESTIONS) {
      expect(q.reference?.url).toMatch(/^https:\/\/learn\.microsoft\.com/)
    }
  })

  it('maps every question to a known domain of the same exam', () => {
    for (const q of ALL_QUESTIONS) {
      const domain = DOMAINS_BY_ID[q.domainId]
      expect(domain, `domain for ${q.id}`).toBeTruthy()
      expect(domain.exam).toBe(q.exam)
    }
  })

  it('every statement question has ids on its statements', () => {
    for (const q of ALL_QUESTIONS) {
      if (q.type === 'statements') {
        for (const s of q.statements) expect(s.id).toBeTruthy()
      }
    }
  })

  it('single answers and multi answers reference real choices', () => {
    for (const q of ALL_QUESTIONS) {
      if (q.type === 'single') {
        expect(q.choices.map((c) => c.id)).toContain(q.answer)
      } else if (q.type === 'multi') {
        const ids = q.choices.map((c) => c.id)
        expect(q.answers.length).toBeGreaterThanOrEqual(2)
        for (const a of q.answers) expect(ids).toContain(a)
      }
    }
  })

  it('can supply at least 40 AI-901 questions for a full exam', () => {
    expect(ALL_QUESTIONS.filter((q) => q.exam === 'AI-901').length).toBeGreaterThanOrEqual(40)
  })
})
