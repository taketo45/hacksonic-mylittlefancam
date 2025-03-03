'use client';

import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadCloud, CheckCircle, AlertCircle, RefreshCw, X } from 'lucide-react';

// 写真アップロードページ
export default function PhotoUploadPage() {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadHistory, setUploadHistory] = useState<Array<{
    id: string;
    fileName: string;
    status: 'completed' | 'failed' | 'uploading';
    url?: string;
    error?: string;
    timestamp: string;
  }>>([]);
  
  // イベント関連の状態
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<Array<{ id: string; eventName: string }>>([]);
  const [eventSlots, setEventSlots] = useState<Array<{ id: string; eventSlotName: string }>>([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedEventSlot, setSelectedEventSlot] = useState('');

  // ファイル選択ハンドラー
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(filesArray);
    }
  };

  // ファイルアップロード関数
  const uploadFile = async (file: File) => {
    try {
      setUploading(true);
      
      // FormDataを作成
      const formData = new FormData();
      formData.append('file', file);
      
      // イベントIDとイベント枠IDの処理を修正
      // 空文字列、null、undefinedの場合は明示的に'temp'を指定
      const eventIdValue = selectedEvent && selectedEvent !== '' ? selectedEvent : 'temp';
      formData.append('eventId', eventIdValue);
      
      const eventSlotIdValue = selectedEventSlot && selectedEventSlot !== '' ? selectedEventSlot : 'temp';
      formData.append('eventSlotId', eventSlotIdValue);
      
      // デバッグ情報の強化
      console.log('アップロード前の確認 (詳細):', {
        fileName: file.name,
        fileSize: file.size,
        eventId: eventIdValue,
        eventSlotId: eventSlotIdValue,
        formDataEntries: [...formData.entries()].map(([key, value]) => {
          if (value instanceof File) {
            return [key, `File: ${value.name} (${value.size} bytes)`];
          }
          return [key, value];
        })
      });
      
      // APIエンドポイントにPOSTリクエストを送信
      const response = await fetch('/api/photos', {
        method: 'POST',
        body: formData,
      });
      
      // レスポンスの詳細なデバッグ
      console.log('アップロードレスポンスステータス:', response.status, response.statusText);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          const errorText = await response.text();
          try {
            errorData = JSON.parse(errorText);
          } catch (e2) {
            errorData = { error: errorText || 'アップロードに失敗しました' };
          }
        }
        
        console.error('アップロードレスポンスエラー (詳細):', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        
        throw new Error(errorData.error || 'アップロードに失敗しました');
      }
      
      const data = await response.json();
      console.log('アップロード成功レスポンス:', data);
      
      // アップロード履歴に追加
      setUploadHistory(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          fileName: file.name,
          status: 'completed',
          url: data.file.url,
          timestamp: new Date().toISOString()
        }
      ]);
      
      toast({
        title: 'アップロード成功',
        description: `${file.name} がアップロードされました`,
        variant: 'default',
      });
      
      return data;
    } catch (error) {
      console.error('アップロードエラー (詳細):', error);
      
      toast({
        title: 'アップロードエラー',
        description: error instanceof Error ? error.message : 'アップロードに失敗しました',
        variant: 'destructive',
      });
      
      // エラーが発生した場合も履歴に追加（ステータスはfailed）
      setUploadHistory(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          fileName: file.name,
          status: 'failed',
          error: error instanceof Error ? error.message : '不明なエラー',
          timestamp: new Date().toISOString()
        }
      ]);
      
      throw error;
    } finally {
      setUploading(false);
    }
  };

  // 複数ファイルのアップロード処理
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: 'エラー',
        description: 'アップロードするファイルを選択してください',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        await uploadFile(file);
        setProgress(((i + 1) / selectedFiles.length) * 100);
      }

      toast({
        title: 'アップロード完了',
        description: `${selectedFiles.length}個のファイルがアップロードされました`,
        variant: 'default',
      });

      // アップロード完了後にファイル選択をリセット
      setSelectedFiles([]);
    } catch (error) {
      console.error('アップロード処理中のエラー:', error);
    } finally {
      setUploading(false);
    }
  };

  // イベント一覧を取得する関数
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/events');
      
      if (!response.ok) {
        throw new Error('イベントの取得に失敗しました');
      }
      
      const data = await response.json();
      console.log('取得したイベント一覧:', data);
      setEvents(data);
      
      // デフォルトで最初のイベントを選択
      if (data.length > 0) {
        setSelectedEvent(data[0].id);
        // 選択したイベントのイベント枠を取得
        fetchEventSlots(data[0].id);
      }
    } catch (error) {
      console.error('イベント取得エラー:', error);
      toast({
        title: 'エラー',
        description: error instanceof Error ? error.message : 'イベントの取得に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // イベント枠一覧を取得する関数
  const fetchEventSlots = async (eventId: string) => {
    if (!eventId) {
      console.log('イベントIDが指定されていないため、イベント枠を取得しません');
      setEventSlots([]);
      setSelectedEventSlot('');
      return;
    }
    
    try {
      const response = await fetch(`/api/events/${eventId}/slots`);
      
      if (!response.ok) {
        throw new Error('イベント枠の取得に失敗しました');
      }
      
      const data = await response.json();
      console.log(`イベントID ${eventId} の枠一覧:`, data);
      setEventSlots(data);
      
      // デフォルトで最初のイベント枠を選択
      if (data.length > 0) {
        setSelectedEventSlot(data[0].id);
      } else {
        setSelectedEventSlot('');
      }
    } catch (error) {
      console.error('イベント枠取得エラー:', error);
      toast({
        title: 'エラー',
        description: error instanceof Error ? error.message : 'イベント枠の取得に失敗しました',
        variant: 'destructive',
      });
      setEventSlots([]);
      setSelectedEventSlot('');
    }
  };

  // イベント選択時の処理
  const handleEventChange = (eventId: string) => {
    console.log('イベント選択変更:', eventId);
    setSelectedEvent(eventId);
    // 選択したイベントのイベント枠を取得
    fetchEventSlots(eventId);
  };

  // イベント枠選択時の処理
  const handleEventSlotChange = (slotId: string) => {
    console.log('イベント枠選択変更:', slotId);
    setSelectedEventSlot(slotId);
  };

  // ハッカソンMVP用の一時的な対応
  // イベント選択なしでもアップロードできるようにする
  const handleUploadWithoutEvent = () => {
    setSelectedEvent('');
    setSelectedEventSlot('');
    toast({
      title: '情報',
      description: 'イベント情報なしでアップロードします。写真は一時フォルダに保存されます。',
      variant: 'default',
    });
  };

  // コンポーネントマウント時にイベント一覧を取得
  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">写真アップロード</h1>
      
      <div className="grid gap-6">
        {/* イベント選択セクション */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>イベント情報</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleUploadWithoutEvent}
              >
                イベント情報なしでアップロード
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="mb-4">
                <Label htmlFor="event-select">イベント選択</Label>
                <Select
                  value={selectedEvent}
                  onValueChange={handleEventChange}
                  disabled={loading || events.length === 0}
                >
                  <SelectTrigger id="event-select">
                    <SelectValue placeholder="イベントを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.eventName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="mb-4">
                <Label htmlFor="event-slot-select">イベント枠選択</Label>
                <Select
                  value={selectedEventSlot}
                  onValueChange={handleEventSlotChange}
                  disabled={loading || eventSlots.length === 0 || !selectedEvent}
                >
                  <SelectTrigger id="event-slot-select">
                    <SelectValue placeholder="イベント枠を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventSlots.map((slot) => (
                      <SelectItem key={slot.id} value={slot.id}>
                        {slot.eventSlotName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* ファイルアップロードセクション */}
        <Card>
          <CardHeader>
            <CardTitle>ファイルアップロード</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="mb-4">
                <Label htmlFor="file-upload">写真を選択</Label>
                <div className="mt-1 flex items-center">
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    disabled={uploading}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-primary file:text-primary-foreground
                      hover:file:bg-primary/90"
                    aria-label="写真ファイルを選択"
                  />
                </div>
              </div>
              
              {selectedFiles.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">
                    {selectedFiles.length}個のファイルが選択されています
                  </p>
                  <ul className="text-sm text-gray-500 max-h-40 overflow-y-auto">
                    {selectedFiles.map((file, index) => (
                      <li key={index} className="truncate">
                        {file.name} ({(file.size / 1024).toFixed(2)} KB)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {uploading && (
                <div className="mb-4">
                  <Label>アップロード進捗</Label>
                  <Progress value={progress} className="mt-1" />
                  <p className="text-sm text-gray-500 mt-1">
                    {Math.round(progress)}% 完了
                  </p>
                </div>
              )}
              
              <Button
                onClick={handleUpload}
                disabled={uploading || selectedFiles.length === 0}
                className="w-full"
              >
                {uploading ? 'アップロード中...' : 'アップロード開始'}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* アップロード履歴セクション */}
        {uploadHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>アップロード履歴</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {uploadHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <div className="flex items-center space-x-3">
                      {item.status === 'completed' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : item.status === 'failed' ? (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
                      )}
                      <div>
                        <p className="font-medium">{item.fileName}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(item.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div>
                      {item.status === 'completed' && item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-500 hover:underline"
                        >
                          表示
                        </a>
                      )}
                      {item.status === 'failed' && item.error && (
                        <span className="text-sm text-red-500">
                          {item.error}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 