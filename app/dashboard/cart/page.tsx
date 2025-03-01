'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'

// 写真の型定義
interface CartItem {
  id: string
  photoId: string
  photoUrl: string
  thumbnailUrl: string
  title: string
  eventName: string
  price: number
  printOption: 'none' | 'l' | '2l'
  printPrice: number
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // カート内の写真を取得
  useEffect(() => {
    const fetchCartItems = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const supabase = createClient()
        
        // カート内の写真を取得（ハッカソンデモ用のモックデータ）
        const mockCartItems: CartItem[] = [
          {
            id: 'cart-1',
            photoId: 'photo-1',
            photoUrl: 'https://picsum.photos/800/600?random=401',
            thumbnailUrl: 'https://picsum.photos/400/300?random=401',
            title: '写真 1',
            eventName: '保育園夏祭り 2023',
            price: 500,
            printOption: 'none',
            printPrice: 0,
          },
          {
            id: 'cart-2',
            photoId: 'photo-2',
            photoUrl: 'https://picsum.photos/800/600?random=402',
            thumbnailUrl: 'https://picsum.photos/400/300?random=402',
            title: '写真 2',
            eventName: '保育園夏祭り 2023',
            price: 500,
            printOption: 'l',
            printPrice: 200,
          },
          {
            id: 'cart-3',
            photoId: 'photo-3',
            photoUrl: 'https://picsum.photos/800/600?random=403',
            thumbnailUrl: 'https://picsum.photos/400/300?random=403',
            title: '写真 3',
            eventName: '運動会 2023',
            price: 500,
            printOption: '2l',
            printPrice: 300,
          },
        ]
        
        setCartItems(mockCartItems)
      } catch (err) {
        console.error('カート取得エラー:', err)
        setError('カートの取得中にエラーが発生しました')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCartItems()
  }, [])

  // 印刷オプションを変更
  const handlePrintOptionChange = (itemId: string, option: 'none' | 'l' | '2l') => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === itemId) {
          const printPrice = option === 'none' ? 0 : option === 'l' ? 200 : 300
          return { ...item, printOption: option, printPrice }
        }
        return item
      })
    )
  }

  // カートから削除
  const handleRemoveFromCart = (itemId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId))
  }

  // 購入処理
  const handlePurchase = async () => {
    if (cartItems.length === 0) return
    
    setIsProcessing(true)
    
    try {
      // 実際の実装では、Stripeなどの決済処理を行う
      // ここではモック実装として、単に待機する
      await new Promise((resolve) => setTimeout(resolve, 2000))
      
      // 成功メッセージを表示
      alert('購入が完了しました！')
      
      // カートをクリア
      setCartItems([])
    } catch (err) {
      console.error('購入処理エラー:', err)
      setError('購入処理中にエラーが発生しました')
    } finally {
      setIsProcessing(false)
    }
  }

  // 合計金額を計算
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price + item.printPrice, 0)
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-milab-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">カートを読み込み中...</p>
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
        <h1 className="text-2xl font-bold text-gray-900">カート</h1>
        <p className="mt-1 text-gray-600">
          購入する写真を確認し、必要に応じて印刷オプションを選択してください。
        </p>
      </div>

      {cartItems.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
          <p className="text-gray-500">カートに写真がありません</p>
          <Link
            href="/dashboard/photos"
            className="mt-4 inline-block rounded-md bg-milab-600 px-4 py-2 text-sm font-medium text-white hover:bg-milab-700 focus:outline-none focus:ring-2 focus:ring-milab-500 focus:ring-offset-2"
          >
            写真を探す
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* カート内の写真一覧 */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
              <ul className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <li key={item.id} className="p-4">
                    <div className="flex flex-col gap-4 sm:flex-row">
                      <div className="h-32 w-32 flex-shrink-0 overflow-hidden rounded-md">
                        <Image
                          src={item.thumbnailUrl}
                          alt={item.title}
                          width={128}
                          height={128}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="text-base font-medium text-gray-900">{item.title}</h3>
                            <p className="mt-1 text-sm text-gray-500">{item.eventName}</p>
                          </div>
                          <p className="text-base font-medium text-gray-900">¥{item.price}</p>
                        </div>
                        <div className="mt-4 flex flex-1 items-end justify-between">
                          <div>
                            <label htmlFor={`print-option-${item.id}`} className="mr-2 text-sm font-medium text-gray-700">
                              印刷オプション:
                            </label>
                            <select
                              id={`print-option-${item.id}`}
                              value={item.printOption}
                              onChange={(e) => handlePrintOptionChange(item.id, e.target.value as any)}
                              className="rounded-md border-gray-300 shadow-sm focus:border-milab-500 focus:ring-milab-500 sm:text-sm"
                            >
                              <option value="none">印刷なし</option>
                              <option value="l">L判 (+¥200)</option>
                              <option value="2l">2L判 (+¥300)</option>
                            </select>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFromCart(item.id)}
                            className="text-sm font-medium text-red-600 hover:text-red-500"
                          >
                            削除
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 注文サマリー */}
          <div className="lg:col-span-1">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
              <h2 className="text-lg font-medium text-gray-900">注文サマリー</h2>
              <div className="mt-6 space-y-4">
                <div className="flex justify-between">
                  <p className="text-sm text-gray-600">写真 ({cartItems.length}点)</p>
                  <p className="text-sm font-medium text-gray-900">
                    ¥{cartItems.reduce((sum, item) => sum + item.price, 0)}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-600">印刷オプション</p>
                  <p className="text-sm font-medium text-gray-900">
                    ¥{cartItems.reduce((sum, item) => sum + item.printPrice, 0)}
                  </p>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <p className="text-base font-medium text-gray-900">合計</p>
                    <p className="text-base font-medium text-gray-900">¥{calculateTotal()}</p>
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handlePurchase}
                    disabled={isProcessing || cartItems.length === 0}
                    className="w-full rounded-md bg-milab-600 px-4 py-2 text-sm font-medium text-white hover:bg-milab-700 focus:outline-none focus:ring-2 focus:ring-milab-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {isProcessing ? '処理中...' : '購入する'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 