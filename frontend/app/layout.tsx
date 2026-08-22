import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { QueryProvider } from "@/components/providers/QueryProvider"

export const metadata: Metadata = {
  title: "ZarrinPal Analytics Dashboard",
  description: "AI-Powered Payment Analytics Dashboard",
  // Runtime font load — avoids build-time network calls in Docker
  other: {
    'font-preload': '',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fa" dir="rtl" className="font-vazirmatn">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@100..900&display=swap"
        />
        <style>{`
          @font-face {
            font-family: 'Vazirmatn';
            font-style: normal;
            font-display: swap;
          }
        `}</style>
      </head>
      <body className="font-sans bg-background text-foreground min-h-screen">
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
