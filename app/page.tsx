import Image from 'next/image'
import Link from 'next/link'
import TestimonialCard from '@/components/testimonial-card'
import PricingCard from '@/components/pricing-card'
import FeatureCard from '@/components/feature-card'
import HowItWorksStep from '@/components/how-it-works-step'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  // セッションが存在する場合はダッシュボードにリダイレクト
  // if (session) {
  //   redirect('/dashboard')
  // }

  return (
    <div className="flex min-h-screen flex-col bg-gradient">
      {/* ナビゲーションバー */}
      <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Image
              src="/img/mylittlefancam.svg"
              width={32}
              height={32}
              alt="Logo"
              className="rounded-full"
            />
            <span className="text-xl font-bold text-gradient">My Little Fancam</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium text-gradient hover:text-milab-600">
              特徴
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-gradient hover:text-milab-600">
              使い方
            </Link>
            <Link href="#testimonials" className="text-sm font-medium text-gradient hover:text-milab-600">
              お客様の声
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-gradient hover:text-milab-600">
              料金
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-milab-600 md:block text-gradient">
              ログイン
            </Link>
            <button className="inline-flex h-10 items-center justify-center rounded-md bg-milab-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-milab-600 focus:outline-none focus:ring-2 focus:ring-milab-400 focus:ring-offset-2">
              <Link href="/register" className="text-white">
                無料で始める
              </Link>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ヒーローセクション */}
        <section className="relative overflow-hidden py-20 md:py-32">
          <div className="container relative z-10 grid gap-12 px-4 md:grid-cols-2 md:items-center md:px-6">
            <div className="space-y-6 text-center md:text-left">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                推しとの
                <span className="text-gradient">素敵な瞬間</span>
                を永遠に
              </h1>
              <p className="text-lg text-gray-600 md:text-xl">
                推し活での特別な瞬間を逃さない。主催者が撮った写真から、あなたの推し活ベストショットを見つけ、共有し、残しましょう。
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center md:justify-start">
                <button className="inline-flex h-11 items-center justify-center rounded-md bg-milab-500 px-8 py-2 text-sm font-medium text-white transition-colors hover:bg-milab-600 focus:outline-none focus:ring-2 focus:ring-milab-400 focus:ring-offset-2">
                  <Link href="/register" className="text-white">
                    今すぐ始める
                  </Link>
                </button>
                <button className="inline-flex h-11 items-center justify-center rounded-md border-input bg-white px-8 py-2 text-sm font-medium transition-colors text-blue-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-milab-400 focus:ring-offset-2">
                  <Link href="#how-it-works">詳しく見る</Link>
                </button>
              </div>
            </div>
            <div className="relative mx-auto aspect-square w-full max-w-md rounded-full bg-gradient-to-br from-milab-100 to-milab-200 p-4 md:p-6">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-milab-100/80 to-milab-200/80 blur-xl"></div>
              <div className="relative h-full w-full overflow-hidden rounded-full border-8 border-white shadow-xl">
                <Image
                  src="/img/mylittlefancam.svg"
                  width={600}
                  height={600}
                  alt="子どもたちの笑顔"
                  className="h-full w-full object-cover"
                  priority
                />
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-[url('/img/mylittlefancam.svg')] bg-repeat opacity-5"></div>
        </section>

        {/* 特徴セクション */}
        <section id="features" className="py-20 bg-white">
          <div className="container px-4 md:px-6">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                推しとの思い出を
                <span className="text-gradient">もっと素敵に</span>
              </h2>
              <p className="text-lg text-gray-600">
                Your Shutterは、推し活での特別な瞬間を、みんなで共有し、残すためのプラットフォームです。
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon="Search"
                title="AIで自動検出"
                description="顔認識AIが、たくさんの写真の中からあなたのお子さんを自動で見つけ出します。"
              />
              <FeatureCard
                icon="Camera"
                title="高品質な写真"
                description="プロ並みの写真編集機能で、どんな写真も美しく仕上げることができます。"
              />
              <FeatureCard
                icon="Share2"
                title="安全な共有"
                description="プライバシーを守りながら、家族や友人と安全に写真を共有できます。"
              />
              <FeatureCard
                icon="Gift"
                title="撮影者に還元"
                description="素敵な写真を撮った人に報酬が入る、フェアなシステムを採用しています。"
              />
              <FeatureCard
                icon="Calendar"
                title="イベント管理"
                description="学校や保育園のイベントごとに写真を整理し、簡単に探せます。"
              />
              <FeatureCard
                icon="Download"
                title="高解像度ダウンロード"
                description="購入した写真は高解像度でダウンロードでき、印刷にも最適です。"
              />
            </div>
          </div>
        </section>

        {/* 使い方セクション */}
        <section id="how-it-works" className="py-20 bg-gradient">
          <div className="container px-4 md:px-6">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                <span className="text-gradient">簡単3ステップ</span>
                で始められます
              </h2>
              <p className="text-lg text-gray-600">Your Shutterは、誰でも簡単に使えるように設計されています。</p>
            </div>
            <div className="grid gap-12 md:grid-cols-3">
              <HowItWorksStep
                number="1"
                title="写真をアップロード"
                description="イベントで撮影した写真をアップロードするだけ。AIが自動で顔を検出します。"
              />
              <HowItWorksStep
                number="2"
                title="お子さんを登録"
                description="お子さんの顔写真を登録すると、AIが自動であなたのお子さんの写真を見つけ出します。"
              />
              <HowItWorksStep
                number="3"
                title="写真を購入・共有"
                description="気に入った写真を購入して高解像度でダウンロードしたり、家族と共有したりできます。"
              />
            </div>
          </div>
        </section>

        {/* 統計セクション */}
        <section className="py-16 bg-milab-500 text-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 text-center md:grid-cols-4">
              <div>
                <div className="text-4xl font-bold">1,000+</div>
                <div className="mt-2">参加しているイベント</div>
              </div>
              <div>
                <div className="text-4xl font-bold">10万+</div>
                <div className="mt-2">登録ユーザー</div>
              </div>
              <div>
                <div className="text-4xl font-bold">100万+</div>
                <div className="mt-2">共有された写真</div>
              </div>
              <div>
                <div className="text-4xl font-bold">98%</div>
                <div className="mt-2">満足度</div>
              </div>
            </div>
          </div>
        </section>

        {/* お客様の声セクション */}
        <section id="testimonials" className="py-20 bg-white">
          <div className="container px-4 md:px-6">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                <span className="text-gradient">お客様の声</span>
              </h2>
              <p className="text-lg text-gray-600">
                Your Shutterを利用している推し活民のみなさまからの声をご紹介します。
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <TestimonialCard
                name="佐藤 美咲"
                role="推し： SixTONES"
                content="推しへ声援で忙しくて推し活の写真を撮れなかったのですが、イベントで撮られた素敵な写真を購入できて本当に嬉しかったです。思い出が増えました！"
                avatar="/img/mylittlefancam.svg"
              />
              <TestimonialCard
                name="田中 健太"
                role="推し： AKB48"
                content="推しが活躍している瞬間をしっかりと目に焼き付けながら、自分では絶対に撮れなかった推しと一緒の写真が手に入りました。感謝しています。"
                avatar="/img/mylittlefancam.svg"
              />
              <TestimonialCard
                name="山田 先生"
                role="推し： サザンオールスターズ"
                content="推し推し推し。"
                avatar="/img/mylittlefancam.svg"
              />
            </div>
          </div>
        </section>

        {/* 料金セクション */}
        <section id="pricing" className="py-20 bg-gradient">
          <div className="container px-4 md:px-6">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                <span className="text-gradient">シンプルな料金プラン</span>
              </h2>
              <p className="text-lg text-gray-600">
                必要な分だけお支払いいただけるフレキシブルなプランをご用意しています。
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <PricingCard
                title="ベーシック"
                price="無料"
                description="お子さんの写真を見つけるための基本機能"
                features={["お子さん1人の顔登録", "月10枚までの写真閲覧", "低解像度ダウンロード", "基本的な検索機能"]}
                buttonText="無料で始める"
                buttonVariant="outline"
              />
              <PricingCard
                title="スタンダード"
                price="¥980"
                period="月額"
                description="家族全員の写真を管理したい方に"
                features={[
                  "お子さん3人までの顔登録",
                  "月50枚までの写真閲覧",
                  "高解像度ダウンロード5枚/月",
                  "詳細な検索機能",
                  "家族との共有機能",
                ]}
                buttonText="スタンダードを選ぶ"
                buttonVariant="default"
                highlighted={true}
              />
              <PricingCard
                title="プレミアム"
                price="¥1,980"
                period="月額"
                description="プロ品質の写真と高度な機能が必要な方に"
                features={[
                  "お子さん5人までの顔登録",
                  "無制限の写真閲覧",
                  "高解像度ダウンロード20枚/月",
                  "プロ級の編集ツール",
                  "優先サポート",
                  "年間フォトブック1冊",
                ]}
                buttonText="プレミアムを選ぶ"
                buttonVariant="outline"
              />
            </div>
          </div>
        </section>

        {/* CTA セクション */}
        <section className="py-16 bg-milab-500 text-white">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                子どもたちの素敵な瞬間を逃さないために
              </h2>
              <p className="mb-8 text-lg">My Little Fancamで、思い出をもっと豊かに、もっと簡単に残しましょう。</p>
              <button className="inline-flex h-11 items-center justify-center rounded-md bg-white px-8 py-2 text-sm font-medium text-milab-600 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-milab-500">
                <Link href="/register">今すぐ無料で始める</Link>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* フッター */}
      <footer className="border-t bg-white py-12">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <Image
                  src="/img/mylittlefancam.svg"
                  width={32}
                  height={32}
                  alt="Logo"
                  className="rounded-full"
                />
                <span className="text-xl font-bold text-gradient">My Little Fancam</span>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                子どもたちの素敵な瞬間を、みんなで共有し、永遠に残すためのプラットフォーム
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold">サービス</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-gray-500 hover:text-milab-600">
                    写真共有
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-500 hover:text-milab-600">
                    AIフォト検索
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-500 hover:text-milab-600">
                    フォトブック作成
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-500 hover:text-milab-600">
                    学校向けプラン
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold">会社情報</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-gray-500 hover:text-milab-600">
                    会社概要
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-500 hover:text-milab-600">
                    プライバシーポリシー
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-500 hover:text-milab-600">
                    利用規約
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-500 hover:text-milab-600">
                    お問い合わせ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold">ニュースレター</h3>
              <p className="mb-4 text-sm text-gray-500">最新情報をお届けします</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="メールアドレス"
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                />
                <button className="inline-flex h-9 items-center justify-center rounded-md bg-milab-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-milab-600 focus:outline-none focus:ring-2 focus:ring-milab-400 focus:ring-offset-2">
                  登録
                </button>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t pt-6 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} My Little Fancam. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

// このページを動的レンダリングに設定
export const dynamic = 'force-dynamic'
