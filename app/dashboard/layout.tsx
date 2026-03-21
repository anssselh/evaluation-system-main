'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Menu, X } from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/');
      return;
    }
    setUser(JSON.parse(userStr));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (!user) {
    return null;
  }

  const navItems = [
    { label: 'Dashboard', href: `/dashboard/${user.role}` },
    ...(user.role === 'student'
      ? [
          { label: 'My Stages', href: `/dashboard/${user.role}/stages` },
          { label: 'Reports', href: `/dashboard/${user.role}/reports` },
          { label: 'Certificates', href: `/dashboard/${user.role}/certificates` },
        ]
      : []),
    ...(user.role === 'company'
      ? [
          { label: 'Active Stages', href: `/dashboard/${user.role}/stages` },
          { label: 'Certificates', href: `/dashboard/${user.role}/certificates` },
        ]
      : []),
    ...(user.role === 'supervisor'
      ? [
          { label: 'Students', href: `/dashboard/${user.role}/students` },
          { label: 'Reports', href: `/dashboard/${user.role}/reports` },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">IE</span>
              </div>
              <h1 className="text-xl font-bold text-white hidden sm:block">
                Internship Eval
              </h1>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Desktop navigation */}
            <nav className="hidden lg:flex gap-1">
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  onClick={() => router.push(item.href)}
                  className="text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  {item.label}
                </Button>
              ))}
            </nav>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  {user.name}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-slate-300 hover:text-white cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile navigation */}
          {isOpen && (
            <div className="lg:hidden pb-4 space-y-2">
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  onClick={() => {
                    router.push(item.href);
                    setIsOpen(false);
                  }}
                  className="w-full text-left text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  {item.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
