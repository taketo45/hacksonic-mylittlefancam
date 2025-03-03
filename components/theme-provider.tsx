"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// 型定義を使わずに直接コンポーネントを実装
export function ThemeProvider({
  children,
  ...props
}: {
  children: React.ReactNode;
  [key: string]: any;
}) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
} 