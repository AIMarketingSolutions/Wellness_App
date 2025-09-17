import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock } from 'lucide-react';

interface LoginPageProps {
  onBack: () => void;
}

function LoginPage({ onBack }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Login attempt:', { email, password });
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

        {/* Login Form Container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-gray-800 tracking-tight">
              Login
            </h1>
            <p className="text-gray-600">
              Welcome back to your fitness journey
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {/* Login Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-lg rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-out focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50"
              >
                Login
              </button>
            </div>
          </form>

          {/* Additional Links */}
          <div className="text-center space-y-4 pt-4 border-t border-gray-100">
            <a
              href="#"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
            >
              Forgot your password?
            </a>
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a
                href="#"
                className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors duration-200"
              >
                Sign up here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;