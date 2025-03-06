import { atomWithStorage } from 'jotai/utils'

export type UserRole = 'organizer' | 'user'

// クライアントサイドでのみlocalStorageを使用するように設定
const storage = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') return 'user'
    try {
      return localStorage.getItem(key)
    } catch {
      return 'user'
    }
  },
  setItem: (key: string, value: string) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(key, value)
    } catch {
      // エラー処理
    }
  },
  removeItem: (key: string) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem(key)
    } catch {
      // エラー処理
    }
  },
}

export const userRoleAtom = atomWithStorage<UserRole>('userRole', 'user', storage) 