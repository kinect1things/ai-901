// Lightweight, defensive localStorage wrappers. All access is wrapped in
// try/catch so the app degrades gracefully in private-mode / storage-disabled
// browsers.

import type { QuizConfig, QuizResult } from './types'

const KEYS = {
  theme: 'ai901.theme',
  history: 'ai901.history',
  lastConfig: 'ai901.lastConfig',
} as const

export type Theme = 'light' | 'dark'

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* ignore quota / disabled storage */
  }
}

// ---- Theme ----------------------------------------------------------------

export function getStoredTheme(): Theme | null {
  const t = read<Theme | null>(KEYS.theme, null)
  return t === 'light' || t === 'dark' ? t : null
}

export function storeTheme(theme: Theme): void {
  write(KEYS.theme, theme)
}

// ---- Last config ----------------------------------------------------------

export function getLastConfig(): QuizConfig | null {
  return read<QuizConfig | null>(KEYS.lastConfig, null)
}

export function storeLastConfig(config: QuizConfig): void {
  write(KEYS.lastConfig, config)
}

// ---- Attempt history ------------------------------------------------------

export interface AttemptSummary {
  id: string
  completedAt: number
  exams: string[]
  difficulty: string
  count: number
  total: number
  correctCount: number
  scaledScore: number
  passed: boolean
  elapsedSeconds: number
}

const MAX_HISTORY = 30

export function getHistory(): AttemptSummary[] {
  return read<AttemptSummary[]>(KEYS.history, [])
}

export function addToHistory(result: QuizResult): AttemptSummary {
  const summary: AttemptSummary = {
    id: `${result.completedAt}-${Math.round(result.scaledScore)}`,
    completedAt: result.completedAt,
    exams: result.config.exams,
    difficulty: result.config.difficulty,
    count: result.config.count,
    total: result.total,
    correctCount: result.correctCount,
    scaledScore: result.scaledScore,
    passed: result.passed,
    elapsedSeconds: result.elapsedSeconds,
  }
  const next = [summary, ...getHistory()].slice(0, MAX_HISTORY)
  write(KEYS.history, next)
  return summary
}

export function clearHistory(): void {
  write(KEYS.history, [])
}
