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

// 写真の型定義
interface Photo {
  id: string
  url: string
  thumbnailUrl: string
  title: string
  eventName: string
  takenAt: string
  hasUserFace: boolean
  facePosition: {
    x: number
    y: number
    width: number
    height: number
  } | null
  isPurchased: boolean
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
  const [photos, setPhotos] = useState<Photo[]>([])
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [frames, setFrames] = useState<Frame[]>([])
  const [selectedFrame, setSelectedFrame] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMaskingFace, setIsMaskingFace] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'frame' | 'mask'>('frame')
  const [selectedMaskOption, setSelectedMaskOption] = useState<string>('blur')
  const [maskIntensity, setMaskIntensity] = useState<number>(50)
  const [snsCaption, setSnsCaption] = useState<string>('')
  const [snsHashtags, setSnsHashtags] = useState<string>('#SmileShare #子供の笑顔')
  const [maskAllFaces, setMaskAllFaces] = useState<boolean>(false)
  const [maskOnlyOthers, setMaskOnlyOthers] = useState<boolean>(true)

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
        const mockPhotos: Photo[] = Array.from({ length: 6 }, (_, i) => {
          // ランダムな顔検出データを生成
          const detectedFacesCount = Math.floor(Math.random() * 3) + 1; // 1〜3人の顔
          const detectedFaces = Array.from({ length: detectedFacesCount }, (_, j) => {
            // ランダムな位置とサイズ
            const left = 0.1 + Math.random() * 0.6;
            const top = 0.1 + Math.random() * 0.6;
            const width = 0.1 + Math.random() * 0.2;
            const height = width * 1.3; // 顔の縦横比を考慮
            
            // 最初の顔はユーザー自身の顔とする確率を高くする
            const isUserFace = j === 0 ? Math.random() > 0.3 : Math.random() > 0.8;
            
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
              smileScore: Math.floor(Math.random() * 100)
            };
          });
          
          // 自分の顔が含まれているかどうか
          const hasUserFace = detectedFaces.some(face => face.matchedUser !== undefined);
          
          // メインの顔の位置（最初の検出顔を使用）
          const mainFace = detectedFaces[0].boundingBox;
          const facePosition = {
            x: mainFace.left,
            y: mainFace.top,
            width: mainFace.width,
            height: mainFace.height
          };
          
          return {
            id: `photo${i + 1}`,
            url: `https://placehold.co/800x600/f5f5f5/aaaaaa?text=Photo${i + 1}`,
            thumbnailUrl: `https://placehold.co/200x150/f5f5f5/aaaaaa?text=Photo${i + 1}`,
            title: `写真 ${i + 1}`,
            eventName: `イベント ${Math.floor(i / 2) + 1}`,
            takenAt: new Date(2023, i % 12, (i % 28) + 1).toISOString(),
            hasUserFace,
            facePosition,
            isPurchased: i < 3, // 最初の3枚は購入済み
            detectedFaces
          };
        });
        
        setFrames(mockFrames);
        setPhotos(mockPhotos);
        
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
    setActiveTab('frame')
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
          写真にフレームを追加したり、SNS用に顔をマスキングしたりできます。
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 左側: 写真一覧 */}
        <div className="lg:col-span-1">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-800">写真を選択</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-2">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className={`cursor-pointer overflow-hidden rounded-lg border ${
                  selectedPhoto?.id === photo.id
                    ? 'border-milab-500 ring-2 ring-milab-500'
                    : 'border-gray-200'
                }`}
                onClick={() => handleSelectPhoto(photo)}
              >
                <div className="relative">
                  <Image
                    src={photo.thumbnailUrl}
                    alt={photo.title}
                    width={200}
                    height={150}
                    className="h-24 w-full object-cover"
                  />
                  {photo.hasUserFace && (
                    <div className="absolute top-1 right-1">
                      <span className="inline-flex items-center rounded-full bg-milab-100 px-2 py-0.5 text-xs font-medium text-milab-800">
                        あなた
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <p className="truncate text-xs font-medium text-gray-900">{photo.title}</p>
                  <p className="text-xs text-gray-500">{formatDate(photo.takenAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 中央: プレビュー */}
        <div className="lg:col-span-1">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-800">プレビュー</h2>
          </div>
          {selectedPhoto ? (
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
              <div className="relative">
                <Image
                  src={previewUrl || selectedPhoto.url}
                  alt={selectedPhoto.title}
                  width={800}
                  height={600}
                  className="w-full"
                />
                
                {/* 顔の位置を示すオーバーレイ（マスキングモードでない場合のみ表示） */}
                {!isMaskingFace && selectedPhoto.detectedFaces?.map((face, index) => (
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
              <div className="p-3">
                <p className="text-sm font-medium text-gray-900">{selectedPhoto.title}</p>
                <p className="text-xs text-gray-500">{selectedPhoto.eventName}</p>
              </div>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
              <p className="text-gray-500">写真を選択してください</p>
            </div>
          )}
          
          {selectedPhoto && (
            <div className="mt-4 flex justify-center space-x-4">
              <button
                onClick={handleSaveEdit}
                disabled={isProcessing || (!selectedFrame && !isMaskingFace)}
                className="rounded-md bg-milab-600 px-4 py-2 text-sm font-medium text-white hover:bg-milab-700 focus:outline-none focus:ring-2 focus:ring-milab-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isProcessing ? '処理中...' : '保存する'}
              </button>
              
              {activeTab === 'mask' && (
                <button
                  onClick={handleSaveForSNS}
                  disabled={isProcessing || !isMaskingFace}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {isProcessing ? '処理中...' : 'SNS用に保存'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* 右側: 編集オプション */}
        <div className="lg:col-span-1">
          {selectedPhoto && (
            <>
              <div className="mb-4">
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'frame' | 'mask')}>
                  <TabsList className="w-full">
                    <TabsTrigger value="frame" className="flex-1">フレーム編集</TabsTrigger>
                    <TabsTrigger value="mask" className="flex-1">
                      <div className="flex items-center">
                        <span>SNS用マスキング</span>
                        <Badge variant="secondary" className="ml-2 bg-red-500 text-white">NEW</Badge>
                      </div>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="frame">
                    <div className="mb-4">
                      <h2 className="text-lg font-semibold text-gray-800">フレームを選択</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {frames.map((frame) => (
                        <div
                          key={frame.id}
                          className={`cursor-pointer overflow-hidden rounded-lg border ${
                            selectedFrame === frame.id
                              ? 'border-milab-500 ring-2 ring-milab-500'
                              : 'border-gray-200'
                          }`}
                          onClick={() => handleSelectFrame(frame.id)}
                        >
                          <Image
                            src={frame.thumbnailUrl}
                            alt={frame.name}
                            width={100}
                            height={100}
                            className="h-24 w-full object-cover"
                          />
                          <div className="p-2">
                            <p className="text-center text-xs font-medium">{frame.name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="mask">
                    <div className="space-y-6">
                      <div>
                        <h2 className="mb-4 text-lg font-semibold text-gray-800">マスキングオプション</h2>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="masking-toggle" className="text-sm font-medium text-gray-700">
                            顔マスキングを有効にする
                          </Label>
                          <Switch
                            id="masking-toggle"
                            checked={isMaskingFace}
                            onCheckedChange={handleToggleMasking}
                          />
                        </div>
                      </div>
                      
                      {isMaskingFace && (
                        <>
                          <div>
                            <h3 className="mb-2 text-sm font-medium text-gray-700">マスキング方法</h3>
                            <div className="grid grid-cols-3 gap-2">
                              {maskingOptions.map((option) => (
                                <button
                                  key={option.id}
                                  className={`flex flex-col items-center justify-center rounded-lg border p-3 ${
                                    selectedMaskOption === option.id
                                      ? 'border-milab-500 bg-milab-50'
                                      : 'border-gray-200 hover:bg-gray-50'
                                  }`}
                                  onClick={() => handleSelectMaskOption(option.id)}
                                >
                                  <div className="mb-2 text-gray-600">{option.icon}</div>
                                  <span className="text-xs font-medium">{option.name}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <div className="mb-2 flex items-center justify-between">
                              <Label htmlFor="mask-intensity" className="text-sm font-medium text-gray-700">
                                マスキング強度
                              </Label>
                              <span className="text-xs text-gray-500">{maskIntensity}%</span>
                            </div>
                            <Slider
                              id="mask-intensity"
                              value={[maskIntensity]}
                              onValueChange={(values) => {
                                setMaskIntensity(values[0])
                                generatePreview(selectedFrame, isMaskingFace)
                              }}
                              max={100}
                              step={10}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="mask-all" className="text-sm font-medium text-gray-700">
                                すべての顔をマスク
                              </Label>
                              <Switch
                                id="mask-all"
                                checked={maskAllFaces}
                                onCheckedChange={(checked) => {
                                  setMaskAllFaces(checked)
                                  if (checked) setMaskOnlyOthers(false)
                                  generatePreview(selectedFrame, isMaskingFace)
                                }}
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <Label htmlFor="mask-others" className="text-sm font-medium text-gray-700">
                                自分以外の顔のみマスク
                              </Label>
                              <Switch
                                id="mask-others"
                                checked={maskOnlyOthers}
                                onCheckedChange={(checked) => {
                                  setMaskOnlyOthers(checked)
                                  if (checked) setMaskAllFaces(false)
                                  generatePreview(selectedFrame, isMaskingFace)
                                }}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="mb-2 text-sm font-medium text-gray-700">SNS投稿用キャプション</h3>
                            <textarea
                              value={snsCaption}
                              onChange={(e) => setSnsCaption(e.target.value)}
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-milab-500 focus:ring-milab-500"
                              rows={2}
                              placeholder="キャプションを入力（任意）"
                            />
                          </div>
                          
                          <div>
                            <h3 className="mb-2 text-sm font-medium text-gray-700">ハッシュタグ</h3>
                            <input
                              type="text"
                              value={snsHashtags}
                              onChange={(e) => setSnsHashtags(e.target.value)}
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-milab-500 focus:ring-milab-500"
                              placeholder="#SmileShare #子供の笑顔"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
} 