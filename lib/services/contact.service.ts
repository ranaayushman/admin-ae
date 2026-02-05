import apiClient from "@/lib/services/api.client";
import { AxiosResponse } from "axios";
import { ContactInquiriesResponse } from "@/lib/types/contact";

export const contactService = {
  /**
   * Get all contact inquiries (paginated)
   * GET /contact
   */
  getContactInquiries: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<ContactInquiriesResponse> => {
    console.log("🚀 [contactService] GET /contact", params);
    const response: AxiosResponse<ContactInquiriesResponse> = await apiClient.get(
      "/contact",
      { params }
    );
    console.log("✅ [contactService] Response:", response.data);
    return response.data;
  },
};

export default contactService;
