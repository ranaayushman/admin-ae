import { create } from "zustand";
import {
  Package,
  PackageDetails,
  PackageFilters,
  DashboardStats,
  FeaturedPackage,
  WaitlistStatus,
  getPackages,
  getPackageById as fetchPackageByIdApi,
  deletePackage,
  getDashboardStats as fetchDashboardStats,
  getFeaturedPackages as fetchFeaturedPackagesApi,
  addTestToPackage as addTestToPackageApi,
  removeTestFromPackage as removeTestFromPackageApi,
  getWaitlistStatus as fetchWaitlistStatusApi,
} from "@/lib/services/package.service";

interface PackageStore {
  // State
  packages: Package[];
  selectedPackage: PackageDetails | null;
  featuredPackages: FeaturedPackage[];
  loading: boolean;
  loadingDetails: boolean;
  loadingStats: boolean;
  loadingFeatured: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  filters: PackageFilters;
  lastFetched: number | null;
  lastStatsFetched: number | null;

  // Dashboard stats from API
  dashboardStats: DashboardStats | null;

  // Computed stats (fallback if API fails)
  stats: {
    totalPackages: number;
    totalEnrollments: number;
    totalRevenue: number;
    activePackages: number;
  };

  // Actions
  fetchPackages: (
    filters?: PackageFilters,
    forceRefresh?: boolean
  ) => Promise<void>;
  fetchPackageById: (id: string) => Promise<PackageDetails>;
  fetchDashboardStats: (forceRefresh?: boolean) => Promise<DashboardStats>;
  fetchFeaturedPackages: () => Promise<FeaturedPackage[]>;
  addTestToPackage: (packageId: string, testId: string) => Promise<void>;
  removeTestFromPackage: (packageId: string, testId: string) => Promise<void>;
  fetchWaitlistStatus: (packageId: string) => Promise<WaitlistStatus>;
  setFilters: (filters: PackageFilters) => void;
  deletePackage: (id: string) => Promise<void>;
  clearPackages: () => void;
  clearSelectedPackage: () => void;
  getPackageFromCache: (id: string) => Package | undefined;
  invalidateCache: () => void;
}

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

export const usePackageStore = create<PackageStore>((set, get) => ({
  packages: [],
  selectedPackage: null,
  featuredPackages: [],
  loading: false,
  loadingDetails: false,
  loadingStats: false,
  loadingFeatured: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
  filters: {
    page: 1,
    limit: 10,
  },
  lastFetched: null,
  lastStatsFetched: null,
  dashboardStats: null,
  stats: {
    totalPackages: 0,
    totalEnrollments: 0,
    totalRevenue: 0,
    activePackages: 0,
  },

  fetchPackages: async (filters?: PackageFilters, forceRefresh = false) => {
    const state = get();
    const now = Date.now();

    // Check cache validity (skip if force refresh or filters changed)
    const filtersChanged =
      filters && JSON.stringify(filters) !== JSON.stringify(state.filters);

    if (
      !forceRefresh &&
      !filtersChanged &&
      state.lastFetched &&
      now - state.lastFetched < CACHE_DURATION &&
      state.packages.length > 0
    ) {
      // Use cached data
      return;
    }

    set({ loading: true, error: null });

    try {
      const filtersToUse = filters || state.filters;
      const response = await getPackages(filtersToUse);

      // Calculate stats from packages
      const packages = response.data || [];
      const stats = {
        totalPackages: response.pagination?.total || packages.length,
        totalEnrollments: packages.reduce(
          (sum, pkg) => sum + (pkg.enrollments || 0),
          0
        ),
        totalRevenue: packages.reduce(
          (sum, pkg) => sum + (pkg.revenue || 0),
          0
        ),
        activePackages: packages.filter((p) => p.status === "active").length,
      };

      set({
        packages,
        pagination: response.pagination || {
          total: packages.length,
          page: filtersToUse.page || 1,
          limit: filtersToUse.limit || 10,
          totalPages: Math.ceil(packages.length / (filtersToUse.limit || 10)),
        },
        filters: filtersToUse,
        stats,
        lastFetched: now,
        loading: false,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch packages";
      set({
        error: errorMessage,
        loading: false,
      });
    }
  },

  setFilters: (filters: PackageFilters) => {
    set({ filters });
  },

  deletePackage: async (id: string) => {
    try {
      await deletePackage(id);
      // Remove from local state
      const packages = get().packages.filter((pkg) => pkg._id !== id);
      const stats = {
        totalPackages: packages.length,
        totalEnrollments: packages.reduce(
          (sum, pkg) => sum + (pkg.enrollments || 0),
          0
        ),
        totalRevenue: packages.reduce(
          (sum, pkg) => sum + (pkg.revenue || 0),
          0
        ),
        activePackages: packages.filter((p) => p.status === "active").length,
      };
      set({ packages, stats });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete package";
      throw new Error(errorMessage);
    }
  },

  clearPackages: () => {
    set({
      packages: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },
      stats: {
        totalPackages: 0,
        totalEnrollments: 0,
        totalRevenue: 0,
        activePackages: 0,
      },
      lastFetched: null,
    });
  },

  clearSelectedPackage: () => {
    set({ selectedPackage: null });
  },

  getPackageFromCache: (id: string) => {
    return get().packages.find((pkg) => pkg._id === id);
  },

  fetchPackageById: async (id: string) => {
    set({ loadingDetails: true, error: null });

    // First, try to find in cache (list already has populated tests)
    const cachedPackage = get().packages.find((pkg) => pkg._id === id);

    try {
      const packageDetails = await fetchPackageByIdApi(id);
      set({ selectedPackage: packageDetails, loadingDetails: false });
      return packageDetails;
    } catch (error: unknown) {
      // If API fails but we have cached data, use it
      if (cachedPackage) {
        // Cast to PackageDetails since list API returns populated tests
        const packageDetails = cachedPackage as unknown as PackageDetails;
        set({
          selectedPackage: packageDetails,
          loadingDetails: false,
          error: null,
        });
        return packageDetails;
      }

      // No cached data, throw error
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch package details";
      set({ error: errorMessage, loadingDetails: false });
      throw new Error(errorMessage);
    }
  },

  // Fetch dashboard stats from API
  fetchDashboardStats: async (forceRefresh = false) => {
    const state = get();
    const now = Date.now();

    // Check cache validity
    if (
      !forceRefresh &&
      state.lastStatsFetched &&
      now - state.lastStatsFetched < CACHE_DURATION &&
      state.dashboardStats
    ) {
      return state.dashboardStats;
    }

    set({ loadingStats: true });

    try {
      const stats = await fetchDashboardStats();
      set({
        dashboardStats: stats,
        lastStatsFetched: now,
        loadingStats: false,
      });
      return stats;
    } catch (error: unknown) {
      // Fallback to computed stats if API fails
      set({ loadingStats: false });
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch dashboard stats";
      console.error(errorMessage);
      // Return computed stats as fallback
      return state.stats as DashboardStats;
    }
  },

  // Fetch featured packages
  fetchFeaturedPackages: async () => {
    set({ loadingFeatured: true });

    try {
      const featuredPackages = await fetchFeaturedPackagesApi();
      set({ featuredPackages, loadingFeatured: false });
      return featuredPackages;
    } catch (error: unknown) {
      set({ loadingFeatured: false });
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch featured packages";
      throw new Error(errorMessage);
    }
  },

  // Add test to package
  addTestToPackage: async (packageId: string, testId: string) => {
    try {
      const response = await addTestToPackageApi(packageId, testId);

      // Update selected package if it's the one being modified
      const selectedPackage = get().selectedPackage;
      if (selectedPackage && selectedPackage._id === packageId) {
        set({
          selectedPackage: {
            ...selectedPackage,
            totalTests: response.data.totalTests,
          },
        });
      }

      // Invalidate cache to refetch fresh data
      get().invalidateCache();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to add test to package";
      throw new Error(errorMessage);
    }
  },

  // Remove test from package
  removeTestFromPackage: async (packageId: string, testId: string) => {
    try {
      const response = await removeTestFromPackageApi(packageId, testId);

      // Update selected package if it's the one being modified
      const selectedPackage = get().selectedPackage;
      if (selectedPackage && selectedPackage._id === packageId) {
        // Remove test from tests array
        const updatedTests = selectedPackage.tests.filter(
          (test) => test._id !== testId
        );
        set({
          selectedPackage: {
            ...selectedPackage,
            tests: updatedTests,
            totalTests: response.data.totalTests,
          },
        });
      }

      // Invalidate cache to refetch fresh data
      get().invalidateCache();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to remove test from package";
      throw new Error(errorMessage);
    }
  },

  // Fetch waitlist status
  fetchWaitlistStatus: async (packageId: string) => {
    try {
      const status = await fetchWaitlistStatusApi(packageId);
      return status;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch waitlist status";
      throw new Error(errorMessage);
    }
  },

  invalidateCache: () => {
    set({ lastFetched: null, lastStatsFetched: null });
  },
}));
