import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { Download } from 'lucide-react';

export function AdvisoryDetail() {
  const { id } = useParams();

  const { data: advisory, isLoading, error } = useQuery({
    queryKey: ['advisory', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/advisory/${id}`);
      return data;
    },
  });

  if (isLoading) return <LoadingSkeleton />;
  if (error || !advisory) return <div>Error loading advisory.</div>;

  const plan = advisory.generated_plan;

  return (
    <div className="max-w-5xl mx-auto py-8 print:py-0 print:text-black">
      {/* Action Header */}
      <div className="flex justify-between items-center mb-8 no-print">
         <h1 className="text-3xl font-bold text-slate-900">Advisory Schedule</h1>
         <button onClick={() => window.print()} className="inline-flex items-center rounded-md bg-agri-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-agri-500">
           <Download className="h-4 w-4 mr-2" /> Print Action Sheet
         </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200 overflow-hidden print:shadow-none print:ring-0">
        <div className="p-8 border-b border-slate-200 bg-slate-50 print:bg-transparent print:border-b-2 print:border-black">
           <h2 className="text-2xl font-bold text-slate-900">{advisory.crop_name} {advisory.crop_variety ? `(${advisory.crop_variety})` : ''}</h2>
           <p className="text-slate-600 mt-2">{plan.executive_summary}</p>
        </div>

        <div className="p-8 space-y-12">
          {/* Soil Section */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-200 pb-2">Soil Health Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-sm font-semibold text-slate-700">pH Status: <span className="font-normal text-slate-900">{plan.soil_health_assessment.ph_status}</span></p>
                <p className="text-sm text-slate-600 mt-1">{plan.soil_health_assessment.ph_impact_comment}</p>
              </div>
              <div className="flex gap-4">
                {['nitrogen', 'phosphorus', 'potassium'].map(n => (
                  <div key={n} className="flex-1 bg-slate-50 rounded-lg p-3 text-center border border-slate-200">
                     <span className="block text-xs uppercase text-slate-500 font-bold">{n.charAt(0)}</span>
                     <span className="block text-sm mt-1 font-medium text-slate-900">{plan.soil_health_assessment.npk_balance[n]}</span>
                  </div>
                ))}
              </div>
            </div>
            {plan.soil_health_assessment.remediation_steps.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-slate-900 mb-2">Required Remediation:</p>
                <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
                  {plan.soil_health_assessment.remediation_steps.map((s: string, i: number) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}
          </section>

          {/* Fertigation Table */}
          <section className="print-page-break">
            <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-200 pb-2">Fertilizer Schedule</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 border border-slate-200">
                <thead className="bg-slate-50 text-xs font-medium text-slate-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Stage</th>
                    <th className="px-4 py-3 text-left">Days</th>
                    <th className="px-4 py-3 text-left">Input (Fertilizer)</th>
                    <th className="px-4 py-3 text-left">Dose/Acre</th>
                    <th className="px-4 py-3 text-left">Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white text-sm">
                  {plan.fertilizer_schedule.map((fs: any, i: number) => (
                    <tr key={i}>
                      <td className="px-4 py-3 font-medium text-slate-900">{fs.growth_stage}</td>
                      <td className="px-4 py-3 text-slate-500">{fs.days_after_sowing}</td>
                      <td className="px-4 py-3 text-slate-900">{fs.fertilizer_name}</td>
                      <td className="px-4 py-3 font-semibold text-agri-700">{fs.dose_per_acre}</td>
                      <td className="px-4 py-3 text-slate-500">{fs.application_method}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* IPM Table */}
          <section className="print-page-break">
            <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-200 pb-2">Integrated Pest & Disease Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plan.integrated_pest_disease_defense.map((def: any, i: number) => (
                <div key={i} className="bg-slate-50 rounded-lg p-5 border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-3">{def.target_threat}</h4>
                  <div className="space-y-3 text-sm">
                    <p><span className="font-semibold text-slate-700">Preventative:</span> {def.preventive_measure}</p>
                    <p><span className="font-semibold text-slate-700">Biological:</span> <span className="text-green-700">{def.biological_control}</span></p>
                    <p><span className="font-semibold text-slate-700">Chemical:</span> <span className="text-red-600">{def.chemical_emergency_control}</span></p>
                    <p><span className="font-semibold text-slate-700">PHI:</span> {def.phi_days} days</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Yield */}
          <section className="bg-agri-50 border border-agri-200 rounded-lg p-6 flex flex-col md:flex-row justify-between items-center print:border-black print:bg-transparent">
             <div>
               <h3 className="text-sm font-bold text-agri-900 uppercase tracking-wide">Estimated Yield Potential</h3>
               <p className="text-sm text-agri-700 mt-1">Limiting Factor: {plan.estimated_yield_potential.key_limiting_factor}</p>
             </div>
             <div className="mt-4 md:mt-0 text-2xl font-black text-agri-700">
               {plan.estimated_yield_potential.range}
             </div>
          </section>
        </div>
      </div>
    </div>
  );
}
