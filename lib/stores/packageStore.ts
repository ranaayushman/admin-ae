import { create } from "zustand";
import {
  Package,
  PackageFilters,
  getPackages,
  deletePackage,
} from "@/lib/services/package.service";

interface PackageStore {
  // State
  packages: Package[];
  loading: boolean;
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
  setFilters: (filters: PackageFilters) => void;
  deletePackage: (id: string) => Promise<void>;
  clearPackages: () => void;
  getPackageById: (id: string) => Package | undefined;
  invalidateCache: () => void;
}

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

export const usePackageStore = create<PackageStore>((set, get) => ({
  packages: [],
  loading: false,
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

  getPackageById: (id: string) => {
    return get().packages.find((pkg) => pkg._id === id);
  },

  invalidateCache: () => {
    set({ lastFetched: null });
  },
}));
