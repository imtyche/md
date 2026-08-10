import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PD Pro',
  description: '专业的 Markdown 编辑器',
  icons: {
    icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNjM2NmYxIiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIGQ9Ik0yMCAxMkw4LjUgMjMuNSAxMiAyMCAxNSA2Ii8+PHBhdGggZD0iTTE2IDRMMjIgMTBNMTQgMkw4IDgiLz48cGF0aCBkPSJNMTUgMTBsLTUgNSIvPjxwYXRoIGQ9Ik0yMiAxN0wxNyAyMiIvPjwvc3ZnPg=='
  }
}

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode
}) {
  return (
      <html lang="zh-CN">
      <body>{children}</body>
      </html>
  )
}