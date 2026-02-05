export interface InternshipApplication {
  _id: string;
  name?: string;
  fullName?: string; // Alternate key
  phone: string;
  college?: string;
  collegeName?: string; // Alternate key
  fathersName?: string;
  fatherName?: string; // Alternate key
  location: string;
  cgpa?: string;
  cgpaPercentage?: string; // Alternate key
  year?: string;
  currentYear?: string; // Alternate key
  branch: string;
  internshipType?: string; // Might be missing in some?
  createdAt: string;
  updatedAt: string;
}

export interface InternshipResponse {
  data: InternshipApplication[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
