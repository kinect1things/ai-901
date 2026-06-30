/* eslint-disable no-console */
// ---------------------------------------------------------------------------
// Question-bank validator. Run with `npm run validate:bank`.
//
// Enforces structural and referential integrity that TypeScript can't:
//  - unique ids
//  - single: exactly one answer, and it references a real choice
//  - multi: >= 2 answers, all referencing real choices, >= 4 choices
//  - statements: 2–4 statements, mixed truth values preferred
//  - every question maps to a known domain/exam
//  - no obviously broken prompts/explanations
//
// Exits non-zero on any error so CI fails fast.
// ---------------------------------------------------------------------------

import { ALL_QUESTIONS } from '../src/data/questions/index'
import { DOMAINS_BY_ID, EXAMS } from '../src/data/exams'
import type { Question } from '../src/lib/types'

const errors: string[] = []
const warnings: string[] = []

const err = (id: string, msg: string) => errors.push(`✗ [${id}] ${msg}`)
const warn = (id: string, msg: string) => warnings.push(`! [${id}] ${msg}`)

const seenIds = new Set<string>()

function validate(q: Question) {
  if (seenIds.has(q.id)) err(q.id, 'duplicate id')
  seenIds.add(q.id)

  if (!EXAMS[q.exam]) err(q.id, `unknown exam "${q.exam}"`)
  if (!DOMAINS_BY_ID[q.domainId]) err(q.id, `unknown domainId "${q.domainId}"`)
  if (DOMAINS_BY_ID[q.domainId] && DOMAINS_BY_ID[q.domainId].exam !== q.exam) {
    err(q.id, `domain "${q.domainId}" does not belong to exam "${q.exam}"`)
  }
  if (!q.prompt || q.prompt.trim().length < 15) err(q.id, 'prompt too short')
  if (!q.explanation || q.explanation.trim().length < 15) err(q.id, 'explanation too short')
  if (!q.reference?.url?.startsWith('https://learn.microsoft.com')) {
    err(q.id, 'reference must link to learn.microsoft.com')
  }
  if (!['easy', 'medium', 'hard'].includes(q.difficulty)) err(q.id, `bad difficulty "${q.difficulty}"`)

  if (q.type === 'single') {
    const ids = q.choices.map((c) => c.id)
    if (q.choices.length < 3) warn(q.id, `only ${q.choices.length} choices (expected 4)`)
    if (new Set(ids).size !== ids.length) err(q.id, 'duplicate choice ids')
    if (!ids.includes(q.answer)) err(q.id, `answer "${q.answer}" is not a choice id`)
  } else if (q.type === 'multi') {
    const ids = q.choices.map((c) => c.id)
    if (q.choices.length < 4) warn(q.id, `only ${q.choices.length} choices (expected >= 4)`)
    if (new Set(ids).size !== ids.length) err(q.id, 'duplicate choice ids')
    if (q.answers.length < 2) err(q.id, 'multi must have >= 2 correct answers')
    if (new Set(q.answers).size !== q.answers.length) err(q.id, 'duplicate answers')
    for (const a of q.answers) if (!ids.includes(a)) err(q.id, `answer "${a}" is not a choice id`)
    if (q.answers.length >= q.choices.length) err(q.id, 'every choice marked correct')
  } else if (q.type === 'statements') {
    if (q.statements.length < 2 || q.statements.length > 4) {
      err(q.id, `statements must be 2–4 (got ${q.statements.length})`)
    }
    const sids = q.statements.map((s) => s.id)
    if (new Set(sids).size !== sids.length) err(q.id, 'duplicate statement ids')
    const truths = new Set(q.statements.map((s) => s.correct))
    if (truths.size < 2) warn(q.id, 'all statements share the same truth value')
  } else if (q.type === 'build-list') {
    if (q.items.length < 3) warn(q.id, `only ${q.items.length} items (expected >= 3)`)
    const iids = q.items.map((i) => i.id)
    if (new Set(iids).size !== iids.length) err(q.id, 'duplicate item ids')
    if (q.correctOrder.length !== q.items.length) err(q.id, 'correctOrder length != items')
    if ([...q.correctOrder].sort().join() !== [...iids].sort().join()) {
      err(q.id, 'correctOrder is not a permutation of item ids')
    }
  } else if (q.type === 'match') {
    if (q.pairs.length < 2) err(q.id, 'match must have >= 2 pairs')
    const pids = q.pairs.map((p) => p.id)
    if (new Set(pids).size !== pids.length) err(q.id, 'duplicate pair ids')
    for (const p of q.pairs) {
      if (!p.left?.trim() || !p.right?.trim()) err(q.id, 'pair has empty left/right')
    }
  }
}

ALL_QUESTIONS.forEach(validate)

// ---- Stats ----------------------------------------------------------------
const byExam: Record<string, number> = {}
const byDomain: Record<string, number> = {}
const byDifficulty: Record<string, number> = {}
const byType: Record<string, number> = {}
for (const q of ALL_QUESTIONS) {
  byExam[q.exam] = (byExam[q.exam] ?? 0) + 1
  byDomain[q.domainId] = (byDomain[q.domainId] ?? 0) + 1
  byDifficulty[q.difficulty] = (byDifficulty[q.difficulty] ?? 0) + 1
  byType[q.type] = (byType[q.type] ?? 0) + 1
}

console.log(`\nQuestion bank: ${ALL_QUESTIONS.length} questions\n`)
console.log('By exam:      ', byExam)
console.log('By domain:    ', byDomain)
console.log('By difficulty:', byDifficulty)
console.log('By type:      ', byType)

if (warnings.length) {
  console.log(`\n${warnings.length} warning(s):`)
  warnings.forEach((w) => console.log('  ' + w))
}

if (errors.length) {
  console.log(`\n${errors.length} error(s):`)
  errors.forEach((e) => console.log('  ' + e))
  console.error('\nBank validation FAILED.')
  process.exit(1)
}

console.log('\n✓ Bank validation passed.')
