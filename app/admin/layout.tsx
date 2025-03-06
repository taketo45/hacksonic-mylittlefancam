import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminHeader from '@/components/admin/header'
import AdminSidebar from '@/components/admin/sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/')
  }

  // システム管理者ロールを持っているか確認
  const { data: userRoles } = await supabase
    .from('user_role_tbl')
    .select('role_mst(role_key)')
    .eq('user_id', session.user.id)

  const isSystemAdmin = userRoles?.some(
    (role) => role.role_mst?.role_key === 'SYSTEM_ADMIN'
  )

  if (!isSystemAdmin) {
    redirect('/dashboard')
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  )
} 