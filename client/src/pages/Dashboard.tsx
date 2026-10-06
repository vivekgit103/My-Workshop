import { useAuth } from '../context/AuthContext';
import { MetricCard } from '../components/MetricCard';
import { Sprout, Activity, AlertTriangle, Droplets } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const { user } = useAuth();

  const { data: plots } = useQuery({
    queryKey: ['plots'],
    queryFn: async () => {
      const { data } = await apiClient.get('/plots');
      return data;
    },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'Farmer'}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Here is what is happening across your active plots today.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard 
          title="Active Plots" 
          value={plots?.length || 0} 
          icon={Sprout} 
          status="optimal" 
          description="Total land parcels managed"
        />
        <MetricCard 
          title="Avg. Soil Health" 
          value="7.2" 
          unit="pH" 
          icon={Activity} 
          status="optimal"
        />
        <MetricCard 
          title="Recent Warnings" 
          value="2" 
          icon={AlertTriangle} 
          status="warning" 
          description="Pest alerts detected"
        />
        <MetricCard 
          title="Irrigation" 
          value="Optimal" 
          icon={Droplets} 
          status="optimal"
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200">
            <h3 className="text-base font-semibold leading-6 text-slate-900">Quick Actions</h3>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            <Link to="/advisory/new" className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-lg text-center hover:border-agri-500 hover:bg-agri-50 transition-all">
              <Sprout className="h-8 w-8 text-agri-600 mb-2" />
              <span className="text-sm font-medium text-slate-900">Generate Crop Plan</span>
            </Link>
            <Link to="/diagnostics/scan" className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-lg text-center hover:border-blue-500 hover:bg-blue-50 transition-all">
              <Activity className="h-8 w-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-slate-900">Diagnose Plant</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
