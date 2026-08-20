import { Metadata } from 'next'
import DashboardPage from '@/components/dashboard/DashboardPage'

export const metadata: Metadata = {
  title: 'داشبورد تحلیلی زرین‌پال',
}

export default function Page() {
  return <DashboardPage />
}
