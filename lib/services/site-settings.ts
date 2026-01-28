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

export interface FooterLink {
  label: string;
  url: string;
  group: string;
  order: number;
  isActive: boolean;
  openInNewTab?: boolean;
}

export interface NavbarLink {
  label: string;
  url: string;
  order: number;
  isActive: boolean;
  children?: NavbarLink[];
}

export interface SocialLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
}

export interface UpdateFooterLinksPayload {
  footerLinks: FooterLink[];
}

export interface UpdateNavbarLinksPayload {
  navbarLinks: NavbarLink[];
}

export interface UpdateSocialLinksPayload {
  socialLinks: SocialLinks;
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

  getHeroBanners: async (): Promise<UpdateHeroBannersPayload> => {
    try {
      const response: AxiosResponse = await apiClient.get("/site-settings/hero-banners");
      return response.data;
    } catch (error) {
       console.error("Error fetching hero banners:", error);
       return { heroBanners: [] };
    }
  },

  // Footer Links
  updateFooterLinks: async (payload: UpdateFooterLinksPayload) => {
    try {
      const response: AxiosResponse = await apiClient.patch(
        "/site-settings/footer",
        payload
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  addFooterLink: async (payload: FooterLink) => {
    try {
      const response: AxiosResponse = await apiClient.post(
        "/site-settings/footer/add",
        payload
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Navbar Links
  updateNavbarLinks: async (payload: UpdateNavbarLinksPayload) => {
    try {
      const response: AxiosResponse = await apiClient.patch(
        "/site-settings/navbar",
        payload
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Social Links
  updateSocialLinks: async (payload: UpdateSocialLinksPayload) => {
    try {
      const response: AxiosResponse = await apiClient.patch(
        "/site-settings/social-links",
        payload
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Reset Settings
  resetSettings: async () => {
    try {
      const response: AxiosResponse = await apiClient.post(
        "/site-settings/reset"
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get All Settings (to populate forms)
  getAllSettings: async () => {
    try {
      const response: AxiosResponse = await apiClient.get("/site-settings");
      return response.data;
    } catch (error) {
      console.error("Error fetching site settings:", error);
      return null;
    }
  }
};
