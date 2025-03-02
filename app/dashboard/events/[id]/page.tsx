'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

// イベントの型定義
interface Event {
  eventId: string
  eventName: string
  eventStatus: '準備中' | '公開中' | '終了' | 'キャンセル'
  createdAt: Date
  updatedAt: Date
  hostEvents: {
    hostId: string
    eventId: string
    eventRole?: string
  }[]
  eventSlots?: {
    eventSlotId: string
    eventId: string
    eventSlotName: string
    eventDate?: string
    eventTime?: string
    facilityId?: string
    geoCode?: string
    eventSlotDetail?: string
    eventSlotStatus?: '準備中' | '公開中' | '終了' | 'キャンセル'
    ticketUrl?: string
    createdAt: Date
    updatedAt: Date
  }[]
}

// 動的レンダリングに設定
export const dynamic = 'force-dynamic'

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { id } = params
  
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<{
    eventName: string
    eventStatus: '準備中' | '公開中' | '終了' | 'キャンセル'
  }>({
    eventName: '',
    eventStatus: '準備中',
  })

  // イベントデータを取得
  useEffect(() => {
    const fetchEvent = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        // APIを経由してイベントデータを取得
        const response = await fetch(`/api/events/${id}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('イベントが見つかりませんでした')
          } else if (response.status === 403) {
            throw new Error('このイベントを閲覧する権限がありません')
          } else {
            throw new Error(`イベント取得エラー: ${response.status}`)
          }
        }
        
        const eventData = await response.json()
        
        setEvent(eventData)
        setFormData({
          eventName: eventData.eventName,
          eventStatus: eventData.eventStatus,
        })
      } catch (err) {
        console.error('イベント取得エラー:', err)
        setError(err instanceof Error ? err.message : 'イベントの取得中にエラーが発生しました')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchEvent()
  }, [id])

  // フォーム入力の変更を処理
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // フォーム送信を処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // バリデーション
      if (!formData.eventName.trim()) {
        throw new Error('イベント名は必須です')
      }

      // APIを経由してイベントデータを更新
      const response = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventName: formData.eventName,
          eventStatus: formData.eventStatus,
        }),
      })
      
      if (!response.ok) {
        throw new Error(`イベント更新エラー: ${response.status}`)
      }
      
      const updatedEvent = await response.json()
      setEvent(updatedEvent)
      
      // 編集モードを終了
      setIsEditing(false)
    } catch (err) {
      console.error('イベント更新エラー:', err)
      setError(err instanceof Error ? err.message : 'イベントの更新中にエラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  // イベント削除を処理
  const handleDelete = async () => {
    if (!confirm('このイベントを削除してもよろしいですか？この操作は元に戻せません。')) {
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      // APIを経由してイベントデータを削除（論理削除）
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error(`イベント削除エラー: ${response.status}`)
      }
      
      // 成功したらイベント一覧ページにリダイレクト
      router.push('/dashboard/events')
      router.refresh()
    } catch (err) {
      console.error('イベント削除エラー:', err)
      setError(err instanceof Error ? err.message : 'イベントの削除中にエラーが発生しました')
      setIsSubmitting(false)
    }
  }

  // 日付をフォーマットする
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ja-JP', {
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
          <div className="mt-4">
            <Link
              href="/dashboard/events"
              className="text-red-600 hover:text-red-800 font-medium"
            >
              イベント一覧に戻る
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="p-6">
        <div className="rounded-lg bg-yellow-50 p-4 text-yellow-800">
          <p>イベントが見つかりませんでした。</p>
          <div className="mt-4">
            <Link
              href="/dashboard/events"
              className="text-yellow-600 hover:text-yellow-800 font-medium"
            >
              イベント一覧に戻る
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'イベント編集' : 'イベント詳細'}
        </h1>
        <div className="flex space-x-3">
          <Link
            href="/dashboard/events"
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-milab-500 focus:ring-offset-2"
          >
            一覧に戻る
          </Link>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="rounded-md bg-milab-600 px-4 py-2 text-sm font-medium text-white hover:bg-milab-700 focus:outline-none focus:ring-2 focus:ring-milab-500 focus:ring-offset-2"
            >
              編集
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-800">
          <p>{error}</p>
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="eventName" className="mb-2 block text-sm font-medium text-gray-700">
                イベント名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="eventName"
                name="eventName"
                value={formData.eventName}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-milab-500 focus:ring-milab-500 sm:text-sm"
                required
              />
            </div>

            <div className="mb-6">
              <label htmlFor="eventStatus" className="mb-2 block text-sm font-medium text-gray-700">
                ステータス
              </label>
              <select
                id="eventStatus"
                name="eventStatus"
                value={formData.eventStatus}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-milab-500 focus:ring-milab-500 sm:text-sm"
              >
                <option value="準備中">準備中</option>
                <option value="公開中">公開中</option>
                <option value="終了">終了</option>
                <option value="キャンセル">キャンセル</option>
              </select>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 shadow-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
              >
                削除
              </button>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={isSubmitting}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-milab-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-md bg-milab-600 px-4 py-2 text-sm font-medium text-white hover:bg-milab-700 focus:outline-none focus:ring-2 focus:ring-milab-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {isSubmitting ? '保存中...' : '保存'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900">イベント情報</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">イベント名</p>
                  <p className="mt-1 text-sm text-gray-900">{event.eventName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">作成日</p>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(event.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">ステータス</p>
                  <p className="mt-1 text-sm text-gray-900">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        event.eventStatus === '公開中'
                          ? 'bg-green-100 text-green-800'
                          : event.eventStatus === '終了'
                          ? 'bg-gray-100 text-gray-800'
                          : event.eventStatus === 'キャンセル'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {event.eventStatus}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900">イベント管理</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Link
                    href={`/dashboard/events/${event.eventId}/share`}
                    className="flex items-center text-milab-600 hover:text-milab-900"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                      />
                    </svg>
                    招待リンクを共有
                  </Link>
                </div>
                <div>
                  <Link
                    href={`/dashboard/events/${event.eventId}/photos`}
                    className="flex items-center text-milab-600 hover:text-milab-900"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 h-5 w-5"
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
                    写真管理
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 