'use client'

import * as React from 'react'
import {
  LayoutDashboard,
  TrendingUp,
  BarChart3,
  GitCompareArrows,
  CalendarDays,
  Lightbulb,
  Database,
  X,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  open: boolean
  collapsed: boolean
  onClose: () => void
  onToggleCollapse: () => void
}

interface NavItem {
  id: string
  label: string
  icon: React.ElementType
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    label: 'داشبورد',
    items: [
      { id: 'overview', label: 'نمای کلی', icon: LayoutDashboard },
      { id: 'trends', label: 'روند تراکنش‌ها', icon: TrendingUp },
    ],
  },
  {
    label: 'تحلیل',
    items: [
      { id: 'ranking', label: 'رتبه‌بندی پذیرنده‌ها', icon: BarChart3 },
      { id: 'peers', label: 'مقایسه هم‌صنفی', icon: GitCompareArrows },
      { id: 'nowruz', label: 'تحلیل نوروز', icon: CalendarDays },
    ],
  },
  {
    label: 'بینش',
    items: [
      { id: 'recommendations', label: 'پیشنهادهای هوشمند', icon: Lightbulb },
      { id: 'provenance', label: 'ردیابی محاسبات', icon: Database },
    ],
  },
]

export function Sidebar({ open, collapsed, onClose, onToggleCollapse }: SidebarProps) {
  const [active, setActive] = React.useState('overview')

  React.useEffect(() => {
    const ids = navGroups.flatMap((g) => g.items.map((i) => i.id))
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id)
          }
        }
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    )
    sections.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className={cn('flex items-center gap-3 border-b border-sidebar-border px-4 py-4', collapsed && 'justify-center px-2')}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-lg font-black text-primary-foreground shadow-gold">
          ز
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-sidebar-foreground">زرین‌پال</p>
            <p className="truncate text-[11px] text-sidebar-foreground/55">داشبورد تحلیلی پذیرندگان</p>
          </div>
        )}
        {!collapsed && (
          <button
            onClick={onClose}
            className="ms-auto rounded-md p-1 text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground lg:hidden"
            aria-label="بستن منو"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wide text-sidebar-foreground/40">
                {group.label}
              </p>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const isActive = active === item.id
                return (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      onClick={onClose}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        collapsed && 'justify-center px-2',
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-primary'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
                      )}
                    >
                      <item.icon className={cn('h-[18px] w-[18px] shrink-0', isActive && 'text-sidebar-primary')} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                      {!collapsed && isActive && (
                        <span className="ms-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary" />
                      )}
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={onToggleCollapse}
          className={cn(
            'hidden w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground lg:flex',
            collapsed && 'justify-center px-2'
          )}
        >
          {collapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          {!collapsed && <span>جمع کردن منو</span>}
        </button>
        {!collapsed && (
          <p className="mt-2 hidden px-3 text-[11px] text-sidebar-foreground/35 lg:block">
            Elcamp 1405 · چالش تحلیل داده
          </p>
        )}
      </div>
    </div>
  )

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={onClose} aria-hidden="true" />}
      <aside
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-200 lg:static',
          collapsed ? 'lg:w-[72px]' : 'lg:w-64',
          'w-72',
          open ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        )}
      >
        {sidebar}
      </aside>
    </>
  )
}
