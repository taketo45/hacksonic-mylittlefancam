'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

// 購入履歴の型定義
interface Purchase {
  id: string
  date: string
  totalAmount: number
  status: 'completed' | 'processing' | 'shipped'
  items: PurchaseItem[]
}

// 購入アイテムの型定義
interface PurchaseItem {
  id: string
  photoId: string
  thumbnailUrl: string
  title: string
  eventName: string
  price: number
  printOption: 'none' | 'l' | '2l'
  printPrice: number
  printStatus?: 'pending' | 'printing' | 'completed' | 'shipped'
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedPurchase, setExpandedPurchase] = useState<string | null>(null)

  // 購入履歴を取得
  useEffect(() => {
    const fetchPurchases = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const supabase = createClient()
        
        // 購入履歴を取得（ハッカソンデモ用のモックデータ）
        const mockPurchases: Purchase[] = [
          {
            id: 'purchase-1',
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            totalAmount: 1200,
            status: 'completed',
            items: [
              {
                id: 'item-1',
                photoId: 'photo-1',
                thumbnailUrl: 'https://source.unsplash.com/random/400x300?sig=501',
                title: '写真 1',
                eventName: '保育園夏祭り 2023',
                price: 500,
                printOption: 'l',
                printPrice: 200,
                printStatus: 'completed',
              },
              {
                id: 'item-2',
                photoId: 'photo-2',
                thumbnailUrl: 'https://source.unsplash.com/random/400x300?sig=502',
                title: '写真 2',
                eventName: '保育園夏祭り 2023',
                price: 500,
                printOption: 'none',
                printPrice: 0,
              },
            ],
          },
          {
            id: 'purchase-2',
            date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            totalAmount: 800,
            status: 'shipped',
            items: [
              {
                id: 'item-3',
                photoId: 'photo-3',
                thumbnailUrl: 'https://source.unsplash.com/random/400x300?sig=503',
                title: '写真 3',
                eventName: '運動会 2023',
                price: 500,
                printOption: 'l',
                printPrice: 200,
                printStatus: 'shipped',
              },
              {
                id: 'item-4',
                photoId: 'photo-4',
                thumbnailUrl: 'https://source.unsplash.com/random/400x300?sig=504',
                title: '写真 4',
                eventName: '運動会 2023',
                price: 100,
                printOption: 'none',
                printPrice: 0,
              },
            ],
          },
          {
            id: 'purchase-3',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            totalAmount: 1300,
            status: 'processing',
            items: [
              {
                id: 'item-5',
                photoId: 'photo-5',
                thumbnailUrl: 'https://source.unsplash.com/random/400x300?sig=505',
                title: '写真 5',
                eventName: 'クリスマス会 2023',
                price: 500,
                printOption: '2l',
                printPrice: 300,
                printStatus: 'printing',
              },
              {
                id: 'item-6',
                photoId: 'photo-6',
                thumbnailUrl: 'https://source.unsplash.com/random/400x300?sig=506',
                title: '写真 6',
                eventName: 'クリスマス会 2023',
                price: 500,
                printOption: 'none',
                printPrice: 0,
              },
            ],
          },
        ]
        
        setPurchases(mockPurchases)
      } catch (err) {
        console.error('購入履歴取得エラー:', err)
        setError('購入履歴の取得中にエラーが発生しました')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPurchases()
  }, [])

  // 購入詳細の表示/非表示を切り替え
  const togglePurchaseDetails = (purchaseId: string) => {
    setExpandedPurchase((prev) => (prev === purchaseId ? null : purchaseId))
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

  // ステータスに応じたバッジの色を返す
  const getStatusBadgeClass = (status: Purchase['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // 印刷ステータスに応じたバッジの色を返す
  const getPrintStatusBadgeClass = (status?: PurchaseItem['printStatus']) => {
    if (!status) return ''
    
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'printing':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-milab-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">購入履歴を読み込み中...</p>
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
        <h1 className="text-2xl font-bold text-gray-900">購入履歴</h1>
        <p className="mt-1 text-gray-600">
          過去に購入した写真の履歴を確認できます。印刷を注文した写真は印刷ステータスも確認できます。
        </p>
      </div>

      {purchases.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
          <p className="text-gray-500">購入履歴がありません</p>
          <Link
            href="/dashboard/photos"
            className="mt-4 inline-block rounded-md bg-milab-600 px-4 py-2 text-sm font-medium text-white hover:bg-milab-700 focus:outline-none focus:ring-2 focus:ring-milab-500 focus:ring-offset-2"
          >
            写真を探す
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {purchases.map((purchase) => (
            <div key={purchase.id} className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
              {/* 購入概要 */}
              <div
                className="flex cursor-pointer flex-wrap items-center justify-between gap-4 border-b border-gray-200 bg-gray-50 p-4"
                onClick={() => togglePurchaseDetails(purchase.id)}
              >
                <div>
                  <p className="text-sm font-medium text-gray-500">注文番号: {purchase.id}</p>
                  <p className="mt-1 text-sm text-gray-500">購入日: {formatDate(purchase.date)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(
                      purchase.status
                    )}`}
                  >
                    {purchase.status === 'completed'
                      ? '完了'
                      : purchase.status === 'processing'
                      ? '処理中'
                      : '発送済み'}
                  </span>
                  <p className="text-base font-medium text-gray-900">¥{purchase.totalAmount}</p>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 text-gray-500 transition-transform ${
                      expandedPurchase === purchase.id ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {/* 購入詳細 */}
              {expandedPurchase === purchase.id && (
                <div className="p-4">
                  <h3 className="mb-4 text-lg font-medium text-gray-900">購入アイテム</h3>
                  <ul className="divide-y divide-gray-200">
                    {purchase.items.map((item) => (
                      <li key={item.id} className="py-4">
                        <div className="flex flex-col gap-4 sm:flex-row">
                          <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md">
                            <img
                              src={item.thumbnailUrl}
                              alt={item.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex flex-1 flex-col">
                            <div className="flex justify-between">
                              <div>
                                <h4 className="text-base font-medium text-gray-900">{item.title}</h4>
                                <p className="mt-1 text-sm text-gray-500">{item.eventName}</p>
                              </div>
                              <p className="text-base font-medium text-gray-900">¥{item.price + item.printPrice}</p>
                            </div>
                            <div className="mt-2">
                              <p className="text-sm text-gray-500">
                                印刷オプション:{' '}
                                {item.printOption === 'none'
                                  ? 'なし'
                                  : item.printOption === 'l'
                                  ? 'L判'
                                  : '2L判'}
                                {item.printOption !== 'none' && ` (¥${item.printPrice})`}
                              </p>
                              {item.printStatus && (
                                <div className="mt-1">
                                  <span
                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getPrintStatusBadgeClass(
                                      item.printStatus
                                    )}`}
                                  >
                                    印刷ステータス:{' '}
                                    {item.printStatus === 'pending'
                                      ? '待機中'
                                      : item.printStatus === 'printing'
                                      ? '印刷中'
                                      : item.printStatus === 'completed'
                                      ? '印刷完了'
                                      : '発送済み'}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="mt-4 flex justify-end">
                              <Link
                                href={`/dashboard/photos/${item.photoId}`}
                                className="text-sm font-medium text-milab-600 hover:text-milab-500"
                              >
                                写真を表示
                              </Link>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 