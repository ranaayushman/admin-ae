/**
 * API Configuration
 *
 * This file centralizes the API base URL configuration for the application.
 * The base URL MUST be set using the NEXT_PUBLIC_API_URL environment variable.
 */

if (!process.env.NEXT_PUBLIC_API_URL) {}

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "",
  TIMEOUT: 30000,
} as const;

export default API_CONFIG;
