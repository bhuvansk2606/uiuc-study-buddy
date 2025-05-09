// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ClientProvider from "@/components/ClientProvider";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "UIUC Study Buddy",
  description: "Find study partners for your courses at UIUC",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session;
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    console.error('Error getting session:', error);
    session = null;
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientProvider session={session}>
          <AuthProvider>
            <div className="min-h-screen bg-gray-50">
              <Navbar />
              <main className="container mx-auto px-4 py-8">
                {children}
              </main>
            </div>
          </AuthProvider>
        </ClientProvider>
      </body>
    </html>
  );
}
