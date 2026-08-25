import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { Bell, Search, Menu } from "lucide-react"
import { Input } from "@/components/ui/input"

export function Header({ onMobileNavOpen }: { onMobileNavOpen?: () => void }) {
  return (
    <header className="flex h-14 lg:h-16 items-center gap-3 sm:gap-4 border-b bg-muted/40 px-3 sm:px-4 lg:px-6">
      {onMobileNavOpen && (
        <button
          onClick={onMobileNavOpen}
          className="rounded p-1.5 hover:bg-muted transition-colors lg:hidden"
          aria-label="باز کردن منو"
        >
          <Menu className="h-5 w-5 text-foreground" />
        </button>
      )}
      <div className="w-full flex-1">
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="relative">
            <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="جستجو در تراکنش‌ها، فروشگاه‌ها..."
              className="pr-8 text-right"
            />
          </div>
        </form>
      </div>
      <ThemeToggle />
      <button className="relative flex items-center justify-center h-8 w-8 rounded-lg border bg-background">
        <Bell className="h-4 w-4" />
        <span className="absolute top-0 right-0 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
        </span>
      </button>
    </header>
  )
}
