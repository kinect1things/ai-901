import type { Difficulty } from './types'

/** Seconds → "M:SS" or "H:MM:SS". */
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(s / 3600)
  const minutes = Math.floor((s % 3600) / 60)
  const seconds = s % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`
}

export function formatDate(ts: number): string {
  try {
    return new Date(ts).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

interface DifficultyMeta {
  label: string
  /** Tailwind classes for a chip. */
  chip: string
  dot: string
}

export function difficultyMeta(d: Difficulty): DifficultyMeta {
  switch (d) {
    case 'easy':
      return {
        label: 'Easy',
        chip: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
        dot: 'bg-emerald-500',
      }
    case 'medium':
      return {
        label: 'Medium',
        chip: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
        dot: 'bg-amber-500',
      }
    case 'hard':
      return {
        label: 'Hard',
        chip: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
        dot: 'bg-rose-500',
      }
  }
}

/** Color for a 0–1 ratio: red → amber → green. */
export function scoreColor(ratio: number): string {
  if (ratio >= 0.7) return 'text-emerald-500'
  if (ratio >= 0.5) return 'text-amber-500'
  return 'text-rose-500'
}

export function pluralize(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`
}
