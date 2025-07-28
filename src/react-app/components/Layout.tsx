import { ReactNode } from 'react';
import { useAuth } from '@/react-app/hooks/useAuth';
import { Link, useNavigate } from 'react-router';
import { 
  Home, 
  Plus, 
  Settings, 
  LogOut, 
  User,
  TicketIcon,
  Menu,
  X
} from 'lucide-react';
import { RoleLabels } from '@/shared/types';
import { useState } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const userData = user;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navigationItems = [
    { name: 'Nadzorna ploča', href: '/dashboard', icon: Home },
    { name: 'Nova prijava', href: '/create-ticket', icon: Plus },
    ...(userData && userData.role === 'administracija' ? [
      { name: 'Administracija', href: '/admin', icon: Settings }
    ] : [])
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-blue-800/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <TicketIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white">
                  FavBet
                </span>
                <span className="text-sm font-medium text-yellow-400">
                  ServiDesk
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center space-x-2 text-gray-300 hover:text-yellow-400 transition-colors duration-200 font-medium"
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">
                    {userData?.full_name || userData?.email}
                  </p>
                  <p className="text-xs text-gray-300">
                    {userData && RoleLabels[userData.role]}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors duration-200 font-medium"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden md:inline">Odjava</span>
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-300 hover:bg-blue-800/50 transition-colors duration-200"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-slate-900/95 backdrop-blur-md border-t border-blue-800/50">
            <div className="px-4 py-4 space-y-3">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center space-x-3 text-gray-300 hover:text-yellow-400 transition-colors duration-200 font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
              
              <div className="pt-3 border-t border-blue-800">
                <div className="flex items-center space-x-3 text-gray-300 py-2">
                  <User className="w-5 h-5" />
                  <div>
                    <p className="font-medium text-white">{userData?.full_name || userData?.email}</p>
                    <p className="text-sm text-gray-400">{userData && RoleLabels[userData.role]}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
