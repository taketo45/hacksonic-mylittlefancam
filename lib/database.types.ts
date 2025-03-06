export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      role_mst: {
        Row: {
          roleId: string
          roleName: string
          roleKey: string
          description: string | null
          isActive: boolean
          isRemovable: boolean
          createdAt: string
          updatedAt: string
        }
        Insert: {
          roleId: string
          roleName: string
          roleKey: string
          description?: string | null
          isActive?: boolean
          isRemovable?: boolean
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          roleId?: string
          roleName?: string
          roleKey?: string
          description?: string | null
          isActive?: boolean
          isRemovable?: boolean
          createdAt?: string
          updatedAt?: string
        }
      }
      user_role_tbl: {
        Row: {
          userId: string
          roleId: string
          assignedAt: string
          assignedBy: string
          isPrimary: boolean
          createdAt: string
          updatedAt: string
          role_mst: {
            roleKey: string
          }
        }
        Insert: {
          userId: string
          roleId: string
          assignedAt?: string
          assignedBy: string
          isPrimary?: boolean
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          userId?: string
          roleId?: string
          assignedAt?: string
          assignedBy?: string
          isPrimary?: boolean
          createdAt?: string
          updatedAt?: string
        }
      }
    }
  }
} 