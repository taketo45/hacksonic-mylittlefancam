'use client'

import DashboardHeader from './header'
import DashboardSidebar from './sidebar'

type DashboardClientProps = {
  children: React.ReactNode
  isAdmin: boolean
}

export default function DashboardClient({ children, isAdmin }: DashboardClientProps) {
  return (
    <div className="flex h-screen bg-gray-100">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader isAdmin={isAdmin} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  )
} 