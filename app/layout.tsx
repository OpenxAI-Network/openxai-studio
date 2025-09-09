import ScrollToTop from '@/components/ScrollToTop'

import '../styles/index.css'

import { type Metadata } from 'next'
import { Inter } from 'next/font/google'
import { cookies } from 'next/headers'
import { prefix } from '@/utils/prefix'
import { GoogleAnalytics } from '@next/third-parties/google'

import { cn } from '@/lib/utils'
import CTAHelp from '@/components/cta-help'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { NavLayout } from '@/components/SidebarNav/sibebar-nav'
import { LoadingOverlay } from '@/components/ui/loading-overlay'

import { Providers } from './providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
})

export const metadata: Metadata = {
  title: 'OpenxAI Studio',
  icons: {
    icon: `${prefix}/images/openxai-logo.png`,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <body
        className={cn(
          'min-h-screen container max-w-[1920px] mx-auto p-0 w-full bg-background font-sans text-foreground antialiased',
          inter.variable
        )}
      >
        <Providers>
          <Header />
          <NavLayout>
            {children}
            <LoadingOverlay/>
            <ScrollToTop />
          </NavLayout>
          <Footer />
          <CTAHelp />
        </Providers>
      </body>
      <GoogleAnalytics gaId="G-9PSXBJPNPC" />
    </html>
  )
}
