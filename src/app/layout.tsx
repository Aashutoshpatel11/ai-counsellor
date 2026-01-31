import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// 1. Import the toggle component
import ThemeToggle from "@/components/ThemeToggle";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Counsellor",
  description: "Your personalized study abroad assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning is important for next-themes/theme toggling to prevent mismatch errors
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-[#F8F9FD] dark:bg-[#0a0a0a] text-[#1F2937] dark:text-[#e5e7eb] transition-colors duration-300`}>
        <div className="fixed top-5 right-5 z-50">
          <ThemeToggle />
        </div>

        {children}
      </body>
    </html>
  );
}