import { create } from "zustand";
import { Question, QuestionFilters } from "@/lib/types";
import { questionService } from "@/lib/services/question.service";

interface QuestionStore {
  questions: Question[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  filters: QuestionFilters;

  // Actions
  fetchQuestions: (filters?: QuestionFilters) => Promise<void>;
  setFilters: (filters: QuestionFilters) => void;
  clearQuestions: () => void;
  getQuestionById: (id: string) => Question | undefined;
}

export const useQuestionStore = create<QuestionStore>((set, get) => ({
  questions: [],
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 0,
  },
  filters: {
    page: 1,
    limit: 50,
  },

  fetchQuestions: async (filters?: QuestionFilters) => {
    set({ loading: true, error: null });

    try {
      const filtersToUse = filters || get().filters;
      const response = await questionService.getQuestions(filtersToUse);

      set({
        questions: response.data,
        pagination: response.pagination,
        filters: filtersToUse,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch questions",
        loading: false,
      });
    }
  },

  setFilters: (filters: QuestionFilters) => {
    set({ filters });
  },

  clearQuestions: () => {
    set({
      questions: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 0,
      },
    });
  },

  getQuestionById: (id: string) => {
    return get().questions.find((q) => q._id === id);
  },
}));
