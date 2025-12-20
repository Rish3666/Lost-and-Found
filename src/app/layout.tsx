import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { ThemeProvider } from "@/context/ThemeContext";
import QueryProvider from "@/components/providers/query-provider";
import { ChatWidget } from "@/components/chat-widget";
import { ClientLayoutWrapper } from "@/components/layout/client-layout-wrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "University Lost & Found Portal",
  description:
    "Report, track, and return lost items across campus with a secure portal.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background text-foreground antialiased overflow-x-hidden`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <QueryProvider>
            <ClientLayoutWrapper
              navbar={<Navbar />}
              chatWidget={<ChatWidget />}
            >
              {children}
            </ClientLayoutWrapper>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
