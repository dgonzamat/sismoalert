import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import OfflineIndicator from "@/components/offline-indicator"
import AccessibilityControls from "@/components/accessibility-controls"
import LanguageSelector from "@/components/language-selector"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SismoAlert - Sistema de Alerta Temprana de Terremotos",
  description: "Aplicación de alerta temprana de terremotos para Chile con ajustes regionales",
  manifest: "/manifest.json",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <header className="border-b py-2 px-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <img src="/icon-48.png" alt="SismoAlert Logo" className="h-8 w-8" />
              <span className="font-bold">SismoAlert</span>
            </div>
            <LanguageSelector />
          </header>

          {children}

          <OfflineIndicator />
          <AccessibilityControls />
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'