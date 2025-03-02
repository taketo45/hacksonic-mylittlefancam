"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from '@/lib/supabase/client';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, MapPin, Clock, Trash, Save, ArrowLeft, Share, Image, Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from '@/components/ui/use-toast';

interface Event {
  id: string;
  eventName: string;
  description: string;
  eventDate: string;
  location: string;
  eventStatus: string;
  createdAt: string;
  updatedAt: string;
  eventId: string;
  hostEvents?: HostEvent[];
  eventSlots?: EventSlot[];
}

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

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const supabase = createClient();
  const eventId = params.id;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    eventName: "",
    description: "",
    eventDate: "",
    location: "",
    eventStatus: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  // イベント情報を取得
  useEffect(() => {
    const fetchEvent = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // APIからイベント情報を取得
        const response = await fetch(`/api/events/${eventId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('イベントが見つかりませんでした');
          }
          if (response.status === 401) {
            router.push('/login');
            return;
          }
          const errorData = await response.json();
          throw new Error(errorData.error || 'イベントの取得に失敗しました');
        }
        
        const data = await response.json();
        const eventData = data.event;
        
        // イベント情報をセット
        setEvent(eventData);
        setFormData({
          eventName: eventData.eventName || "",
          description: eventData.description || "",
          eventDate: eventData.eventDate || "",
          location: eventData.location || "",
          eventStatus: eventData.eventStatus || "",
        });
      } catch (err) {
        console.error("イベント取得エラー:", err);
        setError(err instanceof Error ? err.message : "イベントの取得中にエラーが発生しました。");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEvent();
  }, [eventId, router]);

  // フォーム入力の変更を処理する関数
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // セレクト入力の変更を処理する関数
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // イベント更新を処理する関数
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // 必須フィールドの検証
    if (!formData.eventName || !formData.eventDate || !formData.location) {
      setError("イベント名、日付、場所は必須項目です。");
      setIsSubmitting(false);
      return;
    }

    try {
      // APIを使用してイベントを更新
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventName: formData.eventName,
          description: formData.description,
          eventDate: formData.eventDate,
          location: formData.location,
          eventStatus: formData.eventStatus,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'イベントの更新に失敗しました');
      }
      
      const data = await response.json();
      
      // 更新成功
      setIsEditing(false);
      setEvent(data.event);
      toast({
        title: '成功',
        description: 'イベントが更新されました',
      });
    } catch (err) {
      console.error("イベント更新エラー:", err);
      setError(err instanceof Error ? err.message : "イベントの更新中にエラーが発生しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  // イベント削除を処理する関数
  const handleDelete = async () => {
    if (!confirm("このイベントを削除してもよろしいですか？この操作は元に戻せません。")) {
      return;
    }
    
    setIsDeleting(true);
    setError(null);
    
    try {
      // APIを使用してイベントを削除（論理削除）
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'イベントの削除に失敗しました');
      }
      
      // 削除成功したらイベント一覧ページにリダイレクト
      router.push("/dashboard/events");
      router.refresh();
      toast({
        title: '成功',
        description: 'イベントが削除されました',
      });
    } catch (err) {
      console.error("イベント削除エラー:", err);
      setError(err instanceof Error ? err.message : "イベントの削除中にエラーが発生しました。");
      setIsDeleting(false);
    }
  };

  // ステータスに応じたラベルとスタイルを取得する関数
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return { label: '開催中', className: 'bg-green-100 text-green-800' };
      case 'pending':
        return { label: '準備中', className: 'bg-yellow-100 text-yellow-800' };
      case 'completed':
        return { label: '終了', className: 'bg-gray-100 text-gray-800' };
      case 'cancelled':
        return { label: 'キャンセル', className: 'bg-red-100 text-red-800' };
      default:
        return { label: '不明', className: 'bg-gray-100 text-gray-800' };
    }
  };

  // 日付をフォーマットする関数
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard/events")}
            className="mr-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            イベント一覧に戻る
          </Button>
          <h1 className="text-2xl font-bold">イベント詳細</h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <span className="ml-3">読み込み中...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard/events")}
            className="mr-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            イベント一覧に戻る
          </Button>
          <h1 className="text-2xl font-bold">イベント詳細</h1>
        </div>
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/events")}
        >
          イベント一覧に戻る
        </Button>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard/events")}
            className="mr-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            イベント一覧に戻る
          </Button>
          <h1 className="text-2xl font-bold">イベント詳細</h1>
        </div>
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
          <p>イベントが見つかりませんでした。</p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/events")}
        >
          イベント一覧に戻る
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard/events")}
            className="mr-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            イベント一覧に戻る
          </Button>
          <h1 className="text-2xl font-bold">
            {isEditing ? "イベント編集" : "イベント詳細"}
          </h1>
        </div>
        {!isEditing && (
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}
          >
            編集
          </Button>
        )}
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}

      <Card className="p-6 mb-8">
        {isEditing ? (
          // 編集フォーム
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="eventName">イベント名 *</Label>
                <Input
                  id="eventName"
                  name="eventName"
                  value={formData.eventName}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">説明</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="mt-1 h-32"
                />
              </div>

              <div>
                <Label htmlFor="eventDate">日付 *</Label>
                <Input
                  id="eventDate"
                  name="eventDate"
                  type="date"
                  value={formData.eventDate}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="location">場所 *</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="eventStatus">ステータス</Label>
                <Select
                  value={formData.eventStatus}
                  onValueChange={(value) => handleSelectChange("eventStatus", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="ステータスを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">開催中</SelectItem>
                    <SelectItem value="pending">準備中</SelectItem>
                    <SelectItem value="completed">終了</SelectItem>
                    <SelectItem value="cancelled">キャンセル</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isSubmitting || isDeleting}
              >
                <Trash className="mr-2 h-4 w-4" />
                {isDeleting ? "削除中..." : "イベントを削除"}
              </Button>

              <div className="space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={isSubmitting}
                >
                  キャンセル
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? "保存中..." : "変更を保存"}
                </Button>
              </div>
            </div>
          </form>
        ) : (
          // イベント詳細表示
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">{event.eventName}</h2>
              
              {event.description && (
                <p className="text-gray-700 mb-4">{event.description}</p>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center text-gray-600">
                  <Calendar className="mr-2 h-5 w-5" />
                  <span>{formatDate(event.eventDate)}</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <MapPin className="mr-2 h-5 w-5" />
                  <span>{event.location}</span>
                </div>
              </div>
              
              <div className="flex items-center mb-4">
                <span className="text-sm font-medium mr-2">ステータス:</span>
                {event.eventStatus && (
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusInfo(event.eventStatus).className}`}>
                    {getStatusInfo(event.eventStatus).label}
                  </span>
                )}
              </div>
              
              <div className="text-sm text-gray-500">
                <p>作成日: {formatDate(event.createdAt)}</p>
                <p>更新日: {formatDate(event.updatedAt)}</p>
              </div>
            </div>
            
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">イベント管理</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link 
                  href={`/dashboard/events/${event.id}/invite`}
                  className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Share className="h-5 w-5 mr-3 text-milab-500" />
                  <div>
                    <h4 className="font-medium">招待リンクを共有</h4>
                    <p className="text-sm text-gray-600">保護者に招待リンクを送信します</p>
                  </div>
                </Link>
                
                <Link 
                  href={`/dashboard/events/${event.id}/photos`}
                  className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Image className="h-5 w-5 mr-3 text-milab-500" />
                  <div>
                    <h4 className="font-medium">写真管理</h4>
                    <p className="text-sm text-gray-600">イベントの写真をアップロード・管理します</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
} 