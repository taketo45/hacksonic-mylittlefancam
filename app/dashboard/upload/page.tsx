'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { PostgrestResponse } from '@supabase/supabase-js'
import Image from 'next/image'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

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

// 検出された顔の情報を表す型
interface DetectedFace {
  id: string;
  boundingBox: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  confidence: number;
  matchedUser?: {
    id: string;
    name: string;
    confidence: number;
  };
  selected: boolean;
}

// アップロードファイルの拡張型
interface UploadFile {
  file: File;
  preview: string;
  detectedFaces: DetectedFace[];
  progress: number;
  status: 'idle' | 'analyzing' | 'uploading' | 'success' | 'error';
  error?: string;
}

// 参加者データの型定義を追加
interface UserTbl {
  userId: string;
  userName: string | null;
  faceImageUrl?: string;
}

interface ParticipantData {
  UserTbl: UserTbl;
  userId: string;
  // 他に必要なプロパティがあれば追加
}

export default function UploadPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const eventId = searchParams?.get('eventId') || undefined
  
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'analyzing' | 'uploading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [user, setUser] = useState<any>(null)
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
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
      
      // イベントに参加しているユーザー情報を取得
      if (eventId) {
        try {
          // イベントに参加しているユーザーの顔写真情報を取得
          const { data: participantData, error: participantError } = await supabase
            .from('User_ParticipationTbl')
            .select(`
              userId,
              UserTbl (
                userId,
                userName,
                faceImageUrl
              )
            `)
            .eq('eventSlotId', `${eventId}-main`)
          
          if (participantError) throw participantError
          
          if (participantData && participantData.length > 0) {
            // 顔写真が登録されているユーザーのみをフィルタリング
            const typedParticipantData = participantData as ParticipantData[];
            const usersWithFace = typedParticipantData
              .filter((p) => p.UserTbl && p.UserTbl.faceImageUrl)
              .map((p) => ({
                id: p.UserTbl.userId,
                name: p.UserTbl.userName || '名前なし',
                faceImageUrl: p.UserTbl.faceImageUrl
              }))
            
            setRegisteredUsers(usersWithFace)
          }
        } catch (error) {
          console.error('参加者データ取得エラー:', error)
        }
      }
    }
    
    checkAuth()
  }, [router, eventId])

  // 画像ファイルからプレビューURLを生成
  const createPreviewUrl = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    })
  }

  // 顔検出処理（モック実装 - 実際の環境ではAmazon Rekognitionなどを使用）
  const detectFaces = async (imageUrl: string): Promise<DetectedFace[]> => {
    // 実際の実装では、ここでAmazon Rekognition APIを呼び出す
    // このモック実装では、ランダムな顔検出結果を返す
    
    // 処理時間をシミュレート
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
    
    // ランダムな数の顔を検出
    const faceCount = Math.floor(Math.random() * 4) + 1 // 1〜4人の顔
    const faces: DetectedFace[] = []
    
    for (let i = 0; i < faceCount; i++) {
      // ランダムな位置とサイズの顔を生成
      const left = 0.1 + Math.random() * 0.7
      const top = 0.1 + Math.random() * 0.7
      const width = 0.1 + Math.random() * 0.2
      const height = width * (1 + Math.random() * 0.2)
      
      const face: DetectedFace = {
        id: `face-${Date.now()}-${i}`,
        boundingBox: {
          left,
          top,
          width,
          height
        },
        confidence: 0.7 + Math.random() * 0.3,
        selected: true
      }
      
      // ランダムにユーザーとマッチング（実際の実装では顔認識APIの結果を使用）
      if (registeredUsers.length > 0 && Math.random() > 0.3) {
        const randomUser = registeredUsers[Math.floor(Math.random() * registeredUsers.length)]
        face.matchedUser = {
          id: randomUser.id,
          name: randomUser.name,
          confidence: 0.6 + Math.random() * 0.4
        }
      }
      
      faces.push(face)
    }
    
    return faces
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsAnalyzing(true)
      setUploadStatus('analyzing')
      setErrorMessage('')
      
      const selectedFiles = Array.from(e.target.files)
      const newUploadFiles: UploadFile[] = []
      
      for (const file of selectedFiles) {
        if (!file.type.startsWith('image/')) continue
        
        const preview = await createPreviewUrl(file)
        
        newUploadFiles.push({
          file,
          preview,
          detectedFaces: [],
          progress: 0,
          status: 'analyzing'
        })
      }
      
      setUploadFiles(newUploadFiles)
      
      // 各ファイルに対して顔検出を実行
      for (let i = 0; i < newUploadFiles.length; i++) {
        try {
          const faces = await detectFaces(newUploadFiles[i].preview)
          
          setUploadFiles(prev => {
            const updated = [...prev]
            updated[i] = {
              ...updated[i],
              detectedFaces: faces,
              status: 'idle'
            }
            return updated
          })
        } catch (error) {
          console.error('顔検出エラー:', error)
          setUploadFiles(prev => {
            const updated = [...prev]
            updated[i] = {
              ...updated[i],
              status: 'error',
              error: '顔検出処理に失敗しました'
            }
            return updated
          })
        }
      }
      
      setIsAnalyzing(false)
      setUploadStatus('idle')
    }
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setIsAnalyzing(true)
      setUploadStatus('analyzing')
      setErrorMessage('')
      
      const droppedFiles = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'))
      const newUploadFiles: UploadFile[] = []
      
      for (const file of droppedFiles) {
        const preview = await createPreviewUrl(file)
        
        newUploadFiles.push({
          file,
          preview,
          detectedFaces: [],
          progress: 0,
          status: 'analyzing'
        })
      }
      
      setUploadFiles(newUploadFiles)
      
      // 各ファイルに対して顔検出を実行
      for (let i = 0; i < newUploadFiles.length; i++) {
        try {
          const faces = await detectFaces(newUploadFiles[i].preview)
          
          setUploadFiles(prev => {
            const updated = [...prev]
            updated[i] = {
              ...updated[i],
              detectedFaces: faces,
              status: 'idle'
            }
            return updated
          })
        } catch (error) {
          console.error('顔検出エラー:', error)
          setUploadFiles(prev => {
            const updated = [...prev]
            updated[i] = {
              ...updated[i],
              status: 'error',
              error: '顔検出処理に失敗しました'
            }
            return updated
          })
        }
      }
      
      setIsAnalyzing(false)
      setUploadStatus('idle')
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const toggleFaceSelection = (fileIndex: number, faceId: string) => {
    setUploadFiles(prev => {
      const updated = [...prev]
      const file = updated[fileIndex]
      
      const updatedFaces = file.detectedFaces.map(face => 
        face.id === faceId ? { ...face, selected: !face.selected } : face
      )
      
      updated[fileIndex] = {
        ...file,
        detectedFaces: updatedFaces
      }
      
      return updated
    })
  }

  const uploadFile = async (fileData: UploadFile, index: number) => {
    try {
      const supabase = createClient()
      
      // ファイル名を一意にするためにタイムスタンプを追加
      const timestamp = new Date().getTime()
      const fileExt = fileData.file.name.split('.').pop()
      const fileName = `${timestamp}-${fileData.file.name}`
      const filePath = `${eventId}/${fileName}`
      
      // アップロード状態を更新
      setUploadFiles(prev => {
        const updated = [...prev]
        updated[index] = {
          ...updated[index],
          progress: 10,
          status: 'uploading'
        }
        return updated
      })
      
      // Storageにアップロード
      const uploadResponse = await supabase.storage
        .from('photos')
        .upload(filePath, fileData.file, {
          cacheControl: '3600',
          upsert: false,
        })
      
      // 型ガードを追加して安全にアクセス
      if ('error' in uploadResponse && uploadResponse.error) {
        console.error('アップロードエラー:', uploadResponse.error)
        
        setUploadFiles(prev => {
          const updated = [...prev]
          updated[index] = {
            ...updated[index],
            status: 'error',
            error: '写真のアップロードに失敗しました'
          }
          return updated
        })
        
        return false
      }
      
      // 進捗を更新
      setUploadFiles(prev => {
        const updated = [...prev]
        updated[index] = {
          ...updated[index],
          progress: 50
        }
        return updated
      })
      
      // 検出された顔情報を整形
      const selectedFaces = fileData.detectedFaces
        .filter(face => face.selected)
        .map(face => ({
          boundingBox: face.boundingBox,
          confidence: face.confidence,
          matchedUserId: face.matchedUser?.id || null,
          matchConfidence: face.matchedUser?.confidence || null
        }))
      
      // OriginalPhotoTBLにデータを保存
      const response = await supabase.from('original_photos').insert([
        {
          storage_url: filePath,
          file_name: fileData.file.name,
          event_id: eventId,
          photographer_id: user.id,
          upload_date: new Date().toISOString(),
          status: 'uploaded',
          metadata: JSON.stringify({
            size: fileData.file.size,
            type: fileData.file.type,
            lastModified: fileData.file.lastModified,
            detectedFaces: selectedFaces
          }),
        },
      ])
      
      // 型ガードを追加して安全にアクセス
      if ('error' in response && response.error) {
        console.error('データベース保存エラー:', response.error)
        
        setUploadFiles(prev => {
          const updated = [...prev]
          updated[index] = {
            ...updated[index],
            status: 'error',
            error: '写真のメタデータの保存に失敗しました'
          }
          return updated
        })
        
        return false
      }
      
      // アップロード完了
      setUploadFiles(prev => {
        const updated = [...prev]
        updated[index] = {
          ...updated[index],
          progress: 100,
          status: 'success'
        }
        return updated
      })
      
      return true
    } catch (error) {
      console.error('アップロード処理エラー:', error)
      
      setUploadFiles(prev => {
        const updated = [...prev]
        updated[index] = {
          ...updated[index],
          status: 'error',
          error: '写真のアップロード中にエラーが発生しました'
        }
        return updated
      })
      
      return false
    }
  }

  const handleUpload = async () => {
    if (uploadFiles.length === 0) return
    
    setUploadStatus('uploading')
    setErrorMessage('')
    
    let success = true
    
    for (let i = 0; i < uploadFiles.length; i++) {
      const result = await uploadFile(uploadFiles[i], i)
      if (!result) {
        success = false
      }
    }
    
    if (success) {
      setUploadStatus('success')
    } else {
      // 一部失敗した場合でも、成功したファイルはそのまま表示
      setUploadStatus('error')
      setErrorMessage('一部の写真のアップロードに失敗しました')
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

  const renderFaceOverlay = (file: UploadFile, fileIndex: number) => {
    return file.detectedFaces.map((face, faceIndex) => {
      const { left, top, width, height } = face.boundingBox
      
      return (
        <div
          key={face.id}
          className={`absolute border-2 ${face.selected ? 'border-green-500' : 'border-red-500'} cursor-pointer`}
          style={{
            left: `${left * 100}%`,
            top: `${top * 100}%`,
            width: `${width * 100}%`,
            height: `${height * 100}%`,
          }}
          onClick={() => toggleFaceSelection(fileIndex, face.id)}
        >
          {face.matchedUser && (
            <div className="absolute -top-6 left-0 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded">
              {face.matchedUser.name} ({Math.round(face.matchedUser.confidence * 100)}%)
            </div>
          )}
        </div>
      )
    })
  }

  return (
    <div className="p-6">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>写真アップロード</CardTitle>
          <CardDescription>
            イベントの写真をアップロードします。顔認識機能により、写真に写っている人物を自動的に検出します。
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
          
          {uploadFiles.length === 0 && (
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
          )}
          
          {isAnalyzing && (
            <div className="mt-4 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-milab-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">写真を分析中...</p>
            </div>
          )}
          
          {uploadFiles.length > 0 && (
            <div className="mt-4 space-y-6">
              <h3 className="text-lg font-medium">アップロード予定の写真 ({uploadFiles.length}枚)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {uploadFiles.map((file, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden">
                    <div className="relative">
                      <div className="aspect-w-16 aspect-h-9 relative">
                        <Image
                          src={file.preview}
                          alt={`プレビュー ${index + 1}`}
                          width={400}
                          height={225}
                          className="object-cover"
                        />
                        {renderFaceOverlay(file, index)}
                      </div>
                      
                      {file.status === 'analyzing' && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <div className="text-white text-center">
                            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-white mx-auto"></div>
                            <p className="mt-2">顔を検出中...</p>
                          </div>
                        </div>
                      )}
                      
                      {file.status === 'uploading' && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <div className="text-white text-center w-3/4">
                            <p className="mb-1">アップロード中...</p>
                            <Progress value={file.progress} className="h-2" />
                          </div>
                        </div>
                      )}
                      
                      {file.status === 'success' && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                      
                      {file.status === 'error' && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-3">
                      <p className="text-sm font-medium truncate">{file.file.name}</p>
                      
                      {file.detectedFaces.length > 0 ? (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">
                            検出された顔: {file.detectedFaces.length}人
                            （選択済み: {file.detectedFaces.filter(f => f.selected).length}人）
                          </p>
                          
                          {file.detectedFaces.map(face => (
                            <div key={face.id} className="flex items-center mt-1">
                              <Checkbox
                                id={`face-${face.id}`}
                                checked={face.selected}
                                onCheckedChange={() => toggleFaceSelection(index, face.id)}
                              />
                              <Label
                                htmlFor={`face-${face.id}`}
                                className="ml-2 text-xs cursor-pointer"
                              >
                                {face.matchedUser 
                                  ? `${face.matchedUser.name} (${Math.round(face.matchedUser.confidence * 100)}%)`
                                  : '未特定の人物'}
                              </Label>
                            </div>
                          ))}
                        </div>
                      ) : file.status !== 'analyzing' ? (
                        <p className="text-xs text-gray-500 mt-2">顔が検出されませんでした</p>
                      ) : null}
                      
                      {file.error && (
                        <p className="text-xs text-red-500 mt-1">{file.error}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBackToEvent}
          >
            イベントに戻る
          </Button>
          
          {uploadFiles.length > 0 && (
            <Button
              onClick={handleUpload}
              disabled={
                uploadStatus === 'uploading' ||
                uploadStatus === 'analyzing' ||
                isAnalyzing ||
                uploadFiles.every(f => f.status === 'success')
              }
            >
              {uploadStatus === 'uploading' ? 'アップロード中...' : 'アップロード開始'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
} 