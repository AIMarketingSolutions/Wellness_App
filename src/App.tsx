import React from 'react';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Dumbbell, Heart, Target } from 'lucide-react';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import DashboardNew from './components/routes/DashboardNew';
import ProfileAssessment from './components/routes/ProfileAssessment';
import TransformationTrackerRoute from './components/routes/TransformationTracker';
import MealPlan from './components/routes/MealPlan';
import Fitness from './components/routes/Fitness';
import Supplement from './components/routes/Supplement';
import NutritionalProtocol from './components/routes/NutritionalProtocol';
import Article from './components/routes/Article';
import { supabase } from './lib/supabase';
import { WebContainerErrorBoundary } from './utils/webcontainer';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session?.user?.email);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLoginSuccess = () => {
    window.location.href = '/main-page';
  };

  const handleSignupSuccess = () => {
    window.location.href = '/main-page';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <WebContainerErrorBoundary>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage onBack={() => window.history.back()} onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/signup" element={<SignupPage onBack={() => window.history.back()} onSignupSuccess={handleSignupSuccess} />} />
          
          {/* Protected Routes - All 7 sections */}
          <Route path="/main-page" element={<ProtectedRoute><DashboardNew /></ProtectedRoute>} />
          <Route path="/profile-assessment" element={<ProtectedRoute><ProfileAssessment /></ProtectedRoute>} />
          <Route path="/transformation-tracker" element={<ProtectedRoute><TransformationTrackerRoute /></ProtectedRoute>} />
          <Route path="/meal-plan" element={<ProtectedRoute><MealPlan /></ProtectedRoute>} />
          <Route path="/fitness" element={<ProtectedRoute><Fitness /></ProtectedRoute>} />
          <Route path="/supplement" element={<ProtectedRoute><Supplement /></ProtectedRoute>} />
          <Route path="/nutritional-protocol" element={<ProtectedRoute><NutritionalProtocol /></ProtectedRoute>} />
          <Route path="/article" element={<ProtectedRoute><Article /></ProtectedRoute>} />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </WebContainerErrorBoundary>
  );
}

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    checkUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Home Page Component
function HomePage() {

  return (
    <WebContainerErrorBoundary>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto text-center space-y-12">
        {/* Header Section */}
        <div className="space-y-6">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-emerald-600 p-4 rounded-full shadow-lg">
              <Dumbbell className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 leading-tight tracking-tight">
            Welcome to
            <span className="block bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
              Nutrition One Fitness Inc.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 max-w-xl mx-auto leading-relaxed">
            Transform your health journey with personalized nutrition and fitness coaching, featuring customized meal plans, tailored exercise routines, and expert guidance designed to deliver lasting results.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center max-w-lg mx-auto">
          <Link 
            to="/login"
            className="w-full sm:w-auto px-12 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-lg rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-out focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50"
          >
            Login
          </Link>
          
          <Link 
            to="/signup"
            className="w-full sm:w-auto px-12 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold text-lg rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-out focus:outline-none focus:ring-4 focus:ring-emerald-300 focus:ring-opacity-50"
          >
            Signup
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 max-w-4xl mx-auto">
          <div className="text-center space-y-4 p-6 bg-white/50 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex justify-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <Heart className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Personalized Plans</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Customize your nutrition and fitness plans designed specifically for you, aligning with your individual goals and lifestyle needs.
            </p>
          </div>

          <div className="text-center space-y-4 p-6 bg-white/50 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex justify-center">
              <div className="bg-emerald-100 p-3 rounded-full">
                <Target className="w-8 h-8 text-emerald-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Expert Guidance</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Work with a Registered Nutritional Consulting Practitioner (RNCP) and certified fitness professionals to achieve optimal results.
            </p>
          </div>

          <div className="text-center space-y-4 p-6 bg-white/50 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex justify-center">
              <div className="bg-purple-100 p-3 rounded-full">
                <Dumbbell className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Proven Results</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Transform your health and fitness like thousands before you—join a community of success and achieve your lifestyle goals today!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-8 text-center">
          <p className="text-gray-500 text-sm">
            Ready to start your transformation journey?
          </p>
        </div>
      </div>
    </div>
    </WebContainerErrorBoundary>
  );
}

export default App;