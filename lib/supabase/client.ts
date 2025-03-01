import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // 環境変数が存在しない場合のフォールバック値を設定
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co'
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
  
  // ビルド時のみの処理（静的生成時）
  if (typeof window === 'undefined' && process.env.NODE_ENV === 'production' && process.env.CI) {
    // CIビルド時は実際のクライアント作成をスキップ
    // @ts-ignore - ビルド時のみのダミー実装
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        signOut: () => Promise.resolve({ error: null }),
        signInWithOAuth: () => Promise.resolve({ error: null }),
        // @ts-ignore - ビルド時のみのダミー実装
        signInWithPassword: (credentials: { email: string; password: string }) => 
          Promise.resolve({ data: { user: null, session: null }, error: null }),
        // @ts-ignore - ビルド時のみのダミー実装
        signUp: (credentials: { email: string; password: string; options?: any }) => 
          Promise.resolve({ data: { user: null, session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      // データベース操作用のメソッドをダミー実装
      from: (table: string) => {
        // 共通のダミーレスポンス生成関数
        const dummyResponse = <T>(data: T | null = null) => Promise.resolve({ data, error: null });
        // 配列を返すダミーレスポンス
        const dummyArrayResponse = () => Promise.resolve({ 
          data: [{ id: 'dummy-id', created_at: new Date().toISOString() }], 
          error: null 
        });
        
        return {
          select: (columns = '*') => ({
            eq: (column: string, value: unknown) => ({
              single: () => dummyResponse({ id: 'dummy-id', created_at: new Date().toISOString() }),
              maybeSingle: () => dummyResponse({ id: 'dummy-id', created_at: new Date().toISOString() }),
              limit: (limit: number) => dummyArrayResponse(),
              order: (column: string, options: unknown) => ({
                limit: (limit: number) => dummyArrayResponse()
              }),
              data: [{ id: 'dummy-id', created_at: new Date().toISOString() }],
              error: null,
              then: (callback: (result: { data: unknown[]; error: null }) => unknown) => 
                Promise.resolve({ 
                  data: [{ id: 'dummy-id', created_at: new Date().toISOString() }], 
                  error: null 
                }).then(callback)
            }),
            order: (column: string, options: unknown) => ({
              limit: (limit: number) => dummyArrayResponse()
            }),
            limit: (limit: number) => dummyArrayResponse(),
            in: (column: string, values: unknown[]) => ({
              order: (column: string, options: unknown) => ({
                limit: (limit: number) => dummyArrayResponse()
              }),
              limit: (limit: number) => dummyArrayResponse()
            }),
            single: () => dummyResponse({ id: 'dummy-id', created_at: new Date().toISOString() }),
            maybeSingle: () => dummyResponse({ id: 'dummy-id', created_at: new Date().toISOString() }),
          }),
          insert: (data: unknown) => ({
            select: (columns = '*') => dummyArrayResponse(),
            returning: (columns = '*') => dummyArrayResponse(),
          }),
          update: (data: unknown) => ({
            eq: (column: string, value: unknown) => ({
              select: (columns = '*') => dummyArrayResponse(),
              match: (query: unknown) => dummyArrayResponse(),
            }),
            match: (query: unknown) => dummyArrayResponse(),
          }),
          delete: () => ({
            eq: (column: string, value: unknown) => dummyResponse(null),
            match: (query: unknown) => dummyResponse(null),
          }),
        }
      },
      storage: {
        from: (bucket: string) => ({
          upload: (path: string, file: unknown, options?: unknown) => 
            Promise.resolve({ data: { path: `${bucket}/${path}` }, error: null }),
          getPublicUrl: (path: string) => ({ data: { publicUrl: `https://dummy-url.com/${bucket}/${path}` } }),
          list: (prefix: string) => Promise.resolve({ data: [], error: null }),
          remove: (paths: string[]) => Promise.resolve({ data: null, error: null }),
        }),
      },
      rpc: (fn: string, params?: unknown) => Promise.resolve({ data: null, error: null }),
    }
  }
  
  return createBrowserClient(
    supabaseUrl,
    supabaseKey
  )
}