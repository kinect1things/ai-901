import { BrainCircuit, Moon, Sun } from 'lucide-react'
import type { Theme } from '../lib/storage'

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 .5C5.73.5.5 5.73.5 12a11.5 11.5 0 0 0 7.86 10.92c.575.106.785-.25.785-.555 0-.274-.01-1.002-.015-1.967-3.196.695-3.87-1.54-3.87-1.54-.523-1.33-1.277-1.683-1.277-1.683-1.044-.714.08-.7.08-.7 1.154.082 1.76 1.185 1.76 1.185 1.026 1.758 2.693 1.25 3.35.955.103-.743.4-1.25.728-1.538-2.552-.29-5.236-1.276-5.236-5.68 0-1.255.448-2.28 1.183-3.084-.119-.29-.513-1.46.112-3.043 0 0 .966-.31 3.166 1.178a10.98 10.98 0 0 1 2.882-.388c.978.004 1.963.132 2.882.388 2.198-1.488 3.163-1.178 3.163-1.178.626 1.583.232 2.753.114 3.043.736.804 1.18 1.83 1.18 3.084 0 4.415-2.688 5.387-5.25 5.67.412.355.78 1.057.78 2.13 0 1.538-.014 2.778-.014 3.156 0 .308.207.667.79.554A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
    </svg>
  )
}

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
            <GitHubMark className="h-[18px] w-[18px]" />
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
