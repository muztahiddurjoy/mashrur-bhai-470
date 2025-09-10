// src/components/dashboard/layout.tsx
'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Wallet,
  Target,
  PieChart,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Toaster } from '../ui/sonner';

const navigation = [
  { name: 'Dashboard', href: '/', icon: BarChart3 },
  { name: 'Transactions', href: '/transactions', icon: Wallet },
  { name: 'Budgets', href: '/budgets', icon: PieChart },
  { name: 'Goals', href: '/goals', icon: Target },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/auth/login';
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transition-transform duration-300 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <h1 className="text-xl font-semibold">Finance Manager</h1>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="p-4">
          <div className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </a>
              );
            })}
          </div>
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        <div className="sticky top-0 z-40 lg:hidden bg-card border-b">
          <div className="flex items-center justify-between h-16 px-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="text-xl font-semibold">Finance Manager</h1>
            <div className="w-10" /> {/* Spacer for balance */}
          </div>
        </div>

        <main className="p-6">{children}</main>
        <Toaster/>
      </div>
    </div>
  );
}