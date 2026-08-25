import { Header } from "@/components/layout/Header"
import { Sidebar } from "@/components/layout/Sidebar"
import { Toaster } from "@/components/ui/toaster"

interface DashboardLayoutProps {
  children: React.ReactNode
  merchantFilter?: React.ReactNode
  dateFilter?: React.ReactNode
}

export function DashboardLayout({ children, merchantFilter, dateFilter }: DashboardLayoutProps) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[240px_1fr]">
      <div className="hidden border-l bg-muted/40 lg:block">
        <Sidebar />
      </div>
      <div className="flex flex-col">
        <Header />
        {(merchantFilter || dateFilter) && (
          <div className="flex items-center gap-2 p-2 bg-muted/20 border-b">
            {merchantFilter}
            {dateFilter}
          </div>
        )}
        <main className="flex-1 flex-col gap-4 p-4 lg:p-6 xl:p-8 max-w-screen-2xl mx-auto w-full">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  )
}
