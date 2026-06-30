import { DOMAINS_BY_ID } from '../data/exams'
import { formatDuration } from './format'
import type { QuizResult } from './types'

const SITE_URL = 'https://kinect1things.github.io/ai-901/'

/** A plain-text summary suitable for copying/sharing. */
export function buildSummaryText(r: QuizResult): string {
  const pct = r.total ? Math.round((r.correctCount / r.total) * 100) : 0
  const time = r.elapsedSeconds > 0 ? ` · ${formatDuration(r.elapsedSeconds)}` : ''
  return [
    'Azure AI Fundamentals — practice exam result',
    `Score: ${r.scaledScore}/1000 — ${r.passed ? 'PASS ✅' : 'not yet (keep practicing)'} (pass mark ${r.passingScore})`,
    `Accuracy: ${pct}% (${r.correctCount}/${r.total} correct)`,
    `${r.total} questions · ${r.config.difficulty} difficulty${time}`,
    '',
    'By domain:',
    ...r.domainScores.map((d) => `  • ${d.name}: ${d.correct}/${d.total}`),
    '',
    `Practice yours at ${SITE_URL}`,
  ].join('\n')
}

/** A structured, shareable export of the result (no answer keys for other items). */
export function buildExportObject(r: QuizResult) {
  return {
    app: 'AI-901 Study Hub',
    url: SITE_URL,
    completedAt: new Date(r.completedAt).toISOString(),
    config: r.config,
    score: {
      scaled: r.scaledScore,
      outOf: 1000,
      passMark: r.passingScore,
      passed: r.passed,
      correct: r.correctCount,
      total: r.total,
      accuracyPct: r.total ? Math.round((r.correctCount / r.total) * 100) : 0,
      elapsedSeconds: r.elapsedSeconds,
    },
    domains: r.domainScores.map((d) => ({
      domainId: d.domainId,
      name: d.name,
      correct: d.correct,
      total: d.total,
    })),
    questions: r.graded.map((g) => ({
      id: g.prepared.question.id,
      exam: g.prepared.question.exam,
      domain: DOMAINS_BY_ID[g.prepared.question.domainId]?.name ?? g.prepared.question.domainId,
      type: g.prepared.question.type,
      difficulty: g.prepared.question.difficulty,
      correct: g.correct,
      answered: g.answered,
    })),
  }
}

/** Copy text to the clipboard; resolves to whether it succeeded. */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* fall through to legacy path */
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}

/** Trigger a client-side download of `data` as a pretty-printed JSON file. */
export function downloadJson(filename: string, data: unknown): void {
  try {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch {
    /* ignore */
  }
}
