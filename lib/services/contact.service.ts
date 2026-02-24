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
  }): Promise<ContactInquiriesResponse> => {    const response: AxiosResponse<ContactInquiriesResponse> = await apiClient.get(
      "/contact",
      { params }
    );    return response.data;
  },
};

export default contactService;
