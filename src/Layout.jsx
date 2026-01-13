import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { cn } from '@/lib/utils';

export default function Layout({ children, currentPageName }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        // User not logged in
      }
    };
    loadUser();

    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <div className={cn("min-h-screen bg-slate-50 dark:bg-slate-950", darkMode && "dark")}>
      {/* Sidebar - hidden on mobile by default */}
      <div className={cn(
        "hidden lg:block",
        mobileOpen && "block fixed inset-0 z-50 lg:relative"
      )}>
        {mobileOpen && (
          <div 
            className="fixed inset-0 bg-black/50 lg:hidden" 
            onClick={() => setMobileOpen(false)} 
          />
        )}
        <Sidebar 
          currentPage={currentPageName} 
          collapsed={collapsed} 
          onToggle={() => setCollapsed(!collapsed)}
        />
      </div>

      {/* Main content */}
      <div className={cn(
        "transition-all duration-300",
        collapsed ? "lg:ml-16" : "lg:ml-64"
      )}>
        <Header 
          user={user}
          collapsed={collapsed}
          onMenuToggle={() => setMobileOpen(!mobileOpen)}
          darkMode={darkMode}
          onDarkModeToggle={() => setDarkMode(!darkMode)}
        />
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>

      <style>{`
        :root {
          --primary: 79 70 229;
          --primary-foreground: 255 255 255;
        }
        .dark {
          --background: 2 6 23;
          --foreground: 248 250 252;
        }
      `}</style>
    </div>
  );
}