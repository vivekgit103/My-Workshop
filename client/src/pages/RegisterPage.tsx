import { useState } from 'react';
import { supabase } from '../config/supabase';
import { useNavigate, Link } from 'react-router-dom';

export function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'farmer', // Default role
          country: 'India',
        }
      }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // If email confirmation is off, data.user will be present and confirmed
      if (data?.session) {
        // Automatically logged in
        window.location.href = '/dashboard';
      } else {
        // Requires email confirmation
        setSuccess(true);
        setLoading(false);
      }
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-6">
        <h3 className="text-xl font-bold text-slate-900">Registration Successful!</h3>
        <p className="text-slate-600">Please check your email to confirm your account.</p>
        <Link to="/auth/login" className="block text-agri-600 hover:text-agri-500 font-semibold">
          Return to login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleRegister} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium leading-6 text-slate-900">
            Full Name
          </label>
          <div className="mt-2">
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-agri-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium leading-6 text-slate-900">
            Email address
          </label>
          <div className="mt-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-agri-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium leading-6 text-slate-900">
            Password
          </label>
          <div className="mt-2">
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-agri-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center rounded-md bg-agri-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-agri-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-agri-600 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </div>
      </form>

      <p className="mt-10 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/auth/login" className="font-semibold leading-6 text-agri-600 hover:text-agri-500">
          Sign in instead
        </Link>
      </p>
    </div>
  );
}
