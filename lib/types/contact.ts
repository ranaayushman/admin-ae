export interface ContactInquiry {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContactInquiriesResponse {
  data: ContactInquiry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
