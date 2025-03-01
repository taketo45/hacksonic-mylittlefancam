'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

// 写真の型定義
interface Photo {
  id: string
  url: string
  thumbnailUrl: string
  title: string
  eventName: string
  takenAt: string
  hasUserFace: boolean
  price: number
  isPurchased: boolean
}

export default function PhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)
  const [events, setEvents] = useState<{ id: string; name: string }[]>([])
  const [cartItems, setCartItems] = useState<string[]>([])

  // 写真とイベントの取得
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const supabase = createClient()
        
        // イベントの取得（ハッカソンデモ用のモックデータ）
        const mockEvents = [
          { id: 'event-1', name: '保育園夏祭り 2023' },
          { id: 'event-2', name: '運動会 2023' },
          { id: 'event-3', name: 'クリスマス会 2023' },
        ]
        setEvents(mockEvents)
        
        // 写真の取得（ハッカソンデモ用のモックデータ）
        const mockPhotos: Photo[] = Array.from({ length: 20 }, (_, i) => ({
          id: `photo-${i + 1}`,
          url: `https://source.unsplash.com/random/800x600?sig=${i + 1}`,
          thumbnailUrl: `https://source.unsplash.com/random/400x300?sig=${i + 1}`,
          title: `写真 ${i + 1}`,
          eventName: mockEvents[Math.floor(i / 7)].name,
          takenAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          hasUserFace: Math.random() > 0.3,
          price: 500,
          isPurchased: Math.random() > 0.8,
        }))
        
        setPhotos(mockPhotos)
      } catch (err) {
        console.error('データ取得エラー:', err)
        setError('データの取得中にエラーが発生しました')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // カートに追加
  const addToCart = (photoId: string) => {
    setCartItems((prev) => [...prev, photoId])
  }

  // カートから削除
  const removeFromCart = (photoId: string) => {
    setCartItems((prev) => prev.filter((id) => id !== photoId))
  }

  // 日付をフォーマットする
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP')
  }

  // イベントでフィルタリングされた写真
  const filteredPhotos = selectedEvent
    ? photos.filter((photo) => photo.eventName === events.find((e) => e.id === selectedEvent)?.name)
    : photos

  // 自分が写っている写真
  const photosWithUserFace = filteredPhotos.filter((photo) => photo.hasUserFace)

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-milab-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">写真を読み込み中...</p>
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">写真一覧</h1>
        <p className="mt-1 text-gray-600">
          イベントで撮影された写真を閲覧できます。あなたが写っている写真には「あなたが写っています」のラベルが表示されます。
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div>
          <label htmlFor="event-filter" className="mr-2 text-sm font-medium text-gray-700">
            イベント:
          </label>
          <select
            id="event-filter"
            value={selectedEvent || ''}
            onChange={(e) => setSelectedEvent(e.target.value || null)}
            className="rounded-md border-gray-300 shadow-sm focus:border-milab-500 focus:ring-milab-500 sm:text-sm"
          >
            <option value="">すべてのイベント</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
        </div>

        <div className="ml-auto">
          {cartItems.length > 0 && (
            <Link
              href="/dashboard/cart"
              className="flex items-center rounded-md bg-milab-600 px-4 py-2 text-sm font-medium text-white hover:bg-milab-700 focus:outline-none focus:ring-2 focus:ring-milab-500 focus:ring-offset-2"
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
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              カートを見る ({cartItems.length})
            </Link>
          )}
        </div>
      </div>

      {photosWithUserFace.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">あなたが写っている写真</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {photosWithUserFace.map((photo) => (
              <div
                key={photo.id}
                className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow transition-all hover:shadow-md"
              >
                <div className="relative">
                  <img
                    src={photo.thumbnailUrl}
                    alt={photo.title}
                    className="h-48 w-full object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="rounded-full bg-milab-500 px-2 py-1 text-xs font-semibold text-white">
                      あなたが写っています
                    </span>
                  </div>
                  {photo.isPurchased && (
                    <div className="absolute top-2 right-2">
                      <span className="rounded-full bg-green-500 px-2 py-1 text-xs font-semibold text-white">
                        購入済み
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900">{photo.title}</h3>
                  <p className="mt-1 text-xs text-gray-500">{photo.eventName}</p>
                  <p className="mt-1 text-xs text-gray-500">撮影日: {formatDate(photo.takenAt)}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">¥{photo.price}</span>
                    {photo.isPurchased ? (
                      <Link
                        href={`/dashboard/photos/${photo.id}`}
                        className="rounded-md bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800 hover:bg-gray-200"
                      >
                        詳細を見る
                      </Link>
                    ) : cartItems.includes(photo.id) ? (
                      <button
                        onClick={() => removeFromCart(photo.id)}
                        className="rounded-md bg-red-100 px-3 py-1 text-xs font-medium text-red-800 hover:bg-red-200"
                      >
                        カートから削除
                      </button>
                    ) : (
                      <button
                        onClick={() => addToCart(photo.id)}
                        className="rounded-md bg-milab-100 px-3 py-1 text-xs font-medium text-milab-800 hover:bg-milab-200"
                      >
                        カートに追加
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-800">すべての写真</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow transition-all hover:shadow-md"
            >
              <div className="relative">
                <img
                  src={photo.thumbnailUrl}
                  alt={photo.title}
                  className="h-48 w-full object-cover"
                />
                {photo.hasUserFace && (
                  <div className="absolute top-2 left-2">
                    <span className="rounded-full bg-milab-500 px-2 py-1 text-xs font-semibold text-white">
                      あなたが写っています
                    </span>
                  </div>
                )}
                {photo.isPurchased && (
                  <div className="absolute top-2 right-2">
                    <span className="rounded-full bg-green-500 px-2 py-1 text-xs font-semibold text-white">
                      購入済み
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-900">{photo.title}</h3>
                <p className="mt-1 text-xs text-gray-500">{photo.eventName}</p>
                <p className="mt-1 text-xs text-gray-500">撮影日: {formatDate(photo.takenAt)}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">¥{photo.price}</span>
                  {photo.isPurchased ? (
                    <Link
                      href={`/dashboard/photos/${photo.id}`}
                      className="rounded-md bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800 hover:bg-gray-200"
                    >
                      詳細を見る
                    </Link>
                  ) : cartItems.includes(photo.id) ? (
                    <button
                      onClick={() => removeFromCart(photo.id)}
                      className="rounded-md bg-red-100 px-3 py-1 text-xs font-medium text-red-800 hover:bg-red-200"
                    >
                      カートから削除
                    </button>
                  ) : (
                    <button
                      onClick={() => addToCart(photo.id)}
                      className="rounded-md bg-milab-100 px-3 py-1 text-xs font-medium text-milab-800 hover:bg-milab-200"
                    >
                      カートに追加
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 