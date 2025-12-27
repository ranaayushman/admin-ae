import apiClient, { handleApiError } from "./api.client";

// Dashboard Stats Types
export interface StatItem {
  count?: number;
  amount?: number;
  growth?: string;
  label: string;
  added?: number;
}

export interface RecentRegistration {
  name: string;
  email: string;
  verified: boolean;
  timeAgo: string;
}

export interface RecentPurchase {
  packageName: string;
  buyerName: string;
  price: number;
  timeAgo: string;
}

export interface DashboardStats {
  totalUsers: {
    count: number;
    growth: string;
    label: string;
  };
  totalSales: {
    amount: number;
    growth: string;
    label: string;
  };
  totalQuestions: {
    count: number;
    added: number;
    label: string;
  };
  activeTests: {
    count: number;
    label: string;
  };
  recentRegistrations: RecentRegistration[];
  recentPurchases: RecentPurchase[];
  questionsBySubject: Record<string, number>;
}

export interface DashboardStatsResponse {
  success: boolean;
  data: DashboardStats;
}

/**
 * Get admin dashboard statistics
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await apiClient.get<DashboardStatsResponse>(
      "/admin/dashboard/stats"
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw new Error(handleApiError(error));
  }
};

export default {
  getDashboardStats,
};
