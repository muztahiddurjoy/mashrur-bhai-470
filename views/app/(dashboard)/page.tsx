// src/app/(dashboard)/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  WalletIcon, 
  TargetIcon 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { SpendingByCategory } from '@/components/dashboard/spending-by-category';
import { transactionService, reportService } from '@/api/services';
import { Transaction, FinancialReports } from '@/types/types';

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [reports, setReports] = useState<FinancialReports | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [transactionsRes, reportsRes] = await Promise.all([
        transactionService.getTransactions({ limit: 5 }),
        reportService.getReports(),
      ]);

      if (transactionsRes.success) {
        setTransactions(transactionsRes.data || []);
      }

      if (reportsRes.success) {
        setReports(reportsRes.data || null);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalIncome = reports?.incomeExpense.find(i => i._id === 'income')?.total || 0;
  const totalExpense = reports?.incomeExpense.find(i => i._id === 'expense')?.total || 0;
  const netWorth = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <ArrowUpIcon className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalIncome.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <ArrowDownIcon className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalExpense.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +12.3% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
            <WalletIcon className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${netWorth.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +7.8% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
            <TargetIcon className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalIncome > 0 ? ((netWorth / totalIncome) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              +3.2% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <SpendingByCategory data={reports?.categorySpending || []} />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentTransactions transactions={transactions} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}