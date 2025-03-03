'use client'

import { useRef } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { useFormStatus } from 'react-dom'

interface UploadFormProps {
  uploadAction: (formData: FormData) => Promise<any>
}

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'アップロード中...' : 'アップロード'}
    </Button>
  )
}

export default function UploadForm({ uploadAction }: UploadFormProps) {
  const { toast } = useToast()
  const formRef = useRef<HTMLFormElement>(null)
  
  async function handleAction(formData: FormData) {
    const result = await uploadAction(formData)
    
    if (result.success) {
      toast({
        title: 'アップロード成功',
        description: '写真のアップロードが完了しました',
        variant: 'default',
      })
      alert('アップロード成功');
      // フォームをリセット
      formRef.current?.reset()
    } else {
      toast({
        title: 'アップロードエラー',
        description: result.error || 'アップロードに失敗しました',
        variant: 'destructive',
      })
      alert('アップロード失敗');
    }
  }
  
  return (
    <form ref={formRef} action={handleAction} className="space-y-4">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <label htmlFor="file" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          アップロードする写真を選択
        </label>
        <input
          id="file"
          name="file"
          type="file"
          accept="image/*"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      <SubmitButton />
    </form>
  )
} 