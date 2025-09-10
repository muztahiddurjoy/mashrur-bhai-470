// src/components/dashboard/recent-transactions.tsx
'use client';

import { useState } from 'react';
import { Transaction } from '@/types/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  ArrowDownIcon, 
  ArrowUpIcon, 
  MoreHorizontalIcon,
  EditIcon,
  TrashIcon
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { transactionService } from '@/api/services';
import { toast } from 'sonner';

interface RecentTransactionsProps {
  transactions: Transaction[];
  onUpdate?: () => void;
}

export function RecentTransactions({ transactions, onUpdate }: RecentTransactionsProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setLoading(id);
    try {
      const response = await transactionService.deleteTransaction(id);
      if (response.success) {
        toast.success
        if (onUpdate) onUpdate();
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
        toast.error(error.message || 'Failed to delete transaction');
    } finally {
      setLoading(null);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Food: 'bg-amber-100 text-amber-800 border-amber-200',
      Rent: 'bg-blue-100 text-blue-800 border-blue-200',
      Utilities: 'bg-purple-100 text-purple-800 border-purple-200',
      Transportation: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      Entertainment: 'bg-pink-100 text-pink-800 border-pink-200',
      Healthcare: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      Shopping: 'bg-rose-100 text-rose-800 border-rose-200',
      Income: 'bg-green-100 text-green-800 border-green-200',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No transactions yet</p>
        <p className="text-sm">Add your first transaction to get started</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction._id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {transaction.type === 'income' ? (
                    <ArrowUpIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4 text-red-500" />
                  )}
                  {transaction.description}
                </div>
              </TableCell>
              <TableCell>
                <Badge 
                  variant="outline" 
                  className={getCategoryColor(transaction.category)}
                >
                  {transaction.category}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(transaction.date)}</TableCell>
              <TableCell className={`text-right font-medium ${
                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.type === 'income' ? '+' : '-'}
                {formatCurrency(transaction.amount)}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontalIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <EditIcon className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => handleDelete(transaction._id)}
                      disabled={loading === transaction._id}
                    >
                      <TrashIcon className="mr-2 h-4 w-4" />
                      {loading === transaction._id ? 'Deleting...' : 'Delete'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}