import apiClient from "@/lib/services/api.client";
import { AxiosResponse } from "axios";

export interface CreateTeamMemberPayload {
  name: string;
  title: string;
  imageBase64: string;
  expertise: string[];
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateTeamMemberPayload {
  name?: string;
  title?: string;
  imageBase64?: string;
  expertise?: string[];
  displayOrder?: number;
  isActive?: boolean;
}

export interface TeamMember {
  _id: string;
  name: string;
  title: string;
  image: string;
  expertise: string[];
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface GetTeamMembersParams {
  isActive?: boolean;
  sort?: string;
}

export const teamService = {
  /**
   * Create a new team member
   * POST /team-members
   * @returns TeamMember (201 Created)
   */
  createTeamMember: async (
    payload: CreateTeamMemberPayload,
  ): Promise<TeamMember> => {
    // Log payload details (without full base64 to avoid console clutter)
    const imageInfo = payload.imageBase64
      ? {
          hasImage: true,
          base64Length: payload.imageBase64.length,
          base64SizeKB: Math.round(payload.imageBase64.length / 1024),
          base64Prefix: payload.imageBase64.substring(0, 50) + "...",
          isValidDataUri: payload.imageBase64.startsWith("data:image/"),
        }
      : { hasImage: false };
    const response: AxiosResponse<TeamMember> = await apiClient.post(
      "/team-members",
      payload,
    );    // API returns data directly, not wrapped in { success, data }
    return response.data;
  },

  /**
   * Get all team members
   * GET /team-members
   * @param params - Optional query params (isActive, sort)
   * @returns TeamMember[] (200 OK)
   */
  getTeamMembers: async (
    params?: GetTeamMembersParams,
  ): Promise<TeamMember[]> => {    const response: AxiosResponse<TeamMember[]> = await apiClient.get(
      "/team-members",
      { params },
    );    // API returns array directly, not wrapped
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * Get a single team member by ID
   * GET /team-members/:id
   * @returns TeamMember (200 OK)
   */
  getTeamMemberById: async (id: string): Promise<TeamMember> => {    const response: AxiosResponse<TeamMember> = await apiClient.get(
      `/team-members/${id}`,
    );    return response.data;
  },

  /**
   * Update a team member
   * PATCH /team-members/:id
   * @returns TeamMember (200 OK)
   */
  updateTeamMember: async (
    id: string,
    payload: UpdateTeamMemberPayload,
  ): Promise<TeamMember> => {
    // Log payload details (without full base64 to avoid console clutter)
    const imageInfo = payload.imageBase64
      ? {
          hasImage: true,
          base64Length: payload.imageBase64.length,
          base64SizeKB: Math.round(payload.imageBase64.length / 1024),
          base64Prefix: payload.imageBase64.substring(0, 50) + "...",
          isValidDataUri: payload.imageBase64.startsWith("data:image/"),
        }
      : { hasImage: false, note: "No new image - keeping existing" };
    const response: AxiosResponse<TeamMember> = await apiClient.patch(
      `/team-members/${id}`,
      payload,
    );    return response.data;
  },

  /**
   * Delete a team member
   * DELETE /team-members/:id
   * @returns void (204 No Content)
   */
  deleteTeamMember: async (id: string): Promise<void> => {    await apiClient.delete(`/team-members/${id}`);  },
};
