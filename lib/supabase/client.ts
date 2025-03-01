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
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      // データベース操作用のメソッドをダミー実装
      from: (table) => {
        // 共通のダミーレスポンス生成関数
        const dummyResponse = (data = null) => Promise.resolve({ data, error: null });
        
        return {
          select: (columns = '*') => ({
            eq: (column, value) => ({
              single: () => dummyResponse(null),
              maybeSingle: () => dummyResponse(null),
              limit: (limit) => dummyResponse([]),
              order: (column, options) => ({
                limit: (limit) => dummyResponse([])
              }),
              data: [],
              error: null,
              then: (callback) => Promise.resolve({ data: [], error: null }).then(callback)
            }),
            order: (column, options) => ({
              limit: (limit) => dummyResponse([])
            }),
            limit: (limit) => dummyResponse([]),
            in: (column, values) => ({
              order: (column, options) => ({
                limit: (limit) => dummyResponse([])
              }),
              limit: (limit) => dummyResponse([])
            }),
            single: () => dummyResponse(null),
            maybeSingle: () => dummyResponse(null),
          }),
          insert: (data) => ({
            select: (columns = '*') => dummyResponse(data),
            returning: (columns = '*') => dummyResponse(data),
          }),
          update: (data) => ({
            eq: (column, value) => ({
              select: (columns = '*') => dummyResponse(data),
              match: (query) => dummyResponse(data),
            }),
            match: (query) => dummyResponse(data),
          }),
          delete: () => ({
            eq: (column, value) => dummyResponse(null),
            match: (query) => dummyResponse(null),
          }),
        }
      },
      storage: {
        from: (bucket) => ({
          upload: (path, file) => Promise.resolve({ data: { path: `${bucket}/${path}` }, error: null }),
          getPublicUrl: (path) => ({ data: { publicUrl: `https://dummy-url.com/${bucket}/${path}` } }),
          list: (prefix) => Promise.resolve({ data: [], error: null }),
          remove: (paths) => Promise.resolve({ data: null, error: null }),
        }),
      },
      rpc: (fn, params) => Promise.resolve({ data: null, error: null }),
    }
  }
  
  return createBrowserClient(
    supabaseUrl,
    supabaseKey
  )
}