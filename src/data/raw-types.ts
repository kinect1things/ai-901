// ---------------------------------------------------------------------------
// Authoring types for the question bank.
//
// Questions are authored as `RawQuestion`s that reference a link by KEY
// (`refKey`) instead of inlining a URL. The loader (`questions/index.ts`)
// resolves each `refKey` to a verified ReferenceLink and produces the runtime
// `Question`. Because RawQuestion is a typed discriminated union, `tsc`
// validates every authored question at build time — a wrong field, a bad
// difficulty, or an unknown refKey fails the build.
// ---------------------------------------------------------------------------

import type { RefKey } from './references'
import type {
  Choice,
  Difficulty,
  ExamCode,
} from '../lib/types'

/** A statement as authored — `id` is optional and auto-assigned by the loader. */
export interface RawStatement {
  id?: string
  text: string
  correct: boolean
}

interface RawBase {
  id: string
  exam: ExamCode
  domainId: string
  difficulty: Difficulty
  prompt: string
  explanation: string
  refKey: RefKey
  tags?: string[]
}

export interface RawSingle extends RawBase {
  type: 'single'
  choices: Choice[]
  answer: string
}

export interface RawMulti extends RawBase {
  type: 'multi'
  choices: Choice[]
  answers: string[]
}

export interface RawStatements extends RawBase {
  type: 'statements'
  statements: RawStatement[]
}

export type RawQuestion = RawSingle | RawMulti | RawStatements
