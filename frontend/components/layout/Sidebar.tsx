import { cn } from "@/lib/utils"
import {
  BarChart3,
  LayoutDashboard,
  TrendingUp,
  AlertTriangle,
  FileText,
  Settings,
  Bot,
} from "lucide-react"

const navItems = [
  { icon: LayoutDashboard, label: "داشبورد", href: "/" },
  { icon: BarChart3, label: "تراکنش‌ها", href: "#" },
  { icon: TrendingUp, label: "روندها", href: "#" },
  { icon: AlertTriangle, label: "هشدارها", href: "#" },
  { icon: Bot, label: "هوش مصنوعی", href: "#" },
  { icon: FileText, label: "گزارشات", href: "#" },
  { icon: Settings, label: "تنظیمات", href: "#" },
]

export function Sidebar() {
  return (
    <div className="flex h-full max-h-screen flex-col gap-2 p-3">
      <div className="flex h-14 items-center justify-center border-b mb-2">
        <span className="text-xs font-bold text-primary">OYAZ</span>
      </div>
      <nav className="flex flex-col items-stretch gap-1 text-sm font-medium">
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-primary hover:bg-accent transition-all"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </a>
        ))}
      </nav>
    </div>
  )
}
