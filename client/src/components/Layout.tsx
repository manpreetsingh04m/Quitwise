import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, BookOpen, Users } from 'lucide-react';
import clsx from 'clsx';
import NamePrompt from './NamePrompt';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/cbt', icon: BookOpen, label: 'CBT' },
    { path: '/community', icon: Users, label: 'Community' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NamePrompt />
      <main className="flex-1 container mx-auto px-4 py-6 max-w-md">
        {children}
      </main>
      
      <nav className="bg-white border-t border-gray-200 sticky bottom-0 pb-safe">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  "flex flex-col items-center justify-center w-full h-full transition-colors",
                  isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
                )}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
