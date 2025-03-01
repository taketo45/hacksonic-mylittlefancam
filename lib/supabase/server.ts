import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  // 環境変数が存在しない場合のフォールバック値を設定
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co'
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
  
  // ビルド時のみの処理（静的生成時）
  if (process.env.NODE_ENV === 'production' && process.env.CI) {
    // CIビルド時は実際のクライアント作成をスキップ
    // @ts-ignore - ビルド時のみのダミー実装
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      },
      // データベース操作用のメソッドをダミー実装
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: null }),
            maybeSingle: () => Promise.resolve({ data: null, error: null }),
            order: () => ({
              limit: () => Promise.resolve({ data: [], error: null })
            }),
            limit: () => Promise.resolve({ data: [], error: null }),
          }),
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: null })
          }),
          limit: () => Promise.resolve({ data: [], error: null }),
          in: () => ({
            order: () => ({
              limit: () => Promise.resolve({ data: [], error: null })
            }),
            limit: () => Promise.resolve({ data: [], error: null }),
          }),
        }),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => ({
          eq: () => ({
            select: () => Promise.resolve({ data: null, error: null }),
            match: () => Promise.resolve({ data: null, error: null }),
          }),
          match: () => Promise.resolve({ data: null, error: null }),
        }),
        delete: () => ({
          eq: () => Promise.resolve({ data: null, error: null }),
          match: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
      storage: {
        from: () => ({
          upload: () => Promise.resolve({ data: null, error: null }),
          getPublicUrl: () => ({ data: { publicUrl: '' } }),
          list: () => Promise.resolve({ data: [], error: null }),
          remove: () => Promise.resolve({ data: null, error: null }),
        }),
      },
      rpc: () => Promise.resolve({ data: null, error: null }),
    }
  }
  
  const cookieStore = cookies()
  
  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
} 