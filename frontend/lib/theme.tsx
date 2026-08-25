'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggle: () => void
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined)

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  const stored = window.localStorage.getItem('zarinpal-theme')
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>(() => getInitialTheme())

  React.useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.style.colorScheme = theme
    window.localStorage.setItem('zarinpal-theme', theme)
  }, [theme])

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme: setThemeState,
      toggle: () => setThemeState((t) => (t === 'dark' ? 'light' : 'dark')),
    }),
    [theme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider')
  return ctx
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'تغییر به حالت روشن' : 'تغییر به حالت تاریک'}
      className={cn(
        'group relative inline-flex h-9 w-[4.25rem] items-center rounded-full border bg-muted p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
    >
      <span
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded-full bg-card shadow-sm ring-1 ring-border transition-transform duration-300',
          isDark ? 'translate-x-0' : 'translate-x-[calc(100%+0.25rem)]'
        )}
      >
        {isDark ? (
          <Moon className="h-3.5 w-3.5 text-primary" />
        ) : (
          <Sun className="h-3.5 w-3.5 text-primary" />
        )}
      </span>
    </button>
  )
}
