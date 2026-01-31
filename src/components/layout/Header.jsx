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
import GlobalSearch from '@/components/search/GlobalSearch';
import { useTranslation } from '@/components/i18n/LanguageContext';

export default function Header({ user, collapsed, onMenuToggle, darkMode, onDarkModeToggle }) {
  const { t } = useTranslation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);

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
        <div className="hidden md:flex items-center w-64">
          <button
            onClick={() => setGlobalSearchOpen(true)}
            className="relative w-full h-10 flex items-center px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-slate-300 dark:hover:border-slate-600 transition-colors text-left group"
          >
            <Search className="h-4 w-4 text-slate-400 mr-3" />
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {t('search.searchPlaceholder') || 'Rechercher...'}
            </span>
            <kbd className="absolute right-3 text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
              ⌘K
            </kbd>
          </button>
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
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-slate-600 dark:text-slate-400"
          asChild
        >
          <Link to={createPageUrl('Documentation')}>
            <HelpCircle className="h-5 w-5" />
          </Link>
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
                <AvatarImage src={user?.avatar_url} />
                <AvatarFallback className="bg-sky-600 text-white text-sm">
                  {user?.full_name?.split(' ').map(n => n[0]).join('').substring(0, 2) || user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {user?.full_name || user?.email?.split('@')[0] || 'Utilisateur'}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                  {user?.role === 'admin' ? t('common.admin') || 'Administrateur' : t('common.user') || 'Utilisateur'}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.full_name || 'Utilisateur'}</p>
                <p className="text-xs leading-none text-slate-500 dark:text-slate-400">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="gap-2 cursor-pointer">
              <Link to={createPageUrl('UserProfile')}>
                <User className="h-4 w-4" />
                {t('userProfile.title') || 'Profil'}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="gap-2 cursor-pointer">
              <Link to={createPageUrl('Settings')}>
                <Settings className="h-4 w-4" />
                {t('nav.settings') || 'Paramètres'}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="gap-2 text-red-600 dark:text-red-400 cursor-pointer">
              <LogOut className="h-4 w-4" />
              {t('userProfile.logout') || 'Déconnexion'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Global Search Dialog */}
      <GlobalSearch open={globalSearchOpen} onOpenChange={setGlobalSearchOpen} />
    </header>
  );
}