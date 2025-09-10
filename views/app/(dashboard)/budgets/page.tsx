// src/app/(dashboard)/budgets/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Budget } from '@/types/types';
import { budgetService } from '@/api/services';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { PlusIcon, TrashIcon, AlertTriangleIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    try {
      const response = await budgetService.getBudgets();
      if (response.success) {
        setBudgets(response.data || []);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load budgets',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await budgetService.deleteBudget(id);
      if (response.success) {
        toast.success("Budget deleted successfully");
        loadBudgets();
      }
    } catch (error) {
      toast.error("Failed to delete budget");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Budgets</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              Create Budget
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Budget</DialogTitle>
            </DialogHeader>
            <BudgetForm 
              onSuccess={() => {
                setIsDialogOpen(false);
                loadBudgets();
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {budgets.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <AlertTriangleIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No budgets yet</h3>
              <p className="text-muted-foreground mb-4">
                Create a budget to start tracking your spending limits
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <PlusIcon className="mr-2 h-4 w-4" />
                Create Budget
              </Button>
            </CardContent>
          </Card>
        ) : (
          budgets.map((budget) => (
            <Card key={budget._id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{budget.category}</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {budget.period === 'monthly' ? 'Monthly' : 'Weekly'}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(budget._id)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Spent: {formatCurrency(budget.spent || 0)}</span>
                    <span>Limit: {formatCurrency(budget.limit)}</span>
                  </div>
                  <Progress value={budget.percentage || 0} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{Math.round(budget.percentage || 0)}% of budget</span>
                    <span>
                      {budget.percentage && budget.percentage >= budget.alertThreshold ? (
                        <span className="text-red-500">Over budget alert</span>
                      ) : (
                        'Within budget'
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function BudgetForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    limit: '',
    period: 'monthly',
    alertThreshold: '80',
  });

  const categories = [
    'Food', 'Rent', 'Utilities', 'Transportation', 
    'Entertainment', 'Healthcare', 'Shopping'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await budgetService.createBudget({
        ...formData,
        limit: parseFloat(formData.limit),
        alertThreshold: parseInt(formData.alertThreshold),
      });

      if (response.success) {
        toast.success("Budget created successfully");
        onSuccess();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create budget");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <label htmlFor="category">Category</label>
          <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <label htmlFor="limit">Budget Limit</label>
          <Input
            id="limit"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formData.limit}
            onChange={(e) => handleChange('limit', e.target.value)}
            required
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="period">Period</label>
          <Select value={formData.period} onValueChange={(value) => handleChange('period', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <label htmlFor="alertThreshold">Alert Threshold (%)</label>
          <Input
            id="alertThreshold"
            type="number"
            min="0"
            max="100"
            placeholder="80"
            value={formData.alertThreshold}
            onChange={(e) => handleChange('alertThreshold', e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating...' : 'Create Budget'}
        </Button>
      </div>
    </form>
  );
}