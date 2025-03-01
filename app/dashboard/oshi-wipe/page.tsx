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
  isPurchased: boolean
}

// 推し写真の型定義
interface OshiPhoto {
  id: string
  url: string
  thumbnailUrl: string
  title: string
  eventName: string
  takenAt: string
  oshiName: string
}

// ワイプ位置の型定義
type WipePosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'left' | 'right'

export default function OshiWipePage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [oshiPhotos, setOshiPhotos] = useState<OshiPhoto[]>([])
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [selectedOshiPhoto, setSelectedOshiPhoto] = useState<OshiPhoto | null>(null)
  const [wipePosition, setWipePosition] = useState<WipePosition>('bottom-right')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // 写真と推し写真の取得
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const supabase = createClient()
        
        // 写真の取得（ハッカソンデモ用のモックデータ）
        const mockPhotos: Photo[] = Array.from({ length: 8 }, (_, i) => ({
          id: `photo-${i + 1}`,
          url: `https://source.unsplash.com/random/800x600?sig=${i + 201}`,
          thumbnailUrl: `https://source.unsplash.com/random/400x300?sig=${i + 201}`,
          title: `写真 ${i + 1}`,
          eventName: i < 4 ? '保育園夏祭り 2023' : '運動会 2023',
          takenAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          hasUserFace: true,
          isPurchased: i < 2,
        }))
        
        // 推し写真の取得（ハッカソンデモ用のモックデータ）
        const mockOshiPhotos: OshiPhoto[] = Array.from({ length: 6 }, (_, i) => ({
          id: `oshi-${i + 1}`,
          url: `https://source.unsplash.com/random/300x300?sig=${i + 301}`,
          thumbnailUrl: `https://source.unsplash.com/random/150x150?sig=${i + 301}`,
          title: `推し写真 ${i + 1}`,
          eventName: i < 3 ? '保育園夏祭り 2023' : '運動会 2023',
          takenAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          oshiName: i % 2 === 0 ? '山田先生' : '佐藤先生',
        }))
        
        setPhotos(mockPhotos)
        setOshiPhotos(mockOshiPhotos)
        
        // 最初の写真を選択
        if (mockPhotos.length > 0) {
          setSelectedPhoto(mockPhotos[0])
        }
        
        // 最初の推し写真を選択
        if (mockOshiPhotos.length > 0) {
          setSelectedOshiPhoto(mockOshiPhotos[0])
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
    generatePreview(photo, selectedOshiPhoto, wipePosition)
  }

  // 推し写真を選択
  const handleSelectOshiPhoto = (photo: OshiPhoto) => {
    setSelectedOshiPhoto(photo)
    generatePreview(selectedPhoto, photo, wipePosition)
  }

  // ワイプ位置を変更
  const handleChangeWipePosition = (position: WipePosition) => {
    setWipePosition(position)
    generatePreview(selectedPhoto, selectedOshiPhoto, position)
  }

  // プレビューを生成
  const generatePreview = (
    mainPhoto: Photo | null,
    oshiPhoto: OshiPhoto | null,
    position: WipePosition
  ) => {
    if (!mainPhoto || !oshiPhoto) return
    
    // 実際の実装では、サーバーサイドで画像処理を行う
    // ここではモック実装として、単にURLを変更する
    const positionParam = `&position=${position}`
    const oshiParam = `&oshi=${oshiPhoto.id}`
    
    // プレビュー用のURLを生成（実際には画像処理サーバーのURLになる）
    setPreviewUrl(`${mainPhoto.url}${oshiParam}${positionParam}`)
  }

  // 編集を保存
  const handleSaveEdit = async () => {
    if (!selectedPhoto || !selectedOshiPhoto) return
    
    setIsProcessing(true)
    
    try {
      // 実際の実装では、サーバーサイドで画像処理を行い、結果を保存する
      // ここではモック実装として、単に待機する
      await new Promise((resolve) => setTimeout(resolve, 2000))
      
      // 成功メッセージを表示
      alert('推しワイプが保存されました！')
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
        <h1 className="text-2xl font-bold text-gray-900">推しワイプ編集</h1>
        <p className="mt-1 text-gray-600">
          あなたの写真に推しの写真をワイプとして追加できます。同じイベントで撮影された推しの写真を選んでみましょう！
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
                    <img
                      src={photo.thumbnailUrl}
                      alt={photo.title}
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

          <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 shadow">
            <h2 className="mb-4 text-lg font-medium text-gray-900">推し写真</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-2">
              {oshiPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className={`cursor-pointer overflow-hidden rounded-lg border-2 transition-all ${
                    selectedOshiPhoto?.id === photo.id
                      ? 'border-milab-500 shadow-md'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                  onClick={() => handleSelectOshiPhoto(photo)}
                >
                  <div className="relative">
                    <img
                      src={photo.thumbnailUrl}
                      alt={photo.title}
                      className="h-32 w-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-1">
                      <p className="text-center text-xs font-medium text-white">{photo.oshiName}</p>
                    </div>
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
          {selectedPhoto && selectedOshiPhoto ? (
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-medium text-gray-900">
                  推しワイプの編集
                </h2>
                <button
                  onClick={handleSaveEdit}
                  disabled={isProcessing}
                  className="rounded-md bg-milab-600 px-3 py-1 text-sm font-medium text-white hover:bg-milab-700 disabled:opacity-50"
                >
                  {isProcessing ? '処理中...' : '編集を保存'}
                </button>
              </div>

              {/* プレビュー */}
              <div className="mb-4 overflow-hidden rounded-lg border border-gray-200">
                <img
                  src={previewUrl || selectedPhoto.url}
                  alt={selectedPhoto.title}
                  className="w-full object-contain"
                />
              </div>

              {/* ワイプ位置選択 */}
              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-900">ワイプ位置を選択</h3>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    className={`rounded-md p-2 text-sm ${
                      wipePosition === 'top-left'
                        ? 'bg-milab-500 text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                    onClick={() => handleChangeWipePosition('top-left')}
                  >
                    左上
                  </button>
                  <button
                    className={`rounded-md p-2 text-sm ${
                      wipePosition === 'top-right'
                        ? 'bg-milab-500 text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                    onClick={() => handleChangeWipePosition('top-right')}
                  >
                    右上
                  </button>
                  <button
                    className={`rounded-md p-2 text-sm ${
                      wipePosition === 'left'
                        ? 'bg-milab-500 text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                    onClick={() => handleChangeWipePosition('left')}
                  >
                    左
                  </button>
                  <button
                    className={`rounded-md p-2 text-sm ${
                      wipePosition === 'right'
                        ? 'bg-milab-500 text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                    onClick={() => handleChangeWipePosition('right')}
                  >
                    右
                  </button>
                  <button
                    className={`rounded-md p-2 text-sm ${
                      wipePosition === 'bottom-left'
                        ? 'bg-milab-500 text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                    onClick={() => handleChangeWipePosition('bottom-left')}
                  >
                    左下
                  </button>
                  <button
                    className={`rounded-md p-2 text-sm ${
                      wipePosition === 'bottom-right'
                        ? 'bg-milab-500 text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                    onClick={() => handleChangeWipePosition('bottom-right')}
                  >
                    右下
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="mb-2 text-sm font-medium text-gray-900">選択中の写真情報</h3>
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700">メイン写真:</p>
                    <p className="text-sm text-gray-600">{selectedPhoto.title} - {selectedPhoto.eventName}</p>
                    <p className="text-sm text-gray-600">撮影日: {formatDate(selectedPhoto.takenAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">推し写真:</p>
                    <p className="text-sm text-gray-600">{selectedOshiPhoto.oshiName} - {selectedOshiPhoto.eventName}</p>
                    <p className="text-sm text-gray-600">撮影日: {formatDate(selectedOshiPhoto.takenAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg border border-gray-200 bg-white p-6 shadow">
              <p className="text-gray-500">左側から写真と推し写真を選択してください</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 