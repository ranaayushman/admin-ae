// app/settings/page.tsx
"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { 
  ExternalLink, 
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
          <p className="text-gray-500 mt-1">Manage your admin panel settings</p>
        </div>

        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Basic platform configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input id="siteName" defaultValue="Aspiring Engineer" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteUrl">Site URL</Label>
                <Input id="siteUrl" defaultValue="https://aspiringengineers.com" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                defaultValue="admin@aspiringengineers.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supportEmail">Support Email</Label>
              <Input
                id="supportEmail"
                type="email"
                defaultValue="support@aspiringengineers.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Test Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Test Settings</CardTitle>
            <CardDescription>Default configuration for tests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="defaultDuration">Default Test Duration (minutes)</Label>
                <Input id="defaultDuration" type="number" defaultValue="180" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultNegative">Default Negative Marking</Label>
                <Input id="defaultNegative" type="number" step="0.25" defaultValue="1" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Site Configuration */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Site Configuration</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            
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

        {/* Payment Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Settings</CardTitle>
            <CardDescription>Configure payment gateway and options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" defaultValue="INR" disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minAmount">Minimum Order Value (₹)</Label>
              <Input id="minAmount" type="number" defaultValue="99" />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button size="lg">Save Settings</Button>
        </div>
      </div>
    </div>
  );
}
