import Link from 'next/link'
import SignupForm from './signup-form'
import Image from 'next/image'

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
        <div className="flex flex-col items-center justify-center text-center">
          <Image
            src="/img/mylittlefancam.svg"
            width={64}
            height={64}
            alt="Logo"
            className="mb-2 rounded-full"
          />
          <h1 className="text-2xl font-bold text-gradient">My Little Fancam</h1>
          <h2 className="mt-6 text-2xl font-bold">アカウント登録</h2>
          <p className="mt-2 text-sm text-gray-600">
            新規アカウントを作成して、子どもたちの素敵な瞬間を共有しましょう
          </p>
        </div>

        <SignupForm />

        <div className="mt-4 text-center text-sm">
          <p>
            すでにアカウントをお持ちの場合は{' '}
            <Link href="/login" className="font-medium text-milab-600 hover:text-milab-500">
              ログイン
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

// このページを動的レンダリングに設定
export const dynamic = 'force-dynamic' 