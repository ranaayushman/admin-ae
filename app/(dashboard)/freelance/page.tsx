"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Search,
  ArrowUpDown,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import freelanceService, {
  FreelanceServiceError,
} from "@/lib/services/freelance.service";
import {
  AdminFreelanceProfilesQuery,
  FREELANCE_DOMAINS,
  FREELANCE_STATUSES,
  FreelanceDomain,
  FreelancePagination,
  FreelanceProfile,
  FreelanceStatistics,
  FreelanceStatus,
} from "@/lib/types/freelance";

const DEFAULT_PAGINATION: FreelancePagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
};

const statusClasses: Record<FreelanceStatus, string> = {
  submitted: "bg-blue-100 text-blue-700 border-blue-200",
  "under-review": "bg-amber-100 text-amber-700 border-amber-200",
  verified: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
  contacted: "bg-indigo-100 text-indigo-700 border-indigo-200",
  archived: "bg-slate-100 text-slate-700 border-slate-200",
};

const humanizeSlug = (value: string) =>
  value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const formatDate = (value: string) => {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const mapErrorMessage = (error: unknown): string => {
  if (error instanceof FreelanceServiceError) {
    if (error.statusCode === 401) {
      return "Your session has expired. Please login again.";
    }
    if (error.statusCode === 403) {
      return "You do not have access to this admin module.";
    }
    if (error.statusCode === 404) {
      return "Freelance profiles endpoint was not found.";
    }
    return error.message;
  }

  return "Unable to load freelance profiles right now.";
};

export default function FreelanceAdminListPage() {
  const router = useRouter();

  const [profiles, setProfiles] = useState<FreelanceProfile[]>([]);
  const [statistics, setStatistics] = useState<FreelanceStatistics | null>(null);
  const [pagination, setPagination] = useState<FreelancePagination>(
    DEFAULT_PAGINATION,
  );

  const [statusFilter, setStatusFilter] = useState<"all" | FreelanceStatus>(
    "all",
  );
  const [domainFilter, setDomainFilter] = useState<"all" | FreelanceDomain>(
    "all",
  );
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const query = useMemo<AdminFreelanceProfilesQuery>(
    () => ({
      status: statusFilter === "all" ? undefined : statusFilter,
      domain: domainFilter === "all" ? undefined : domainFilter,
      search: search.trim() ? search.trim() : undefined,
      page,
      limit,
      sortBy,
      sortOrder,
    }),
    [statusFilter, domainFilter, search, page, limit, sortBy, sortOrder],
  );

  const loadData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const listData = await freelanceService.getAdminFreelanceProfiles(query);

      setProfiles(listData.profiles);
      setPagination(listData.pagination);
      try {
        const statsData = await freelanceService.getFreelanceStatistics();
        setStatistics(statsData);
      } catch {
        setStatistics(null);
      }
      setErrorBanner(null);
    } catch (error) {
      const message = mapErrorMessage(error);
      setErrorBanner(message);

      if (error instanceof FreelanceServiceError && error.statusCode === 401) {
        const returnUrl = "/freelance";
        router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [query, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    await loadData();
    toast.success("Freelance profiles refreshed");
  };

  const handleFilterStatus = (value: string) => {
    setStatusFilter(value === "all" ? "all" : (value as FreelanceStatus));
    setPage(1);
  };

  const handleFilterDomain = (value: string) => {
    setDomainFilter(value === "all" ? "all" : (value as FreelanceDomain));
    setPage(1);
  };

  const handleSortBy = (value: string) => {
    setSortBy(value);
    setPage(1);
  };

  const handleSortOrder = (value: string) => {
    setSortOrder(value as "asc" | "desc");
    setPage(1);
  };

  const handleLimitChange = (value: string) => {
    setLimit(Number(value));
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BriefcaseBusiness className="w-8 h-8" />
              Freelance Profiles
            </h1>
            <p className="text-gray-500 mt-1">
              Review applications, track status, and manage outreach.
            </p>
          </div>
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {errorBanner && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3 text-red-700">
                <AlertTriangle className="w-5 h-5 mt-0.5" />
                <div>
                  <p className="font-semibold">Could not load freelance data</p>
                  <p className="text-sm">{errorBanner}</p>
                </div>
              </div>
              <Button variant="outline" onClick={loadData} disabled={isRefreshing}>
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Profiles</CardDescription>
              <CardTitle>{statistics?.totalProfiles ?? pagination.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>By Status</CardDescription>
              <div className="flex flex-wrap gap-2">
                {FREELANCE_STATUSES.map((status) => (
                  <Badge key={status} variant="outline" className={statusClasses[status]}>
                    {humanizeSlug(status)}: {statistics?.byStatus?.[status] ?? 0}
                  </Badge>
                ))}
              </div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>By Domain</CardDescription>
              <div className="flex flex-wrap gap-2">
                {FREELANCE_DOMAINS.slice(0, 6).map((domain) => (
                  <Badge key={domain} variant="secondary">
                    {humanizeSlug(domain)}: {statistics?.byDomain?.[domain] ?? 0}
                  </Badge>
                ))}
              </div>
            </CardHeader>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters and Sorting</CardTitle>
            <CardDescription>
              Narrow down profiles using status, domain, and keywords.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  className="pl-10"
                  placeholder="Search name, email, phone"
                />
              </div>

              <Select value={statusFilter} onValueChange={handleFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {FREELANCE_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {humanizeSlug(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={domainFilter} onValueChange={handleFilterDomain}>
                <SelectTrigger>
                  <SelectValue placeholder="Domain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Domains</SelectItem>
                  {FREELANCE_DOMAINS.map((domain) => (
                    <SelectItem key={domain} value={domain}>
                      {humanizeSlug(domain)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={handleSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Created Date</SelectItem>
                  <SelectItem value="fullName">Name</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="domain">Domain</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortOrder} onValueChange={handleSortOrder}>
                <SelectTrigger>
                  <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descending</SelectItem>
                  <SelectItem value="asc">Ascending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4" />
              Freelancers ({pagination.total})
            </CardTitle>
            <CardDescription>
              Showing page {pagination.page} of {pagination.totalPages}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell>
                      <p className="font-medium">{profile.fullName}</p>
                      <p className="text-xs text-gray-500">{profile.phoneNumber}</p>
                    </TableCell>
                    <TableCell>{profile.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{humanizeSlug(profile.domain)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusClasses[profile.status]} variant="outline">
                        {humanizeSlug(profile.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(profile.submittedAt || profile.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/freelance/${profile.id}`}>
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {profiles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      No freelance profiles found for current filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Rows per page</span>
                <Select value={String(limit)} onValueChange={handleLimitChange}>
                  <SelectTrigger className="w-24 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page <= 1 || isRefreshing}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                  disabled={page >= pagination.totalPages || isRefreshing}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
