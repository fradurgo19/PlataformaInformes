import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../atoms/Button';
import { 
  Home, 
  FileText, 
  Plus, 
  User, 
  LogOut, 
  Settings,
  Menu,
  X,
  Shield
} from 'lucide-react';
import { cn } from '../../utils/cn';

// Defino el tipo para los items de navegación
interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  children?: NavItem[];
}

interface NavigationProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const { state: authState, logout } = useAuth();

  const isAdmin = authState.user?.role === 'admin';
  const navItems: NavItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/reports', label: 'Reports', icon: FileText },
    { path: '/reports/new', label: 'New Report', icon: Plus },
  ];
  if (isAdmin) {
    navItems.push(
      { path: '/admin', label: 'Administration', icon: Shield },
      { path: '/admin/users', label: 'Usuarios', icon: User }
    );
  }

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={onToggle}
        className="md:hidden fixed top-4 left-4 z-50 bg-white rounded-lg p-2 shadow-lg border border-slate-200"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <nav
        className={cn(
          'fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out z-40',
          'md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-slate-200">
            <h1 className="text-xl font-bold text-slate-900">
              MachineryReports
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Technical Inspection System
            </p>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);
              if (item.children) {
                return (
                  <div key={item.path}>
                    <div className={cn(
                      'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    )}>
                      <Icon className="w-5 h-5 mr-3" />
                      {item.label}
                    </div>
                    <div className="ml-8 mt-1 space-y-1">
                      {item.children.map((child: NavItem) => (
                        <Link
                          key={child.path}
                          to={child.path}
                          onClick={onToggle}
                          className={cn(
                            'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                            isActivePath(child.path)
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                          )}
                        >
                          <child.icon className="w-4 h-4 mr-2" />
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onToggle}
                  className={cn(
                    'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* User Section */}
          <div className="p-4 border-t border-slate-200 space-y-2">
            <div className="flex items-center px-3 py-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {authState.user?.full_name}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {authState.user?.role}
                </p>
              </div>
            </div>

            <Link
              to="/profile"
              onClick={onToggle}
              className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <Settings className="w-4 h-4 mr-3" />
              Profile Settings
            </Link>

            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="w-full justify-start px-3 text-slate-700 hover:text-red-600"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>
    </>
  );
};