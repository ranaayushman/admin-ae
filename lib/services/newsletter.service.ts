import apiClient, { handleApiError } from "./api.client";

export type NewsletterTemplateCategory =
  | "newsletter"
  | "invoice"
  | "transactional"
  | "other";

export type NewsletterAudienceType = "all-users" | "custom-list";

export type NewsletterCampaignStatus =
  | "draft"
  | "queued"
  | "sending"
  | "paused"
  | "completed"
  | "failed"
  | "cancelled";

export interface NewsletterTemplate {
  _id: string;
  name: string;
  key: string;
  category: NewsletterTemplateCategory;
  subjectTemplate: string;
  htmlTemplate: string;
  textTemplate?: string;
  variables?: string[];
  isActive: boolean;
  version?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PreviewTemplateResponse {
  subject: string;
  html: string;
  text?: string;
  usedVariables: string[];
}

export interface TestSendTemplateResponse {
  success: boolean;
  message: string;
  data?: {
    email: string;
    subject: string;
  };
}

export interface CreateTemplatePayload {
  name: string;
  key: string;
  category: NewsletterTemplateCategory;
  subjectTemplate: string;
  htmlTemplate: string;
  textTemplate?: string;
  variables?: string[];
  isActive?: boolean;
}

export interface UpdateTemplatePayload {
  name?: string;
  key?: string;
  category?: NewsletterTemplateCategory;
  subjectTemplate?: string;
  htmlTemplate?: string;
  textTemplate?: string;
  variables?: string[];
  isActive?: boolean;
}

export interface CreateCampaignPayload {
  name: string;
  templateId: string;
  audienceType: NewsletterAudienceType;
  recipientEmails?: string[];
  templateData?: Record<string, string | number | boolean>;
}

export interface CampaignSendPayload {
  batchLimit?: number;
  chunkSize?: number;
  maxRetries?: number;
  retryDelayMs?: number;
}

export interface NewsletterCampaign {
  _id: string;
  name: string;
  templateId:
    | string
    | {
        _id: string;
        name: string;
        key: string;
        category: NewsletterTemplateCategory;
      };
  audienceType: NewsletterAudienceType;
  recipientEmails?: string[];
  templateData?: Record<string, string | number | boolean>;
  status: NewsletterCampaignStatus;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  processedCount: number;
  isPaused?: boolean;
  cancelRequested?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CampaignProgress {
  campaignId: string;
  status: NewsletterCampaignStatus;
  totalRecipients: number;
  processedCount: number;
  sentCount: number;
  failedCount: number;
  progressPercent: number;
  startedAt?: string | null;
  queuedAt?: string | null;
  lastProcessedAt?: string | null;
  completedAt?: string | null;
  isPaused?: boolean;
  cancelRequested?: boolean;
  queueState?: string;
}

export interface NewsletterQueueHealth {
  mode: string;
  queueName: string;
  configured: boolean;
  connected: boolean;
  status: string;
  message: string;
}

const unwrapData = <T>(payload: any): T => {
  if (payload?.data !== undefined) {
    return payload.data as T;
  }
  return payload as T;
};

export const newsletterService = {
  createTemplate: async (
    payload: CreateTemplatePayload
  ): Promise<NewsletterTemplate> => {
    try {
      const response = await apiClient.post("/admin/newsletter/templates", payload);
      return unwrapData<NewsletterTemplate>(response.data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  listTemplates: async (): Promise<NewsletterTemplate[]> => {
    try {
      const response = await apiClient.get("/admin/newsletter/templates");
      if (Array.isArray(response.data)) {
        return response.data as NewsletterTemplate[];
      }
      return unwrapData<NewsletterTemplate[]>(response.data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getTemplateById: async (id: string): Promise<NewsletterTemplate> => {
    try {
      const response = await apiClient.get(`/admin/newsletter/templates/${id}`);
      return unwrapData<NewsletterTemplate>(response.data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  updateTemplate: async (
    id: string,
    payload: UpdateTemplatePayload
  ): Promise<NewsletterTemplate> => {
    try {
      const response = await apiClient.patch(
        `/admin/newsletter/templates/${id}`,
        payload
      );
      return unwrapData<NewsletterTemplate>(response.data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  previewTemplate: async (
    id: string,
    data: Record<string, string | number | boolean>
  ): Promise<PreviewTemplateResponse> => {
    try {
      const response = await apiClient.post(
        `/admin/newsletter/templates/${id}/preview`,
        { data }
      );
      return unwrapData<PreviewTemplateResponse>(response.data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  testSendTemplate: async (
    id: string,
    payload: {
      email: string;
      recipientName?: string;
      data?: Record<string, string | number | boolean>;
    }
  ): Promise<TestSendTemplateResponse> => {
    try {
      const response = await apiClient.post(
        `/admin/newsletter/templates/${id}/test-send`,
        payload
      );
      return unwrapData<TestSendTemplateResponse>(response.data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  createCampaign: async (
    payload: CreateCampaignPayload
  ): Promise<NewsletterCampaign> => {
    try {
      const response = await apiClient.post("/admin/newsletter/campaigns", payload);
      return unwrapData<NewsletterCampaign>(response.data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  listCampaigns: async (): Promise<NewsletterCampaign[]> => {
    try {
      const response = await apiClient.get("/admin/newsletter/campaigns");
      if (Array.isArray(response.data)) {
        return response.data as NewsletterCampaign[];
      }
      return unwrapData<NewsletterCampaign[]>(response.data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getCampaignById: async (id: string): Promise<NewsletterCampaign> => {
    try {
      const response = await apiClient.get(`/admin/newsletter/campaigns/${id}`);
      return unwrapData<NewsletterCampaign>(response.data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  sendCampaign: async (
    id: string,
    payload?: CampaignSendPayload
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.post(
        `/admin/newsletter/campaigns/${id}/send`,
        payload || {}
      );
      return unwrapData<{ success: boolean; message: string }>(response.data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getCampaignProgress: async (id: string): Promise<CampaignProgress> => {
    try {
      const response = await apiClient.get(
        `/admin/newsletter/campaigns/${id}/progress`
      );
      return unwrapData<CampaignProgress>(response.data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  pauseCampaign: async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.post(
        `/admin/newsletter/campaigns/${id}/pause`
      );
      return unwrapData<{ success: boolean; message: string }>(response.data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  resumeCampaign: async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.post(
        `/admin/newsletter/campaigns/${id}/resume`
      );
      return unwrapData<{ success: boolean; message: string }>(response.data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  cancelCampaign: async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.post(
        `/admin/newsletter/campaigns/${id}/cancel`
      );
      return unwrapData<{ success: boolean; message: string }>(response.data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getQueueHealth: async (): Promise<NewsletterQueueHealth> => {
    try {
      const response = await apiClient.get("/admin/newsletter/queue/health");
      return unwrapData<NewsletterQueueHealth>(response.data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
