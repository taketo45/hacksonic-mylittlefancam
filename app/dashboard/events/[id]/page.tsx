'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { PostgrestResponse } from '@supabase/supabase-js'

// イベントの型定義
interface Event {
  id: string
  title: string
  description: string
  date: string
  location: string
  created_at: string
  status: 'active' | 'completed' | 'cancelled'
  organizer_id: string
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
  const [formData, setFormData] = useState<Omit<Event, 'id' | 'created_at' | 'organizer_id'>>({
    title: '',
    description: '',
    date: '',
    location: '',
    status: 'active',
  })

  // イベントデータを取得
  useEffect(() => {
    const fetchEvent = async () => {
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
        
        // イベントデータを取得
        const response = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .single()
        
        // 型ガードを追加して安全にアクセス
        if ('error' in response && response.error) {
          throw response.error
        }
        
        // 型ガードを追加して安全にアクセス
        if (!('data' in response) || !response.data) {
          throw new Error('イベントが見つかりませんでした')
        }
        
        // 自分が作成したイベントかチェック
        if (response.data.organizer_id !== user.id) {
          throw new Error('このイベントを閲覧する権限がありません')
        }
        
        setEvent(response.data)
        setFormData({
          title: response.data.title,
          description: response.data.description || '',
          date: response.data.date,
          location: response.data.location,
          status: response.data.status,
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
      if (!formData.title.trim()) {
        throw new Error('イベント名は必須です')
      }
      if (!formData.date) {
        throw new Error('開催日は必須です')
      }
      if (!formData.location.trim()) {
        throw new Error('開催場所は必須です')
      }

      const supabase = createClient()
      
      // イベントデータを更新
      const response = await supabase
        .from('events')
        .update({
          title: formData.title,
          description: formData.description,
          date: formData.date,
          location: formData.location,
          status: formData.status,
        })
        .eq('id', id)
        .select()
      
      // 型ガードを追加して安全にアクセス
      if ('error' in response && response.error) {
        throw response.error
      }
      
      // 型ガードを追加して安全にアクセス
      if ('data' in response && response.data && response.data[0]) {
        setEvent(response.data[0])
      }
      
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
      const supabase = createClient()
      
      // イベントデータを削除
      const response = await supabase
        .from('events')
        .delete()
        .eq('id', id)
      
      // 型ガードを追加して安全にアクセス
      if ('error' in response && response.error) {
        throw response.error
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
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-800">
          <p>{error}</p>
        </div>
        <div className="mt-4">
          <Link
            href="/dashboard/events"
            className="text-milab-600 hover:text-milab-900"
          >
            イベント一覧に戻る
          </Link>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
          <p className="text-gray-500">イベントが見つかりませんでした</p>
        </div>
        <div className="mt-4">
          <Link
            href="/dashboard/events"
            className="text-milab-600 hover:text-milab-900"
          >
            イベント一覧に戻る
          </Link>
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
          // 編集フォーム
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="title" className="mb-2 block text-sm font-medium text-gray-700">
                イベント名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-milab-500 focus:ring-milab-500 sm:text-sm"
                placeholder="例: 保育園夏祭り"
                required
              />
            </div>

            <div className="mb-6">
              <label htmlFor="description" className="mb-2 block text-sm font-medium text-gray-700">
                イベント説明
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-milab-500 focus:ring-milab-500 sm:text-sm"
                placeholder="イベントの詳細説明を入力してください"
              />
            </div>

            <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="date" className="mb-2 block text-sm font-medium text-gray-700">
                  開催日 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-milab-500 focus:ring-milab-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="location" className="mb-2 block text-sm font-medium text-gray-700">
                  開催場所 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-milab-500 focus:ring-milab-500 sm:text-sm"
                  placeholder="例: ○○保育園"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="status" className="mb-2 block text-sm font-medium text-gray-700">
                ステータス
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-milab-500 focus:ring-milab-500 sm:text-sm"
              >
                <option value="active">開催中</option>
                <option value="completed">終了</option>
                <option value="cancelled">中止</option>
              </select>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
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
          // 詳細表示
          <div>
            <div className="mb-6 border-b border-gray-200 pb-4">
              <h2 className="text-xl font-semibold text-gray-900">{event.title}</h2>
              <p className="mt-2 text-gray-600">{event.description || '説明はありません'}</p>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium text-gray-500">開催日</h3>
                <p className="mt-1 text-gray-900">{formatDate(event.date)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">開催場所</h3>
                <p className="mt-1 text-gray-900">{event.location}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">ステータス</h3>
                <p className="mt-1">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      event.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : event.status === 'completed'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {event.status === 'active'
                      ? '開催中'
                      : event.status === 'completed'
                      ? '終了'
                      : '中止'}
                  </span>
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">作成日</h3>
                <p className="mt-1 text-gray-900">{formatDate(event.created_at)}</p>
              </div>
            </div>

            <div className="mt-8 border-t border-gray-200 pt-6">
              <h3 className="mb-4 text-lg font-medium text-gray-900">イベント管理</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Link
                  href={`/dashboard/events/${event.id}/share`}
                  className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-milab-500 focus:ring-offset-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2 h-5 w-5 text-gray-500"
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
                <Link
                  href={`/dashboard/events/${event.id}/photos`}
                  className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-milab-500 focus:ring-offset-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2 h-5 w-5 text-gray-500"
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
                  イベント写真を管理
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 