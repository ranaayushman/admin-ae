import { create } from "zustand";
import {
  Package,
  PackageDetails,
  PackageFilters,
  getPackages,
  getPackageById as fetchPackageByIdApi,
  deletePackage,
} from "@/lib/services/package.service";

interface PackageStore {
  // State
  packages: Package[];
  selectedPackage: PackageDetails | null;
  loading: boolean;
  loadingDetails: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  filters: PackageFilters;
  lastFetched: number | null;

  // Computed stats
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
  loading: false,
  loadingDetails: false,
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

  invalidateCache: () => {
    set({ lastFetched: null });
  },
}));
