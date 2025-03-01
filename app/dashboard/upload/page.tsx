'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { PostgrestResponse } from '@supabase/supabase-js'

// 動的レンダリングに設定
export const dynamic = 'force-dynamic'

// TypeScriptの型定義を拡張
declare module 'react' {
  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    // ディレクトリ選択のための非標準属性
    webkitdirectory?: string;
    directory?: string;
  }
}

export default function UploadPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const eventId = searchParams.get('eventId')
  
  const [files, setFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<number[]>([])
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [user, setUser] = useState<any>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      
      if (!data.user) {
        router.push('/login')
        return
      }
      
      setUser(data.user)
    }
    
    checkAuth()
  }, [router])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files)
      setFiles(selectedFiles)
      setUploadProgress(new Array(selectedFiles.length).fill(0))
      setUploadStatus('idle')
      setErrorMessage('')
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files)
      setFiles(droppedFiles)
      setUploadProgress(new Array(droppedFiles.length).fill(0))
      setUploadStatus('idle')
      setErrorMessage('')
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const uploadFile = async (file: File, index: number) => {
    try {
      const supabase = createClient()
      
      // ファイル名を一意にするためにタイムスタンプを追加
      const timestamp = new Date().getTime()
      const fileExt = file.name.split('.').pop()
      const fileName = `${timestamp}-${file.name}`
      const filePath = `${eventId}/${fileName}`
      
      // アップロード開始時に進捗を設定
      const newProgress = [...uploadProgress]
      newProgress[index] = 10 // アップロード開始を示す初期値
      setUploadProgress(newProgress)
      
      // Storageにアップロード
      const uploadResponse = await supabase.storage
        .from('photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })
      
      // アップロード完了時に進捗を100%に設定
      const completedProgress = [...uploadProgress]
      completedProgress[index] = 100
      setUploadProgress(completedProgress)
      
      // 型ガードを追加して安全にアクセス
      if ('error' in uploadResponse && uploadResponse.error) {
        console.error('アップロードエラー:', uploadResponse.error)
        setUploadStatus('error')
        setErrorMessage('写真のアップロードに失敗しました')
        return false
      }
      
      // OriginalPhotoTBLにデータを保存
      const response = await supabase.from('original_photos').insert([
        {
          storage_url: filePath,
          file_name: file.name,
          event_id: eventId,
          photographer_id: user.id,
          upload_date: new Date().toISOString(),
          status: 'uploaded',
          metadata: JSON.stringify({
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
          }),
        },
      ])
      
      // 型ガードを追加して安全にアクセス
      if ('error' in response && response.error) {
        console.error('データベース保存エラー:', response.error)
        setUploadStatus('error')
        setErrorMessage('写真のメタデータの保存に失敗しました')
        return false
      }
      
      return true
    } catch (error) {
      console.error('アップロード処理エラー:', error)
      setUploadStatus('error')
      setErrorMessage('写真のアップロード中にエラーが発生しました')
      return false
    }
  }

  const handleUpload = async () => {
    if (files.length === 0) return
    
    setUploadStatus('uploading')
    setErrorMessage('')
    
    let success = true
    
    for (let i = 0; i < files.length; i++) {
      const result = await uploadFile(files[i], i)
      if (!result) {
        success = false
        break
      }
    }
    
    if (success) {
      setUploadStatus('success')
    }
  }

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleBackToEvent = () => {
    router.push(`/dashboard/events/${eventId}`)
  }

  return (
    <div className="p-6">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>写真アップロード</CardTitle>
          <CardDescription>
            イベントの写真をアップロードします。複数の写真を一度に選択できます。
          </CardDescription>
        </CardHeader>
        <CardContent>
          {uploadStatus === 'error' && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>エラーが発生しました</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          
          {uploadStatus === 'success' && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <AlertTitle>アップロード完了</AlertTitle>
              <AlertDescription>すべての写真のアップロードが完了しました。</AlertDescription>
            </Alert>
          )}
          
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={handleBrowseClick}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              accept="image/*"
              className="hidden"
              aria-label="写真ファイル選択"
            />
            <div className="flex flex-col items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-400 mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-lg font-medium text-gray-700">
                ここに写真をドラッグ&ドロップ
              </p>
              <p className="text-sm text-gray-500 mt-1">または</p>
              <Button
                variant="outline"
                className="mt-2"
                onClick={(e) => {
                  e.stopPropagation()
                  handleBrowseClick()
                }}
              >
                写真を選択
              </Button>
            </div>
          </div>
          
          {files.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                選択された写真 ({files.length}枚)
              </h3>
              <div className="space-y-3">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm text-gray-700 truncate">{file.name}</p>
                      <Progress value={uploadProgress[index]} className="h-2 mt-1" />
                    </div>
                    <span className="ml-2 text-xs text-gray-500">
                      {uploadProgress[index]}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleBackToEvent}>
            イベントに戻る
          </Button>
          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || uploadStatus === 'uploading'}
          >
            {uploadStatus === 'uploading' ? 'アップロード中...' : 'アップロード開始'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 