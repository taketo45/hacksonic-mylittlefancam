'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'

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
}

// フレームの型定義
interface Frame {
  id: string
  name: string
  thumbnailUrl: string
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
        
        // 写真の取得（ハッカソンデモ用のモックデータ）
        const mockPhotos: Photo[] = Array.from({ length: 8 }, (_, i) => ({
          id: `photo-${i + 1}`,
          url: `https://source.unsplash.com/random/800x600?sig=${i + 101}`,
          thumbnailUrl: `https://source.unsplash.com/random/400x300?sig=${i + 101}`,
          title: `写真 ${i + 1}`,
          eventName: i < 4 ? '保育園夏祭り 2023' : '運動会 2023',
          takenAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          hasUserFace: true,
          facePosition: {
            x: 0.3 + Math.random() * 0.4,
            y: 0.3 + Math.random() * 0.4,
            width: 0.1 + Math.random() * 0.1,
            height: 0.1 + Math.random() * 0.1,
          },
          isPurchased: i < 2,
        }))
        
        setPhotos(mockPhotos)
        
        // 最初の写真を選択
        if (mockPhotos.length > 0) {
          setSelectedPhoto(mockPhotos[0])
        }
      } catch (err) {
        console.error('データ取得エラー:', err)
        setError('データの取得中にエラーが発生しました')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // 写真を選択
  const handleSelectPhoto = (photo: Photo) => {
    setSelectedPhoto(photo)
    setSelectedFrame(null)
    setIsMaskingFace(false)
    setPreviewUrl(null)
  }

  // フレームを選択
  const handleSelectFrame = (frameId: string) => {
    setSelectedFrame(frameId)
    generatePreview(frameId, isMaskingFace)
  }

  // 顔マスキングを切り替え
  const handleToggleMasking = () => {
    const newMaskingState = !isMaskingFace
    setIsMaskingFace(newMaskingState)
    generatePreview(selectedFrame, newMaskingState)
  }

  // プレビューを生成
  const generatePreview = (frameId: string | null, masking: boolean) => {
    if (!selectedPhoto) return
    
    // 実際の実装では、サーバーサイドで画像処理を行う
    // ここではモック実装として、単にURLを変更する
    const frameParam = frameId ? `&frame=${frameId}` : ''
    const maskParam = masking ? '&mask=true' : ''
    
    // プレビュー用のURLを生成（実際には画像処理サーバーのURLになる）
    setPreviewUrl(`${selectedPhoto.url}${frameParam}${maskParam}`)
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
        {/* 写真一覧 */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow">
            <h2 className="mb-4 text-lg font-medium text-gray-900">あなたの写真</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-2">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className={`cursor-pointer overflow-hidden rounded-lg border-2 transition-all ${
                    selectedPhoto?.id === photo.id
                      ? 'border-milab-500 shadow-md'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                  onClick={() => handleSelectPhoto(photo)}
                >
                  <div className="relative">
                    <Image
                      src={photo.thumbnailUrl}
                      alt={photo.title}
                      width={300}
                      height={200}
                      className="h-32 w-full object-cover"
                    />
                    {photo.isPurchased && (
                      <div className="absolute top-1 right-1">
                        <span className="rounded-full bg-green-500 px-1.5 py-0.5 text-xs font-semibold text-white">
                          購入済み
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="truncate text-xs font-medium text-gray-900">{photo.title}</p>
                    <p className="truncate text-xs text-gray-500">{formatDate(photo.takenAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 編集エリア */}
        <div className="lg:col-span-2">
          {selectedPhoto ? (
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-medium text-gray-900">
                  {selectedPhoto.title} の編集
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleMasking}
                    className={`rounded-md px-3 py-1 text-sm font-medium ${
                      isMaskingFace
                        ? 'bg-milab-500 text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    SNS用に顔をマスク
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={isProcessing || (!selectedFrame && !isMaskingFace)}
                    className="rounded-md bg-milab-600 px-3 py-1 text-sm font-medium text-white hover:bg-milab-700 disabled:opacity-50"
                  >
                    {isProcessing ? '処理中...' : '編集を保存'}
                  </button>
                </div>
              </div>

              {/* プレビュー */}
              <div className="mb-4 overflow-hidden rounded-lg border border-gray-200">
                <img
                  src={previewUrl || selectedPhoto.url}
                  alt={selectedPhoto.title}
                  className="w-full object-contain"
                />
              </div>

              {/* フレーム選択 */}
              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-900">フレームを選択</h3>
                <div className="flex flex-wrap gap-4">
                  {frames.map((frame) => (
                    <div
                      key={frame.id}
                      className={`cursor-pointer overflow-hidden rounded-lg border-2 transition-all ${
                        selectedFrame === frame.id
                          ? 'border-milab-500 shadow-md'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                      onClick={() => handleSelectFrame(frame.id)}
                    >
                      <img
                        src={frame.thumbnailUrl}
                        alt={frame.name}
                        className="h-16 w-16 object-cover"
                      />
                      <p className="p-1 text-center text-xs">{frame.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg border border-gray-200 bg-white p-6 shadow">
              <p className="text-gray-500">左側から写真を選択してください</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 