import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

// ユーザーロールの型定義
export type UserRole = 'organizer' | 'user'

// ローカルストレージを使用してユーザーロールを保存するatom
export const userRoleAtom = atomWithStorage<UserRole>('userRole', 'organizer')

// ユーザーロールに応じたデフォルトページを返す関数
export const getDefaultPageForRole = (role: UserRole): string => {
  return role === 'organizer' ? '/dashboard/events' : '/dashboard/photos'
} 