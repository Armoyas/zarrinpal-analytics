"use client"

import { QueryClientProvider } from "@tanstack/react-query"
<<<<<<< HEAD
=======
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
>>>>>>> b02ecabe7ff1feb08af1199006c2ee9cdf441a41
import { queryClient } from "@/lib/query-client"

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
