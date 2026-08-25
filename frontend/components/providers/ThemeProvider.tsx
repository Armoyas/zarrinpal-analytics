"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"

// OYAZ Theme — locked to dark default, no system option.
// Language, direction, font, accent are all fixed.
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
