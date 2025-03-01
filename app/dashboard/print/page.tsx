'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

// 印刷ジョブの型定義
interface PrintJob {
  id: string
  photoId: string
  photoUrl: string
  status: 'pending' | 'printing' | 'completed' | 'failed'
  createdAt: string
  updatedAt: string
  printSize: string
  printType: string
  userName: string
  userEmail: string
}

export default function PrintPage() {
  const [printJobs, setPrintJobs] = useState<PrintJob[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 印刷ジョブの取得
  useEffect(() => {
    const fetchPrintJobs = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const supabase = createClient()
        
        // 印刷ジョブの取得（ハッカソンデモ用のモックデータ）
        // 実際の実装では、Supabaseからデータを取得する
        const mockJobs: PrintJob[] = [
          {
            id: '1',
            photoId: 'photo-1',
            photoUrl: 'https://source.unsplash.com/random/300x300?sig=1',
            status: 'completed',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            updatedAt: new Date(Date.now() - 3540000).toISOString(),
            printSize: 'L判',
            printType: '光沢',
            userName: '山田太郎',
            userEmail: 'yamada@example.com',
          },
          {
            id: '2',
            photoId: 'photo-2',
            photoUrl: 'https://source.unsplash.com/random/300x300?sig=2',
            status: 'printing',
            createdAt: new Date(Date.now() - 1800000).toISOString(),
            updatedAt: new Date(Date.now() - 1800000).toISOString(),
            printSize: 'L判',
            printType: 'マット',
            userName: '佐藤花子',
            userEmail: 'sato@example.com',
          },
          {
            id: '3',
            photoId: 'photo-3',
            photoUrl: 'https://source.unsplash.com/random/300x300?sig=3',
            status: 'pending',
            createdAt: new Date(Date.now() - 900000).toISOString(),
            updatedAt: new Date(Date.now() - 900000).toISOString(),
            printSize: '2L判',
            printType: '光沢',
            userName: '鈴木一郎',
            userEmail: 'suzuki@example.com',
          },
          {
            id: '4',
            photoId: 'photo-4',
            photoUrl: 'https://source.unsplash.com/random/300x300?sig=4',
            status: 'failed',
            createdAt: new Date(Date.now() - 7200000).toISOString(),
            updatedAt: new Date(Date.now() - 7140000).toISOString(),
            printSize: 'L判',
            printType: '光沢',
            userName: '高橋次郎',
            userEmail: 'takahashi@example.com',
          },
        ]

        setPrintJobs(mockJobs)
      } catch (err) {
        console.error('印刷ジョブ取得エラー:', err)
        setError('印刷ジョブの取得中にエラーが発生しました')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPrintJobs()
  }, [])

  // 印刷ジョブの再実行
  const retryPrintJob = async (jobId: string) => {
    try {
      // 印刷ジョブのステータスを更新
      setPrintJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === jobId ? { ...job, status: 'printing', updatedAt: new Date().toISOString() } : job
        )
      )

      // 実際の印刷処理の実行（ハッカソンデモ用の擬似処理）
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // 印刷ジョブのステータスを更新
      setPrintJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === jobId ? { ...job, status: 'completed', updatedAt: new Date().toISOString() } : job
        )
      )
    } catch (err) {
      console.error(`印刷ジョブ再実行エラー (${jobId}):`, err)
      
      // エラー状態に更新
      setPrintJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === jobId ? { ...job, status: 'failed', updatedAt: new Date().toISOString() } : job
        )
      )
    }
  }

  // ステータスに応じたバッジの色を返す
  const getStatusBadgeClass = (status: PrintJob['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'printing':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // 日時をフォーマットする
  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString)
    return date.toLocaleString('ja-JP')
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-milab-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">印刷ジョブを読み込み中...</p>
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
        <h1 className="text-2xl font-bold text-gray-900">印刷ステータス</h1>
        <p className="mt-1 text-gray-600">
          印刷ジョブの状態を確認できます。失敗したジョブは再実行できます。
        </p>
      </div>

      {printJobs.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
          <p className="text-gray-500">印刷ジョブがありません</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  写真
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  ユーザー
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  印刷サイズ
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  ステータス
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  作成日時
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  更新日時
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">アクション</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {printJobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    <div className="h-12 w-12 overflow-hidden rounded-md">
                      <img
                        src={job.photoUrl}
                        alt={`写真 ${job.photoId}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div>{job.userName}</div>
                    <div className="text-xs text-gray-400">{job.userEmail}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {job.printSize} ({job.printType})
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(
                        job.status
                      )}`}
                    >
                      {job.status === 'pending'
                        ? '待機中'
                        : job.status === 'printing'
                        ? '印刷中'
                        : job.status === 'completed'
                        ? '完了'
                        : '失敗'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {formatDateTime(job.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {formatDateTime(job.updatedAt)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    {job.status === 'failed' && (
                      <button
                        onClick={() => retryPrintJob(job.id)}
                        className="text-milab-600 hover:text-milab-900"
                      >
                        再実行
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
} 