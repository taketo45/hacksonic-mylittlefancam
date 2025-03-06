import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies, type ReadonlyRequestCookies } from 'next/headers'

/**
 * Supabaseクライアントを作成する関数
 * 
 * @param {ReadonlyRequestCookies | boolean} cookieStoreOrServiceRole - CookieStoreまたはサービスロールキーを使用するかどうか
 * @returns {ReturnType<typeof createSupabaseClient>} Supabaseクライアント
 */
export function createClient(cookieStoreOrServiceRole: ReadonlyRequestCookies | boolean = false) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  
  // 環境変数が設定されているか確認
  if (!supabaseUrl) {
    console.error('NEXT_PUBLIC_SUPABASE_URL is not set');
  }
  
  // ハッカソンMVP用に一時的にサービスロールキーを使用
  // 本番環境では絶対に使用しないでください
  const useServiceRole = typeof cookieStoreOrServiceRole === 'boolean' && cookieStoreOrServiceRole
  const supabaseKey = useServiceRole 
    ? process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  if (!supabaseKey) {
    console.error(useServiceRole 
      ? 'SUPABASE_SERVICE_ROLE_KEY is not set' 
      : 'NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
  }
  
  const cookieStore = typeof cookieStoreOrServiceRole === 'object' ? cookieStoreOrServiceRole : undefined
  
  console.log('Creating Supabase client with URL:', supabaseUrl ? 'Set' : 'Not set');
  console.log('Using service role:', useServiceRole);
  
  return createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
    ...(cookieStore && {
      global: {
        fetch: (url, init) => {
          const cookieHeader = cookieStore.getAll()
            .map(cookie => `${cookie.name}=${cookie.value}`)
            .join('; ');
          
          init = init || {};
          init.headers = {
            ...init.headers,
            Cookie: cookieHeader,
          };
          
          return fetch(url, init);
        }
      }
    })
  })
}

/**
 * Cookieを使用してSupabaseクライアントを作成する関数
 * 
 * @returns {ReturnType<typeof createSupabaseClient>} Supabaseクライアント
 */
export function createClientWithCookies() {
  const cookieStore = cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  // 環境変数が設定されているか確認
  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase environment variables are not properly set');
  }
  
  // 最新のSupabaseクライアントでは、cookiesプロパティの代わりにglobal.fetchを使用
  return createSupabaseClient(
    supabaseUrl, 
    supabaseKey, 
    {
      auth: {
        persistSession: true, // セッション情報を保持するように変更
        autoRefreshToken: true, // トークンの自動更新も有効化
        detectSessionInUrl: false,
      },
      global: {
        fetch: (url, init) => {
          // Cookieをリクエストに含める
          const cookieHeader = cookieStore.getAll()
            .map(cookie => `${cookie.name}=${cookie.value}`)
            .join('; ');
          
          init = init || {};
          init.headers = {
            ...init.headers,
            Cookie: cookieHeader,
          };
          
          return fetch(url, init);
        }
      }
    }
  )
} 