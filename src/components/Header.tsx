import { BrainCircuit, Github, Moon, Sun } from 'lucide-react'
import type { Theme } from '../lib/storage'

interface HeaderProps {
  theme: Theme
  onToggleTheme: () => void
  onHome: () => void
}

export function Header({ theme, onToggleTheme, onHome }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/70 backdrop-blur-lg print:hidden dark:border-slate-800/70 dark:bg-slate-950/70">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <button
          onClick={onHome}
          className="group flex items-center gap-2.5 rounded-lg text-left"
          aria-label="AI-901 Study Hub home"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-azure-500 to-sky-400 text-white shadow-[0_4px_16px_-2px_rgba(37,99,235,0.6)] transition-transform group-hover:scale-105">
            <BrainCircuit className="h-5 w-5" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-bold tracking-tight text-slate-900 dark:text-white">
              AI-901 Study Hub
            </span>
            <span className="block text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Azure AI Fundamentals practice
            </span>
          </span>
        </button>

        <div className="flex items-center gap-1">
          <a
            href="https://github.com/kinect1things/ai-901"
            target="_blank"
            rel="noreferrer"
            className="btn-ghost h-9 w-9 !px-0"
            aria-label="View source on GitHub"
            title="View source on GitHub"
          >
            <Github className="h-[18px] w-[18px]" />
          </a>
          <button
            onClick={onToggleTheme}
            className="btn-ghost h-9 w-9 !px-0"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          </button>
        </div>
      </div>
    </header>
  )
}
