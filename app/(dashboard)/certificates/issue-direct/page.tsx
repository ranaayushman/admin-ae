"use client";

import { useState } from "react";
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
import { toast } from "sonner";
import { AlertCircle, Info, Loader2 } from "lucide-react";
import { certificateService } from "@/lib/services/certificate.service";
import { handleApiError } from "@/lib/services/api.client";

export default function IssueCertificatePage() {
  const [formData, setFormData] = useState({
    email: "",
    domain: "",
    overrideName: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDomainChange = (value: string) => {
    setFormData((prev) => ({ ...prev, domain: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.domain) {
      const message = "Please fill in all required fields";
      setError(message);
      toast.error(message);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await certificateService.issueDirectCertificate({
        email: formData.email,
        domain: formData.domain as
          | "web-dev"
          | "app-dev"
          | "cloud"
          | "devops"
          | "machine-learning"
          | "data-science",
        overrideName: formData.overrideName || undefined,
      });
      toast.success(`Certificate issued! ID: ${data.certificateId}`);
      setFormData({ email: "", domain: "", overrideName: "" });
    } catch (err) {
      const message = handleApiError(err);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Issue Certificate</h1>
        <p className="text-gray-600 mt-1">
          Directly issue a certificate to a user without requiring a request
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Issue New Certificate</CardTitle>
              <CardDescription>
                Fill in the details to issue a certificate directly
              </CardDescription>
            </CardHeader>

            <CardContent>
              {error ? (
                <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                  <div>
                    <p className="font-medium text-red-900">Unable to issue certificate</p>
                    <p className="mt-1 text-red-700">{error}</p>
                  </div>
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="email" className="font-medium">
                    User Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter user email"
                    value={formData.email}
                    onChange={(event) => {
                      setError(null);
                      handleInputChange(event);
                    }}
                    disabled={loading}
                    className="mt-2"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Certificate will be issued to this email's account
                  </p>
                </div>

                <div>
                  <Label htmlFor="domain" className="font-medium">
                    Domain <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.domain} onValueChange={handleDomainChange}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select a domain" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="web-dev">Web Development</SelectItem>
                      <SelectItem value="app-dev">App Development</SelectItem>
                      <SelectItem value="cloud">Cloud Computing</SelectItem>
                      <SelectItem value="devops">DevOps Engineering</SelectItem>
                      <SelectItem value="machine-learning">Machine Learning</SelectItem>
                      <SelectItem value="data-science">Data Science</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="overrideName" className="font-medium">
                    Override Name (Optional)
                  </Label>
                  <Input
                    id="overrideName"
                    name="overrideName"
                    placeholder="Leave blank to use user's registered name"
                    value={formData.overrideName}
                    onChange={(event) => {
                      setError(null);
                      handleInputChange(event);
                    }}
                    disabled={loading}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    If set, this name will appear on the certificate instead of the user's
                    registered name
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Issuing Certificate...
                    </>
                  ) : (
                    "Issue Certificate"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="h-4 w-4" />
                Information
              </CardTitle>
            </CardHeader>

            <CardContent>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex gap-2">
                  <span className="text-blue-600 font-bold shrink-0">•</span>
                  <span>Direct issuance bypasses the user request flow</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600 font-bold shrink-0">•</span>
                  <span>A user can only have one certificate per domain</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600 font-bold shrink-0">•</span>
                  <span>Format: TAE-[CODE]-[YEAR]-[SEQ]</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600 font-bold shrink-0">•</span>
                  <span>Both records are created for audit</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
