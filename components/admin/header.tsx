'use client'

import Link from 'next/link'
import Image from 'next/image'
import LogoutButton from '@/components/logout-button'
import { User } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'

export default function AdminHeader() {
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  return (
    <header className="sticky top-0 z-40 border-b bg-white shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/admin" className="flex items-center gap-2">
            <Image
              src="/img/mylittlefancam.svg"
              width={32}
              height={32}
              alt="Logo"
              className="rounded-full"
            />
            <span className="text-xl font-bold text-gradient">My Little Fancam</span>
          </Link>
          <span className="ml-4 text-sm text-gray-500">システム管理画面</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm">
            <p className="font-medium text-gray-700">{user?.email}</p>
          </div>
          <LogoutButton />
        </div>
      </div>
    </header>
  )
} 