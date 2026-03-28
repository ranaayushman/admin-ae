import apiClient, { handleApiError } from "./api.client";

export type TestStatus = "draft" | "published";
export type QuestionSelectionMode = "random" | "selected" | "mixed";
export type QuestionDeliveryPolicy = "fixed-per-user" | "fresh-each-attempt";

// Admin endpoint response shape
export interface AdminQuestionOption {
  id?: string;
  text?: string;
}

export interface AdminQuestion {
  id: string;
  index: number;
  questionText: string;
  questionType: 'single-correct' | 'multi-correct' | 'integer' | string;
  questionImageUrl?: string | null;
  options: string[] | AdminQuestionOption[];
  correctAnswer?: string | null;
  correctAnswers?: string[];
  numericalAnswer?: number | null;
  tolerance?: number | null;
  solutionText?: string;
  solutionImageUrl?: string | null;
  category?: string;
  chapter?: string;
  topic?: string;
  difficulty?: string;
  metadata?: { marks?: number };
}

export interface AdminTestData {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'mock' | 'practice' | 'previous_year' | string;
  status: TestStatus;
  duration: number;
  totalMarks: number;
  marksPerQuestion: number;
  negativeMarking: number;
  totalQuestions: number;
  shuffleQuestions: boolean;
  isPaid: boolean;
  price?: number;
  packageId?: string;
  packageName?: string;
  difficulty?: string;
  subjects?: string[];
  syllabus?: string[];
  instructions?: string[];
  sections?: any[];
  thumbnail?: string | null;
  assignedTo?: string[];
  questions: AdminQuestion[];
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  // New: Question selection mode and delivery policy
  questionSelectionMode?: QuestionSelectionMode;
  questionDeliveryPolicy?: QuestionDeliveryPolicy;
  questionsPerUser?: number;
  selectedQuestionIds?: string[];
  ensureSubjectDistribution?: boolean;
  subjectQuestionCounts?: Record<string, number>;
}

export interface AdminTestResponse {
  success: boolean;
  data: AdminTestData;
}

export interface CreateTestPayload {
  title: string;
  description: string;
  category: string;
  questions?: string[];
  duration: number;
  marksPerQuestion: number;
  negativeMarking: number;
  status: TestStatus;
  type: "mock" | "practice" | "previous_year";
  difficulty?: string;
  useExamPattern?: boolean;
  subjects?: string[];
  syllabus?: string[];
  instructions?: string[];
  sections?: any[];
  shuffleQuestions: boolean;
  startDate?: string;
  endDate?: string;
  // New: Question selection mode and delivery policy
  questionSelectionMode?: QuestionSelectionMode;
  questionDeliveryPolicy?: QuestionDeliveryPolicy;
  questionsPerUser?: number;
  selectedQuestionIds?: string[];
  ensureSubjectDistribution?: boolean;
  subjectQuestionCounts?: Record<string, number>;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Test {
  _id: string;
  title: string;
  description: string;
  category: string;
  questions: string[];
  duration: number;
  marksPerQuestion: number;
  totalMarks: number;
  negativeMarking: number;
  status: TestStatus;
  type: "mock" | "practice" | "previous_year";
  shuffleQuestions: boolean;
  useExamPattern?: boolean;
  difficulty?: string;
  subjects?: string[];
  syllabus?: string[];
  instructions?: string[];
  sections?: any[];
  startDate?: string;
  endDate?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTestResponse {
  success: boolean;
  message?: string;
  data: Test;
}

// List endpoint often returns a lighter payload (e.g. totalQuestions instead of questions[])
export interface TestListItem {
  _id: string;
  title: string;
  category: string;
  duration: number;
  status: TestStatus;
  description?: string;
  type?: string;
  totalMarks?: number;
  totalQuestions?: number;
  questions?: string[];
}

export interface TestsListResponse {
  data: TestListItem[];
  pagination: Pagination;
}

export interface AutoCreateTestPayload {
  title: string;
  category: string;
  duration: number;
  questionCount?: number;
  /** When true, applies exam-pattern sections (e.g. 3×25q for JEE Main) */
  useExamPattern?: boolean;
  /** Optional filter: limit to a specific chapter */
  chapter?: string;
  /** Optional filter: easy | medium | hard */
  difficulty?: string;
  // New: Question selection mode and delivery policy
  questionSelectionMode?: QuestionSelectionMode;
  questionDeliveryPolicy?: QuestionDeliveryPolicy;
  questionsPerUser?: number;
  selectedQuestionIds?: string[];
  ensureSubjectDistribution?: boolean;
  subjectQuestionCounts?: Record<string, number>;
}

export interface ExamPatternSection {
  name: string;
  subject: string;
  questionCount: number;
  duration: number;
  isTimed: boolean;
  questionIds: string[];
  marksPerCorrect: number;
  negativeMarks: number;
}

export interface AutoCreateTestResponse {
  success: boolean;
  message?: string;
  data: {
    _id: string;
    title: string;
    questions: string[];
    totalMarks?: number;
    duration: number;
    category: string;
    type: "mock" | "practice" | "previous_year" | "full-length";
    status: TestStatus;
    createdAt?: string;
    /** Present when useExamPattern: true */
    subjects?: string[];
    sections?: ExamPatternSection[];
    marksPerQuestion?: number;
    negativeMarking?: number;
  };
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const normalizeStatus = (status: unknown): TestStatus => {
  const s = String(status ?? "").toLowerCase();
  return s === "published" ? "published" : "draft";
};

const normalizeListItem = (item: Record<string, unknown>): TestListItem => {
  const idRaw = item["_id"] ?? item["id"];
  const questionsRaw = item["questions"];

  const questions = Array.isArray(questionsRaw)
    ? questionsRaw.filter((q): q is string => typeof q === "string")
    : undefined;

  return {
    _id: typeof idRaw === "string" ? idRaw : String(idRaw ?? ""),
    title: typeof item["title"] === "string" ? item["title"] : "",
    category:
      typeof item["category"] === "string"
        ? item["category"]
        : typeof item["examType"] === "string"
        ? item["examType"]
        : "",
    duration: Number(item["duration"] ?? 0),
    status: normalizeStatus(item["status"]),
    description:
      typeof item["description"] === "string" ? item["description"] : undefined,
    type:
      typeof item["type"] === "string"
        ? item["type"]
        : typeof item["testType"] === "string"
        ? item["testType"]
        : undefined,
    totalMarks:
      typeof item["totalMarks"] === "number"
        ? item["totalMarks"]
        : typeof item["totalMarks"] === "string"
        ? Number(item["totalMarks"])
        : undefined,
    totalQuestions:
      typeof item["totalQuestions"] === "number"
        ? item["totalQuestions"]
        : typeof item["totalQuestions"] === "string"
        ? Number(item["totalQuestions"])
        : typeof item["questionCount"] === "number"
        ? item["questionCount"]
        : typeof item["questionCount"] === "string"
        ? Number(item["questionCount"])
        : typeof item["questionsCount"] === "number"
        ? item["questionsCount"]
        : typeof item["questionsCount"] === "string"
        ? Number(item["questionsCount"])
        : undefined,
    questions,
  };
};

const pickCandidates = (raw: unknown): Record<string, unknown>[] => {
  if (!isRecord(raw)) return [];
  const candidates: Record<string, unknown>[] = [raw];
  const dataVal = raw["data"];
  if (isRecord(dataVal)) {
    candidates.push(dataVal);
    const nested = dataVal["data"];
    if (isRecord(nested)) candidates.push(nested);
  }
  return candidates;
};

const extractTestsArray = (raw: unknown): unknown[] => {
  if (Array.isArray(raw)) return raw;
  for (const candidate of pickCandidates(raw)) {
    const testsVal = candidate["tests"];
    if (Array.isArray(testsVal)) return testsVal;
    const dataVal = candidate["data"];
    if (Array.isArray(dataVal)) return dataVal;
    if (isRecord(dataVal) && Array.isArray(dataVal["data"]))
      return dataVal["data"] as unknown[];
  }
  return [];
};

const extractPagination = (raw: unknown): Record<string, unknown> => {
  for (const candidate of pickCandidates(raw)) {
    const p = candidate["pagination"];
    if (isRecord(p)) return p;
  }
  return {};
};

export const testService = {
  createTest: async (data: CreateTestPayload): Promise<Test> => {
    try {
      const response = await apiClient.post<any>("/tests", data);
      return response.data?.data || response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getTests: async (filters?: {
    examType?: string;
    testType?: string;
    difficulty?: string;
    category?: string;
    status?: string;
    type?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<TestsListResponse> => {
    try {
      const params = new URLSearchParams();

      if (filters?.examType) params.append("examType", filters.examType);
      if (filters?.testType) params.append("testType", filters.testType);
      if (filters?.difficulty) params.append("difficulty", filters.difficulty);
      if (filters?.category) params.append("category", filters.category);
      if (filters?.status) params.append("status", filters.status);
      if (filters?.type) params.append("type", filters.type);
      if (filters?.search) params.append("search", filters.search);
      if (filters?.page) params.append("page", String(filters.page));
      if (filters?.limit) params.append("limit", String(filters.limit));

      const queryString = params.toString();
      const url = queryString ? `/tests?${queryString}` : "/tests";

      const response = await apiClient.get<unknown>(url);
      const raw = response.data;

      const testsArray = extractTestsArray(raw);
      const paginationObj = extractPagination(raw);

      const items = testsArray.filter(isRecord).map(normalizeListItem);

      const page = Number(
        paginationObj["page"] ??
          paginationObj["currentPage"] ??
          filters?.page ??
          1
      );
      const limit = Number(paginationObj["limit"] ?? filters?.limit ?? 10);
      const total = Number(
        paginationObj["total"] ??
          paginationObj["totalTests"] ??
          paginationObj["count"] ??
          items.length
      );
      const totalPages = Number(
        paginationObj["totalPages"] ??
          (total && limit ? Math.ceil(total / limit) : 1)
      );

      return {
        data: items,
        pagination: {
          total: Number.isFinite(total) ? total : items.length,
          page: Number.isFinite(page) ? page : 1,
          limit: Number.isFinite(limit) ? limit : 10,
          totalPages: Number.isFinite(totalPages) ? totalPages : 1,
        },
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getTestById: async (id: string): Promise<Test> => {
    try {
      const response = await apiClient.get<unknown>(`/tests/${id}`);
      const raw = response.data;
      if (isRecord(raw) && isRecord(raw["data"])) {
        return raw["data"] as unknown as Test;
      }
      return raw as unknown as Test;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getTestByIdAdmin: async (id: string): Promise<AdminTestData> => {
    try {
      const response = await apiClient.get<AdminTestResponse>(`/tests/${id}/admin`);
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  updateTestAdmin: async (
    id: string,
    data: Partial<CreateTestPayload> & { questions?: string[] }
  ): Promise<AdminTestData> => {
    try {
      const response = await apiClient.patch<AdminTestResponse>(
        `/tests/${id}`,
        data
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  updateTest: async (
    id: string,
    data: Partial<CreateTestPayload>
  ): Promise<Test> => {
    try {
      const response = await apiClient.patch<CreateTestResponse>(
        `/tests/${id}`,
        data
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  deleteTest: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/tests/${id}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  autoCreateTest: async (
    data: AutoCreateTestPayload
  ): Promise<AutoCreateTestResponse["data"]> => {
    try {
      const response = await apiClient.post<AutoCreateTestResponse>(
        "/tests/auto-create",
        data
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

export default testService;
