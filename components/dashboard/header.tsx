'use client'

import { useAtom } from 'jotai'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import LogoutButton from '@/components/logout-button'
import { User } from '@supabase/supabase-js'
import { userRoleAtom, getDefaultPageForRole } from '@/lib/atoms/userRole'

interface DashboardHeaderProps {
  user: User | null
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const [activeRole, setActiveRole] = useAtom(userRoleAtom)
  const router = useRouter()

  const handleRoleChange = (role: 'organizer' | 'user') => {
    // すでに選択されているロールの場合は何もしない
    if (role === activeRole) return

    // 状態を更新（Jotaiのatomが自動的にローカルストレージに保存する）
    setActiveRole(role)
    
    // ロールに応じたデフォルトページにリダイレクト
    const targetPath = getDefaultPageForRole(role)
    
    // ページ遷移（リロードではなく、クライアントサイドナビゲーション）
    router.push(targetPath)
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