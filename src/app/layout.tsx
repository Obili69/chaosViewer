import type { Metadata, Viewport } from 'next'
import './globals.css'
import { NavProvider } from '@/components/layout/NavProvider'
import { AppShell } from '@/components/layout/AppShell'
import { ServiceWorkerRegistrar } from '@/components/layout/ServiceWorkerRegistrar'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export const metadata: Metadata = {
  title: 'ChaosTracker',
  description: 'Selbst gehostete Projektverwaltung',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ChaosTracker',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#06b6d4',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = headers()
  const pathname = headersList.get('x-invoke-path') ?? ''

  // Skip auth check for login page
  if (!pathname.includes('/login')) {
    const session = await getSession()
    if (!session && !pathname.includes('/login')) {
      // middleware handles redirect, but as backup
    }
  }

  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="bg-base text-text-primary antialiased">
        <ServiceWorkerRegistrar />
        <NavProvider>
          <AppShellWrapper>
            {children}
          </AppShellWrapper>
        </NavProvider>
      </body>
    </html>
  )
}

async function AppShellWrapper({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  // Don't render the shell on the login page
  if (!session) {
    return <>{children}</>
  }

  return <AppShell>{children}</AppShell>
}
