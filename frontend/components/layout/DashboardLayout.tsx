"use client"

import { Header } from "@/components/layout/Header"
import { Sidebar } from "@/components/layout/Sidebar"
import { Toaster } from "@/components/ui/toaster"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"

export function DashboardLayout({
  children,
  merchantFilter,
  dateFilter,
}: {
  children: React.ReactNode
  merchantFilter?: React.ReactNode
  dateFilter?: React.ReactNode
}) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[240px_1fr]">
      {/* Sidebar - hidden on mobile, shown on desktop */}
      <div className="hidden border-l bg-muted/40 lg:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay - controlled by header button */}
      <div className="lg:hidden">
        {/* The mobile sidebar is toggled via the header button */}
      </div>

      <div className="flex flex-col">
        <Header />

        {/* Filter bar - appears below header on all screens */}
        {(merchantFilter || dateFilter) && (
          <div className="flex flex-wrap items-center gap-3 px-4 sm:px-6 lg:px-8 py-3 bg-muted/20 border-b">
            {merchantFilter}
            {dateFilter}
          </div>
        )}

        <main className="flex-1 flex flex-col gap-4 p-4 lg:p-6 xl:p-8 max-w-screen-2xl mx-auto w-full">
          {children}
        </main>
      </div>

      <Toaster />
    </div>
  )
}

export function MobileSidebar({
  open,
  onClose,
  children,
}: {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-l bg-muted/40 transform transition-transform duration-300 ease-in-out lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <span className="text-sm font-bold text-primary">زرین‌پال</span>
          <button
            onClick={onClose}
            className="rounded p-1 hover:bg-muted transition-colors"
            aria-label="بستن منو"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </>
  )
}
