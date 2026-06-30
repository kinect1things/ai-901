import { useCallback, useState } from 'react'
import { Header } from './components/Header'
import { ConfigScreen } from './components/ConfigScreen'
import { QuizScreen } from './components/QuizScreen'
import { ResultsScreen } from './components/ResultsScreen'
import { useTheme } from './hooks/useTheme'
import { addToHistory, storeLastConfig } from './lib/storage'
import type { QuizConfig, QuizResult } from './lib/types'

type Screen = 'config' | 'quiz' | 'results'

function newSeed(): number {
  return Math.floor(Math.random() * 2_147_483_647) + 1
}

export default function App() {
  const { theme, toggle } = useTheme()
  const [screen, setScreen] = useState<Screen>('config')
  const [config, setConfig] = useState<QuizConfig | null>(null)
  const [seed, setSeed] = useState<number>(newSeed)
  const [runKey, setRunKey] = useState(0)
  const [result, setResult] = useState<QuizResult | null>(null)

  const startQuiz = useCallback((cfg: QuizConfig) => {
    storeLastConfig(cfg)
    setConfig(cfg)
    setSeed(newSeed())
    setRunKey((k) => k + 1)
    setResult(null)
    setScreen('quiz')
  }, [])

  const handleComplete = useCallback((r: QuizResult) => {
    addToHistory(r)
    setResult(r)
    setScreen('results')
  }, [])

  const retakeSame = useCallback(() => {
    // Same config + same seed ⇒ identical exam, fresh attempt.
    setRunKey((k) => k + 1)
    setResult(null)
    setScreen('quiz')
  }, [])

  const newSimilar = useCallback(() => {
    if (!config) return
    setSeed(newSeed())
    setRunKey((k) => k + 1)
    setResult(null)
    setScreen('quiz')
  }, [config])

  const backToConfig = useCallback(() => setScreen('config'), [])

  return (
    <div className="flex min-h-screen flex-col">
      <Header theme={theme} onToggleTheme={toggle} onHome={backToConfig} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
        {screen === 'config' && <ConfigScreen onStart={startQuiz} />}

        {screen === 'quiz' && config && (
          <QuizScreen
            key={runKey}
            config={config}
            seed={seed}
            onComplete={handleComplete}
            onExit={backToConfig}
          />
        )}

        {screen === 'results' && result && (
          <ResultsScreen
            result={result}
            onRetakeSame={retakeSame}
            onNewSimilar={newSimilar}
            onNewQuiz={backToConfig}
          />
        )}
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500 print:hidden dark:border-slate-800 dark:text-slate-400">
        <p>
          AI-901 Study Hub · An open-source, community practice tool. Not affiliated with or endorsed
          by Microsoft.
        </p>
        <p className="mt-1">
          Aligned to the official{' '}
          <a
            className="font-medium text-azure-600 hover:underline dark:text-azure-400"
            href="https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-fundamentals/"
            target="_blank"
            rel="noreferrer"
          >
            Azure AI Fundamentals
          </a>{' '}
          skills outline. Always verify against Microsoft Learn.
        </p>
      </footer>
    </div>
  )
}
