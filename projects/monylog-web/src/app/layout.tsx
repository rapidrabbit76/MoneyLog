import type React from "react"
import type { Metadata } from "next"
import { Mona_Sans as FontSans } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TransactionProvider } from "@/contexts/transaction-context"
import { SidebarProvider } from "@/contexts/sidebar-context"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "가계부 챗",
  description: "채팅으로 가계부를 작성하는 서비스",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`font-sans antialiased ${fontSans.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange={false}
          storageKey="finance-chat-theme"
        >
          <TransactionProvider>
            <SidebarProvider>
              {children}
            </SidebarProvider>
          </TransactionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
