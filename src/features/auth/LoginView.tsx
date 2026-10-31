import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth/AuthContext';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Alert } from '../../components/Alert';
import { PhoneCall } from 'lucide-react';

export const LoginView: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, token, user: currentUser, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated and not loading, redirect to appropriate workspace
  if (!authLoading && token && currentUser) {
    const from = (location.state as any)?.from?.pathname;
    const dest = from && from !== '/login' ? from : (currentUser.role?.slug === 'telecaller' ? '/telecaller' : '/dashboard');
    return <Navigate to={dest} replace />;
  }

  const queryParams = new URLSearchParams(location.search);
  const isExpired = queryParams.get('expired') === '1';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const loggedInUser = await login(email, password);
      const from = (location.state as any)?.from?.pathname;
      if (from && from !== '/login') {
        navigate(from);
      } else if (loggedInUser.role?.slug === 'telecaller') {
        navigate('/telecaller');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Logo & Gradient Accent */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-gradient shadow-brand text-white mb-4">
          <PhoneCall className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight sm:text-3xl">
          Apex Dynamics CRM
        </h1>
        <p className="mt-1 text-xs text-zinc-500 font-medium">
          Multi-Tenant Telecalling & Lead Management SaaS
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm rounded-2xl border border-zinc-200/80 sm:px-10">
          {isExpired && (
            <div className="mb-5">
              <Alert type="warning" title="Session Expired">
                Your session has expired. Please log in again to continue.
              </Alert>
            </div>
          )}

          {error && (
            <div className="mb-5">
              <Alert type="error" title="Sign In Failed">
                {error}
              </Alert>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Work Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
            />

            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="gradient"
                className="w-full py-2.5 text-sm font-semibold"
                isLoading={isLoading}
              >
                Sign In to Workspace
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
