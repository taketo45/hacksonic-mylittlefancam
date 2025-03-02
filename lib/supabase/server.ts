import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

/**
 * Supabaseクライアントを作成する関数
 * 
 * @param {boolean} useServiceRole - サービスロールキーを使用するかどうか
 * @returns {ReturnType<typeof createSupabaseClient>} Supabaseクライアント
 */
export function createClient(useServiceRole = false) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  
  // ハッカソンMVP用に一時的にサービスロールキーを使用
  // 本番環境では絶対に使用しないでください
  const supabaseKey = useServiceRole 
    ? process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  return createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
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
  
  // 最新のSupabaseクライアントでは、cookiesプロパティの代わりにglobal.fetchを使用
  return createSupabaseClient(
    supabaseUrl, 
    supabaseKey, 
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
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