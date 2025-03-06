'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/database.types'

type UserDetails = {
  userId?: string
  hostId?: string
  photographerId?: string
  name?: string
  email?: string
  accountStatus?: string
  roles: string[]
}

export function useUserDetails(userId: string | undefined) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!userId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // 1. ロール情報を取得
        const { data: roleData, error: roleError } = await supabase
          .from('user_role_tbl')
          .select(`
            role_mst!inner (
              role_key,
              role_name
            )
          `)
          .eq('user_id', userId)

        if (roleError) throw roleError

        // 2. ユーザー基本情報を取得
        const { data: userData, error: userError } = await supabase
          .from('user_tbl')
          .select('*')
          .eq('auth_user_id', userId)
          .single()

        if (userError && userError.code !== 'PGRST116') throw userError

        // 3. 主催者情報を取得（存在する場合）
        const { data: hostData, error: hostError } = await supabase
          .from('host_tbl')
          .select('*')
          .eq('auth_user_id', userId)
          .single()

        if (hostError && hostError.code !== 'PGRST116') throw hostError

        // 4. 撮影者情報を取得（存在する場合）
        const { data: photographerData, error: photographerError } = await supabase
          .from('photographer_tbl')
          .select('*')
          .eq('auth_user_id', userId)
          .single()

        if (photographerError && photographerError.code !== 'PGRST116') throw photographerError

        // 5. 情報を統合
        setUserDetails({
          userId: userData?.userId,
          hostId: hostData?.hostId,
          photographerId: photographerData?.photographerId,
          name: userData?.name || hostData?.name || photographerData?.name,
          email: userData?.email || hostData?.email || photographerData?.email,
          accountStatus: userData?.accountStatus || hostData?.accountStatus || photographerData?.accountStatus,
          roles: roleData?.map(role => role.role_mst.role_key) || [],
        })

      } catch (error: any) {
        console.error('Error fetching user details:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUserDetails()
  }, [userId, supabase])

  return { userDetails, loading, error }
} 