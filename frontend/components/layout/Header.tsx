import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur lg:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick} aria-label="باز کردن منو">
        <Menu className="h-5 w-5" />
      </Button>
      <div className="flex-1">
        <h1 className="text-base font-bold text-primary sm:text-lg">داشبورد تحلیلی زرین‌پال</h1>
      </div>
      <span className="hidden rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground sm:inline-block">
        پذیرندهٔ نمونه
      </span>
    </header>
  )
}
