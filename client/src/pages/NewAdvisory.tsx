import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { Sprout, TestTube, Map, Sparkles } from 'lucide-react';
import { cn } from '../utils/cn';

const wizardSchema = z.object({
  plot_id: z.string().uuid("Please select a plot"),
  crop_name: z.string().min(2, "Crop name is required"),
  crop_variety: z.string().optional(),
  current_growth_stage: z.string().min(2, "Growth stage is required"),
});

type WizardData = z.infer<typeof wizardSchema>;

export function NewAdvisory() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<WizardData>({
    resolver: zodResolver(wizardSchema)
  });

  const onSubmit = async (data: WizardData) => {
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // In a real app, you would select from existing plots. For simplicity in UI scaffolding, we assume a hardcoded plot_id or a dropdown is used.
      // E.g., data.plot_id = "some-uuid"
      // We will pass the required fields directly
      const response = await apiClient.post('/advisory/generate', {
        ...data,
        // Mock plot ID for the sake of the wizard - in a real app this would come from a <select> populated via React Query
        plot_id: '00000000-0000-0000-0000-000000000000', 
      });
      navigate(`/advisory/${response.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
      setLoading(false);
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Generate Crop Advisory</h1>
        <p className="mt-2 text-slate-500">Configure parameters for AI-driven agronomic scheduling.</p>
      </div>

      {/* Stepper UI */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
           {[
             { id: 1, label: 'Plot', icon: Map },
             { id: 2, label: 'Soil Metrics', icon: TestTube },
             { id: 3, label: 'Crop Params', icon: Sprout }
           ].map((s, idx) => (
             <div key={s.id} className="flex flex-col items-center w-1/3 relative">
               <div className={cn("flex items-center justify-center w-10 h-10 rounded-full", step >= s.id ? "bg-agri-600 text-white" : "bg-slate-200 text-slate-500")}>
                 <s.icon className="w-5 h-5" />
               </div>
               <span className="mt-2 text-xs font-medium text-slate-500">{s.label}</span>
               {idx !== 2 && (
                 <div className={cn("absolute top-5 left-1/2 w-full h-0.5", step > s.id ? "bg-agri-600" : "bg-slate-200")} style={{ zIndex: -1, width: 'calc(100% - 2.5rem)', left: 'calc(50% + 1.25rem)' }} />
               )}
             </div>
           ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200 p-6 sm:p-8">
        {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Select Plot</h3>
              <p className="text-sm text-slate-500 mb-4">Choose the land parcel to analyze.</p>
              {/* Mock Input for Plot UUID */}
              <div>
                <label className="block text-sm font-medium text-slate-900">Plot ID</label>
                <input type="text" {...register('plot_id')} defaultValue="00000000-0000-0000-0000-000000000000" className="mt-1 block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-agri-600 sm:text-sm" />
                {errors.plot_id && <p className="text-red-500 text-xs mt-1">{errors.plot_id.message}</p>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
               <h3 className="text-lg font-semibold">Soil Metrics</h3>
               <p className="text-sm text-slate-500 mb-4">The AI will use the latest soil test associated with this plot.</p>
               <div className="bg-blue-50 text-blue-800 p-4 rounded-md text-sm">
                 Soil parameters (pH, NPK, etc.) will be automatically fetched from the plot's history.
               </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
               <h3 className="text-lg font-semibold">Crop Configuration</h3>
               <p className="text-sm text-slate-500 mb-4">Define the target crop and current growth state.</p>
               
               <div>
                 <label className="block text-sm font-medium text-slate-900">Crop Name</label>
                 <input type="text" placeholder="e.g., Wheat, Cotton, Tomato" {...register('crop_name')} className="mt-1 block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-agri-600 sm:text-sm" />
                 {errors.crop_name && <p className="text-red-500 text-xs mt-1">{errors.crop_name.message}</p>}
               </div>

               <div>
                 <label className="block text-sm font-medium text-slate-900">Crop Variety (Optional)</label>
                 <input type="text" placeholder="e.g., HD 2967" {...register('crop_variety')} className="mt-1 block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-agri-600 sm:text-sm" />
               </div>

               <div>
                 <label className="block text-sm font-medium text-slate-900">Current Growth Stage</label>
                 <select {...register('current_growth_stage')} className="mt-1 block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-agri-600 sm:text-sm">
                   <option value="">Select a stage</option>
                   <option value="Land Preparation">Land Preparation</option>
                   <option value="Vegetative">Vegetative</option>
                   <option value="Flowering">Flowering / Tasseling</option>
                   <option value="Fruiting">Fruit / Pod Formation</option>
                 </select>
                 {errors.current_growth_stage && <p className="text-red-500 text-xs mt-1">{errors.current_growth_stage.message}</p>}
               </div>
            </div>
          )}

          <div className="flex justify-between pt-6 border-t border-slate-200">
             <button type="button" disabled={step === 1} onClick={() => setStep(step - 1)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50">
               Back
             </button>
             <button type="submit" className="flex items-center px-4 py-2 text-sm font-medium text-white bg-agri-600 rounded-md hover:bg-agri-700">
               {step === 3 ? (
                 <><Sparkles className="w-4 h-4 mr-2" /> Generate Advisory</>
               ) : 'Continue'}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}
