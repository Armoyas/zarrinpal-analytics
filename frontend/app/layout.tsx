import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { QueryProvider } from "@/components/providers/QueryProvider"

export const metadata: Metadata = {
  title: "OYAZ Analytics",
  description: "OYAZ Analytics Dashboard",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fa" dir="rtl" className="font-iransans">
      <head>
        <style>{`
          @font-face {
            font-family: 'iransans';
            src: url('/fonts/iransans.ttf') format('truetype');
            font-style: normal;
            font-display: swap;
          }
        `}</style>
      </head>
      <body className="font-iransans bg-background text-foreground min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
