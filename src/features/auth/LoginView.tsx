import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/auth/AuthContext';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Alert } from '../../components/Alert';
import { Sparkles, PhoneCall, Shield, Users, BarChart3 } from 'lucide-react';

export const LoginView: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('owner@apexdynamics.com');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const isExpired = queryParams.get('expired') === '1';

  const demoAccounts = [
    { role: 'Owner', email: 'owner@apexdynamics.com', desc: 'Full workspace authority & CRM metrics', icon: <Sparkles className="w-3.5 h-3.5 text-purple-600" /> },
    { role: 'Admin', email: 'admin@apexdynamics.com', desc: 'User & team management, imports/exports', icon: <Shield className="w-3.5 h-3.5 text-blue-600" /> },
    { role: 'Manager', email: 'manager@apexdynamics.com', desc: 'Team lead assignment & performance', icon: <Users className="w-3.5 h-3.5 text-indigo-600" /> },
    { role: 'Telecaller', email: 'telecaller@apexdynamics.com', desc: 'Assigned leads work queue & calling', icon: <PhoneCall className="w-3.5 h-3.5 text-pink-600" /> },
  ];

  const handleSelectDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const user = await login(email, password);
      // Route based on role
      if (user.role?.slug === 'telecaller') {
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

          {/* Quick Demo Accounts Switcher */}
          <div className="mt-8 pt-6 border-t border-zinc-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Demo Accounts (Click to Fill)
              </span>
              <span className="text-[11px] text-zinc-400">PW: Password123!</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((item) => (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => handleSelectDemo(item.email)}
                  className={`text-left p-2.5 rounded-xl border text-xs transition-all flex flex-col gap-1 ${
                    email === item.email
                      ? 'border-purple-500 bg-purple-50/60 text-purple-900 shadow-sm'
                      : 'border-zinc-200 hover:border-zinc-300 bg-zinc-50/50 text-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-semibold">
                    {item.icon}
                    <span>{item.role}</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 truncate">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
