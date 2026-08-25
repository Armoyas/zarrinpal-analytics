"use client"

export const dynamic = "force-dynamic"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function NowruzRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/ai-dashboard")
  }, [router])

  return null
}
