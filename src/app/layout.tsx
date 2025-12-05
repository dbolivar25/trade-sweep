import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { CommandMenu } from "@/components/layout/command-bar";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";
import ReactQueryProvider from "@/components/providers/react-query-provider";
import { MarketTicker } from "@/components/layout/market-ticker";

export const metadata: Metadata = {
  title: {
    default: "TradeSweep",
    template: "%s | TradeSweep",
  },
  description: "Precision trading validation for the modern trader",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
    other: [
      {
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="antialiased min-h-screen">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ReactQueryProvider>
              <SidebarProvider defaultOpen={true}>
                <div className="flex min-h-screen w-full">
                  <AppSidebar />
                  <main className="flex-1 flex flex-col min-h-screen">
                    <MarketTicker />
                    <div className="flex-1 px-6 py-8 lg:px-12">
                      {children}
                    </div>
                  </main>
                </div>
                <CommandMenu />
                <Toaster
                  position="bottom-right"
                  toastOptions={{
                    style: {
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      color: "var(--foreground)",
                    },
                  }}
                />
              </SidebarProvider>
            </ReactQueryProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
