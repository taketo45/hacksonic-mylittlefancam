/** @type {import('next').NextConfig} */
const nextConfig = {
  // 画像の最適化に関する警告を抑制
  images: {
    unoptimized: process.env.CI === 'true',
  },
  // 環境変数が存在しない場合のフォールバック値を設定
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
  },
}

module.exports = nextConfig
