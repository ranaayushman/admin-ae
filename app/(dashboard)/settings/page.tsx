// app/settings/page.tsx
"use client";

import React from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { 
  ImageIcon, 
  LayoutTemplate, 
  Menu, 
  Share2 
} from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your site configuration</p>
        </div>

        {/* Site Configuration */}
        <div className="grid gap-6 md:grid-cols-2">
          
          {/* Hero Banners */}
          <Link href="/settings/hero-banners" className="block h-full">
            <Card className="hover:bg-accent/50 transition-colors h-full cursor-pointer border-transparent ring-1 ring-border shadow-sm hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ImageIcon className="h-5 w-5 text-blue-600" />
                  Hero Banners
                </CardTitle>
                <CardDescription>
                  Manage homepage carousel banners
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          {/* Navbar */}
          <Link href="/settings/navbar" className="block h-full">
            <Card className="hover:bg-accent/50 transition-colors h-full cursor-pointer border-transparent ring-1 ring-border shadow-sm hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Menu className="h-5 w-5 text-purple-600" />
                  Navbar Menu
                </CardTitle>
                <CardDescription>
                  Configure navigation structure
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          {/* Footer */}
          <Link href="/settings/footer" className="block h-full">
            <Card className="hover:bg-accent/50 transition-colors h-full cursor-pointer border-transparent ring-1 ring-border shadow-sm hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <LayoutTemplate className="h-5 w-5 text-indigo-600" />
                  Footer Links
                </CardTitle>
                <CardDescription>
                  Manage footer links and layout
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          {/* Social Links */}
          <Link href="/settings/social" className="block h-full">
            <Card className="hover:bg-accent/50 transition-colors h-full cursor-pointer border-transparent ring-1 ring-border shadow-sm hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Share2 className="h-5 w-5 text-pink-600" />
                  Social Media
                </CardTitle>
                <CardDescription>
                  Update social profile links
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

        </div>
      </div>
    </div>
  );
}
