import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { DiagnosticVerdictBadge } from '../components/DiagnosticVerdictBadge';
import { Bug, Droplets, ShieldCheck, Download } from 'lucide-react';

export function DiagnosticsDetail() {
  const { id } = useParams();

  const { data: diagnostic, isLoading, error } = useQuery({
    queryKey: ['diagnostic', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/diagnostics/${id}`);
      return data;
    },
  });

  if (isLoading) return <LoadingSkeleton />;
  if (error || !diagnostic) return <div>Error loading diagnosis.</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 print:py-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 print:text-2xl">Pathology Report: {diagnostic.crop_name}</h1>
          <p className="mt-1 text-sm text-slate-500">Analyzed on {new Date(diagnostic.created_at).toLocaleDateString()}</p>
        </div>
        <div className="no-print flex gap-3">
           <button onClick={() => window.print()} className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50">
             <Download className="h-4 w-4 mr-2" /> Export PDF
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Image & Verdict */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
             <div className="aspect-square bg-slate-100 relative">
               <img src={diagnostic.image_url} alt="Analyzed Plant" className="absolute inset-0 w-full h-full object-cover" />
             </div>
             <div className="p-5">
               <h3 className="font-semibold text-slate-900 mb-1">{diagnostic.diagnosed_disease}</h3>
               <p className="text-sm text-slate-500 mb-4">{diagnostic.pathogen_type}</p>
               
               <div className="flex items-center justify-between py-2 border-t border-slate-100">
                 <span className="text-sm font-medium text-slate-500">Confidence</span>
                 <span className="text-sm font-bold text-slate-900">{(diagnostic.confidence_score * 100).toFixed(1)}%</span>
               </div>
               <div className="flex items-center justify-between py-2 border-t border-slate-100">
                 <span className="text-sm font-medium text-slate-500">Severity</span>
                 <DiagnosticVerdictBadge severity={diagnostic.severity} />
               </div>
             </div>
           </div>
        </div>

        {/* Right Column: Protocols */}
        <div className="lg:col-span-2 space-y-6">
           {/* Symptoms */}
           <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200 p-6">
             <h3 className="text-lg font-semibold text-slate-900 flex items-center mb-4">
               <Bug className="h-5 w-5 mr-2 text-slate-400" /> Observed Symptoms
             </h3>
             <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700">
               {diagnostic.symptoms.map((sym: string, i: number) => (
                 <li key={i}>{sym}</li>
               ))}
             </ul>
           </div>

           {/* Organic Protocols */}
           <div className="bg-green-50 rounded-xl shadow-sm ring-1 ring-green-200 p-6">
             <h3 className="text-lg font-semibold text-green-900 flex items-center mb-4">
               <ShieldCheck className="h-5 w-5 mr-2 text-green-600" /> Organic & Biological Remedies
             </h3>
             <ul className="list-disc pl-5 space-y-2 text-sm text-green-800">
               {diagnostic.organic_controls.map((rem: string, i: number) => (
                 <li key={i}>{rem}</li>
               ))}
             </ul>
           </div>

           {/* Chemical Protocols */}
           {diagnostic.chemical_controls.length > 0 && (
             <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
               <div className="p-6 border-b border-slate-200">
                 <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                   <Droplets className="h-5 w-5 mr-2 text-blue-500" /> Chemical Interventions
                 </h3>
               </div>
               <table className="min-w-full divide-y divide-slate-200">
                 <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                   <tr>
                     <th className="px-6 py-3 text-left font-medium">Active Name</th>
                     <th className="px-6 py-3 text-left font-medium">Dosage</th>
                     <th className="px-6 py-3 text-left font-medium">PHI (Days)</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-200 bg-white">
                   {diagnostic.chemical_controls.map((chem: any, i: number) => (
                     <tr key={i}>
                       <td className="px-6 py-4 text-sm font-medium text-slate-900">{chem.commercial_or_active_name}</td>
                       <td className="px-6 py-4 text-sm text-slate-500">{chem.recommended_dosage_per_liter}</td>
                       <td className="px-6 py-4 text-sm text-slate-500 font-bold">{chem.withholding_period_phi_days}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
