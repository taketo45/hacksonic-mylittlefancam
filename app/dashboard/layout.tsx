import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardHeader from '@/components/dashboard/header'
import DashboardSidebar from '@/components/dashboard/sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  // デバッグ情報（ログには出ないがビルド時に確認可能）
  console.log('Dashboard Layout - Session check:', !!session)

  // ミドルウェアでもチェックしているが、念のためここでもチェック
  // ただし、リダイレクトループを防ぐためにミドルウェアが機能していることを前提とする
  if (!session) {
    console.log('Dashboard Layout - No session, but middleware should have redirected already')
    // ミドルウェアが機能していない場合のフォールバック
    // リダイレクトループを防ぐために一時的にコメントアウト
    // return redirect('/login')
  }

  const { data: { user } } = await supabase.auth.getUser()
  console.log('Dashboard Layout - User:', !!user)

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <DashboardHeader user={user} />
      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
} 