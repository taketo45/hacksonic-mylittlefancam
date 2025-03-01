'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// バッチ処理の定義
interface BatchJob {
  id: string
  name: string
  description: string
  status: 'idle' | 'running' | 'completed' | 'failed'
  lastRun: string | null
  duration: number | null
}

export default function BatchPage() {
  // バッチジョブの状態管理
  const [batchJobs, setBatchJobs] = useState<BatchJob[]>([
    {
      id: 'face-recognition',
      name: '顔一致確認処理',
      description: '写真から顔を検出し、登録済みの顔と一致するか確認します',
      status: 'idle',
      lastRun: null,
      duration: null,
    },
    {
      id: 'notification',
      name: '写真購入可能通知',
      description: '顔一致が確認された写真について、ユーザーに通知を送信します',
      status: 'idle',
      lastRun: null,
      duration: null,
    },
    {
      id: 'face-position',
      name: '顔位置判定/フレーム付与',
      description: '写真内の顔の位置を検出し、最適なフレームを付与します',
      status: 'idle',
      lastRun: null,
      duration: null,
    },
    {
      id: 'expression-analysis',
      name: '表情分析/おすすめ写真抽出',
      description: '写真内の表情を分析し、ポジティブな表情の写真をおすすめとして抽出します',
      status: 'idle',
      lastRun: null,
      duration: null,
    },
  ])

  // バッチジョブの実行
  const runBatchJob = async (jobId: string) => {
    // 実行中のジョブを更新
    setBatchJobs((prevJobs) =>
      prevJobs.map((job) =>
        job.id === jobId
          ? { ...job, status: 'running', lastRun: new Date().toISOString(), duration: null }
          : job
      )
    )

    try {
      // 実際のバッチ処理の実行（ハッカソンデモ用の擬似処理）
      const supabase = createClient()
      
      // ジョブの種類に応じた処理
      switch (jobId) {
        case 'face-recognition':
          // 顔一致確認処理の擬似実装
          await new Promise((resolve) => setTimeout(resolve, 3000))
          
          // ジョブ完了を記録
          await supabase.from('batch_jobs').insert({
            job_id: jobId,
            status: 'completed',
            started_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
            result: { processed: 15, matched: 8 },
          })
          break
          
        case 'notification':
          // 写真購入可能通知の擬似実装
          await new Promise((resolve) => setTimeout(resolve, 2000))
          
          // ジョブ完了を記録
          await supabase.from('batch_jobs').insert({
            job_id: jobId,
            status: 'completed',
            started_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
            result: { notifications_sent: 5 },
          })
          break
          
        case 'face-position':
          // 顔位置判定/フレーム付与の擬似実装
          await new Promise((resolve) => setTimeout(resolve, 4000))
          
          // ジョブ完了を記録
          await supabase.from('batch_jobs').insert({
            job_id: jobId,
            status: 'completed',
            started_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
            result: { processed: 8, framed: 8 },
          })
          break
          
        case 'expression-analysis':
          // 表情分析/おすすめ写真抽出の擬似実装
          await new Promise((resolve) => setTimeout(resolve, 5000))
          
          // ジョブ完了を記録
          await supabase.from('batch_jobs').insert({
            job_id: jobId,
            status: 'completed',
            started_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
            result: { analyzed: 8, recommended: 3 },
          })
          break
      }

      // 完了状態に更新
      const endTime = new Date()
      const startTime = new Date(
        batchJobs.find((job) => job.id === jobId)?.lastRun || endTime.toISOString()
      )
      const durationInSeconds = (endTime.getTime() - startTime.getTime()) / 1000

      setBatchJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === jobId
            ? { ...job, status: 'completed', duration: durationInSeconds }
            : job
        )
      )
    } catch (error) {
      console.error(`バッチジョブ実行エラー (${jobId}):`, error)
      
      // エラー状態に更新
      setBatchJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === jobId ? { ...job, status: 'failed', duration: null } : job
        )
      )
    }
  }

  // 全てのバッチジョブを実行
  const runAllBatchJobs = async () => {
    for (const job of batchJobs) {
      await runBatchJob(job.id)
    }
  }

  // ステータスに応じたバッジの色を返す
  const getStatusBadgeClass = (status: BatchJob['status']) => {
    switch (status) {
      case 'idle':
        return 'bg-gray-100 text-gray-800'
      case 'running':
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
  const formatDateTime = (dateTimeString: string | null) => {
    if (!dateTimeString) return '-'
    const date = new Date(dateTimeString)
    return date.toLocaleString('ja-JP')
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">バッチ処理管理</h1>
          <p className="mt-1 text-gray-600">
            各種バッチ処理の実行と状態確認ができます。
          </p>
        </div>
        <button
          onClick={runAllBatchJobs}
          disabled={batchJobs.some((job) => job.status === 'running')}
          className="rounded-md bg-milab-600 px-4 py-2 text-sm font-medium text-white hover:bg-milab-700 focus:outline-none focus:ring-2 focus:ring-milab-500 focus:ring-offset-2 disabled:opacity-50"
        >
          全てのバッチを実行
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                バッチ名
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                説明
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
                最終実行
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                実行時間
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">アクション</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {batchJobs.map((job) => (
              <tr key={job.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {job.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{job.description}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(
                      job.status
                    )}`}
                  >
                    {job.status === 'idle'
                      ? '待機中'
                      : job.status === 'running'
                      ? '実行中'
                      : job.status === 'completed'
                      ? '完了'
                      : '失敗'}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {formatDateTime(job.lastRun)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {job.duration !== null ? `${job.duration.toFixed(1)}秒` : '-'}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <button
                    onClick={() => runBatchJob(job.id)}
                    disabled={job.status === 'running'}
                    className="text-milab-600 hover:text-milab-900 disabled:opacity-50"
                  >
                    {job.status === 'running' ? '実行中...' : '実行'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 