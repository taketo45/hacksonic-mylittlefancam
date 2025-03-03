"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from '@/lib/supabase/client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Trash, 
  Save, 
  ArrowLeft, 
  Share, 
  Image, 
  Loader2, 
  Plus,
  Edit,
  Phone,
  DollarSign,
  User
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";

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

interface Facility {
  facilityId: string;
  facilityName: string;
  facilityAddress: string;
  facilityPhone: string;
}

interface Host {
  hostId: string;
  name: string;
  email: string;
}

interface EventSlot {
  eventSlotId: string;
  eventId: string;
  eventSlotName: string;
  eventDate: string | null;
  eventTime: string | null;
  facilityId: string | null;
  facilityName?: string;
  facilityAddress?: string;
  facilityPhone?: string;
  eventSlotDetail: string | null;
  eventSlotStatus: '準備中' | '公開中' | '終了' | 'キャンセル';
  photographerId?: string;
  photographerName?: string;
  basePrice?: number;
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

  const [eventSlots, setEventSlots] = useState<EventSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [hosts, setHosts] = useState<Host[]>([]);
  const [isLoadingHosts, setIsLoadingHosts] = useState(false);
  const [showSlotForm, setShowSlotForm] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [slotFormData, setSlotFormData] = useState({
    eventSlotName: "",
    eventDate: "",
    eventTime: "",
    facilityName: "",
    facilityAddress: "",
    facilityPhone: "",
    eventSlotDetail: "",
    photographerId: "",
    basePrice: "",
    eventSlotStatus: "準備中" as '準備中' | '公開中' | '終了' | 'キャンセル',
  });
  const [isSubmittingSlot, setIsSubmittingSlot] = useState(false);
  const [slotError, setSlotError] = useState<string | null>(null);

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

  // イベント枠情報を取得
  useEffect(() => {
    if (!eventId) return;
    
    const fetchEventSlots = async () => {
      setIsLoadingSlots(true);
      
      try {
        const response = await fetch(`/api/events/${eventId}/slots`);
        
        if (!response.ok) {
          throw new Error('イベント枠の取得に失敗しました');
        }
        
        const data = await response.json();
        setEventSlots(data.eventSlots || []);
      } catch (err) {
        console.error("イベント枠取得エラー:", err);
      } finally {
        setIsLoadingSlots(false);
      }
    };
    
    fetchEventSlots();
  }, [eventId]);

  // 主催者情報を取得（撮影者として選択するため）
  useEffect(() => {
    const fetchHosts = async () => {
      setIsLoadingHosts(true);
      
      try {
        // 本来はAPIから取得するが、ハッカソンでは簡易的に主催者テーブルから取得
        const response = await fetch(`/api/hosts`);
        
        if (!response.ok) {
          // APIがない場合はダミーデータを使用
          setHosts([
            { hostId: "1", name: "山田太郎", email: "yamada@example.com" },
            { hostId: "2", name: "佐藤花子", email: "sato@example.com" },
            { hostId: "3", name: "鈴木一郎", email: "suzuki@example.com" },
          ]);
          return;
        }
        
        const data = await response.json();
        setHosts(data.hosts || []);
      } catch (err) {
        console.error("主催者取得エラー:", err);
        // エラー時はダミーデータを使用
        setHosts([
          { hostId: "1", name: "山田太郎", email: "yamada@example.com" },
          { hostId: "2", name: "佐藤花子", email: "sato@example.com" },
          { hostId: "3", name: "鈴木一郎", email: "suzuki@example.com" },
        ]);
      } finally {
        setIsLoadingHosts(false);
      }
    };
    
    fetchHosts();
  }, []);

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
      toast.success('イベントが更新されました');
    } catch (err) {
      console.error("イベント更新エラー:", err);
      setError(err instanceof Error ? err.message : "イベントの更新中にエラーが発生しました。");
      toast.error(err instanceof Error ? err.message : "イベントの更新中にエラーが発生しました。");
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
      
      // 削除成功したらイベント一覧ページにリダイレクト
      router.push("/dashboard/events");
      router.refresh();
      toast.success('イベントが削除されました');
    } catch (err) {
      console.error("イベント削除エラー:", err);
      setError(err instanceof Error ? err.message : "イベントの削除中にエラーが発生しました。");
      toast.error(err instanceof Error ? err.message : "イベントの削除中にエラーが発生しました。");
    } finally {
      setIsDeleting(false);
    }
  };

  // イベント枠フォームの入力変更を処理する関数
  const handleSlotChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setSlotFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // セレクト入力の変更を処理する関数
  const handleSlotSelectChange = (name: string, value: string) => {
    setSlotFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // イベント枠の編集を開始する関数
  const handleEditSlot = (slot: EventSlot) => {
    setEditingSlotId(slot.eventSlotId);
    setSlotFormData({
      eventSlotName: slot.eventSlotName || "",
      eventDate: slot.eventDate || "",
      eventTime: slot.eventTime || "",
      facilityName: slot.facilityName || "",
      facilityAddress: slot.facilityAddress || "",
      facilityPhone: slot.facilityPhone || "",
      eventSlotDetail: slot.eventSlotDetail || "",
      photographerId: slot.photographerId || "",
      basePrice: slot.basePrice?.toString() || "",
      eventSlotStatus: slot.eventSlotStatus || "準備中",
    });
    setShowSlotForm(true);
  };

  // 新規イベント枠フォームを表示する関数
  const handleAddNewSlot = () => {
    setEditingSlotId(null);
    setSlotFormData({
      eventSlotName: "",
      eventDate: "",
      eventTime: "",
      facilityName: "",
      facilityAddress: "",
      facilityPhone: "",
      eventSlotDetail: "",
      photographerId: "",
      basePrice: "",
      eventSlotStatus: "準備中",
    });
    setShowSlotForm(true);
  };

  // イベント枠を保存する関数
  const handleSaveSlot = async () => {
    setIsSubmittingSlot(true);
    setSlotError(null);
    
    // 必須フィールドの検証
    if (!slotFormData.eventSlotName) {
      setSlotError("イベント枠名は必須です");
      setIsSubmittingSlot(false);
      return;
    }
    
    try {
      let response;
      
      if (editingSlotId) {
        // 既存のイベント枠を更新
        response = await fetch(`/api/events/${eventId}/slots/${editingSlotId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eventSlotName: slotFormData.eventSlotName,
            eventDate: slotFormData.eventDate || null,
            eventTime: slotFormData.eventTime || null,
            facilityName: slotFormData.facilityName || null,
            facilityAddress: slotFormData.facilityAddress || null,
            facilityPhone: slotFormData.facilityPhone || null,
            eventSlotDetail: slotFormData.eventSlotDetail || null,
            photographerId: slotFormData.photographerId || null,
            basePrice: slotFormData.basePrice ? parseFloat(slotFormData.basePrice) : null,
            eventSlotStatus: slotFormData.eventSlotStatus,
          }),
        });
      } else {
        // 新規イベント枠を作成
        response = await fetch(`/api/events/${eventId}/slots`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eventSlotName: slotFormData.eventSlotName,
            eventDate: slotFormData.eventDate || null,
            eventTime: slotFormData.eventTime || null,
            facilityName: slotFormData.facilityName || null,
            facilityAddress: slotFormData.facilityAddress || null,
            facilityPhone: slotFormData.facilityPhone || null,
            eventSlotDetail: slotFormData.eventSlotDetail || null,
            photographerId: slotFormData.photographerId || null,
            basePrice: slotFormData.basePrice ? parseFloat(slotFormData.basePrice) : null,
            eventSlotStatus: slotFormData.eventSlotStatus,
          }),
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'イベント枠の保存に失敗しました');
      }
      
      // イベント枠一覧を再取得
      const slotsResponse = await fetch(`/api/events/${eventId}/slots`);
      if (slotsResponse.ok) {
        const data = await slotsResponse.json();
        setEventSlots(data.eventSlots || []);
      }
      
      // フォームをリセット
      setShowSlotForm(false);
      setEditingSlotId(null);
      
      toast.success(editingSlotId ? 'イベント枠が更新されました' : 'イベント枠が作成されました');
    } catch (err) {
      console.error("イベント枠保存エラー:", err);
      setSlotError(err instanceof Error ? err.message : "イベント枠の保存中にエラーが発生しました。");
      toast.error(err instanceof Error ? err.message : "イベント枠の保存中にエラーが発生しました。");
    } finally {
      setIsSubmittingSlot(false);
    }
  };

  // イベント枠を削除する関数
  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm("このイベント枠を削除してもよろしいですか？この操作は元に戻せません。")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/events/${eventId}/slots/${slotId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'イベント枠の削除に失敗しました');
      }
      
      // イベント枠一覧から削除したものを除外
      setEventSlots(eventSlots.filter(slot => slot.eventSlotId !== slotId));
      
      toast.success('イベント枠が削除されました');
    } catch (err) {
      console.error("イベント枠削除エラー:", err);
      toast.error(err instanceof Error ? err.message : "イベント枠の削除中にエラーが発生しました。");
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
  const formatDate = (dateString: string | undefined | null) => {
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

  // イベント詳細表示部分を拡張
  const renderEventDetails = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">{event?.eventName}</h2>
        
        {event?.description && (
          <p className="text-gray-700 mb-4">{event.description}</p>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-gray-600">
            <Calendar className="mr-2 h-5 w-5" />
            <span>{formatDate(event?.eventDate)}</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <MapPin className="mr-2 h-5 w-5" />
            <span>{event?.location || '未設定'}</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <Clock className="mr-2 h-5 w-5" />
            <span>ステータス: {event?.eventStatus || '準備中'}</span>
          </div>
        </div>
        
        <div className="text-sm text-gray-500">
          <p>作成日: {formatDate(event?.createdAt)}</p>
          <p>更新日: {formatDate(event?.updatedAt)}</p>
        </div>
      </div>
      
      {/* イベント枠セクション */}
      <div className="border-t pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">イベント枠</h3>
          <Button onClick={handleAddNewSlot} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            新規枠を追加
          </Button>
        </div>
        
        {isLoadingSlots ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3">読み込み中...</span>
          </div>
        ) : eventSlots.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-gray-500">イベント枠がまだ登録されていません。</p>
            <Button onClick={handleAddNewSlot} variant="outline" className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              イベント枠を追加
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {eventSlots.map((slot) => (
              <Card key={slot.eventSlotId} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{slot.eventSlotName}</CardTitle>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusInfo(slot.eventSlotStatus).className}`}>
                      {getStatusInfo(slot.eventSlotStatus).label}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pb-3 space-y-3">
                  {slot.eventDate && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>{formatDate(slot.eventDate)}</span>
                      {slot.eventTime && (
                        <>
                          <Clock className="ml-3 mr-2 h-4 w-4" />
                          <span>{slot.eventTime}</span>
                        </>
                      )}
                    </div>
                  )}
                  
                  {slot.facilityName && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="mr-2 h-4 w-4" />
                      <span>{slot.facilityName}</span>
                    </div>
                  )}
                  
                  {slot.facilityAddress && (
                    <div className="flex items-start text-sm text-gray-600">
                      <MapPin className="mr-2 h-4 w-4 opacity-0" />
                      <span className="text-xs">{slot.facilityAddress}</span>
                    </div>
                  )}
                  
                  {slot.facilityPhone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="mr-2 h-4 w-4" />
                      <span>{slot.facilityPhone}</span>
                    </div>
                  )}
                  
                  {slot.photographerName && (
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="mr-2 h-4 w-4" />
                      <span>撮影者: {slot.photographerName}</span>
                    </div>
                  )}
                  
                  {slot.basePrice && (
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="mr-2 h-4 w-4" />
                      <span>基本価格: {slot.basePrice.toLocaleString()}円</span>
                    </div>
                  )}
                  
                  {slot.eventSlotDetail && (
                    <div className="mt-2 text-sm text-gray-600">
                      <p className="line-clamp-2">{slot.eventSlotDetail}</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end pt-0">
                  <Button variant="ghost" size="sm" onClick={() => handleEditSlot(slot)}>
                    <Edit className="mr-2 h-4 w-4" />
                    編集
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDeleteSlot(slot.eventSlotId)}>
                    <Trash className="mr-2 h-4 w-4" />
                    削除
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* イベント管理セクション */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium mb-4">イベント管理</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link 
            href={`/dashboard/events/${event?.id}/invite`}
            className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Share className="h-5 w-5 mr-3 text-milab-500" />
            <div>
              <h4 className="font-medium">招待リンクを共有</h4>
              <p className="text-sm text-gray-600">保護者に招待リンクを送信します</p>
            </div>
          </Link>
          
          <Link 
            href={`/dashboard/events/${event?.id}/photos`}
            className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Image className="h-5 w-5 mr-3 text-milab-500" aria-label="写真管理アイコン" />
            <div>
              <h4 className="font-medium">写真管理</h4>
              <p className="text-sm text-gray-600">イベントの写真をアップロード・管理します</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );

  // イベント枠フォームのダイアログ
  const renderEventSlotDialog = () => (
    <Dialog open={showSlotForm} onOpenChange={setShowSlotForm}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{editingSlotId ? 'イベント枠を編集' : '新規イベント枠を追加'}</DialogTitle>
        </DialogHeader>
        
        {slotError && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p>{slotError}</p>
          </div>
        )}
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="eventSlotName">イベント枠名 *</Label>
            <Input
              id="eventSlotName"
              name="eventSlotName"
              value={slotFormData.eventSlotName}
              onChange={handleSlotChange}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="eventDate">開催日</Label>
              <Input
                id="eventDate"
                name="eventDate"
                type="date"
                value={slotFormData.eventDate}
                onChange={handleSlotChange}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="eventTime">開始時刻</Label>
              <Input
                id="eventTime"
                name="eventTime"
                type="time"
                value={slotFormData.eventTime}
                onChange={handleSlotChange}
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="facilityName">使用施設名</Label>
            <Input
              id="facilityName"
              name="facilityName"
              value={slotFormData.facilityName}
              onChange={handleSlotChange}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="facilityAddress">施設住所</Label>
            <Input
              id="facilityAddress"
              name="facilityAddress"
              value={slotFormData.facilityAddress}
              onChange={handleSlotChange}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="facilityPhone">施設連絡先</Label>
            <Input
              id="facilityPhone"
              name="facilityPhone"
              value={slotFormData.facilityPhone}
              onChange={handleSlotChange}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="eventSlotDetail">イベント枠の詳細説明</Label>
            <Textarea
              id="eventSlotDetail"
              name="eventSlotDetail"
              value={slotFormData.eventSlotDetail}
              onChange={handleSlotChange}
              className="h-24"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="photographerId">撮影者</Label>
            <Select
              value={slotFormData.photographerId}
              onValueChange={(value) => handleSlotSelectChange("photographerId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="撮影者を選択" />
              </SelectTrigger>
              <SelectContent>
                {hosts.map((host) => (
                  <SelectItem key={host.hostId} value={host.hostId}>
                    {host.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="basePrice">写真販売ベース価格（円）</Label>
            <Input
              id="basePrice"
              name="basePrice"
              type="number"
              value={slotFormData.basePrice}
              onChange={handleSlotChange}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="eventSlotStatus">ステータス</Label>
            <Select
              value={slotFormData.eventSlotStatus}
              onValueChange={(value) => handleSlotSelectChange("eventSlotStatus", value as '準備中' | '公開中' | '終了' | 'キャンセル')}
            >
              <SelectTrigger>
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
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowSlotForm(false)} disabled={isSubmittingSlot}>
            キャンセル
          </Button>
          <Button onClick={handleSaveSlot} disabled={isSubmittingSlot}>
            {isSubmittingSlot ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                保存
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

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
          renderEventDetails()
        )}
      </Card>
      
      {/* イベント枠フォームのダイアログ */}
      {renderEventSlotDialog()}
    </div>
  );
} 