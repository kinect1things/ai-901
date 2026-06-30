import { useCallback, useEffect, useState } from 'react'
import { getStoredTheme, storeTheme, type Theme } from '../lib/storage'

function initialTheme(): Theme {
  // Default to dark ("black") regardless of the OS preference — the app is a
  // dark-first experience. Only an explicit user choice (via the toggle, saved
  // to localStorage) overrides it.
  return getStoredTheme() ?? 'dark'
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(initialTheme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    storeTheme(theme)
  }, [theme])

  const toggle = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, toggle }
}
