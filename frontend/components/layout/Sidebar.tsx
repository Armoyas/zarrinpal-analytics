import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  LayoutDashboard,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  FileText,
  Settings,
  Bot,
  Gift,
  Menu,
} from "lucide-react"

const navItems = [
  { icon: LayoutDashboard, label: "داشبورد", href: "/dashboard" },
  { icon: BarChart3, label: "تراکنش‌ها", href: "/dashboard" },
  { icon: ShoppingBag, label: "فروشگاه‌ها", href: "/dashboard" },
  { icon: TrendingUp, label: "روندها", href: "/dashboard" },
  { icon: AlertTriangle, label: "هشدارها", href: "/dashboard" },
  { icon: Bot, label: "هوش مصنوعی", href: "/ai-dashboard" },
  { icon: Gift, label: "نوروز ۱۴۰۵", href: "/nowruz-dashboard" },
  { icon: FileText, label: "گزارشات", href: "/dashboard" },
  { icon: Settings, label: "تنظیمات", href: "/dashboard" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col gap-2 p-3">
      <div className="flex h-14 items-center justify-center border-b mb-2">
        <span className="text-xs font-bold text-primary">ZARRINPAL ANALYTICS</span>
      </div>
      <nav className="flex flex-col items-stretch gap-1 text-sm font-medium">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-primary hover:bg-accent transition-all",
                isActive && "bg-accent text-primary font-medium"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export function MobileNavTrigger({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="rounded p-2 hover:bg-muted transition-colors lg:hidden"
      aria-label="باز کردن منو"
    >
      <Menu className="h-5 w-5 text-foreground" />
    </button>
  )
}
