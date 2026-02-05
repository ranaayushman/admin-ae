"use client";

import React, { useState, useEffect, useCallback } from "react";
import { internshipService } from "@/lib/services/internship.service";
import { InternshipApplication } from "@/lib/types/internship";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  Loader2,
  RefreshCw,
  GraduationCap,
  Download,
  FileSpreadsheet,
  FileIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function InternshipApplicationsPage() {
  const [applications, setApplications] = useState<InternshipApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Fetch applications
  const fetchApplications = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const data = await internshipService.getInternshipApplications({
        page: currentPage,
        limit,
      });
      setApplications(data.data || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error: any) {
      console.error("Failed to fetch applications:", error);
      toast.error("Failed to load internship applications", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Export as CSV
  const exportCSV = () => {
    if (applications.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = [
      "Name",
      "Phone",
      "College",
      "Father's Name",
      "Location",
      "CGPA",
      "Year",
      "Branch",
      "Internship Type",
      "Applied At"
    ];

    const rows = applications.map(app => [
      app.name || app.fullName || "-",
      app.phone,
      app.college || app.collegeName || "-",
      app.fathersName || app.fatherName || "-",
      app.location,
      app.cgpa || app.cgpaPercentage || "-",
      app.year || app.currentYear || "-",
      app.branch,
      app.internshipType || "-",
      new Date(app.createdAt).toLocaleString()
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map(e => e.map(item => `"${item}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `internship_applications_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export as PDF
  const exportPDF = () => {
    if (applications.length === 0) {
        toast.error("No data to export");
        return;
    }

    const doc = new jsPDF();

    // Add Title
    doc.setFontSize(18);
    doc.text("Internship Applications", 14, 22);
    
    // Add Date
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    const headers = [
      ["Name", "Type", "College", "Branch", "Year", "Phone"]
    ];

    const data = applications.map(app => [
      app.name || app.fullName || "-",
      app.internshipType || "-",
      app.college || app.collegeName || "-",
      app.branch,
      app.year || app.currentYear || "-",
      app.phone
    ]);

    autoTable(doc, {
      head: headers,
      body: data,
      startY: 40,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [37, 150, 190], textColor: 255 }, // #2596be
    });

    doc.save(`internship_applications_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-primary" />
            Internship Applications
          </h1>
          <p className="text-muted-foreground">
            Manage student internship applications
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
           <Button
            variant="outline"
            onClick={fetchApplications}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          
          <Button variant="outline" onClick={exportCSV}>
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          
          <Button variant="outline" onClick={exportPDF}>
             <FileIcon className="w-4 h-4 mr-2" />
             Export PDF
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-sm text-muted-foreground">Total Applications</p>
          </CardContent>
        </Card>
      </div>

      {/* Applications Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Applicant</TableHead>
              <TableHead>Internship Type</TableHead>
              <TableHead>Academic Info</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((app) => (
              <TableRow key={app._id}>
                <TableCell>
                  <div className="font-medium">{app.name || app.fullName || "-"}</div>
                  <div className="text-xs text-muted-foreground">{app.phone}</div>
                  <div className="text-xs text-muted-foreground">Father: {app.fathersName || app.fatherName || "-"}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{app.internshipType || "Not Specified"}</Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm font-medium">{app.college || app.collegeName || "-"}</div>
                  <div className="text-xs text-muted-foreground">
                    {app.branch} • {app.year || app.currentYear || "-"}
                  </div>
                  <div className="text-xs text-muted-foreground">CGPA: {app.cgpa || app.cgpaPercentage || "-"}</div>
                </TableCell>
                <TableCell>
                    <div className="text-sm">{app.location}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </div>
                   <div className="text-xs text-muted-foreground">
                    {new Date(app.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {applications.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No applications found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination (Reused logic) */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
               <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
