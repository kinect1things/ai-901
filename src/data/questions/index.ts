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
import { questions as ai901d1Extra } from './ai901-d1-extra'
import { questions as ai901d2Extra } from './ai901-d2-extra'
import { questions as ai900ExtraA } from './ai900-extra-a'
import { questions as ai900ExtraB } from './ai900-extra-b'
import { questions as formatsExtra } from './formats-extra'
import { questions as ai901d1B3 } from './ai901-d1-b3'
import { questions as ai901d2B3 } from './ai901-d2-b3'
import { questions as ai900d1B3 } from './ai900-d1-b3'
import { questions as ai900MixedB3 } from './ai900-mixed-b3'

export const RAW_QUESTIONS: RawQuestion[] = [
  ...ai901d1,
  ...ai901d2,
  ...ai900d1,
  ...ai900d2,
  ...ai900d3,
  ...ai900d4,
  ...ai900d5,
  ...ai901d1Extra,
  ...ai901d2Extra,
  ...ai900ExtraA,
  ...ai900ExtraB,
  ...formatsExtra,
  ...ai901d1B3,
  ...ai901d2B3,
  ...ai900d1B3,
  ...ai900MixedB3,
]

function resolve(raw: RawQuestion): Question {
  const { refKey, ...rest } = raw
  const reference = REF[refKey]
  switch (rest.type) {
    case 'statements':
      return {
        ...rest,
        reference,
        statements: rest.statements.map((s, i) => ({
          id: s.id ?? `s${i + 1}`,
          text: s.text,
          correct: s.correct,
        })),
      }
    case 'build-list': {
      // Items are authored in the correct order; assign ids + derive the order.
      const items = rest.items.map((it, i) => ({ id: it.id ?? `i${i + 1}`, text: it.text }))
      return { ...rest, reference, items, correctOrder: items.map((it) => it.id) }
    }
    case 'match': {
      const pairs = rest.pairs.map((p, i) => ({ id: p.id ?? `p${i + 1}`, left: p.left, right: p.right }))
      return { ...rest, reference, pairs }
    }
    default:
      return { ...rest, reference }
  }
}

export const ALL_QUESTIONS: Question[] = RAW_QUESTIONS.map(resolve)
