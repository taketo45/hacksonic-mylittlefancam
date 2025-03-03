'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRouter } from 'next/navigation'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

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
  photographer?: {
    id: string;
    name: string;
  };
  camera?: {
    model: string;
    settings: {
      aperture: string;
      shutterSpeed: string;
      iso: number;
    };
  };
}

export default function PhotoDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [photo, setPhoto] = useState<Photo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isInCart, setIsInCart] = useState(false)
  const [activeTab, setActiveTab] = useState('photo')
  const [showOriginal, setShowOriginal] = useState(false)
  const [showOnlyWithFaces, setShowOnlyWithFaces] = useState(false)

  useEffect(() => {
    const fetchPhoto = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const supabase = createClient()
        
        // 実際の実装ではSupabaseから写真データを取得
        // ハッカソンデモ用のモックデータ
        const mockPhoto: Photo = {
          id: params.id,
          url: `https://picsum.photos/800/600?random=${params.id.split('-')[1] || 1}`,
          thumbnailUrl: `https://picsum.photos/400/300?random=${params.id.split('-')[1] || 1}`,
          title: `写真 ${params.id.split('-')[1] || 1}`,
          eventName: '保育園夏祭り 2023',
          takenAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          hasUserFace: Math.random() > 0.3,
          price: 500,
          isPurchased: Math.random() > 0.7,
          smileScore: Math.floor(Math.random() * 100),
          photographer: {
            id: 'user-photographer-1',
            name: '山田 太郎'
          },
          camera: {
            model: 'Canon EOS R5',
            settings: {
              aperture: 'f/2.8',
              shutterSpeed: '1/125',
              iso: 400
            }
          }
        }
        
        // 顔検出データを生成
        const faceCount = Math.floor(Math.random() * 4) + 1
        const detectedFaces = Array.from({ length: faceCount }, (_, i) => {
          // ランダムな位置とサイズの顔を生成
          const left = 0.1 + Math.random() * 0.7
          const top = 0.1 + Math.random() * 0.7
          const width = 0.1 + Math.random() * 0.2
          const height = width * (1 + Math.random() * 0.2)
          const smileScore = Math.floor(Math.random() * 100)
          
          // 30%の確率でユーザー自身の顔とマッチング
          const isUserFace = i === 0 && mockPhoto.hasUserFace
          
          return {
            id: `face-${params.id}-${i}`,
            boundingBox: {
              left,
              top,
              width,
              height
            },
            matchedUser: isUserFace ? {
              id: 'user-1',
              name: 'あなた'
            } : Math.random() > 0.7 ? {
              id: `user-${i + 2}`,
              name: `ユーザー ${i + 2}`
            } : undefined,
            smileScore
          }
        })
        
        mockPhoto.detectedFaces = detectedFaces
        
        setPhoto(mockPhoto)
        
        // カート情報を取得
        const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]')
        setIsInCart(cartItems.includes(params.id))
      } catch (err) {
        console.error('写真データ取得エラー:', err)
        setError('写真データの取得中にエラーが発生しました')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPhoto()
  }, [params.id])

  // カートに追加
  const addToCart = () => {
    const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]')
    if (!cartItems.includes(params.id)) {
      const updatedCart = [...cartItems, params.id]
      localStorage.setItem('cartItems', JSON.stringify(updatedCart))
      setIsInCart(true)
    }
  }

  // カートから削除
  const removeFromCart = () => {
    const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]')
    const updatedCart = cartItems.filter((id: string) => id !== params.id)
    localStorage.setItem('cartItems', JSON.stringify(updatedCart))
    setIsInCart(false)
  }

  // 日付をフォーマットする
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP')
  }

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

  if (error || !photo) {
    return (
      <div className="p-6">
        <div className="rounded-lg bg-red-50 p-4 text-red-800">
          <p>{error || '写真が見つかりませんでした'}</p>
        </div>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push('/dashboard/photos')}
        >
          写真一覧に戻る
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{photo.title}</h1>
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/photos')}
          >
            写真一覧に戻る
          </Button>
        </div>
        <p className="mt-1 text-gray-600">
          {photo.eventName} - 撮影日: {formatDate(photo.takenAt)}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              <Tabs defaultValue="photo" value={activeTab} onValueChange={setActiveTab}>
                <div className="border-b px-4">
                  <TabsList className="bg-transparent">
                    <TabsTrigger value="photo">写真</TabsTrigger>
                    <TabsTrigger value="faces">検出された顔</TabsTrigger>
                    <TabsTrigger value="info">詳細情報</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="photo" className="p-0 m-0">
                  <div className="relative">
                    <div className="aspect-w-4 aspect-h-3 relative">
                      <Image
                        src={photo.isPurchased || showOriginal ? photo.url : photo.thumbnailUrl}
                        alt={photo.title}
                        width={800}
                        height={600}
                        className={`w-full object-contain ${!photo.isPurchased && !showOriginal ? 'filter blur-sm' : ''}`}
                      />
                      
                      {/* 購入済みでない場合はウォーターマーク表示 */}
                      {!photo.isPurchased && !showOriginal && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-white text-opacity-70 text-2xl font-bold transform rotate-45 select-none">
                            プレビュー
                          </div>
                        </div>
                      )}
                      
                      {/* 顔の位置を示すオーバーレイ */}
                      {photo.detectedFaces?.map((face) => (
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
                              {face.smileScore !== undefined && ` (笑顔度: ${face.smileScore}%)`}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {!photo.isPurchased && (
                      <div className="absolute bottom-4 right-4">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setShowOriginal(!showOriginal)}
                        >
                          {showOriginal ? 'プレビューを表示' : 'オリジナルをプレビュー'}
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="faces" className="p-4 m-0">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">検出された顔: {photo.detectedFaces?.length || 0}人</h3>
                    
                    {photo.detectedFaces && photo.detectedFaces.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {photo.detectedFaces.map((face) => (
                          <Card key={face.id}>
                            <CardContent className="p-4">
                              <div className="flex items-start gap-4">
                                <div className="relative w-20 h-20 overflow-hidden rounded-full border-2 border-gray-200">
                                  <div className="absolute inset-0">
                                    <Image
                                      src={photo.url}
                                      alt="顔"
                                      width={200}
                                      height={200}
                                      className="object-cover"
                                      style={{
                                        clipPath: `inset(${face.boundingBox.top * 100}% ${100 - (face.boundingBox.left + face.boundingBox.width) * 100}% ${100 - (face.boundingBox.top + face.boundingBox.height) * 100}% ${face.boundingBox.left * 100}%)`,
                                        transform: 'scale(5)',
                                        transformOrigin: `${face.boundingBox.left * 100 + face.boundingBox.width * 50}% ${face.boundingBox.top * 100 + face.boundingBox.height * 50}%`
                                      }}
                                    />
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="font-medium">
                                    {face.matchedUser ? face.matchedUser.name : '未特定の人物'}
                                  </h4>
                                  
                                  {face.smileScore !== undefined && (
                                    <div className="mt-2">
                                      <Badge className={`${getSmileColor(face.smileScore)} text-white`}>
                                        笑顔度: {face.smileScore}%
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">顔が検出されませんでした</p>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="info" className="p-4 m-0">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">写真情報</h3>
                      <dl className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">イベント</dt>
                          <dd className="text-sm text-gray-900">{photo.eventName}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">撮影日</dt>
                          <dd className="text-sm text-gray-900">{formatDate(photo.takenAt)}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">撮影者</dt>
                          <dd className="text-sm text-gray-900">{photo.photographer?.name || '不明'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">笑顔度</dt>
                          <dd className="text-sm text-gray-900">
                            {photo.smileScore !== undefined ? (
                              <Badge className={`${getSmileColor(photo.smileScore)} text-white`}>
                                {photo.smileScore}%
                              </Badge>
                            ) : '不明'}
                          </dd>
                        </div>
                      </dl>
                    </div>
                    
                    {photo.camera && (
                      <div>
                        <h3 className="text-lg font-medium">カメラ情報</h3>
                        <dl className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                          <div>
                            <dt className="text-sm font-medium text-gray-500">カメラ</dt>
                            <dd className="text-sm text-gray-900">{photo.camera.model}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">絞り値</dt>
                            <dd className="text-sm text-gray-900">{photo.camera.settings.aperture}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">シャッタースピード</dt>
                            <dd className="text-sm text-gray-900">{photo.camera.settings.shutterSpeed}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">ISO感度</dt>
                            <dd className="text-sm text-gray-900">{photo.camera.settings.iso}</dd>
                          </div>
                        </dl>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>写真の購入</CardTitle>
              <CardDescription>
                この写真を購入して、高解像度の写真をダウンロードできます。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium">価格:</span>
                  <span className="text-xl font-bold">¥{photo.price}</span>
                </div>
                
                <div className="rounded-lg bg-gray-50 p-3">
                  <h4 className="font-medium">含まれるもの:</h4>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li className="flex items-center">
                      <svg className="mr-2 h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      高解像度デジタル写真
                    </li>
                    <li className="flex items-center">
                      <svg className="mr-2 h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      商用利用可能
                    </li>
                    <li className="flex items-center">
                      <svg className="mr-2 h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      無期限ダウンロード
                    </li>
                  </ul>
                </div>
                
                {photo.hasUserFace && (
                  <div className="rounded-lg bg-milab-50 p-3">
                    <div className="flex items-center">
                      <svg className="mr-2 h-5 w-5 text-milab-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium text-milab-800">あなたが写っています</span>
                    </div>
                    <p className="mt-1 text-sm text-milab-700">
                      この写真にはあなたが写っています。顔認識技術により自動的に検出されました。
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              {photo.isPurchased ? (
                <div className="w-full space-y-3">
                  <Button className="w-full" disabled>
                    購入済み
                  </Button>
                  <Link href="/dashboard/purchases" className="block w-full">
                    <Button variant="outline" className="w-full">
                      購入履歴を見る
                    </Button>
                  </Link>
                </div>
              ) : isInCart ? (
                <div className="w-full space-y-3">
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={removeFromCart}
                  >
                    カートから削除
                  </Button>
                  <Link href="/dashboard/cart" className="block w-full">
                    <Button variant="outline" className="w-full">
                      カートを見る
                    </Button>
                  </Link>
                </div>
              ) : (
                <Button
                  className="w-full"
                  onClick={addToCart}
                >
                  カートに追加
                </Button>
              )}
            </CardFooter>
          </Card>
          
          {photo.smileScore !== undefined && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>笑顔分析</CardTitle>
                <CardDescription>
                  AIによる表情分析の結果です
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">笑顔度:</span>
                      <span className="text-sm font-medium">{photo.smileScore}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getSmileColor(photo.smileScore)}`}
                        style={{ width: `${photo.smileScore}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    {photo.smileScore >= 80 ? (
                      <p>とても素敵な笑顔の瞬間が捉えられています！</p>
                    ) : photo.smileScore >= 60 ? (
                      <p>自然な笑顔が見られる良い写真です。</p>
                    ) : photo.smileScore >= 40 ? (
                      <p>穏やかな表情が見られます。</p>
                    ) : photo.smileScore >= 20 ? (
                      <p>真剣な表情が捉えられています。</p>
                    ) : (
                      <p>落ち着いた表情の瞬間です。</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="show-only-faces"
            checked={showOnlyWithFaces}
            onCheckedChange={(checked) => setShowOnlyWithFaces(!!checked)}
          />
          <Label htmlFor="show-only-faces" className="text-sm">人物が写っている写真のみ表示</Label>
        </div>
      </div>
    </div>
  )
} 