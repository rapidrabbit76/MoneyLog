import type React from "react"
import type { Metadata } from "next"
import { Mona_Sans as FontSans } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ExpensesProvider } from "@/contexts/expenses-context"
import { SidebarProvider } from "@/contexts/sidebar-context"
import { UserProvider } from "@/contexts/user-context"
import { SidebarContainer } from "@/components/dashboard-sidebar-container"
import { AppHeader } from "@/components/app-header"

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
          <UserProvider>
            <ExpensesProvider>
              <SidebarProvider>
                <div className="flex h-screen w-full overflow-hidden">
                  <SidebarContainer />
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <AppHeader />
                    <div className="flex flex-1 flex-col overflow-hidden p-4">
                      {children}
                    </div>
                  </div>
                </div>
              </SidebarProvider>
            </ExpensesProvider>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
