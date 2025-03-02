import Link from 'next/link'
import { db } from '@/src/db'
import { eventQueries } from '@/src/db/queries'
import { createClient } from '@/lib/supabase/client'

// イベントの型定義
interface Event {
  eventId: string
  eventName: string
  eventStatus: '準備中' | '公開中' | '終了' | 'キャンセル'
  createdAt: Date
  updatedAt: Date
}

interface HostEvent {
  id: number
  hostId: string
  eventId: string
  eventRole: string | null
  createdAt: Date | null
  updatedAt: Date | null
  event: Event
}

// サーバーコンポーネントに変更
export default async function EventsPage() {
  const supabase = createClient()
  
  // ユーザー情報を取得
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">イベント一覧</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          ユーザー情報が取得できませんでした。ログインしてください。
        </div>
        <Link href="/login" className="text-blue-500 hover:underline">
          ログインページへ
        </Link>
      </div>
    )
  }
  
  // Drizzleを使用してイベントを取得
  let events: HostEvent[] = []
  let error: string | null = null
  
  try {
    events = await eventQueries.getEventsByHostId(user.id)
  } catch (err) {
    console.error('イベント一覧取得エラー:', err)
    error = `イベントの取得中にエラーが発生しました: ${err instanceof Error ? err.message : String(err)}`
  }

  // イベントの状態に応じたラベルとスタイルを取得する関数
  const getStatusLabel = (status: string) => {
    switch (status) {
      case '準備中':
        return { label: '準備中', className: 'bg-yellow-100 text-yellow-800' }
      case '公開中':
        return { label: '公開中', className: 'bg-green-100 text-green-800' }
      case '終了':
        return { label: '終了', className: 'bg-gray-100 text-gray-800' }
      case 'キャンセル':
        return { label: 'キャンセル', className: 'bg-red-100 text-red-800' }
      default:
        return { label: status, className: 'bg-gray-100 text-gray-800' }
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">イベント一覧</h1>
        <Link
          href="/dashboard/events/new"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          新規イベント作成
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {events.length === 0 && !error ? (
        <div className="bg-gray-100 p-6 rounded text-center">
          <p className="text-gray-600 mb-4">イベントがまだ登録されていません</p>
          <Link
            href="/dashboard/events/new"
            className="text-blue-500 hover:underline"
          >
            最初のイベントを作成する
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  イベント名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  作成日
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  アクション
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {events.map((hostEvent) => {
                const event = hostEvent.event
                const { label, className } = getStatusLabel(event.eventStatus)
                
                return (
                  <tr key={event.eventId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {event.eventName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${className}`}>
                        {label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(event.createdAt).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/dashboard/events/${event.eventId}`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        詳細
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
} 