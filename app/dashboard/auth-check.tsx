import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AuthCheck() {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/')
  }

  // ユーザーのロールを確認
  const { data: userRoles } = await supabase
    .from('user_role_tbl')
    .select(`
      role_mst (
        role_key
      )
    `)
    .eq('user_id', session.user.id)

  // 有効なロールを持っているか確認（USER, HOST, PHOTOGRAPHER, SYSTEM_ADMINのいずれか）
  const hasValidRole = userRoles?.some(
    (role) => ['USER', 'HOST', 'PHOTOGRAPHER', 'SYSTEM_ADMIN'].includes(role.role_mst?.role_key)
  )

  if (!hasValidRole) {
    redirect('/')
  }

  return null
} 