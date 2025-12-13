// app/enrollments/manual/page.tsx
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  manualEnrollmentSchema,
  ManualEnrollmentFormValues,
} from "@/lib/validations/package-schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { toast } from "sonner";

// Mock packages
const mockPackages = [
  { id: "pkg_001", name: "JEE Main 2025 Complete Package", price: 2999 },
  { id: "pkg_002", name: "NEET 2025 Crash Course", price: 1999 },
  { id: "pkg_003", name: "12th Board Practice Package", price: 999 },
];

export default function ManualEnrollmentPage() {
  const [studentFound, setStudentFound] = useState(false);
  const [studentInfo, setStudentInfo] = useState<any>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ManualEnrollmentFormValues>({
    resolver: zodResolver(manualEnrollmentSchema),
    defaultValues: {
      studentEmail: "",
      packageId: "",
      enrollmentType: "FREE",
      customPrice: 0,
      customValidity: 0,
      notes: "",
    },
  });

  const enrollmentType = watch("enrollmentType");

  const handleStudentSearch = () => {
    const email = watch("studentEmail");
    if (email) {
      // Mock student lookup
      setStudentInfo({
        name: "John Doe",
        email: email,
        phone: "+91 9876543210",
        enrollments: 2,
      });
      setStudentFound(true);
      toast.success("Student found!");
    }
  };

  const onSubmit = (data: ManualEnrollmentFormValues) => {
    const payload = {
      ...data,
      studentInfo,
      enrolledAt: new Date().toISOString(),
      enrolledBy: "admin_id",
    };

    console.log("Manual Enrollment Payload:", payload);
    toast.success("Student enrolled successfully!", {
      description: `Enrolled in package via ${data.enrollmentType} enrollment`,
    });

    reset();
    setStudentFound(false);
    setStudentInfo(null);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manual Enrollment</h1>
          <p className="text-gray-500 mt-1">
            Manually enroll students in packages (for promotions, scholarships, etc.)
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Student Lookup */}
          <Card>
            <CardHeader>
              <CardTitle>Student Lookup</CardTitle>
              <CardDescription>Search for student by email</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="studentEmail">Student Email *</Label>
                  <Input
                    id="studentEmail"
                    type="email"
                    placeholder="student@example.com"
                    {...register("studentEmail")}
                  />
                  {errors.studentEmail && (
                    <p className="text-sm text-red-600">
                      {errors.studentEmail.message}
                    </p>
                  )}
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    onClick={handleStudentSearch}
                    className="flex items-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    Search
                  </Button>
                </div>
              </div>

              {studentFound && studentInfo && (
                <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2">
                    Student Found
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <span className="ml-2 font-medium">{studentInfo.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <span className="ml-2 font-medium">{studentInfo.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <span className="ml-2 font-medium">{studentInfo.phone}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Current Enrollments:</span>
                      <span className="ml-2 font-medium">
                        {studentInfo.enrollments}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Package Selection */}
          {studentFound && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Package Selection</CardTitle>
                  <CardDescription>Select package to enroll student in</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="packageId">Package *</Label>
                    <Select
                      onValueChange={(value) => setValue("packageId", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select package" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockPackages.map((pkg) => (
                          <SelectItem key={pkg.id} value={pkg.id}>
                            {pkg.name} - ₹{pkg.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.packageId && (
                      <p className="text-sm text-red-600">
                        {errors.packageId.message}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Enrollment Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle>Enrollment Configuration</CardTitle>
                  <CardDescription>
                    Configure enrollment type and pricing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="enrollmentType">Enrollment Type *</Label>
                    <Select
                      onValueChange={(value) =>
                        setValue("enrollmentType", value as any)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FREE">
                          Free (Promotional/Scholarship)
                        </SelectItem>
                        <SelectItem value="DISCOUNTED">
                          Discounted (Custom Price)
                        </SelectItem>
                        <SelectItem value="PAID">
                          Paid (Full Price - Manual Payment)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(enrollmentType === "DISCOUNTED" ||
                    enrollmentType === "PAID") && (
                    <div className="space-y-2">
                      <Label htmlFor="customPrice">
                        {enrollmentType === "DISCOUNTED"
                          ? "Discounted Price (₹)"
                          : "Amount Paid (₹)"}
                      </Label>
                      <Input
                        id="customPrice"
                        type="number"
                        {...register("customPrice", { valueAsNumber: true })}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="customValidity">
                      Custom Validity (days, 0 = package default)
                    </Label>
                    <Input
                      id="customValidity"
                      type="number"
                      placeholder="0"
                      {...register("customValidity", { valueAsNumber: true })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <textarea
                      id="notes"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Reason for manual enrollment..."
                      {...register("notes")}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Submit */}
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    reset();
                    setStudentFound(false);
                    setStudentInfo(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Enrolling..." : "Enroll Student"}
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
