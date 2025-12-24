/**
 * API Configuration
 * 
 * This file centralizes the API base URL configuration for the application.
 * The base URL can be overridden using the NEXT_PUBLIC_API_URL environment variable.
 */

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://aspiring-engineers-api-dbbcfdascdezgvcx.centralindia-01.azurewebsites.net/api/v1',
  TIMEOUT: 30000,
} as const;

export default API_CONFIG;
