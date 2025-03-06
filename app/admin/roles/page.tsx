'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type User = {
  id: string
  email: string
  roles: string[]
}

export default function RolesPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      // ユーザー一覧を取得
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
      if (authError) throw authError

      // ユーザーロールを取得
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_role_tbl')
        .select(`
          user_id,
          role_mst (
            role_key,
            role_name
          )
        `)
      if (rolesError) throw rolesError

      // ユーザー情報とロール情報を結合
      const usersWithRoles = authUsers.users.map(user => ({
        id: user.id,
        email: user.email,
        roles: userRoles
          .filter(role => role.user_id === user.id)
          .map(role => role.role_mst.role_key)
      }))

      setUsers(usersWithRoles)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching users:', error)
      setLoading(false)
    }
  }

  const assignRole = async (userId: string, roleKey: string) => {
    try {
      // 該当のロールIDを取得
      const { data: roleData } = await supabase
        .from('role_mst')
        .select('role_id')
        .eq('role_key', roleKey)
        .single()

      if (!roleData) throw new Error('Role not found')

      // ロールが既に割り当てられているか確認
      const { data: existingRole } = await supabase
        .from('user_role_tbl')
        .select('*')
        .eq('user_id', userId)
        .eq('role_id', roleData.role_id)
        .single()

      if (existingRole) {
        alert('このロールは既に割り当てられています')
        return
      }

      // ロールを割り当て
      const { error } = await supabase
        .from('user_role_tbl')
        .insert({
          user_id: userId,
          role_id: roleData.role_id,
          assigned_at: new Date().toISOString(),
          assigned_by: (await supabase.auth.getUser()).data.user?.id,
        })

      if (error) throw error

      // ユーザー一覧を更新
      await fetchUsers()
    } catch (error) {
      console.error('Error assigning role:', error)
      alert('ロールの割り当てに失敗しました')
    }
  }

  if (loading) {
    return <div>読み込み中...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">ロール管理</h1>
      <div className="overflow-x-auto rounded-lg border bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                メールアドレス
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                現在のロール
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                ロールの割り当て
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm text-gray-900">{user.email}</div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex gap-2">
                    {user.roles.map((role) => (
                      <span
                        key={role}
                        className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex gap-2">
                    {['HOST', 'PHOTOGRAPHER', 'SYSTEM_ADMIN'].map((role) => (
                      <button
                        key={role}
                        onClick={() => assignRole(user.id, role)}
                        disabled={user.roles.includes(role)}
                        className={`rounded px-3 py-1 text-sm font-medium ${
                          user.roles.includes(role)
                            ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                            : 'bg-milab-500 text-white hover:bg-milab-600'
                        }`}
                      >
                        {role}を付与
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 