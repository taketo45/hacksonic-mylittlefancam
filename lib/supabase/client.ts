import { createBrowserClient } from '@supabase/ssr'

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
        signInWithPassword: () => Promise.resolve({ data: null, error: null }),
        signUp: () => Promise.resolve({ data: null, error: null }),
        signOut: () => Promise.resolve({ error: null }),
      },
      // データベース操作用のメソッドをダミー実装
      from: (table) => {
        // 共通のダミーレスポンス生成関数
        const dummyResponse = (data = null) => Promise.resolve({ data, error: null });
        
        return {
          select: () => {
            return {
              eq: () => dummyResponse([]),
              order: () => ({
                limit: () => dummyResponse([])
              }),
              limit: () => dummyResponse([]),
              in: () => ({
                order: () => ({
                  limit: () => dummyResponse([])
                }),
                limit: () => dummyResponse([])
              }),
              single: () => dummyResponse(null),
              maybeSingle: () => dummyResponse(null),
            }
          },
          insert: (data) => ({
            select: () => dummyResponse(data),
            returning: () => dummyResponse(data),
          }),
          update: (data) => ({
            eq: () => ({
              select: () => dummyResponse(data),
              match: () => dummyResponse(data),
            }),
            match: () => dummyResponse(data),
          }),
          delete: () => ({
            eq: () => dummyResponse(null),
            match: () => dummyResponse(null),
          }),
        }
      },
      storage: {
        from: (bucket) => ({
          upload: () => Promise.resolve({ data: { path: `${bucket}/dummy-path` }, error: null }),
          getPublicUrl: () => ({ data: { publicUrl: `https://dummy-url.com/${bucket}/dummy-file` } }),
          list: () => Promise.resolve({ data: [], error: null }),
          remove: () => Promise.resolve({ data: null, error: null }),
        }),
      },
      rpc: () => Promise.resolve({ data: null, error: null }),
    }
  }
  
  return createBrowserClient(
    supabaseUrl,
    supabaseKey
  )
}