"use client";

import "./globals.css";
import "katex/dist/katex.min.css";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <Toaster richColors position="bottom-center" />
        </AuthProvider>
      </body>
    </html>
  );
}
