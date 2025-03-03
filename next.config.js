/** @type {import('next').NextConfig} */
const nextConfig = {
  // 画像の最適化に関する警告を抑制
  images: {
    unoptimized: process.env.VERCEL === '1' ? false : (process.env.CI === 'true'),
    domains: [
      'source.unsplash.com',
      'images.unsplash.com',
      'plus.unsplash.com',
      'placehold.co',
      'placekitten.com',
      'picsum.photos',
      'via.placeholder.com'
    ], // 複数の画像ドメインを許可リストに追加
  },
  // 環境変数が存在しない場合のフォールバック値を設定
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
    EFFECTIVE_CI: process.env.VERCEL === '1' ? 'false' : (process.env.CI || 'false'),
  },
}

module.exports = nextConfig
