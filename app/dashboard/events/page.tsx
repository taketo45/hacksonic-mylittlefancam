'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// イベントの型定義
interface Event {
  eventId: string;
  eventName: string;
  eventStatus: '準備中' | '公開中' | '終了' | 'キャンセル';
  createdAt: string;
  updatedAt: string;
  hostEvents?: HostEvent[];
  eventSlots?: EventSlot[];
}

// ホストイベントの型定義
interface HostEvent {
  id: number;
  hostId: string;
  eventId: string;
  eventRole: string | null;
  createdAt: string;
  updatedAt: string;
  host?: {
    hostId: string;
    name: string;
    email: string;
  };
}

// イベントスロットの型定義
interface EventSlot {
  eventSlotId: string;
  eventId: string;
  eventSlotName: string;
  eventDate: string | null;
  eventTime: string | null;
  eventSlotStatus: '準備中' | '公開中' | '終了' | 'キャンセル';
  createdAt: string;
  updatedAt: string;
}

export default function EventsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState<{
    eventName: string;
    eventStatus: '準備中' | '公開中' | '終了' | 'キャンセル';
  }>({
    eventName: '',
    eventStatus: '準備中',
  });

  // ユーザー認証とイベント取得
  useEffect(() => {
    const checkAuthAndFetchEvents = async () => {
      try {
        setLoading(true);
        // APIを使用してイベントを取得
        const response = await fetch('/api/events');
        
        if (!response.ok) {
          if (response.status === 401) {
            setIsAuthenticated(false);
            return;
          }
          throw new Error('イベントの取得に失敗しました');
        }
        
        const data = await response.json();
        // APIレスポンスの形式に合わせて修正
        setEvents(data.events || []);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchEvents();
  }, []);

  // 入力変更ハンドラ
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewEvent({
      ...newEvent,
      [name]: value,
    });
  };

  // ステータス選択ハンドラ
  const handleStatusChange = (value: string) => {
    setNewEvent({
      ...newEvent,
      eventStatus: value as '準備中' | '公開中' | '終了' | 'キャンセル',
    });
  };

  // イベント作成ハンドラ
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEvent.eventName.trim()) {
      toast({
        title: 'エラー',
        description: 'イベント名を入力してください',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsCreatingEvent(true);
      
      // APIを使用してイベントを作成
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEvent),
      });
      
      if (!response.ok) {
        throw new Error('イベントの作成に失敗しました');
      }
      
      const responseData = await response.json();
      const createdEvent = responseData.event;
      
      // 新しいイベントをリストに追加
      setEvents([...events, createdEvent]);
      
      // フォームをリセット
      setNewEvent({
        eventName: '',
        eventStatus: '準備中',
      });
      
      toast({
        title: '成功',
        description: 'イベントが作成されました',
      });
    } catch (err) {
      console.error('Error creating event:', err);
      toast({
        title: 'エラー',
        description: err instanceof Error ? err.message : '不明なエラーが発生しました',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingEvent(false);
    }
  };

  // ステータス情報を取得
  const getStatusInfo = (status: string) => {
    switch (status) {
      case '準備中':
        return { label: '準備中', color: 'bg-yellow-100 text-yellow-800' };
      case '公開中':
        return { label: '公開中', color: 'bg-green-100 text-green-800' };
      case '終了':
        return { label: '終了', color: 'bg-gray-100 text-gray-800' };
      case 'キャンセル':
        return { label: 'キャンセル', color: 'bg-red-100 text-red-800' };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-800' };
    }
  };

  // 認証されていない場合
  if (!isAuthenticated && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl font-bold mb-4">ログインが必要です</h1>
        <p className="mb-4">イベント管理機能を利用するにはログインしてください。</p>
        <Button asChild>
          <Link href="/login">ログイン</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">イベント管理</h1>

      {/* イベント作成フォーム */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">新規イベント作成</h2>
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <div>
            <Label htmlFor="eventName">イベント名</Label>
            <Input
              id="eventName"
              name="eventName"
              value={newEvent.eventName}
              onChange={handleInputChange}
              placeholder="イベント名を入力"
              required
            />
          </div>
          <div>
            <Label htmlFor="eventStatus">ステータス</Label>
            <Select
              value={newEvent.eventStatus}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger id="eventStatus">
                <SelectValue placeholder="ステータスを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="準備中">準備中</SelectItem>
                <SelectItem value="公開中">公開中</SelectItem>
                <SelectItem value="終了">終了</SelectItem>
                <SelectItem value="キャンセル">キャンセル</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={isCreatingEvent}>
            {isCreatingEvent ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            イベントを作成
          </Button>
        </form>
      </Card>

      {/* イベント一覧 */}
      <h2 className="text-xl font-semibold mb-4">登録済みイベント</h2>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md text-red-800 mb-4">
          {error}
        </div>
      ) : events.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-md text-center">
          <p className="text-gray-500 mb-4">登録済みのイベントはありません</p>
          <p className="text-sm text-gray-400">
            上のフォームから新しいイベントを作成してください
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const statusInfo = getStatusInfo(event.eventStatus);
            
            return (
              <Card key={event.eventId} className="overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold">{event.eventName}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-500 mb-4">
                    <p>作成日: {new Date(event.createdAt).toLocaleDateString('ja-JP')}</p>
                    <p>更新日: {new Date(event.updatedAt).toLocaleDateString('ja-JP')}</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link href={`/dashboard/events/${event.eventId}`} passHref>
                      <Button variant="outline" size="sm">
                        詳細
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
} 