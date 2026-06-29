// ---------------------------------------------------------------------------
// Core domain model for the AI-901 / AI-900 study platform.
//
// The data model is deliberately multi-exam: AI-901 is the current exam
// (replacing AI-900 on 2026-06-30) but AI-900 content is retained as
// foundational study material. Every question is tagged with an exam, a
// domain, a difficulty and a question type so the quiz engine can build
// realistic, randomized, weighted practice exams.
// ---------------------------------------------------------------------------

export type ExamCode = 'AI-901' | 'AI-900'

export type Difficulty = 'easy' | 'medium' | 'hard'

/**
 * Question formats modeled on Microsoft's fundamentals exams:
 *  - `single`     : multiple choice, exactly one correct answer
 *  - `multi`      : multiple response, "select N that apply"
 *  - `statements` : the Yes/No review-statement series ("For each of the
 *                   following statements, select Yes if the statement is true")
 */
export type QuestionType = 'single' | 'multi' | 'statements'

export interface Choice {
  /** Stable id, e.g. 'a', 'b', 'c'. Used for answer keys + shuffling. */
  id: string
  text: string
}

export interface Statement {
  id: string
  text: string
  /** true === the correct answer is "Yes" (the statement is true). */
  correct: boolean
}

export interface ReferenceLink {
  label: string
  url: string
}

interface QuestionBase {
  /** Globally unique, stable id e.g. "ai901-d1-0007". */
  id: string
  exam: ExamCode
  /** References a Domain.id. */
  domainId: string
  difficulty: Difficulty
  /** The question stem / scenario. */
  prompt: string
  /** Rationale shown after answering — why the answer is correct. */
  explanation: string
  /** Official Microsoft Learn link backing the rationale. */
  reference?: ReferenceLink
  /** Free-form concept tags for filtering/analytics. */
  tags?: string[]
}

export interface SingleChoiceQuestion extends QuestionBase {
  type: 'single'
  choices: Choice[]
  /** Choice id of the single correct answer. */
  answer: string
}

export interface MultipleResponseQuestion extends QuestionBase {
  type: 'multi'
  choices: Choice[]
  /** Choice ids of all correct answers. */
  answers: string[]
}

export interface StatementSeriesQuestion extends QuestionBase {
  type: 'statements'
  /** Lead-in is implied: "For each statement, select Yes if it is true." */
  statements: Statement[]
}

export type Question =
  | SingleChoiceQuestion
  | MultipleResponseQuestion
  | StatementSeriesQuestion

export interface Domain {
  id: string
  exam: ExamCode
  /** Official domain title. */
  name: string
  /** Official weighting, e.g. "40–45%". */
  weight: string
  /** Midpoint of the weighting range (0–1), used for weighted sampling. */
  weightValue: number
  /** Short human description for the UI. */
  blurb: string
}

export interface ExamMeta {
  code: ExamCode
  title: string
  status: 'current' | 'legacy'
  passingScore: number
  /** Marketing-style one liner for cards. */
  tagline: string
  /** Notes shown in the UI (e.g. retirement info). */
  note?: string
  studyGuideUrl: string
}

// --------------------------- Quiz configuration ----------------------------

export type QuestionCount = 10 | 20 | 40

export type DifficultySelection = Difficulty | 'mixed'

export type QuizMode = 'exam' | 'study'

export interface QuizConfig {
  /** Exams to draw questions from (at least one). */
  exams: ExamCode[]
  /** Specific domain ids, or 'all' to draw from every domain. */
  domainIds: string[] | 'all'
  difficulty: DifficultySelection
  count: QuestionCount
  /** 'exam' = feedback at the end; 'study' = immediate feedback per question. */
  mode: QuizMode
  timed: boolean
}

// ------------------------------ Quiz runtime -------------------------------

/** A question prepared for a session: choices/statements already shuffled. */
export interface PreparedQuestion {
  question: Question
  /** Shuffled display order of choice ids (for single/multi). */
  displayChoiceOrder: string[]
  /** Shuffled display order of statement ids (for statements). */
  displayStatementOrder: string[]
}

/** The learner's response to a single prepared question. */
export interface Response {
  /** Selected choice ids (single = length 1, multi = length N). */
  selectedChoiceIds: string[]
  /** Map of statementId -> answered value (true = "Yes"). */
  statementAnswers: Record<string, boolean>
}

export interface GradedQuestion {
  prepared: PreparedQuestion
  response: Response
  correct: boolean
  /** True when answered at all. */
  answered: boolean
}

export interface DomainScore {
  domainId: string
  name: string
  total: number
  correct: number
}

export interface QuizResult {
  config: QuizConfig
  graded: GradedQuestion[]
  total: number
  correctCount: number
  /** Scaled to a 1000-point scale like the real exam. */
  scaledScore: number
  passed: boolean
  passingScore: number
  domainScores: DomainScore[]
  /** Elapsed seconds (0 when untimed and not tracked). */
  elapsedSeconds: number
  completedAt: number
}
