// src/lib/api/services.ts
import axiosInstance from './index';
import { 
  Transaction, 
  Budget, 
  Goal, 
  FinancialReports, 
  ApiResponse,
  User 
} from '@/types/types';

// Auth Services
export const authService = {
  login: async (email: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> => {
    const response = await axiosInstance.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (username: string, email: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> => {
    const response = await axiosInstance.post('/auth/register', { username, email, password });
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  },

  updateProfile: async (profile: Partial<User['profile']>): Promise<ApiResponse<User>> => {
    const response = await axiosInstance.put('/auth/profile', profile);
    return response.data;
  },
};

// Transaction Services
export const transactionService = {
  getTransactions: async (params?: {
    page?: number;
    limit?: number;
    type?: 'income' | 'expense';
    category?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<Transaction[]>> => {
    const response = await axiosInstance.get('/transactions', { params });
    return response.data;
  },

  createTransaction: async (transaction: Omit<Transaction, '_id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Transaction>> => {
    const response = await axiosInstance.post('/transactions', transaction);
    return response.data;
  },

  updateTransaction: async (id: string, transaction: Partial<Transaction>): Promise<ApiResponse<Transaction>> => {
    const response = await axiosInstance.put(`/transactions/${id}`, transaction);
    return response.data;
  },

  deleteTransaction: async (id: string): Promise<ApiResponse> => {
    const response = await axiosInstance.delete(`/transactions/${id}`);
    return response.data;
  },
};

// Budget Services
export const budgetService = {
  getBudgets: async (): Promise<ApiResponse<Budget[]>> => {
    const response = await axiosInstance.get('/budgets');
    return response.data;
  },

  createBudget: async (budget: Omit<Budget, '_id' | 'userId' | 'createdAt' | 'updatedAt' | 'spent' | 'percentage'>): Promise<ApiResponse<Budget>> => {
    const response = await axiosInstance.post('/budgets', budget);
    return response.data;
  },

  updateBudget: async (id: string, budget: Partial<Budget>): Promise<ApiResponse<Budget>> => {
    const response = await axiosInstance.put(`/budgets/${id}`, budget);
    return response.data;
  },

  deleteBudget: async (id: string): Promise<ApiResponse> => {
    const response = await axiosInstance.delete(`/budgets/${id}`);
    return response.data;
  },
};

// Goal Services
export const goalService = {
  getGoals: async (): Promise<ApiResponse<Goal[]>> => {
    const response = await axiosInstance.get('/goals');
    return response.data;
  },

  createGoal: async (goal: Omit<Goal, '_id' | 'userId' | 'createdAt' | 'updatedAt' | 'isAchieved'>): Promise<ApiResponse<Goal>> => {
    const response = await axiosInstance.post('/goals', goal);
    return response.data;
  },

  updateGoal: async (id: string, goal: Partial<Goal>): Promise<ApiResponse<Goal>> => {
    const response = await axiosInstance.put(`/goals/${id}`, goal);
    return response.data;
  },

  addToGoal: async (id: string, amount: number): Promise<ApiResponse<Goal>> => {
    const response = await axiosInstance.post(`/goals/${id}/add`, { amount });
    return response.data;
  },

  deleteGoal: async (id: string): Promise<ApiResponse> => {
    const response = await axiosInstance.delete(`/goals/${id}`);
    return response.data;
  },
};

// Report Services
export const reportService = {
  getReports: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<FinancialReports>> => {
    const response = await axiosInstance.get('/reports', { params });
    return response.data;
  },

  getSpendingAnalysis: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse> => {
    const response = await axiosInstance.get('/ai-analysis/spending-analysis', { params });
    return response.data;
  },
};