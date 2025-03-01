'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

// 動的レンダリングに設定
export const dynamic = 'force-dynamic'

// イベントの型定義
interface Event {
  id: string
  name: string
  date: string
  isParticipating: boolean
}

// 参加イベントデータの型定義を追加
interface EventData {
  eventId: string;
  eventName: string;
  // 他に必要なプロパティがあれば追加
}

// ユーザー参加データの型定義
interface ParticipationData {
  EventTbl: EventData;
  eventSlotId: string;
  // 他に必要なプロパティがあれば追加
}

// イベント参加情報の型定義
interface EventParticipation {
  eventSlotId: string;
}

// Supabaseのレスポンス型を定義
interface SupabaseResponse {
  data: any;
  error: any;
}

export default function UserProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [faceImage, setFaceImage] = useState<string | null>(null)
  const [newFaceImage, setNewFaceImage] = useState<File | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const supabase = createClient()
        
        // ユーザー情報を取得
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          setError('ユーザー情報が取得できませんでした')
          setIsLoading(false)
          return
        }
        
        setUser(user)
        
        // ユーザーの顔写真を取得
        const { data: userData, error: userError } = await supabase
          .from('UserTbl')
          .select('*')
          .eq('userId', user.id)
          .single()
        
        if (userError && userError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          throw userError
        }
        
        if (userData?.faceImageUrl) {
          setFaceImage(userData.faceImageUrl)
        }
        
        // 参加可能なイベント一覧を取得（ハッカソンデモ用のモックデータ）
        const mockEvents: Event[] = [
          { id: 'event-1', name: '保育園夏祭り 2023', date: '2023-07-15', isParticipating: false },
          { id: 'event-2', name: '運動会 2023', date: '2023-10-10', isParticipating: false },
          { id: 'event-3', name: 'クリスマス会 2023', date: '2023-12-20', isParticipating: false },
          { id: 'event-4', name: '卒園式 2024', date: '2024-03-15', isParticipating: false },
        ]
        
        // ユーザーの参加イベントを取得
        const { data: participations, error: participationError } = await supabase
          .from('User_ParticipationTbl')
          .select('eventSlotId')
          .eq('userId', user.id)
        
        if (participationError) {
          throw participationError
        }
        
        // 参加イベントをマーク
        if (participations) {
          const typedParticipations = participations as EventParticipation[];
          const participatingEventIds = typedParticipations.map(p => p.eventSlotId.split('-')[0]) // 仮定: eventSlotIdはeventId-slotIdの形式
          const updatedEvents = mockEvents.map(event => ({
            ...event,
            isParticipating: participatingEventIds.includes(event.id)
          }))
          setEvents(updatedEvents)
        } else {
          setEvents(mockEvents)
        }
      } catch (err) {
        console.error('ユーザーデータ取得エラー:', err)
        setError('ユーザーデータの取得中にエラーが発生しました')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchUserData()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setNewFaceImage(e.target.files[0])
      
      // プレビュー表示
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setFaceImage(event.target.result as string)
        }
      }
      reader.readAsDataURL(e.target.files[0])
    }
  }

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleEventToggle = (eventId: string) => {
    setEvents(events.map(event => 
      event.id === eventId 
        ? { ...event, isParticipating: !event.isParticipating } 
        : event
    ))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    setSuccessMessage(null)
    
    try {
      const supabase = createClient()
      
      // 顔写真のアップロード
      if (newFaceImage) {
        const timestamp = new Date().getTime()
        const filePath = `users/${user.id}/face-${timestamp}.jpg`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('profiles')
          .upload(filePath, newFaceImage, {
            cacheControl: '3600',
            upsert: true
          })
        
        if (uploadError) {
          throw uploadError
        }
        
        // 公開URLを取得
        const { data: { publicUrl } } = supabase.storage
          .from('profiles')
          .getPublicUrl(filePath)
        
        // ユーザー情報を更新
        const updateResponse = await supabase
          .from('UserTbl')
          .update({
            userId: user.id,
            faceImageUrl: publicUrl
          })
          .eq('userId', user.id) as SupabaseResponse;
        
        if (updateResponse.error) {
          // レコードが存在しない場合は挿入
          const insertResponse = await supabase
            .from('UserTbl')
            .insert({
              userId: user.id,
              faceImageUrl: publicUrl
            }) as SupabaseResponse;
          
          if (insertResponse.error) {
            throw insertResponse.error;
          }
        }
      }
      
      // 参加イベントの更新
      const participatingEvents = events.filter(event => event.isParticipating)
      
      // 既存の参加情報を削除
      const deleteResponse = await supabase
        .from('User_ParticipationTbl')
        .delete()
        .eq('userId', user.id) as SupabaseResponse;
      
      if (deleteResponse.error) {
        throw deleteResponse.error;
      }
      
      // 新しい参加情報を追加
      if (participatingEvents.length > 0) {
        const participations = participatingEvents.map(event => ({
          userId: user.id,
          eventSlotId: `${event.id}-main`, // 仮定: メインスロットのIDを生成
          facilityId: 'facility-1', // ダミーデータ
          seatBlockId: 'block-1', // ダミーデータ
          seatLineId: 'line-1', // ダミーデータ
          seatRowId: 'row-1' // ダミーデータ
        }));
        
        const insertResponse = await supabase
          .from('User_ParticipationTbl')
          .insert(participations) as SupabaseResponse;
        
        if (insertResponse.error) {
          throw insertResponse.error;
        }
      }
      
      setSuccessMessage('プロフィール情報が正常に保存されました')
    } catch (err) {
      console.error('保存エラー:', err)
      setError('プロフィール情報の保存中にエラーが発生しました')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-milab-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">ユーザー情報を読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">ユーザープロフィール</h1>
        <p className="mt-1 text-gray-600">
          顔写真のアップロードと参加イベントの選択ができます。顔写真は写真検索に使用されます。
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>エラーが発生しました</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <AlertTitle>成功</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* 顔写真アップロード */}
        <Card>
          <CardHeader>
            <CardTitle>顔写真</CardTitle>
            <CardDescription>
              あなたの顔写真をアップロードすると、写真検索時に自動的にあなたが写っている写真を見つけることができます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="mb-4 h-48 w-48 overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
                {faceImage ? (
                  <Image
                    src={faceImage}
                    alt="顔写真"
                    width={192}
                    height={192}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-24 w-24 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                aria-label="顔写真ファイル選択"
              />
              <Button
                variant="outline"
                onClick={handleBrowseClick}
                className="mt-2"
              >
                写真を選択
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 参加イベント選択 */}
        <Card>
          <CardHeader>
            <CardTitle>参加イベント</CardTitle>
            <CardDescription>
              あなたが参加したイベントを選択してください。選択したイベントの写真が表示されます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`event-${event.id}`}
                    checked={event.isParticipating}
                    onCheckedChange={() => handleEventToggle(event.id)}
                  />
                  <Label
                    htmlFor={`event-${event.id}`}
                    className="flex flex-col cursor-pointer"
                  >
                    <span className="font-medium">{event.name}</span>
                    <span className="text-sm text-gray-500">{event.date}</span>
                  </Label>
                </div>
              ))}
              
              {events.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  参加可能なイベントがありません
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? '保存中...' : '変更を保存'}
        </Button>
      </div>
    </div>
  )
} 