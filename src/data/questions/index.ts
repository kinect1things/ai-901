// ---------------------------------------------------------------------------
// Question bank loader.
//
// Aggregates every per-domain RawQuestion file, resolves each `refKey` to a
// verified ReferenceLink, and auto-assigns statement ids where the author
// omitted them. The result is the runtime `ALL_QUESTIONS: Question[]`.
// ---------------------------------------------------------------------------

import type { Question } from '../../lib/types'
import type { RawQuestion } from '../raw-types'
import { REF } from '../references'

import { questions as ai901d1 } from './ai901-d1'
import { questions as ai901d2 } from './ai901-d2'
import { questions as ai900d1 } from './ai900-d1'
import { questions as ai900d2 } from './ai900-d2'
import { questions as ai900d3 } from './ai900-d3'
import { questions as ai900d4 } from './ai900-d4'
import { questions as ai900d5 } from './ai900-d5'

export const RAW_QUESTIONS: RawQuestion[] = [
  ...ai901d1,
  ...ai901d2,
  ...ai900d1,
  ...ai900d2,
  ...ai900d3,
  ...ai900d4,
  ...ai900d5,
]

function resolve(raw: RawQuestion): Question {
  const { refKey, ...rest } = raw
  const reference = REF[refKey]
  if (rest.type === 'statements') {
    return {
      ...rest,
      reference,
      statements: rest.statements.map((s, i) => ({
        id: s.id ?? `s${i + 1}`,
        text: s.text,
        correct: s.correct,
      })),
    }
  }
  return { ...rest, reference }
}

export const ALL_QUESTIONS: Question[] = RAW_QUESTIONS.map(resolve)
