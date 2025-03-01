'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function NewEventPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    status: 'active' as 'active' | 'completed' | 'cancelled',
  })

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
      
      // ユーザー情報を取得
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('ユーザー情報が取得できませんでした')
      }
      
      // イベントデータを作成
      const { data, error: insertError } = await supabase
        .from('events')
        .insert([
          {
            title: formData.title,
            description: formData.description,
            date: formData.date,
            location: formData.location,
            status: formData.status,
            organizer_id: user.id,
          },
        ])
        .select()
      
      if (insertError) {
        throw insertError
      }
      
      // 成功したらイベント一覧ページにリダイレクト
      router.push('/dashboard/events')
      router.refresh()
    } catch (err) {
      console.error('イベント作成エラー:', err)
      setError(err instanceof Error ? err.message : 'イベントの作成中にエラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">新規イベント作成</h1>
        <p className="mt-1 text-gray-600">
          新しいイベントの詳細を入力してください。
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-800">
          <p>{error}</p>
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-6">
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

          <div className="flex justify-end space-x-3">
            <Link
              href="/dashboard/events"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-milab-500 focus:ring-offset-2"
            >
              キャンセル
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-milab-600 px-4 py-2 text-sm font-medium text-white hover:bg-milab-700 focus:outline-none focus:ring-2 focus:ring-milab-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? '作成中...' : 'イベントを作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 