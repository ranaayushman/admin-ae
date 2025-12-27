import { useState, useEffect, useCallback, useRef } from 'react';
import { questionService } from '@/lib/services/question.service';
import { Question, QuestionFilters } from '@/lib/types';

/**
 * Custom hook for fetching questions with caching and pagination
 * Implements stale-while-revalidate pattern for optimal UX
 */

interface UseQuestionsOptions {
  filters?: QuestionFilters;
  enabled?: boolean; // Allow conditional fetching
  cacheTime?: number; // Cache duration in milliseconds
}

interface UseQuestionsReturn {
  data: Question[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  isRefetching: boolean;
}

// Simple in-memory cache
const questionCache = new Map<string, {
  data: Question[];
  pagination: any;
  timestamp: number;
}>();

export function useQuestions(options: UseQuestionsOptions = {}): UseQuestionsReturn {
  const { filters, enabled = true, cacheTime = 5 * 60 * 1000 } = options; // 5 min default cache
  
  const [data, setData] = useState<Question[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Use ref to track if component is mounted
  const isMountedRef = useRef(true);
  const isInitialLoadRef = useRef(true);
  
  // Create cache key from filters
  const getCacheKey = useCallback(() => {
    return JSON.stringify(filters || {});
  }, [filters]);
  
  const fetchQuestions = useCallback(async (isRefetch = false) => {
    if (!enabled) return;
    
    const cacheKey = getCacheKey();
    const cached = questionCache.get(cacheKey);
    
    // Check if cache is fresh
    if (cached && Date.now() - cached.timestamp < cacheTime && !isRefetch) {
      console.log('📦 Using cached data');
      setData(cached.data);
      setPagination(cached.pagination);
      setLoading(false);
      isInitialLoadRef.current = false;
      return;
    }
    
    // If we have cached data, show it while revalidating
    if (cached && !isInitialLoadRef.current) {
      console.log('🔄 Revalidating cached data');
      setIsRefetching(true);
    } else {
      console.log('⏳ Initial load');
      setLoading(true);
    }
    
    try {
      console.log('🌐 Fetching questions from API...');
      const response = await questionService.getQuestions(filters);
      
      console.log('✅ Got response:', {
        questionCount: response.data.length,
        pagination: response.pagination
      });
      
      if (!isMountedRef.current) return;
      
      // Update cache
      questionCache.set(cacheKey, {
        data: response.data,
        pagination: response.pagination,
        timestamp: Date.now(),
      });
      
      setData(response.data);
      setPagination(response.pagination);
      setError(null);
      isInitialLoadRef.current = false;
    } catch (err) {
      if (!isMountedRef.current) return;
      
      setError(err as Error);
      console.error('❌ Error fetching questions:', err);
    } finally {
      if (!isMountedRef.current) return;
      
      setLoading(false);
      setIsRefetching(false);
    }
  }, [filters, enabled, cacheTime, getCacheKey]); // Removed 'loading' from dependencies
  
  // Fetch on mount and when filters change
  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  const refetch = useCallback(async () => {
    await fetchQuestions(true);
  }, [fetchQuestions]);
  
  return {
    data,
    pagination,
    loading,
    error,
    refetch,
    isRefetching,
  };
}

/**
 * Custom hook for fetching a single question by ID
 */

interface UseQuestionOptions {
  id: string;
  enabled?: boolean;
}

interface UseQuestionReturn {
  data: Question | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const singleQuestionCache = new Map<string, {
  data: Question;
  timestamp: number;
}>();

export function useQuestion(options: UseQuestionOptions): UseQuestionReturn {
  const { id, enabled = true } = options;
  
  const [data, setData] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const isMountedRef = useRef(true);
  
  const fetchQuestion = useCallback(async () => {
    if (!enabled || !id) {
      console.log('⏭️ Skipping fetch: enabled=', enabled, 'id=', id);
      return;
    }
    
    const cached = singleQuestionCache.get(id);
    
    // Check cache (2 min cache for single questions)
    if (cached && Date.now() - cached.timestamp < 2 * 60 * 1000) {
      console.log('📦 Using cached question:', id);
      setData(cached.data);
      setLoading(false);
      return;
    }
    
    console.log('🌐 Fetching question from API:', id);
    setLoading(true);
    
    try {
      const question = await questionService.getQuestionById(id);
      
      console.log('✅ Got question:', question._id);
      
      if (!isMountedRef.current) return;
      
      singleQuestionCache.set(id, {
        data: question,
        timestamp: Date.now(),
      });
      
      setData(question);
      setError(null);
    } catch (err) {
      if (!isMountedRef.current) return;
      
      setError(err as Error);
      console.error('❌ Error fetching question:', err);
    } finally {
      if (!isMountedRef.current) return;
      
      setLoading(false);
    }
  }, [id, enabled]); // No state dependencies
  
  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);
  
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  const refetch = useCallback(async () => {
    singleQuestionCache.delete(id);
    await fetchQuestion();
  }, [fetchQuestion, id]);
  
  return {
    data,
    loading,
    error,
    refetch,
  };
}

/**
 * Utility to invalidate question cache
 */
export function invalidateQuestionCache(filters?: QuestionFilters) {
  if (filters) {
    const cacheKey = JSON.stringify(filters);
    questionCache.delete(cacheKey);
  } else {
    // Clear all cache
    questionCache.clear();
    singleQuestionCache.clear();
  }
}

/**
 * Utility to invalidate single question cache
 */
export function invalidateSingleQuestionCache(id: string) {
  singleQuestionCache.delete(id);
}
