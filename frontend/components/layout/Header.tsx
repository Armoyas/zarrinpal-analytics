'use client'

import { Menu, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/lib/theme'
import { cn } from '@/lib/utils'

interface HeaderProps {
  onMenuClick: () => void
  onRefresh: () => void
  refreshing: boolean
}

export function Header({ onMenuClick, onRefresh, refreshing }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md lg:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick} aria-label="باز کردن منو">
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex min-w-0 flex-1 flex-col">
        <h1 className="truncate text-base font-bold tracking-tight sm:text-lg">داشبورد تحلیلی زرین‌پال</h1>
        <p className="hidden truncate text-xs text-muted-foreground sm:block">
          نمای کلی عملکرد پذیرنده · داده‌های زنده از تراکنش‌ها
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground sm:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          زنده
        </span>

        <Button variant="outline" size="icon" onClick={onRefresh} aria-label="به‌روزرسانی داده‌ها">
          <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
        </Button>

        <ThemeToggle />
      </div>
    </header>
  )
}
