import { LayoutDashboard, TrendingUp, BarChart3, Lightbulb, CalendarDays, GitCompareArrows, Database, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

const navItems = [
  { key: 'overview', label: 'نمای کلی', icon: LayoutDashboard },
  { key: 'trends', label: 'روند تراکنش‌ها', icon: TrendingUp },
  { key: 'ranking', label: 'رتبه‌بندی پذیرنده‌ها', icon: BarChart3 },
  { key: 'recommendations', label: 'پیشنهادهای هوشمند', icon: Lightbulb },
  { key: 'nowruz', label: 'تحلیل نوروز', icon: CalendarDays },
  { key: 'peers', label: 'مقایسه با هم‌صنفی‌ها', icon: GitCompareArrows },
  { key: 'provenance', label: 'ردیابی محاسبات', icon: Database },
]

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} aria-hidden="true" />}
      <aside
        className={cn(
          'fixed inset-y-0 right-0 z-50 w-64 border-l bg-card transition-transform duration-200 lg:static lg:translate-x-0',
          open ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex h-14 items-center justify-between border-b px-4">
          <span className="font-bold text-primary">زرین‌پال</span>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose} aria-label="بستن منو">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="space-y-1 p-3">
          {navItems.map((item) => (
            <a
              key={item.key}
              href={`#${item.key}`}
              onClick={onClose}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </a>
          ))}
        </nav>
      </aside>
    </>
  )
}
