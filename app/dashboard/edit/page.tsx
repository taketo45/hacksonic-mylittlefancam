'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { FaSmile, FaRegSmile, FaRegMeh } from 'react-icons/fa'
import { BiSolidMask } from 'react-icons/bi'
import { BsEmojiSmile, BsEmojiLaughing } from 'react-icons/bs'
import { MdBlurOn, MdOutlineBlurCircular } from 'react-icons/md'
import { RiImageEditFill } from 'react-icons/ri'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'

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
  hasFaces?: boolean; // 顔が含まれているかどうかのフラグを追加
  isSelected?: boolean; // 選択状態
}

// フレームの型定義
interface Frame {
  id: string
  name: string
  thumbnailUrl: string
}

// マスキングオプションの型定義
interface MaskingOption {
  id: string;
  name: string;
  icon: JSX.Element;
}

export default function EditPage() {
  const router = useRouter()
  const [photos, setPhotos] = useState<Photo[]>([])
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [frames, setFrames] = useState<Frame[]>([])
  const [selectedFrame, setSelectedFrame] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMaskingFace, setIsMaskingFace] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('all')
  const [selectedMaskOption, setSelectedMaskOption] = useState<string>('blur')
  const [maskIntensity, setMaskIntensity] = useState<number>(50)
  const [snsCaption, setSnsCaption] = useState<string>('')
  const [snsHashtags, setSnsHashtags] = useState<string>('#SmileShare #子供の笑顔')
  const [maskAllFaces, setMaskAllFaces] = useState<boolean>(false)
  const [maskOnlyOthers, setMaskOnlyOthers] = useState<boolean>(true)
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)
  const [events, setEvents] = useState<{ id: string; name: string }[]>([])
  const [minSmileScore, setMinSmileScore] = useState(0)
  const [showOnlyWithFaces, setShowOnlyWithFaces] = useState(true) // 顔が含まれている写真のみを表示するかどうかのフラグ
  const [editedImage, setEditedImage] = useState<string | null>(null)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)

  // マスキングオプション
  const maskingOptions: MaskingOption[] = [
    { id: 'blur', name: 'ぼかし', icon: <MdBlurOn size={24} /> },
    { id: 'emoji', name: '絵文字', icon: <BsEmojiSmile size={24} /> },
    { id: 'pixelate', name: 'モザイク', icon: <RiImageEditFill size={24} /> },
  ];

  // 写真とフレームの取得
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const supabase = createClient()
        
        // フレームの取得（ハッカソンデモ用のモックデータ）
        const mockFrames: Frame[] = [
          {
            id: 'frame-1',
            name: 'シンプル',
            thumbnailUrl: 'https://via.placeholder.com/100x100/ffffff/000000?text=Simple',
          },
          {
            id: 'frame-2',
            name: 'カラフル',
            thumbnailUrl: 'https://via.placeholder.com/100x100/ff9900/ffffff?text=Colorful',
          },
          {
            id: 'frame-3',
            name: 'クラシック',
            thumbnailUrl: 'https://via.placeholder.com/100x100/996633/ffffff?text=Classic',
          },
          {
            id: 'frame-4',
            name: 'モダン',
            thumbnailUrl: 'https://via.placeholder.com/100x100/333333/ffffff?text=Modern',
          },
        ]
        setFrames(mockFrames)
        
        // 写真のモックデータ
        const mockPhotos: Photo[] = Array.from({ length: 20 }, (_, i) => {
          // 各写真に0〜4人の顔を検出（20%の確率で顔なし）
          const faceCount = Math.random() > 0.2 ? Math.floor(Math.random() * 4) + 1 : 0;
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
          const avgSmileScore = detectedFaces.length > 0 
            ? detectedFaces.reduce((sum, face) => sum + (face.smileScore || 0), 0) / detectedFaces.length
            : 0;
          
          return {
            id: `photo-${i + 1}`,
            url: `https://picsum.photos/800/600?random=${i + 1}`,
            thumbnailUrl: `https://picsum.photos/400/300?random=${i + 1}`,
            title: `写真 ${i + 1}`,
            eventName: mockFrames[Math.floor(i / 5)].name,
            takenAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            hasUserFace: detectedFaces.some(face => face.matchedUser?.name === 'あなた'),
            price: 500,
            isPurchased: Math.random() > 0.8,
            smileScore: detectedFaces.length > 0 ? Math.round(avgSmileScore) : undefined,
            detectedFaces,
            hasFaces: detectedFaces.length > 0, // 顔が含まれているかどうかのフラグを設定
            isSelected: false
          }
        })
        
        setFrames(mockFrames)
        setPhotos(mockPhotos)
        
        // 最初の写真を選択
        if (mockPhotos.length > 0) {
          setSelectedPhoto(mockPhotos[0]);
        }
      } catch (err) {
        console.error('データ取得エラー:', err);
        setError('データの取得中にエラーが発生しました');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [])

  // 写真を選択
  const handleSelectPhoto = (photo: Photo) => {
    setSelectedPhoto(photo)
    setSelectedFrame(null)
    setIsMaskingFace(false)
    setPreviewUrl(null)
    setActiveTab('all')
    setEditedImage(null)
    // リセット
    setBrightness(100)
    setContrast(100)
    setSaturation(100)
  }

  // フレームを選択
  const handleSelectFrame = (frameId: string) => {
    setSelectedFrame(frameId === selectedFrame ? null : frameId)
    generatePreview(frameId === selectedFrame ? null : frameId, isMaskingFace)
  }

  // マスキングオプションを選択
  const handleSelectMaskOption = (optionId: string) => {
    setSelectedMaskOption(optionId)
    generatePreview(selectedFrame, isMaskingFace)
  }

  // 顔マスキングを切り替え
  const handleToggleMasking = (checked: boolean) => {
    setIsMaskingFace(checked)
    generatePreview(selectedFrame, checked)
  }

  // プレビューを生成
  const generatePreview = (frameId: string | null, masking: boolean) => {
    if (!selectedPhoto) return
    
    // 実際の実装では、サーバーサイドで画像処理を行う
    // ここではモック実装として、単にURLを変更する
    const frameParam = frameId ? `&frame=${frameId}` : ''
    const maskParam = masking ? `&mask=${selectedMaskOption}&intensity=${maskIntensity}` : ''
    const maskAllParam = maskAllFaces ? '&maskAll=true' : ''
    const maskOnlyOthersParam = maskOnlyOthers ? '&maskOnlyOthers=true' : ''
    
    // プレビュー用のURLを生成（実際には画像処理サーバーのURLになる）
    setPreviewUrl(`${selectedPhoto.url}${frameParam}${maskParam}${maskAllParam}${maskOnlyOthersParam}`)
  }

  // 編集を適用
  const applyEdit = () => {
    // 実際のアプリでは画像処理ライブラリを使用して編集を適用
    // ここではモックとして元の画像を使用
    setEditedImage(selectedPhoto?.url || null)
  }

  // 編集をリセット
  const resetEdit = () => {
    setBrightness(100)
    setContrast(100)
    setSaturation(100)
    setEditedImage(null)
  }

  // 編集を保存
  const handleSaveEdit = async () => {
    if (!selectedPhoto) return
    
    setIsProcessing(true)
    
    try {
      // 実際の実装では、サーバーサイドで画像処理を行い、結果を保存する
      // ここではモック実装として、単に待機する
      await new Promise((resolve) => setTimeout(resolve, 2000))
      
      // 成功メッセージを表示
      alert('編集が保存されました！')
    } catch (err) {
      console.error('編集保存エラー:', err)
      setError('編集の保存中にエラーが発生しました')
    } finally {
      setIsProcessing(false)
    }
  }

  // SNS用に保存
  const handleSaveForSNS = async () => {
    if (!selectedPhoto) return
    
    setIsProcessing(true)
    
    try {
      // 実際の実装では、サーバーサイドで画像処理を行い、結果を保存する
      // ここではモック実装として、単に待機する
      await new Promise((resolve) => setTimeout(resolve, 2000))
      
      // 成功メッセージを表示
      alert('SNS用に保存されました！投稿準備が完了しました。')
    } catch (err) {
      console.error('SNS保存エラー:', err)
      setError('SNS用保存中にエラーが発生しました')
    } finally {
      setIsProcessing(false)
    }
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

  // イベントでフィルタリングされた写真
  const filteredByEvent = selectedEvent
    ? photos.filter((photo) => photo.eventName === events.find((e) => e.id === selectedEvent)?.name)
    : photos

  // 顔の有無でフィルタリング
  const filteredByFaces = showOnlyWithFaces
    ? filteredByEvent.filter(photo => photo.hasFaces)
    : filteredByEvent

  // 笑顔度でフィルタリング
  const filteredBySmile = filteredByFaces.filter(photo => 
    !showOnlyWithFaces || (photo.smileScore !== undefined && photo.smileScore >= minSmileScore)
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
        <h1 className="text-2xl font-bold text-gray-900">写真編集</h1>
        <p className="mt-1 text-gray-600">
          写真の明るさ、コントラスト、彩度などを調整できます。
        </p>
      </div>

      {selectedPhoto ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-4">
                <div className="aspect-w-4 aspect-h-3 relative">
                  <Image
                    src={editedImage || selectedPhoto.url}
                    alt={selectedPhoto.title}
                    width={800}
                    height={600}
                    className="w-full object-contain"
                    style={{
                      filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
                    }}
                  />
                  
                  {/* 顔の位置を示すオーバーレイ */}
                  {selectedPhoto.detectedFaces?.map((face) => (
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
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-medium mb-4">編集ツール</h3>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="brightness" className="text-sm font-medium">明るさ: {brightness}%</label>
                    </div>
                    <Slider
                      id="brightness"
                      value={[brightness]}
                      onValueChange={(values) => setBrightness(values[0])}
                      min={0}
                      max={200}
                      step={1}
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="contrast" className="text-sm font-medium">コントラスト: {contrast}%</label>
                    </div>
                    <Slider
                      id="contrast"
                      value={[contrast]}
                      onValueChange={(values) => setContrast(values[0])}
                      min={0}
                      max={200}
                      step={1}
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="saturation" className="text-sm font-medium">彩度: {saturation}%</label>
                    </div>
                    <Slider
                      id="saturation"
                      value={[saturation]}
                      onValueChange={(values) => setSaturation(values[0])}
                      min={0}
                      max={200}
                      step={1}
                    />
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <Button onClick={applyEdit}>編集を適用</Button>
                    <Button variant="outline" onClick={resetEdit}>リセット</Button>
                    <Button variant="secondary" onClick={handleSaveEdit}>保存</Button>
                    <Button variant="ghost" onClick={() => setSelectedPhoto(null)}>キャンセル</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <>
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

            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-only-faces"
                checked={showOnlyWithFaces}
                onCheckedChange={(checked) => setShowOnlyWithFaces(!!checked)}
              />
              <Label htmlFor="show-only-faces" className="text-sm">人物が写っている写真のみ表示</Label>
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
                  className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow transition-all hover:shadow-md cursor-pointer"
                  onClick={() => handleSelectPhoto(photo)}
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
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-900">{photo.title}</h3>
                    <p className="mt-1 text-xs text-gray-500">{photo.eventName}</p>
                    <p className="mt-1 text-xs text-gray-500">撮影日: {formatDate(photo.takenAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
} 