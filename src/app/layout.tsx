'use client';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from '@/components/theme-provider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

type RoutePath = '/' | '/video/download' | '/video/convert' | '/settings';

const ROUTES: Record<RoutePath, string> = {
  '/': 'Home',
  '/video/download': 'Download Vídeo',
  '/video/convert': 'Converter Vídeo',
  '/settings': 'Configurações',
} as const;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname() as RoutePath;

  const getPageTitle = (path: RoutePath): string => {
    return ROUTES[path];
  };

  return (
    <html
      lang='pt-br'
      className='cursor-default select-none'
      suppressHydrationWarning
    >
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <AppSidebar />
            <div className='flex h-screen w-full flex-col'>
              <div className='flex w-full space-x-5 p-3'>
                <SidebarTrigger className='cursor-pointer' />
                <h1 className='text-xl font-semibold'>
                  {getPageTitle(pathname)}
                </h1>
              </div>
              <Separator />

              <div className='flex-1 p-4'>{children}</div>
            </div>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
