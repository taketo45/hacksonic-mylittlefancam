<div id="top"></div>

## 使用技術一覧

<!-- シールド一覧 -->
<!-- 該当するプロジェクトの中から任意のものを選ぶ-->
<p style="display: inline">
  <!-- フロントエンドのフレームワーク一覧 -->
  <img src="https://img.shields.io/badge/-Node.js-000000.svg?logo=node.js&style=for-the-badge">
  <img src="https://img.shields.io/badge/-Next.js-000000.svg?logo=next.js&style=for-the-badge">
  <img src="https://img.shields.io/badge/-TailwindCSS-000000.svg?logo=tailwindcss&style=for-the-badge">
  <img src="https://img.shields.io/badge/-React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB">
  <img src="https://img.shields.io/badge/-supabase-3FCF8E.svg?logo=mysql&style=for-the-badge&logoColor=white">
  <img src="https://img.shields.io/badge/-postgresql-4169E1.svg?logo=postgresql&style=for-the-badge&logoColor=white">
  <img src="https://img.shields.io/badge/-drizzle-C5F74F.svg?logo=postgresql&style=for-the-badge&logoColor=black">
  <img src="https://img.shields.io/badge/-Docker-1488C6.svg?logo=docker&style=for-the-badge">
  <img src="https://img.shields.io/badge/-githubactions-FFFFFF.svg?logo=github-actions&style=for-the-badge">
</p>

## 目次

1. [プロジェクトについて](#プロジェクトについて)
2. [環境](#環境)
3. [ディレクトリ構成](#ディレクトリ構成)
4. [開発環境構築](#開発環境構築)
5. [トラブルシューティング](#トラブルシューティング)


<!-- プロジェクト名を記載 -->

## プロジェクト名

My Little Fancam

<!-- プロジェクトについて -->

## プロジェクトについて
- 子どもたちの写真を園や学校内でシェア・販売できるサービスです。

- 親たちの子どものもっと素敵な姿を写真として残したいという思いに応えるサービスです
- 保育園/幼稚園や学校での催しに集まった親たちが撮影した膨大な写真から我が子の写真を見つけ出すことを自動化することで、まだ観ぬ我が子の最高の一枚を購入できます。
- 催しを開催する主催者、撮影をする親に報酬を渡すことで、写真の撮影とシェアに対するマインドを変化させ、積極的に催しの参加者が多くの子どもたちの写真を撮影する気持ちにさせるプラットフォームです。


<!-- プロジェクトの概要を記載 -->

<p align="right">(<a href="#top">トップへ</a>)</p>

## 環境

<!-- 言語、フレームワーク、ミドルウェア、インフラの一覧とバージョンを記載 -->


| 言語・フレームワーク | バージョン  |
| -------------------- | ----------- |
| Supabase             | 2.45.0      |
| drizzle              | 0.30.4      |
| Node.js              | 20.10.0     |
| React                | 18.2.0      |
| Next.js              | 14.0.4      |
| Vercel               | CLI 33.0.0  |
| stripe               | 14.9.0      |
| TypeScript           | 5.3.3       |
| TailwindCSS          | 3.3.6       |




<p align="right">(<a href="#top">トップへ</a>)</p>

## ディレクトリ構成

<!-- Treeコマンドを使ってディレクトリ構成を記載 -->

❯ tree -a -I "node_modules|.next|.git|static" -L 2
<pre>



</pre>

<p align="right">(<a href="#top">トップへ</a>)</p>

## 開発環境構築

<!-- コンテナの作成方法、パッケージのインストール方法など、開発環境構築に必要な情報を記載 -->

### コンテナの作成と起動

<pre>

</pre>

### 動作確認

ローカル開発環境
http://127.0.0.1:3000 にアクセスできるか確認

アクセスできたら成功

下記テストユーザーでログイン
User: test@test.com
Password: admin123

本リポジトリの内容は下記ホスティングサービスに自動デプロイされる
https://mylittlefancam.onrender.com/

上記テストユーザーも利用可能


### コンテナの停止

以下のコマンドでコンテナを停止することができます

ctrl + c

### 環境変数の一覧




### コマンド一覧


<p align="right">(<a href="#top">トップへ</a>)</p>


## トラブルシューティング



<p align="right">(<a href="#top">トップへ</a>)</p>


# 開発環境構築チェックリスト

以下のチェックリストに従って、Supabase、Next.js、React、TailwindCSSなどを使用した開発環境を構築しましょう。各ステップは順番に実行してください。

## 1. 前提条件のインストール

- [ ] Node.jsとnpmをインストール
  ```bash
  # Node.jsの公式サイトからNode.js 20.10.0をダウンロードしてインストール
  # https://nodejs.org/download/release/v20.10.0/
  
  # インストール確認
  node -v  # v20.10.0と表示されるはず
  npm -v
  ```

- [ ] Gitをインストール（まだの場合）
  ```bash
  # https://git-scm.com/downloadsからダウンロードしてインストール
  
  # インストール確認
  git --version
  ```

## 2. プロジェクトの作成

- [ ] Next.jsプロジェクトを作成
  ```bash
  npx create-next-app@14.0.4 my-project
  cd my-project
  ```

- [ ] プロジェクト作成時の質問に答える
  - TypeScriptを使用? → Yes
  - ESLintを使用? → Yes
  - TailwindCSSを使用? → Yes
  - `src/`ディレクトリを使用? → Yes（推奨）
  - Appルーターを使用? → Yes（推奨）
  - カスタマイズするインポートエイリアスを使用? → No（デフォルトの@/*で良い）

## 3. 必要なパッケージのインストール

- [ ] TypeScriptが指定バージョンであることを確認し、必要なら更新
  ```bash
  npm install typescript@5.3.3
  ```

- [ ] TailwindCSSの設定を確認（すでにインストール済み）
  ```bash
  # tailwind.config.jsファイルが存在することを確認
  ```

- [ ] Stripe SDKをインストール
  ```bash
  npm install stripe@14.9.0
  ```

- [ ] Drizzle関連パッケージをインストール
  ```bash
  npm install drizzle-orm@0.30.4 drizzle-kit pg
  ```

- [ ] Supabase関連パッケージをインストール
  ```bash
  npm install @supabase/supabase-js@2.45.0
  ```

## 4. Supabaseプロジェクトのセットアップ

- [ ] Supabaseアカウントを作成（未作成の場合）
  - https://supabase.com/ にアクセスし、サインアップ

- [ ] 新しいプロジェクトを作成
  - Supabaseダッシュボードから「New Project」をクリック
  - プロジェクト名を入力
  - データベースのパスワードを設定
  - リージョンを選択
  - 「Create new project」をクリック

- [ ] 環境変数を設定
  - プロジェクトの「Settings」→「API」からAPIキーを取得
  - プロジェクトのルートに`.env.local`ファイルを作成
  ```
  NEXT_PUBLIC_SUPABASE_URL=あなたのSupabaseプロジェクトURL
  NEXT_PUBLIC_SUPABASE_ANON_KEY=あなたのSupabase匿名キー
  SUPABASE_SERVICE_ROLE_KEY=あなたのSupabaseサービスロールキー
  ```

## 5. Drizzleの設定

- [ ] Drizzleの設定ファイルを作成
  - プロジェクトのルートに`drizzle.config.ts`ファイルを作成
  ```typescript
  import { defineConfig } from 'drizzle-kit';
  
  export default defineConfig({
    schema: './src/db/schema.ts',
    out: './drizzle',
    driver: 'pg',
    dbCredentials: {
      connectionString: process.env.DATABASE_URL || '',
    },
  });
  ```

- [ ] データベーススキーマを定義
  - `src/db`ディレクトリを作成
  - `src/db/schema.ts`ファイルを作成し、テーブル定義を記述

- [ ] データベース接続クライアントを設定
  - `src/db/index.ts`ファイルを作成
  ```typescript
  import { drizzle } from 'drizzle-orm/postgres-js';
  import postgres from 'postgres';
  import * as schema from './schema';
  
  // データベース接続URLを環境変数から取得
  const connectionString = process.env.DATABASE_URL || '';
  
  // クライアントを作成
  const client = postgres(connectionString);
  export const db = drizzle(client, { schema });
  ```

## 6. StripeとSupabaseの連携設定

- [ ] Stripeアカウントを作成・設定（未作成の場合）
  - https://stripe.com/ にアクセスし、サインアップ
  - APIキーを取得

- [ ] Stripe環境変数を追加
  ```
  # .env.localに追加
  STRIPE_SECRET_KEY=あなたのStripeシークレットキー
  STRIPE_WEBHOOK_SECRET=あなたのStripeウェブフックシークレット
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=あなたのStripe公開キー
  ```

- [ ] Stripeクライアントを設定
  - `src/lib/stripe.ts`ファイルを作成
  ```typescript
  import Stripe from 'stripe';
  
  export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16', // 最新のAPIバージョンを使用
  });
  ```

## 7. Vercelへのデプロイ準備

- [ ] Vercel CLIをインストール
  ```bash
  npm install -g vercel@33.0.0
  ```

- [ ] Vercelにログイン
  ```bash
  vercel login
  ```

- [ ] package.jsonのスクリプトを確認
  ```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
  ```

## 8. プロジェクトの動作確認

- [ ] 開発サーバーを起動
  ```bash
  npm run dev
  ```

- [ ] ブラウザで http://localhost:3000 にアクセスし、正常に表示されることを確認

## 9. プロジェクトのバージョン管理設定

- [ ] Gitリポジトリを初期化（必要な場合）
  ```bash
  git init
  ```

- [ ] .gitignoreの確認と更新
  ```
  # .gitignoreに以下が含まれていることを確認
  node_modules
  .env
  .env.local
  .env.development.local
  .env.test.local
  .env.production.local
  .next/
  ```

- [ ] 最初のコミット
  ```bash
  git add .
  git commit -m "Initial commit"
  ```

## 10. Vercelへのデプロイ

- [ ] Vercelへデプロイ
  ```bash
  vercel
  ```

- [ ] デプロイ中に聞かれる質問に答える
  - Set up and deploy? → Y
  - Which scope? → 自分のアカウントを選択
  - Link to existing project? → N
  - What's your project's name? → プロジェクト名を入力
  - In which directory is your code located? → ./ (デフォルト)
  - Want to override the settings? → N

- [ ] デプロイ後、提供されたURLにアクセスして正常に動作することを確認

## 11. 環境変数のVercelへの設定

- [ ] Vercelのプロジェクトダッシュボードに移動
- [ ] Settings → Environmentに移動
- [ ] .env.localに設定した環境変数を全てVercelに追加

これでセットアップは完了です！各種技術を使った開発を開始できます。