import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, User, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { signUp } from '../lib/supabase';

interface SignupPageProps {
  onBack: () => void;
  onSignupSuccess: () => void;
}

function SignupPage({ onBack, onSignupSuccess }: SignupPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { data, error } = await signUp(email, password, name);
      
      if (error) {
        setError(error.message);
      } else if (data.user) {
        setSuccess(true);
        // Auto-login after successful signup
        setTimeout(() => {
          onSignupSuccess();
        }, 2000);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-8 flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
          <span className="font-medium">Back to Home</span>
        </button>

        {/* Signup Form Container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-gray-800 tracking-tight">
              Create Account
            </h1>
            <p className="text-gray-600">
              Start your fitness journey today
            </p>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <p className="text-sm text-green-700">Account created successfully! Redirecting...</p>
              </div>
            )}

            {/* Name Field */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-gray-800 placeholder-gray-400 bg-white/50 backdrop-blur-sm"
                  placeholder="Enter your full name"
                  disabled={loading || success}
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-gray-800 placeholder-gray-400 bg-white/50 backdrop-blur-sm"
                  placeholder="Enter your email address"
                  disabled={loading || success}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-gray-800 placeholder-gray-400 bg-white/50 backdrop-blur-sm"
                  placeholder="Create a secure password"
                  disabled={loading || success}
                  minLength={6}
                  required
                />
              </div>
            </div>

            {/* Signup Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || success}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold text-lg rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:transform-none transition-all duration-300 ease-out focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating account...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Account created!
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>

          {/* Additional Links */}
          <div className="text-center space-y-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <a
                href="#"
                className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors duration-200"
              >
                Login here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;