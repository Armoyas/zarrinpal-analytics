'use client'

import { useEffect, useState } from 'react'
import { Database } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { api, type Provenance } from '@/lib/api'

export function DataProvenance() {
  const [rows, setRows] = useState<Provenance[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.provenance().then(setRows).catch((e) => setError(e.message))
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-teal-600" />
          ردیابی محاسبات (منبع هر عدد)
        </CardTitle>
        <CardDescription>هر عدد در داشبورد از کجا آمده و چگونه محاسبه شده است</CardDescription>
      </CardHeader>
      <CardContent>
        {!rows && !error ? (
          <Skeleton className="h-40 w-full" />
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          <div className="space-y-2">
            {rows?.map((p) => (
              <details key={p.metric} className="rounded-lg border p-3">
                <summary className="cursor-pointer text-sm font-medium">
                  {p.metric}: <span className="font-bold" dir="ltr">{p.value}</span>
                </summary>
                <div className="mt-2 space-y-1 text-xs text-muted-foreground" dir="ltr">
                  <p><span className="font-semibold">استعلام:</span> {p.query}</p>
                  <p><span className="font-semibold">منبع:</span> {p.source}</p>
                  <p><span className="font-semibold">محاسبه شده در:</span> {p.computed_at}</p>
                </div>
              </details>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
