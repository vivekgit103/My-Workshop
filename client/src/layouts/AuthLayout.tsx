import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf } from 'lucide-react';

export function AuthLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="flex flex-1 flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex items-center">
            <Leaf className="h-10 w-10 text-agri-600 mr-3" />
            <span className="text-3xl font-bold text-slate-900 tracking-tight">AgroAdvisor <span className="text-agri-600">AI</span></span>
          </div>
          <h2 className="mt-6 text-2xl font-bold leading-9 tracking-tight text-slate-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Precision agronomy at your fingertips.
          </p>

          <div className="mt-10">
            <Outlet />
          </div>
        </div>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2940&auto=format&fit=crop"
          alt="Agriculture field"
        />
        <div className="absolute inset-0 bg-agri-900/60 mix-blend-multiply" />
      </div>
    </div>
  );
}
