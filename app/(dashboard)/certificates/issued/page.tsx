"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  AlertCircle,
  Download,
  ExternalLink,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  certificateService,
  type Certificate,
} from "@/lib/services/certificate.service";
import { handleApiError } from "@/lib/services/api.client";

const domainNames: Record<string, string> = {
  "web-dev": "Web Development",
  "app-dev": "App Development",
  cloud: "Cloud Computing",
  devops: "DevOps Engineering",
  "machine-learning": "Machine Learning",
  "data-science": "Data Science",
};

export default function IssuedCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  useEffect(() => {
    void fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await certificateService.getAllIssuedCertificates();
      setCertificates(data || []);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      setCertificates([]);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewDownload = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
  };

  const handleClosePreview = () => {
    setSelectedCertificate(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Issued Certificates</h1>
        <p className="text-gray-600 mt-1">
          View and manage all certificates issued to users
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Certificate History</CardTitle>
          <CardDescription>
            All certificates issued through the admin panel
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error ? (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6 flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
                <div className="flex-1">
                  <p className="font-medium text-red-900">Failed to load certificates</p>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={fetchCertificates}
                    disabled={loading}
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : certificates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No certificates issued yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Certificate ID</TableHead>
                    <TableHead>Certificate Number</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Issued Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {certificates.map((cert) => (
                    <TableRow key={cert._id}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {cert.certificateId}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {cert.certificateNumber}
                      </TableCell>
                      <TableCell>{domainNames[cert.domain]}</TableCell>
                      <TableCell>
                        {new Date(cert.issuedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePreviewDownload(cert)}
                            className="flex items-center gap-1"
                          >
                            <Download className="h-3 w-3" />
                            Download
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(cert.qrUrl, "_blank")}
                            className="flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Verify
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(selectedCertificate)} onOpenChange={(open) => !open && handleClosePreview()}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Download Certificate</DialogTitle>
            <DialogDescription>
              Preview the certificate image, then use the download button below to save it directly.
            </DialogDescription>
          </DialogHeader>

          {selectedCertificate ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                <div className="max-h-[70vh] overflow-auto rounded-md bg-white shadow-sm">
                  <img
                    src={selectedCertificate.fileUrl}
                    alt={`Certificate ${selectedCertificate.certificateNumber}`}
                    className="w-full h-auto"
                  />
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <p className="font-medium text-gray-900">
                  {selectedCertificate.certificateNumber}
                </p>
                <p>{domainNames[selectedCertificate.domain]}</p>
              </div>

              <DialogFooter className="sm:justify-between">
                <Button variant="outline" onClick={handleClosePreview}>
                  Close
                </Button>
                <Button asChild>
                  <a
                    href={selectedCertificate.fileUrl}
                    download
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Certificate
                  </a>
                </Button>
              </DialogFooter>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
