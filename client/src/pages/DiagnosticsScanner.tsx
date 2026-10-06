import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { UploadCloud, Image as ImageIcon, Camera, Loader2 } from 'lucide-react';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

const diagnosticSchema = z.object({
  crop_name: z.string().min(2, "Crop name is required"),
  plot_id: z.string().optional(),
});

type DiagnosticData = z.infer<typeof diagnosticSchema>;

export function DiagnosticsScanner() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<DiagnosticData>({
    resolver: zodResolver(diagnosticSchema)
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selected);
    }
  };

  const onSubmit = async (data: DiagnosticData) => {
    if (!file) {
      setError("Please upload an image for analysis.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('crop_name', data.crop_name);
      if (data.plot_id) formData.append('plot_id', data.plot_id);

      const response = await apiClient.post('/diagnostics/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      navigate(`/diagnostics/${response.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
      setLoading(false);
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Visual Crop Doctor</h1>
        <p className="mt-2 text-slate-500">Upload a leaf, fruit, or stem photo for instant multimodal pathology diagnosis.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8">
          {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}

          <div className="space-y-8">
            {/* Image Dropzone */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Plant Image</label>
              <div className="mt-2 flex justify-center rounded-xl border-2 border-dashed border-slate-300 px-6 py-10 hover:bg-slate-50 transition-colors">
                <div className="text-center">
                  {preview ? (
                    <div className="relative mx-auto h-48 w-48 rounded-lg overflow-hidden">
                      <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                      <button type="button" onClick={() => { setFile(null); setPreview(null); }} className="absolute top-2 right-2 bg-slate-900/50 text-white rounded-full p-1 hover:bg-red-500">
                        &times;
                      </button>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="mx-auto h-12 w-12 text-slate-300" aria-hidden="true" />
                      <div className="mt-4 flex text-sm leading-6 text-slate-600 justify-center">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer rounded-md bg-white font-semibold text-agri-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-agri-600 focus-within:ring-offset-2 hover:text-agri-500"
                        >
                          <span>Upload a file</span>
                          <input id="file-upload" type="file" accept="image/jpeg, image/png, image/webp" className="sr-only" onChange={handleFileChange} />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs leading-5 text-slate-500">PNG, JPG, WEBP up to 8MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Context Input */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                 <label className="block text-sm font-medium text-slate-900">Crop Name</label>
                 <input type="text" placeholder="e.g., Tomato" {...register('crop_name')} className="mt-1 block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-agri-600 sm:text-sm" />
                 {errors.crop_name && <p className="text-red-500 text-xs mt-1">{errors.crop_name.message}</p>}
              </div>
              <div>
                 <label className="block text-sm font-medium text-slate-900">Link to Plot (Optional)</label>
                 <input type="text" placeholder="UUID of Plot" {...register('plot_id')} className="mt-1 block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-agri-600 sm:text-sm" />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <button type="submit" className="w-full flex justify-center items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                <UploadCloud className="w-5 h-5 mr-2" /> Submit for Diagnosis
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
