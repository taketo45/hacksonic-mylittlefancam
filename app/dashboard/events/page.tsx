'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

// イベントの型定義
interface Event {
  id: string
  title: string
  description: string
  date: string
  location: string
  created_at: string
  status: 'active' | 'completed' | 'cancelled'
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const supabase = createClient()
        
        // ユーザー情報を取得
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          setError('ユーザー情報が取得できませんでした')
          setIsLoading(false)
          return
        }
        
        // ユーザーが作成したイベントを取得
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('organizer_id', user.id)
          .order('date', { ascending: false })
        
        if (error) {
          throw error
        }
        
        setEvents(data || [])
      } catch (err) {
        console.error('イベント取得エラー:', err)
        setError('イベントの取得中にエラーが発生しました')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchEvents()
  }, [])

  // イベントのステータスに応じたバッジの色を返す
  const getStatusBadgeClass = (status: Event['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  // 日付をフォーマットする
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-milab-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">イベントを読み込み中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg bg-red-50 p-4 text-red-800">
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">イベント管理</h1>
        <Link
          href="/dashboard/events/new"
          className="rounded-md bg-milab-600 px-4 py-2 text-sm font-medium text-white hover:bg-milab-700 focus:outline-none focus:ring-2 focus:ring-milab-500 focus:ring-offset-2"
        >
          新規イベント作成
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
          <p className="text-gray-500">イベントがまだありません。新しいイベントを作成してください。</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  イベント名
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  日付
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  場所
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  ステータス
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">編集</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{event.title}</div>
                    <div className="text-sm text-gray-500">{event.description}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {formatDate(event.date)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {event.location}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusBadgeClass(
                        event.status
                      )}`}
                    >
                      {event.status === 'active'
                        ? '開催中'
                        : event.status === 'completed'
                        ? '終了'
                        : '中止'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <Link
                      href={`/dashboard/events/${event.id}`}
                      className="text-milab-600 hover:text-milab-900"
                    >
                      詳細
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
} 