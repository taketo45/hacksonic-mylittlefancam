"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function NewEventPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    eventName: "",
    eventStatus: "準備中" as "準備中" | "公開中" | "終了" | "キャンセル",
  });

  // 入力変更ハンドラ
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // ステータス選択ハンドラ
  const handleStatusChange = (value: string) => {
    setFormData({
      ...formData,
      eventStatus: value as "準備中" | "公開中" | "終了" | "キャンセル",
    });
  };

  // フォーム送信ハンドラ
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.eventName.trim()) {
      toast({
        title: "エラー",
        description: "イベント名を入力してください",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // APIを使用してイベントを作成
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error("イベントの作成に失敗しました");
      }
      
      const data = await response.json();
      
      toast({
        title: "成功",
        description: "イベントが作成されました",
      });
      
      // 作成したイベントの詳細ページにリダイレクト
      router.push(`/dashboard/events/${data.eventId}`);
    } catch (err) {
      console.error("Error creating event:", err);
      toast({
        title: "エラー",
        description: err instanceof Error ? err.message : "不明なエラーが発生しました",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // キャンセルボタンのハンドラ
  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">新規イベント作成</h1>
        <Button onClick={handleCancel} variant="outline">
          キャンセル
        </Button>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="eventName">イベント名</Label>
            <Input
              id="eventName"
              name="eventName"
              value={formData.eventName}
              onChange={handleInputChange}
              placeholder="イベント名を入力"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="eventStatus">ステータス</Label>
            <Select
              value={formData.eventStatus}
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
          
          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              イベントを作成
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
} 