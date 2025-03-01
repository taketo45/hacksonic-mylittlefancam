'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// ダッシュボードカードコンポーネント
function DashboardCard({
  title,
  description,
  icon,
  href,
  color = 'blue',
}: {
  title: string
  description: string
  icon: React.ReactNode
  href: string
  color?: 'blue' | 'green' | 'purple' | 'orange'
}) {
  // カラーバリエーション
  const colorVariants = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  }

  return (
    <Link
      href={href}
      className="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
    >
      <div className="flex items-center space-x-4">
        <div className={`rounded-full p-3 ${colorVariants[color]}`}>{icon}</div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </Link>
  )
}

export default function DashboardPage() {
  const [userName, setUserName] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<'organizer' | 'user'>('organizer')
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUserName(user.email)
        
        // ローカルストレージからユーザーロールを取得
        const storedRole = localStorage.getItem('userRole') as 'organizer' | 'user' | null
        const role = storedRole || 'organizer'
        setUserRole(role)
        
        // ロールに応じたデフォルトページにリダイレクト
        if (role === 'organizer') {
          // 主催者・撮影者の場合はイベント管理ページへ
          router.prefetch('/dashboard/events')
        } else {
          // 一般ユーザーの場合は写真一覧ページへ
          router.prefetch('/dashboard/photos')
        }
      }
      
      setIsLoading(false)
    }
    
    fetchUserData()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-milab-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="mt-1 text-gray-600">
          こんにちは、{userName || 'ゲスト'}さん。SmileShareへようこそ！
        </p>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-800">クイックアクセス</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {userRole === 'organizer' ? (
            // 主催者向けカード
            <>
              <DashboardCard
                title="イベント管理"
                description="イベントの作成・編集・管理を行います"
                href="/dashboard/events"
                color="blue"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                }
              />
              <DashboardCard
                title="写真アップロード"
                description="イベントの写真をアップロードします"
                href="/dashboard/upload"
                color="green"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                }
              />
              <DashboardCard
                title="バッチ処理"
                description="各種バッチ処理の実行と状態確認"
                href="/dashboard/batch"
                color="purple"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                }
              />
              <DashboardCard
                title="印刷ステータス"
                description="印刷注文の状況を確認します"
                href="/dashboard/print"
                color="orange"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                    />
                  </svg>
                }
              />
            </>
          ) : (
            // 一般ユーザー向けカード
            <>
              <DashboardCard
                title="写真一覧"
                description="イベントの写真を閲覧します"
                href="/dashboard/photos"
                color="blue"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                }
              />
              <DashboardCard
                title="写真編集"
                description="写真にフレームを追加したり、SNS用に顔をマスキングしたりできます"
                href="/dashboard/edit"
                color="green"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                }
              />
              <DashboardCard
                title="推しワイプ編集"
                description="あなたの写真に推しの写真をワイプとして追加できます"
                href="/dashboard/oshi-wipe"
                color="purple"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                    />
                  </svg>
                }
              />
              <DashboardCard
                title="カート"
                description="選択した写真を購入します"
                href="/dashboard/cart"
                color="orange"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                }
              />
              <DashboardCard
                title="購入履歴"
                description="過去の購入履歴を確認します"
                href="/dashboard/purchases"
                color="blue"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                }
              />
            </>
          )}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-800">最近のアクティビティ</h2>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-center text-gray-500 py-8">
            まだアクティビティはありません
          </p>
        </div>
      </div>
    </div>
  )
} 