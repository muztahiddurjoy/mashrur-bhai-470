// src/types/index.ts
export interface User {
  id: string;
  username: string;
  email: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    currency?: string;
    notificationPreferences?: {
      email: boolean;
      push: boolean;
    };
  };
}

export interface Transaction {
  _id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  _id: string;
  userId: string;
  category: string;
  limit: number;
  period: 'weekly' | 'monthly';
  alertThreshold: number;
  isActive: boolean;
  spent?: number;
  percentage?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  _id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  description?: string;
  isAchieved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialReports {
  incomeExpense: Array<{ _id: string; total: number }>;
  categorySpending: Array<{ _id: string; total: number }>;
  monthlyTrends: Array<{ _id: { year: number; month: number; type: string }; total: number }>;
  goals: Goal[];
  aiInsights: {
    insights: string[];
    recommendations: string[];
    statistics: {
      totalIncome: number;
      totalExpenses: number;
      savingsRate: string;
      topCategories: [string, number][];
    };
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}