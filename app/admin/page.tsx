export default function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">システム管理画面</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold">ユーザー管理</h2>
          <p className="text-gray-600">
            ユーザーの一覧表示、詳細情報の確認、アカウントのステータス管理などを行います。
          </p>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold">ロール管理</h2>
          <p className="text-gray-600">
            ユーザーへのロール割り当て、ロールの権限設定などを管理します。
          </p>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold">システム設定</h2>
          <p className="text-gray-600">
            アプリケーションの全般的な設定、システムパラメータの管理を行います。
          </p>
        </div>
      </div>
    </div>
  )
} 