'use client'

import * as React from 'react'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [collapsed, setCollapsed] = React.useState(false)
  const [refreshKey, setRefreshKey] = React.useState(0)
  const [refreshing, setRefreshing] = React.useState(false)

  const handleRefresh = () => {
    setRefreshing(true)
    setRefreshKey((k) => k + 1)
    window.setTimeout(() => setRefreshing(false), 700)
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar
        open={menuOpen}
        collapsed={collapsed}
        onClose={() => setMenuOpen(false)}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header onMenuClick={() => setMenuOpen(true)} onRefresh={handleRefresh} refreshing={refreshing} />
        <main key={refreshKey} className="flex-1 px-4 py-6 lg:px-6">
          <div className="mx-auto w-full max-w-[1400px] space-y-6">{children}</div>
        </main>
        <footer className="border-t px-4 py-4 text-center text-xs text-muted-foreground lg:px-6">
          داشبورد تحلیلی زرین‌پال · ساخته‌شده برای چالش تحلیل داده Elcamp 1405
        </footer>
      </div>
    </div>
  )
}
