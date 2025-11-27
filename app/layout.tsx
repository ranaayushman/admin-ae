"use client";

import "./globals.css";
import "katex/dist/katex.min.css";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "sonner";

export default function RootLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <html lang="en">
      <body className="flex">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

        <main
          className="flex-1 min-h-screen transition-all duration-300 bg-gray-50"
          style={{ marginLeft: collapsed ? "5rem" : "18rem" }}
        >
          {children}
          <Toaster richColors position="bottom-center" />
        </main>
      </body>
    </html>
  );
}
