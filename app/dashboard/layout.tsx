'use client'

import DashboardClient from '@/components/dashboard/dashboard-client'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkAdminRole = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: userRoles } = await supabase
          .from('user_role_tbl')
          .select(`
            role_mst (
              role_key
            )
          `)
          .eq('user_id', user.id)

        setIsAdmin(userRoles?.some(role => role.role_mst?.role_key === 'SYSTEM_ADMIN') ?? false)
      }
    }

    checkAdminRole()
  }, [supabase])

  return (
    <DashboardClient isAdmin={isAdmin}>
      {children}
    </DashboardClient>
  )
} 