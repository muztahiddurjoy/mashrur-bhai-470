// src/app/(dashboard)/goals/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Goal } from '@/types/types';
import { goalService } from '@/api/services';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { PlusIcon, TargetIcon, TrashIcon, PlusCircleIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [addFundsDialog, setAddFundsDialog] = useState<string | null>(null);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const response = await goalService.getGoals();
      if (response.success) {
        setGoals(response.data || []);
      }
    } catch (error) {
      toast.error("Failed to load goals");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await goalService.deleteGoal(id);
      if (response.success) {
        toast.success("Goal deleted successfully");
        loadGoals();
      }
    } catch (error) {
      toast.error("Failed to delete goal");
    }
  };

  const handleAddFunds = async (id: string, amount: number) => {
    try {
      const response = await goalService.addToGoal(id, amount);
      if (response.success) {
        toast.success("Funds added successfully");
        setAddFundsDialog(null);
        loadGoals();
      }
    } catch (error) {
      toast.error("Failed to add funds");
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
        <h1 className="text-3xl font-bold">Savings Goals</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              Create Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Savings Goal</DialogTitle>
            </DialogHeader>
            <GoalForm 
              onSuccess={() => {
                setIsDialogOpen(false);
                loadGoals();
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {goals.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <TargetIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No goals yet</h3>
              <p className="text-muted-foreground mb-4">
                Create a savings goal to start tracking your progress
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <PlusIcon className="mr-2 h-4 w-4" />
                Create Goal
              </Button>
            </CardContent>
          </Card>
        ) : (
          goals.map((goal) => (
            <Card key={goal._id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{goal.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setAddFundsDialog(goal._id)}
                  >
                    <PlusCircleIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(goal._id)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Saved: {formatCurrency(goal.currentAmount)}</span>
                      <span>Target: {formatCurrency(goal.targetAmount)}</span>
                    </div>
                    <Progress 
                      value={(goal.currentAmount / goal.targetAmount) * 100} 
                      className="h-2" 
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{Math.round((goal.currentAmount / goal.targetAmount) * 100)}% complete</span>
                      <span>Due: {formatDate(goal.deadline)}</span>
                    </div>
                  </div>
                  
                  {goal.description && (
                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                  )}
                  
                  {goal.isAchieved && (
                    <div className="bg-green-50 text-green-700 p-2 rounded-md text-sm">
                      🎉 Goal achieved! Congratulations!
                    </div>
                  )}
                </div>
              </CardContent>

              {/* Add Funds Dialog */}
              <Dialog open={addFundsDialog === goal._id} onOpenChange={(open) => !open && setAddFundsDialog(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Funds to {goal.name}</DialogTitle>
                  </DialogHeader>
                  <AddFundsForm 
                    goal={goal}
                    onAdd={(amount) => handleAddFunds(goal._id, amount)}
                    onCancel={() => setAddFundsDialog(null)}
                  />
                </DialogContent>
              </Dialog>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function GoalForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '0',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await goalService.createGoal({
        ...formData,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount),
        deadline: new Date(formData.deadline),
      });

      if (response.success) {
        toast.success("Goal created successfully");
        onSuccess();
      }
    } catch (error) {
      toast.error("Failed to create goal");
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
          <label htmlFor="name">Goal Name</label>
          <Input
            id="name"
            placeholder="e.g., Vacation Fund"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="targetAmount">Target Amount</label>
          <Input
            id="targetAmount"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formData.targetAmount}
            onChange={(e) => handleChange('targetAmount', e.target.value)}
            required
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="currentAmount">Current Amount</label>
          <Input
            id="currentAmount"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formData.currentAmount}
            onChange={(e) => handleChange('currentAmount', e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="deadline">Target Date</label>
          <Input
            id="deadline"
            type="date"
            value={formData.deadline}
            onChange={(e) => handleChange('deadline', e.target.value)}
            required
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="description">Description (Optional)</label>
          <Input
            id="description"
            placeholder="Describe your goal"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating...' : 'Create Goal'}
        </Button>
      </div>
    </form>
  );
}

function AddFundsForm({ goal, onAdd, onCancel }: { 
  goal: Goal; 
  onAdd: (amount: number) => void; 
  onCancel: () => void;
}) {
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount && parseFloat(amount) > 0) {
      onAdd(parseFloat(amount));
    }
  };

  const remainingAmount = goal.targetAmount - goal.currentAmount;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <label htmlFor="amount">Amount to Add</label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          max={remainingAmount}
          required
        />
        <p className="text-sm text-muted-foreground">
          Remaining to reach goal: {formatCurrency(remainingAmount)}
        </p>
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" className="flex-1">
          Add Funds
        </Button>
      </div>
    </form>
  );
}