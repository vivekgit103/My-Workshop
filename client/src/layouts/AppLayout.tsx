import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, LayoutDashboard, Sprout, ClipboardList, ScanSearch, Settings, LogOut } from 'lucide-react';
import { cn } from '../utils/cn';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Plot Manager', href: '/plots', icon: Sprout },
  { name: 'Crop Advisory', href: '/advisory/new', icon: ClipboardList },
  { name: 'Visual Diagnostics', href: '/diagnostics/scan', icon: ScanSearch },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function AppLayout() {
  const { user, signOut } = useAuth();
  const location = useLocation();

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="no-print w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <Leaf className="h-6 w-6 text-agri-600 mr-2" />
          <span className="text-xl font-bold text-slate-900 tracking-tight">AgroAdvisor <span className="text-agri-600">AI</span></span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  isActive ? 'bg-agri-50 text-agri-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                  'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors'
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? 'text-agri-600' : 'text-slate-400 group-hover:text-slate-500',
                    'flex-shrink-0 -ml-1 mr-3 h-5 w-5'
                  )}
                  aria-hidden="true"
                />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center px-3 py-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {user?.user_metadata?.full_name || 'Farmer'}
              </p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="mt-2 group flex w-full items-center px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="flex-shrink-0 -ml-1 mr-3 h-5 w-5 text-slate-400 group-hover:text-red-500" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="no-print md:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4">
          <div className="flex items-center">
             <Leaf className="h-6 w-6 text-agri-600 mr-2" />
             <span className="text-xl font-bold text-slate-900 tracking-tight">AgroAdvisor AI</span>
          </div>
          {/* Add mobile hamburger menu implementation here if desired */}
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
