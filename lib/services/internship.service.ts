import apiClient from "@/lib/services/api.client";
import { AxiosResponse } from "axios";
import { InternshipResponse } from "@/lib/types/internship";

export const internshipService = {
  /**
   * Get all internship applications (paginated)
   * GET /internship/apply
   */
  getInternshipApplications: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<InternshipResponse> => {
    console.log("🚀 [internshipService] GET /internship", params);
    const response: AxiosResponse<InternshipResponse> = await apiClient.get(
      "/internship",
      { params }
    );
    console.log("✅ [internshipService] Response:", response.data);
    return response.data;
  },
};

export default internshipService;
