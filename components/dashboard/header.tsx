'use client'

import Link from 'next/link'
import Image from 'next/image'
import LogoutButton from '@/components/logout-button'
import { User } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import { useAtom } from 'jotai'
import { userRoleAtom } from '@/lib/store/role'

type DashboardHeaderProps = {
  isAdmin: boolean
}

export default function DashboardHeader({ isAdmin }: DashboardHeaderProps) {
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClientComponentClient()
  const [activeRole, setActiveRole] = useAtom(userRoleAtom)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleRoleChange = (role: 'organizer' | 'user') => {
    setActiveRole(role)
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-white shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image
              src="/img/mylittlefancam.svg"
              width={32}
              height={32}
              alt="Logo"
              className="rounded-full"
            />
            <span className="text-xl font-bold text-gradient">My Little Fancam</span>
          </Link>
          <span className="ml-4 text-sm text-gray-500">ハッカソンデモ</span>
        </div>

        <div className="flex items-center gap-4">
          {/* ロール切り替えボタン */}
          <div className="flex rounded-md border border-gray-200 p-1">
            <button
              onClick={() => handleRoleChange('organizer')}
              className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                activeRole === 'organizer'
                  ? 'bg-milab-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              主催者・撮影者
            </button>
            <button
              onClick={() => handleRoleChange('user')}
              className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                activeRole === 'user'
                  ? 'bg-milab-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              一般ユーザー
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* システム管理者メニューへのリンク */}
            {isAdmin && (
              <Link
                href="/admin"
                className="rounded-md bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                システム管理
              </Link>
            )}
            <div className="text-sm">
              <p className="font-medium text-gray-700">{user?.email}</p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </div>
    </header>
  )
} 