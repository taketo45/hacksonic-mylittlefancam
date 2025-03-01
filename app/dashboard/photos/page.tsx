'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

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
  smileScore?: number // 笑顔度（0-100）
  detectedFaces?: {
    id: string;
    boundingBox: {
      left: number;
      top: number;
      width: number;
      height: number;
    };
    matchedUser?: {
      id: string;
      name: string;
    };
    smileScore?: number;
  }[];
}

export default function PhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)
  const [events, setEvents] = useState<{ id: string; name: string }[]>([])
  const [cartItems, setCartItems] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState('all')
  const [minSmileScore, setMinSmileScore] = useState(0)
  const [user, setUser] = useState<any>(null)

  // 写真とイベントの取得
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const supabase = createClient()
        
        // ユーザー情報を取得
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        
        // イベントの取得（ハッカソンデモ用のモックデータ）
        const mockEvents = [
          { id: 'event-1', name: '保育園夏祭り 2023' },
          { id: 'event-2', name: '運動会 2023' },
          { id: 'event-3', name: 'クリスマス会 2023' },
        ]
        setEvents(mockEvents)
        
        // 写真の取得（ハッカソンデモ用のモックデータ）
        const mockPhotos: Photo[] = Array.from({ length: 20 }, (_, i) => {
          // 各写真に1〜4人の顔を検出
          const faceCount = Math.floor(Math.random() * 4) + 1
          const detectedFaces = Array.from({ length: faceCount }, (_, j) => {
            // ランダムな位置とサイズの顔を生成
            const left = 0.1 + Math.random() * 0.7
            const top = 0.1 + Math.random() * 0.7
            const width = 0.1 + Math.random() * 0.2
            const height = width * (1 + Math.random() * 0.2)
            const smileScore = Math.floor(Math.random() * 100)
            
            // 30%の確率でユーザー自身の顔とマッチング
            const isUserFace = Math.random() > 0.7
            
            return {
              id: `face-${i}-${j}`,
              boundingBox: {
                left,
                top,
                width,
                height
              },
              matchedUser: isUserFace ? {
                id: 'user-1',
                name: 'あなた'
              } : undefined,
              smileScore
            }
          })
          
          // 写真全体の笑顔度は検出された顔の笑顔度の平均
          const avgSmileScore = detectedFaces.reduce((sum, face) => sum + (face.smileScore || 0), 0) / detectedFaces.length
          
          return {
            id: `photo-${i + 1}`,
            url: `https://picsum.photos/800/600?random=${i + 1}`,
            thumbnailUrl: `https://picsum.photos/400/300?random=${i + 1}`,
            title: `写真 ${i + 1}`,
            eventName: mockEvents[Math.floor(i / 7)].name,
            takenAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            hasUserFace: detectedFaces.some(face => face.matchedUser?.name === 'あなた'),
            price: 500,
            isPurchased: Math.random() > 0.8,
            smileScore: Math.round(avgSmileScore),
            detectedFaces
          }
        })
        
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
  const filteredByEvent = selectedEvent
    ? photos.filter((photo) => photo.eventName === events.find((e) => e.id === selectedEvent)?.name)
    : photos

  // 笑顔度でフィルタリング
  const filteredBySmile = filteredByEvent.filter(photo => 
    (photo.smileScore || 0) >= minSmileScore
  )
  
  // タブに応じたフィルタリング
  const getFilteredPhotos = () => {
    switch (activeTab) {
      case 'user':
        return filteredBySmile.filter(photo => photo.hasUserFace)
      case 'smile':
        return [...filteredBySmile].sort((a, b) => (b.smileScore || 0) - (a.smileScore || 0))
      case 'all':
      default:
        return filteredBySmile
    }
  }
  
  const filteredPhotos = getFilteredPhotos()

  // 笑顔度に応じた色を返す
  const getSmileColor = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-green-400'
    if (score >= 40) return 'bg-yellow-400'
    if (score >= 20) return 'bg-orange-400'
    return 'bg-red-400'
  }

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
          イベントで撮影された写真を閲覧できます。顔認識技術により、あなたが写っている写真や笑顔度の高い写真を簡単に見つけられます。
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

      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
            <TabsList>
              <TabsTrigger value="all">すべての写真</TabsTrigger>
              <TabsTrigger value="user">あなたが写っている写真</TabsTrigger>
              <TabsTrigger value="smile">笑顔度順</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">最低笑顔度:</span>
            <Slider
              value={[minSmileScore]}
              onValueChange={(values) => setMinSmileScore(values[0])}
              max={100}
              step={10}
              className="w-40"
            />
            <span className="min-w-[2rem] text-sm text-gray-700">{minSmileScore}%</span>
          </div>
        </div>
      </div>

      {filteredPhotos.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-gray-500">条件に一致する写真がありません</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow transition-all hover:shadow-md"
            >
              <div className="relative">
                <Image
                  src={photo.thumbnailUrl}
                  alt={photo.title}
                  width={400}
                  height={300}
                  className="h-48 w-full object-cover"
                />
                
                {/* 顔の位置を示すオーバーレイ */}
                {photo.detectedFaces?.map((face, index) => (
                  <div
                    key={face.id}
                    className={`absolute border-2 ${face.matchedUser ? 'border-green-500' : 'border-white'} pointer-events-none`}
                    style={{
                      left: `${face.boundingBox.left * 100}%`,
                      top: `${face.boundingBox.top * 100}%`,
                      width: `${face.boundingBox.width * 100}%`,
                      height: `${face.boundingBox.height * 100}%`,
                    }}
                  >
                    {face.matchedUser && (
                      <div className="absolute -top-6 left-0 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded whitespace-nowrap">
                        {face.matchedUser.name}
                      </div>
                    )}
                  </div>
                ))}
                
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {photo.hasUserFace && (
                    <Badge variant="secondary" className="bg-milab-500 text-white hover:bg-milab-600">
                      あなたが写っています
                    </Badge>
                  )}
                  
                  {photo.smileScore !== undefined && (
                    <Badge variant="secondary" className={`${getSmileColor(photo.smileScore)} text-white`}>
                      笑顔度: {photo.smileScore}%
                    </Badge>
                  )}
                </div>
                
                {photo.isPurchased && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="bg-green-500 text-white hover:bg-green-600">
                      購入済み
                    </Badge>
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
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeFromCart(photo.id)}
                      className="h-7 px-3 text-xs"
                    >
                      カートから削除
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => addToCart(photo.id)}
                      className="h-7 px-3 text-xs"
                    >
                      カートに追加
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 