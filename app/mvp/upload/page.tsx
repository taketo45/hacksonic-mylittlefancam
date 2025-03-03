// app/mvp/upload/page.tsx
// Server Componentsを活用したSupabaseへの写真アップロード機能のサンプル実装

import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import UploadForm from './upload-form'
import { uploadPhoto } from './actions'

// 動的レンダリングに設定
export const dynamic = 'force-dynamic'

// サンプル用の固定値
export const SAMPLE_USER_ID = 'sample-user-123'
export const SAMPLE_EVENT_ID = 'sample-event-456'
export const SAMPLE_EVENT_DATE = '2025-01-01'
export const SAMPLE_EVENT_SLOT = 'morning'

// アップロード済み写真を表示するコンポーネント
async function UploadedPhotos() {
  const supabase = createClient()
  
  // Storageから写真のリストを取得
  const folderPath = `${SAMPLE_EVENT_DATE}/${SAMPLE_EVENT_ID}/${SAMPLE_EVENT_SLOT}/${SAMPLE_USER_ID}`
  const { data: files, error } = await supabase.storage
    .from('photos')
    .list(folderPath)
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>エラー</AlertTitle>
        <AlertDescription>写真の取得に失敗しました: {error.message}</AlertDescription>
      </Alert>
    )
  }
  
  if (!files || files.length === 0) {
    return (
      <Alert>
        <AlertTitle>情報</AlertTitle>
        <AlertDescription>アップロードされた写真はありません</AlertDescription>
      </Alert>
    )
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
      {files.map((file) => {
        if (file.name === '.keep') return null
        
        const { data: { publicUrl } } = supabase.storage
          .from('photos')
          .getPublicUrl(`${folderPath}/${file.name}`)
        
        return (
          <Card key={file.name}>
            <CardContent className="p-4">
              <div className="relative aspect-square overflow-hidden rounded-md">
                <Image
                  src={publicUrl}
                  alt={file.name}
                  fill
                  className="object-cover"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-sm text-gray-500 truncate max-w-[200px]">{file.name}</p>
              <p className="text-sm text-gray-500">{Math.round(file.metadata?.size / 1024)} KB</p>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}

// メインページコンポーネント
export default function UploadPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>写真アップロード</CardTitle>
          <CardDescription>
            サンプルアップロードページ（認証なし）
            <br />
            イベント: サンプルイベント（{SAMPLE_EVENT_ID}）
            <br />
            日付: {SAMPLE_EVENT_DATE}
            <br />
            枠: {SAMPLE_EVENT_SLOT}
            <br />
            ユーザー: サンプルユーザー（{SAMPLE_USER_ID}）
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UploadForm uploadAction={uploadPhoto} />
        </CardContent>
        <CardFooter>
          <Link href="/" className="text-sm text-blue-500 hover:underline">
            ホームに戻る
          </Link>
        </CardFooter>
      </Card>
      
      <h2 className="text-2xl font-bold mb-4">アップロード済み写真</h2>
      <Suspense fallback={<div>写真を読み込み中...</div>}>
        <UploadedPhotos />
      </Suspense>
    </div>
  )
}
