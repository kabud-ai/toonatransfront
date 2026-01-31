import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  Search,
  Moon,
  Sun,
  Settings,
  LogOut,
  User,
  Building2,
  HelpCircle,
  Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import LanguageSelector from '@/components/i18n/LanguageSelector';
import { useTranslation } from '@/components/i18n/LanguageContext';

export default function Header({ user, collapsed, onMenuToggle, darkMode, onDarkModeToggle }) {
  const { t } = useTranslation();
  const [searchOpen, setSearchOpen] = useState(false);

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  const notifications = [
    { id: 1, title: 'Low stock alert', message: 'Steel Rods below minimum level', type: 'warning', time: '5m ago' },
    { id: 2, title: 'Order completed', message: 'MO-2024-0156 finished production', type: 'success', time: '1h ago' },
    { id: 3, title: 'Quality check required', message: 'Batch B-2024-089 pending inspection', type: 'info', time: '2h ago' },
  ];

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search */}
        <div className={cn(
          "hidden md:flex items-center transition-all duration-300",
          searchOpen ? "w-80" : "w-64"
        )}>
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search products, orders, suppliers..."
              className="pl-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-indigo-500"
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setSearchOpen(false)}
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Language selector */}
        <LanguageSelector />

        {/* Dark mode toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onDarkModeToggle}
          className="text-slate-600 dark:text-slate-400"
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        {/* Help */}
        <Button variant="ghost" size="icon" className="text-slate-600 dark:text-slate-400">
          <HelpCircle className="h-5 w-5" />
        </Button>

        {/* Notifications */}
        <NotificationCenter />

        {/* Site selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 text-slate-600 dark:text-slate-400">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">Main Factory</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Switch Site</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              Main Factory
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2">
              <div className="h-2 w-2 rounded-full bg-slate-300" />
              Warehouse North
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2">
              <div className="h-2 w-2 rounded-full bg-slate-300" />
              Distribution Center
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 pl-2 pr-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-indigo-600 text-white text-sm">
                  {user?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {user?.full_name || 'User'}
                </span>
                <span className="text-xs text-slate-500 capitalize">{user?.role || 'Admin'}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="gap-2 cursor-pointer">
              <Link to={createPageUrl('UserProfile')}>
                <User className="h-4 w-4" />
                {t('userProfile.title') || 'Profile'}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="gap-2 cursor-pointer">
              <Link to={createPageUrl('Settings')}>
                <Settings className="h-4 w-4" />
                {t('nav.settings')}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="gap-2 text-red-600 cursor-pointer">
              <LogOut className="h-4 w-4" />
              {t('userProfile.logout') || 'Log out'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}