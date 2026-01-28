import apiClient from "@/lib/services/api.client";
import { AxiosResponse } from "axios";

export interface HeroBanner {
  title: string;
  description: string;
  imageUrl: string;
  ctaUrl: string;
  ctaText: string;
  order: number;
  isActive: boolean;
}

export interface UpdateHeroBannersPayload {
  heroBanners: HeroBanner[];
}

export const siteSettingsService = {
  // Update Hero Banners
  updateHeroBanners: async (payload: UpdateHeroBannersPayload) => {
    try {
      const response: AxiosResponse = await apiClient.patch(
        "/site-settings/hero-banners",
        payload
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Fetch Hero Banners (if needed for initial load, assuming standard GET endpoint or part of site-settings)
  // Based on common patterns, we likely need a way to get the current settings.
  // Assuming GET /site-settings/hero-banners or similar exists, or we might need to fetch all settings.
  // For now, I'll add a getter that mirrors the structure if standard CRUD applies.
  // The user prompt only specified the PATCH body, but we need to load data too.
  // Let's assume GET /site-settings/hero-banners returns the same structure { heroBanners: [] }.
  getHeroBanners: async (): Promise<UpdateHeroBannersPayload> => {
    try {
      const response: AxiosResponse = await apiClient.get("/site-settings/hero-banners");
      return response.data;
    } catch (error) {
       console.error("Error fetching hero banners:", error);
       // Return empty default if fails or endpoint doesn't exist yet
       return { heroBanners: [] };
    }
  }
};
