'use client';

import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { DBProvider } from '@/components/layout/db-provider';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <DBProvider>
          <div className="min-h-screen bg-background">
            <Sidebar />
            <main className="md:pl-60 pb-20 md:pb-0">
              <div className="container max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
                {children}
              </div>
            </main>
            <MobileNav />
          </div>
          <Toaster />
        </DBProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}
