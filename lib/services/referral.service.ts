import apiClient, { handleApiError } from "./api.client";

export type ReferralStatus = "pending" | "rewarded" | "disqualified";

export interface Referrer {
  name: string;
  email: string;
  phone?: string;
  examTargets?: string[];
  pointsBalance?: number;
  successfulReferralsCount?: number;
}

export interface ReferredUser {
  name: string;
  email: string;
  phone?: string;
  examTargets?: string[];
  registrationDate?: string;
}

export interface ReferralItem {
  _id: string;
  referrerUserId: string;
  referrerName: string;
  referrerEmail: string;
  referredUserId: string;
  referredName: string;
  referredEmail: string;
  status: ReferralStatus;
  referralCodeUsed: string;
  pointsAwarded: number;
  firstSuccessfulPaymentId?: string;
  qualifiedAt?: string;
  rewardedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReferralDetail extends ReferralItem {
  referrer?: Referrer;
  referred?: ReferredUser;
  paymentDetails?: {
    amount: number;
    packageName: string;
    paymentDate: string;
  };
  disqualifiedAt?: string | null;
  disqualifyReason?: string | null;
  metadata?: {
    linkedAt: string;
    ipAddress: string;
  };
}

export interface ReferralsListResponse {
  data: ReferralItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReferralStats {
  overview: {
    totalReferrals: number;
    pendingReferrals: number;
    rewardedReferrals: number;
    disqualifiedReferrals: number;
    conversionRate: string;
    averageTimeToConversion: string;
  };
  pointsMetrics: {
    totalPointsIssued: number;
    totalPointsRedeemed: number;
    totalPointsOutstanding: number;
    averagePointsPerReferral: number;
  };
  revenueMetrics: {
    revenueFromReferrals: number;
    averageOrderValue: number;
    referredUserLifetimeValue: number;
    costPerAcquisition: number;
  };
  topReferrers?: Array<{
    userId: string;
    name: string;
    email: string;
    successfulReferrals: number;
    pointsEarned: number;
    revenue: number;
  }>;
  dailyTrends?: Array<{
    date: string;
    newReferrals: number;
    conversions: number;
    pointsIssued: number;
    revenue: number;
  }>;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  successfulReferrals: number;
  pointsEarned: number;
  revenueGenerated: number;
  recentActivity: string;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  generatedAt: string;
}

export interface FraudCheckResponse {
  referralId: string;
  fraudRiskScore: number;
  riskLevel: "low" | "medium" | "high";
  flags: string[];
  recommendations: string[];
}

export interface PointsAdjustmentResponse {
  userId: string;
  pointsBalanceBefore: number;
  pointsDelta: number;
  pointsBalanceAfter: number;
  transactionId: string;
  reason: string;
  processedAt: string;
  processedBy: string;
}

const unwrapData = <T>(payload: any): T => {
  if (payload?.data !== undefined) {
    return payload.data as T;
  }
  return payload as T;
};

export const referralService = {
  listReferrals: async (filters?: {
    status?: ReferralStatus;
    referrerId?: string;
    referredId?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<ReferralsListResponse> => {
    try {
      const response = await apiClient.get("/admin/referrals", { params: filters });
      const payload = response.data;

      // Handle common backend shapes safely:
      // 1) { data: [...], total, page, limit, totalPages }
      // 2) { data: { data: [...], total, page, limit, totalPages } }
      // 3) [...]
      const candidate = payload?.data && !Array.isArray(payload?.data)
        ? payload.data
        : payload;

      if (candidate && Array.isArray(candidate.data)) {
        return {
          data: candidate.data,
          total: Number(candidate.total ?? candidate.data.length ?? 0),
          page: Number(candidate.page ?? filters?.page ?? 1),
          limit: Number(candidate.limit ?? filters?.limit ?? 20),
          totalPages: Number(candidate.totalPages ?? 1),
        };
      }

      if (Array.isArray(candidate)) {
        return {
          data: candidate,
          total: candidate.length,
          page: Number(filters?.page ?? 1),
          limit: Number(filters?.limit ?? 20),
          totalPages: 1,
        };
      }

      return {
        data: [],
        total: 0,
        page: Number(filters?.page ?? 1),
        limit: Number(filters?.limit ?? 20),
        totalPages: 1,
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getReferralById: async (referralId: string): Promise<ReferralDetail> => {
    try {
      const response = await apiClient.get(`/admin/referrals/${referralId}`);
      return unwrapData<ReferralDetail>(response.data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  disqualifyReferral: async (
    referralId: string,
    payload: { reason: string; notes?: string }
  ): Promise<{ message: string; pointsRecovered?: number }> => {
    try {
      const response = await apiClient.patch(
        `/admin/referrals/${referralId}/disqualify`,
        payload
      );
      return unwrapData<{ message: string; pointsRecovered?: number }>(response.data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  adjustUserPoints: async (
    userId: string,
    payload: { pointsDelta: number; reason: string; description: string }
  ): Promise<PointsAdjustmentResponse> => {
    try {
      const response = await apiClient.patch(
        `/admin/users/${userId}/points`,
        payload
      );
      return unwrapData<PointsAdjustmentResponse>(response.data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getStats: async (filters?: {
    startDate?: string;
    endDate?: string;
    granularity?: string;
  }): Promise<ReferralStats> => {
    try {
      const response = await apiClient.get("/admin/referrals/stats", { params: filters });
      return unwrapData<ReferralStats>(response.data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getLeaderboard: async (filters?: {
    rankBy?: "referrals" | "points" | "revenue";
    limit?: number;
    period?: string;
  }): Promise<LeaderboardResponse> => {
    try {
      const response = await apiClient.get("/admin/referrals/leaderboard", {
        params: filters,
      });
      return unwrapData<LeaderboardResponse>(response.data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  verifyFraud: async (payload: {
    referralId: string;
    checkSuspiciousPatterns?: boolean;
    compareWithReferrer?: boolean;
  }): Promise<FraudCheckResponse> => {
    try {
      const response = await apiClient.post("/admin/referrals/verify-fraud", payload);
      return unwrapData<FraudCheckResponse>(response.data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
