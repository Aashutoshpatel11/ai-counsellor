import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ThemeToggle from "@/components/ThemeToggle";
import { Toaster } from "react-hot-toast"; // Import Toaster

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-[#F8F9FD] dark:bg-[#0a0a0a] text-[#1F2937] dark:text-[#e5e7eb] transition-colors duration-300`}>
        
        {/* Global Toaster Configuration */}
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            // 1. Base Styles (Tailwind classes for Dark/Light mode)
            className: '!bg-white dark:!bg-[#23232A] !text-[#1F2937] dark:!text-white !shadow-2xl !rounded-xl !border !border-gray-100 dark:!border-white/5',
            style: {
              padding: '16px',
              fontFamily: 'inherit',
            },
            
            // 2. Success State (Brand Colors)
            success: {
              iconTheme: {
                primary: '#4A2B5E', // Brand Purple
                secondary: '#FFC229', // Brand Yellow (Checkmark)
              },
              style: {
                borderLeft: '4px solid #4A2B5E', 
              }
            },
            
            // 3. Error State
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#FFFFFF',
              },
              style: {
                borderLeft: '4px solid #EF4444',
              }
            },

            // 4. Loading State
            loading: {
              iconTheme: {
                primary: '#FFC229', 
                secondary: '#4A2B5E',
              },
            },
          }}
        />

        <div className="fixed top-5 right-5 z-50">
          <ThemeToggle />
        </div>

        {children}
      </body>
    </html>
  );
}