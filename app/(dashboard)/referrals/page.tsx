"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  referralService,
  ReferralStatus,
  ReferralItem,
  ReferralStats,
  LeaderboardEntry,
  FraudCheckResponse,
} from "@/lib/services/referral.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Gift,
  Loader2,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  Users,
  Crown,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { toast } from "sonner";

const getStatusVariant = (status: ReferralStatus) => {
  if (status === "rewarded") return "default" as const;
  if (status === "disqualified") return "destructive" as const;
  return "secondary" as const;
};

const getRiskLevelVariant = (level: string) => {
  if (level === "high") return "destructive" as const;
  if (level === "medium") return "secondary" as const;
  return "default" as const;
};

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<ReferralItem[]>([]);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const [isLoadingReferrals, setIsLoadingReferrals] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<ReferralStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [disqualifyDialogOpen, setDisqualifyDialogOpen] = useState(false);
  const [selectedReferralId, setSelectedReferralId] = useState<string | null>(null);
  const [disqualifyReason, setDisqualifyReason] = useState("");
  const [disqualifyNotes, setDisqualifyNotes] = useState("");
  const [isDisqualifying, setIsDisqualifying] = useState(false);

  const [pointsDialogOpen, setPointsDialogOpen] = useState(false);
  const [pointsUserId, setPointsUserId] = useState("");
  const [pointsDelta, setPointsDelta] = useState(0);
  const [pointsReason, setPointsReason] = useState("bonus_campaign");
  const [pointsDescription, setPointsDescription] = useState("");
  const [isAdjustingPoints, setIsAdjustingPoints] = useState(false);

  const [fraudDialogOpen, setFraudDialogOpen] = useState(false);
  const [fraudResult, setFraudResult] = useState<FraudCheckResponse | null>(null);
  const [isCheckingFraud, setIsCheckingFraud] = useState(false);

  const fetchReferrals = useCallback(async () => {
    try {
      setIsLoadingReferrals(true);
      const data = await referralService.listReferrals({
        status: statusFilter !== "all" ? (statusFilter as ReferralStatus) : undefined,
        page,
        limit: 20,
      });
      const referralsList = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
          ? data
          : [];
      setReferrals(referralsList);
      setTotalPages(typeof data?.totalPages === "number" && data.totalPages > 0 ? data.totalPages : 1);
    } catch (error: any) {
      setReferrals([]);
      setTotalPages(1);
      toast.error("Failed to load referrals", { description: error.message });
    } finally {
      setIsLoadingReferrals(false);
    }
  }, [page, statusFilter]);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoadingStats(true);
      const data = await referralService.getStats();
      setStats(data);
    } catch (error: any) {
      toast.error("Failed to load stats", { description: error.message });
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setIsLoadingLeaderboard(true);
      const data = await referralService.getLeaderboard({
        rankBy: "revenue",
        limit: 10,
      });
      setLeaderboard(data.leaderboard);
    } catch (error: any) {
      toast.error("Failed to load leaderboard", { description: error.message });
    } finally {
      setIsLoadingLeaderboard(false);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await Promise.all([fetchReferrals(), fetchStats(), fetchLeaderboard()]);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchReferrals, fetchStats, fetchLeaderboard]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const handleDisqualify = async () => {
    if (!selectedReferralId || !disqualifyReason.trim()) {
      toast.error("Reason is required");
      return;
    }

    try {
      setIsDisqualifying(true);
      await referralService.disqualifyReferral(selectedReferralId, {
        reason: disqualifyReason,
        notes: disqualifyNotes || undefined,
      });
      toast.success("Referral disqualified successfully");
      setDisqualifyDialogOpen(false);
      setDisqualifyReason("");
      setDisqualifyNotes("");
      setSelectedReferralId(null);
      await fetchReferrals();
    } catch (error: any) {
      toast.error("Failed to disqualify referral", { description: error.message });
    } finally {
      setIsDisqualifying(false);
    }
  };

  const handleAdjustPoints = async () => {
    if (!pointsUserId.trim()) {
      toast.error("User ID is required");
      return;
    }

    try {
      setIsAdjustingPoints(true);
      const result = await referralService.adjustUserPoints(pointsUserId, {
        pointsDelta,
        reason: pointsReason,
        description: pointsDescription,
      });
      toast.success("Points adjusted successfully", {
        description: `New balance: ${result.pointsBalanceAfter}`,
      });
      setPointsDialogOpen(false);
      setPointsUserId("");
      setPointsDelta(0);
      setPointsReason("bonus_campaign");
      setPointsDescription("");
    } catch (error: any) {
      toast.error("Failed to adjust points", { description: error.message });
    } finally {
      setIsAdjustingPoints(false);
    }
  };

  const handleCheckFraud = async (referralId: string) => {
    try {
      setIsCheckingFraud(true);
      const result = await referralService.verifyFraud({
        referralId,
        checkSuspiciousPatterns: true,
        compareWithReferrer: true,
      });
      setFraudResult(result);
      setFraudDialogOpen(true);
      toast.success("Fraud check completed");
    } catch (error: any) {
      toast.error("Fraud check failed", { description: error.message });
    } finally {
      setIsCheckingFraud(false);
    }
  };

  const filteredReferrals = useMemo(() => {
    const referralsList = Array.isArray(referrals) ? referrals : [];
    if (!searchQuery.trim()) return referralsList;
    const query = searchQuery.toLowerCase();
    return referralsList.filter(
      (ref) =>
        (ref.referrerName ?? "").toLowerCase().includes(query) ||
        (ref.referrerEmail ?? "").toLowerCase().includes(query) ||
        (ref.referredName ?? "").toLowerCase().includes(query) ||
        (ref.referredEmail ?? "").toLowerCase().includes(query)
    );
  }, [referrals, searchQuery]);

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Gift className="w-8 h-8 text-yellow-600" />
              Refer & Earn
            </h1>
            <p className="text-gray-500 mt-1">
              Manage referral programs, rewards, and user engagement metrics.
            </p>
          </div>
          <Button variant="outline" onClick={refreshAll} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Overview */}
        {stats && !isLoadingStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Total Referrals</p>
                <p className="text-3xl font-bold mt-2">{stats.overview.totalReferrals}</p>
                <p className="text-xs text-green-600 mt-1">
                  {stats.overview.conversionRate} conversion rate
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Points Issued</p>
                <p className="text-3xl font-bold mt-2 text-yellow-600">
                  {stats.pointsMetrics.totalPointsIssued.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  ₹{stats.revenueMetrics.revenueFromReferrals.toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Avg Order Value</p>
                <p className="text-3xl font-bold mt-2">
                  ₹{stats.revenueMetrics.averageOrderValue.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  CAC: ₹{stats.revenueMetrics.costPerAcquisition}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Disputed</p>
                <p className="text-3xl font-bold mt-2 text-red-600">
                  {stats.overview.disqualifiedReferrals}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {((stats.overview.disqualifiedReferrals / stats.overview.totalReferrals) * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="referrals" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          {/* Referrals Tab */}
          <TabsContent value="referrals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Filter & Search</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select
                    className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                    value={statusFilter}
                    onChange={(event) => {
                      setStatusFilter(event.target.value as ReferralStatus | "all");
                      setPage(1);
                    }}
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="rewarded">Rewarded</option>
                    <option value="disqualified">Disqualified</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Referral List</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingReferrals ? (
                  <div className="py-8 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading referrals...
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Referrer</TableHead>
                          <TableHead>Referred User</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Points</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredReferrals.map((referral) => (
                          <TableRow key={referral._id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{referral.referrerName}</p>
                                <p className="text-xs text-muted-foreground">{referral.referrerEmail}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{referral.referredName}</p>
                                <p className="text-xs text-muted-foreground">{referral.referredEmail}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusVariant(referral.status)}>
                                {referral.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-semibold text-yellow-600">
                              {referral.pointsAwarded}
                            </TableCell>
                            <TableCell className="text-sm">
                              {new Date(referral.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCheckFraud(referral._id)}
                                  disabled={isCheckingFraud}
                                >
                                  <AlertTriangle className="w-4 h-4" />
                                  Check Fraud
                                </Button>
                                {referral.status !== "disqualified" && (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => {
                                      setSelectedReferralId(referral._id);
                                      setDisqualifyDialogOpen(true);
                                    }}
                                  >
                                    <AlertCircle className="w-4 h-4" />
                                    Disqualify
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {filteredReferrals.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              No referrals found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <div className="text-sm text-muted-foreground">
                          Page {page} of {totalPages}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                            disabled={page === totalPages}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-600" />
                  Top Referrers
                </CardTitle>
                <CardDescription>Ranked by revenue generated</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingLeaderboard ? (
                  <div className="py-8 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading leaderboard...
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leaderboard.map((entry) => (
                      <div
                        key={entry.userId}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100 font-bold text-yellow-700">
                            #{entry.rank}
                          </div>
                          <div>
                            <p className="font-medium">{entry.name}</p>
                            <p className="text-sm text-muted-foreground">{entry.email}</p>
                          </div>
                        </div>
                        <div className="flex gap-4 text-right">
                          <div>
                            <p className="text-xs text-muted-foreground">Referrals</p>
                            <p className="text-lg font-bold">{entry.successfulReferrals}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Points</p>
                            <p className="text-lg font-bold text-yellow-600">{entry.pointsEarned}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Revenue</p>
                            <p className="text-lg font-bold text-green-600">
                              ₹{entry.revenueGenerated.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {leaderboard.length === 0 && (
                      <p className="text-center py-8 text-muted-foreground">No leaderboard data available</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Adjust Points Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Adjust User Points</CardTitle>
                  <CardDescription>Add or remove points for corrections or rewards</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => setPointsDialogOpen(true)}
                    className="w-full"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Adjust Points
                  </Button>
                </CardContent>
              </Card>

              {/* Disqualify Referral Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Disqualify Referral</CardTitle>
                  <CardDescription>Mark a referral as disqualified with reason</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Use the Referrals tab to select a referral and disqualify it.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Disqualify Dialog */}
        <Dialog open={disqualifyDialogOpen} onOpenChange={setDisqualifyDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Disqualify Referral</DialogTitle>
              <DialogDescription>
                Provide a reason for disqualifying this referral. Points will be recovered from the referrer.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              <div>
                <label className="text-sm font-medium">Reason (Required)</label>
                <Input
                  placeholder="e.g., Multiple accounts, Fraudulent activity"
                  value={disqualifyReason}
                  onChange={(event) => setDisqualifyReason(event.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Notes (Optional)</label>
                <Textarea
                  placeholder="Additional details for admin records..."
                  value={disqualifyNotes}
                  onChange={(event) => setDisqualifyNotes(event.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDisqualifyDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDisqualify}
                disabled={isDisqualifying}
              >
                {isDisqualifying ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Disqualify
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Points Dialog */}
        <Dialog open={pointsDialogOpen} onOpenChange={setPointsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adjust User Points</DialogTitle>
              <DialogDescription>Manually adjust points for corrections or rewards</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              <div>
                <label className="text-sm font-medium">User ID</label>
                <Input
                  placeholder="24-character MongoDB ID"
                  value={pointsUserId}
                  onChange={(event) => setPointsUserId(event.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Points Delta</label>
                <Input
                  type="number"
                  placeholder="Positive to add, negative to deduct"
                  value={pointsDelta}
                  onChange={(event) => setPointsDelta(Number(event.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Reason</label>
                <select
                  className="h-9 rounded-md border border-input bg-transparent px-3 text-sm w-full mt-1"
                  value={pointsReason}
                  onChange={(event) => setPointsReason(event.target.value)}
                >
                  <option value="bonus_campaign">Bonus Campaign</option>
                  <option value="correction">Correction</option>
                  <option value="contested_referral">Contested Referral</option>
                  <option value="penalty">Penalty</option>
                  <option value="recovery">Recovery</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Detailed explanation for audit trail..."
                  value={pointsDescription}
                  onChange={(event) => setPointsDescription(event.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPointsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAdjustPoints} disabled={isAdjustingPoints}>
                {isAdjustingPoints ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Adjust Points
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Fraud Check Dialog */}
        <Dialog open={fraudDialogOpen} onOpenChange={setFraudDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Fraud Risk Assessment</DialogTitle>
              <DialogDescription>Analysis of suspicious patterns in this referral</DialogDescription>
            </DialogHeader>
            {fraudResult && (
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <span className="font-medium">Risk Level</span>
                  <Badge variant={getRiskLevelVariant(fraudResult.riskLevel)}>
                    {fraudResult.riskLevel.toUpperCase()}
                  </Badge>
                </div>

                <div>
                  <p className="font-medium mb-2">Risk Score: {fraudResult.fraudRiskScore}/100</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        fraudResult.fraudRiskScore > 70
                          ? "bg-red-600"
                          : fraudResult.fraudRiskScore > 30
                          ? "bg-yellow-600"
                          : "bg-green-600"
                      }`}
                      style={{ width: `${fraudResult.fraudRiskScore}%` }}
                    />
                  </div>
                </div>

                {fraudResult.flags.length > 0 && (
                  <div>
                    <p className="font-medium mb-2">Flags</p>
                    <ul className="space-y-1">
                      {fraudResult.flags.map((flag, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
                          {flag}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {fraudResult.recommendations.length > 0 && (
                  <div>
                    <p className="font-medium mb-2">Recommendations</p>
                    <ul className="space-y-1">
                      {fraudResult.recommendations.map((rec, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setFraudDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
