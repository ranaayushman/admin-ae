// app/questions/[id]/edit/page.tsx
"use client";

import React from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditQuestionPage() {
  const params = useParams();
  const questionId = params.id;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/questions">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Questions
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Question</h1>
            <p className="text-gray-500 mt-1">Question ID: {questionId}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit Question Form</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-8 text-center text-gray-500">
              <p className="text-lg font-medium">Question Edit Form</p>
              <p className="mt-2">
                This page will reuse the existing question form from /pyq with pre-filled data.
              </p>
              <p className="mt-4 text-sm">
                The form will fetch question details from:
                <code className="block mt-2 p-2 bg-gray-100 rounded">
                  GET /api/admin/questions/{questionId}
                </code>
              </p>
              <p className="mt-4 text-sm">
                And submit updates to:
                <code className="block mt-2 p-2 bg-gray-100 rounded">
                  PUT /api/admin/questions/{questionId}
                </code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
