// app/settings/page.tsx
"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

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

        {/* Footer Management */}
        <Card>
          <CardHeader>
            <CardTitle>Footer Management</CardTitle>
            <CardDescription>Manage website footer links and content</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/settings/footer">
              <Button className="flex items-center gap-2">
                Manage Footer Links
                <ExternalLink className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Hero Banners Management */}
        <Card>
            <CardHeader>
                <CardTitle>Hero Banners</CardTitle>
                <CardDescription>Update the homepage hero slider</CardDescription>
            </CardHeader>
            <CardContent>
                <Link href="/settings/hero-banners">
                    <Button className="flex items-center gap-2">
                        Manage Hero Banners
                        <ExternalLink className="w-4 h-4" />
                    </Button>
                </Link>
            </CardContent>
        </Card>

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
