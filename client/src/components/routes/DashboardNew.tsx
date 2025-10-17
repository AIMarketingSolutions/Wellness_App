import React, { useState, useEffect } from 'react';
import { User, LogOut, Dumbbell, Target, TrendingUp, Utensils, Activity, Pill, BookOpen, ArrowRight } from 'lucide-react';
import { signOut, getCurrentUser } from '../../lib/supabase';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface DashboardNewProps {}

function DashboardNew({}: DashboardNewProps) {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { user } = await getCurrentUser();
      setUser(user);
      setLoading(false);
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your main page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#52C878] to-[#4A90E2] text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Bar */}
          <div className="flex justify-between items-center h-14 border-b border-white/20">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">Nutrition One Fitness</h1>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-white/90">
                <User className="w-5 h-5" />
                <span className="font-medium">
                  {user?.user_metadata?.full_name || user?.email || 'User'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>

          {/* Main Navigation - All 7 sections */}
          <div className="flex justify-center items-center h-14 bg-white/5">
            <nav className="flex items-center gap-6">
              <button
                onClick={() => navigate('/profile-assessment')}
                className="flex items-center gap-2 px-3 py-2 font-medium transition-colors duration-200 cursor-pointer text-white/80 hover:text-white hover:bg-white/10 rounded-lg"
              >
                <Target className="w-4 h-4" />
                Profile Assessment
              </button>
              <button
                onClick={() => navigate('/transformation-tracker')}
                className="flex items-center gap-2 px-3 py-2 font-medium transition-colors duration-200 cursor-pointer text-white/80 hover:text-white hover:bg-white/10 rounded-lg"
              >
                <TrendingUp className="w-4 h-4" />
                Transformation Tracker
              </button>
              <button
                onClick={() => navigate('/meal-plan')}
                className="flex items-center gap-2 px-3 py-2 font-medium transition-colors duration-200 cursor-pointer text-white/80 hover:text-white hover:bg-white/10 rounded-lg"
              >
                <Utensils className="w-4 h-4" />
                Meal Plan
              </button>
              <button
                onClick={() => navigate('/fitness')}
                className="flex items-center gap-2 px-3 py-2 font-medium transition-colors duration-200 cursor-pointer text-white/80 hover:text-white hover:bg-white/10 rounded-lg"
              >
                <Activity className="w-4 h-4" />
                Fitness
              </button>
              <button
                onClick={() => navigate('/supplement')}
                className="flex items-center gap-2 px-3 py-2 font-medium transition-colors duration-200 cursor-pointer text-white/80 hover:text-white hover:bg-white/10 rounded-lg"
              >
                <Pill className="w-4 h-4" />
                Supplement
              </button>
              <button
                onClick={() => navigate('/nutritional-protocol')}
                className="flex items-center gap-2 px-3 py-2 font-medium transition-colors duration-200 cursor-pointer text-white/80 hover:text-white hover:bg-white/10 rounded-lg"
              >
                <Pill className="w-4 h-4" />
                Nutritional Protocol
              </button>
              <button
                onClick={() => navigate('/article')}
                className="flex items-center gap-2 px-3 py-2 font-medium transition-colors duration-200 cursor-pointer text-white/80 hover:text-white hover:bg-white/10 rounded-lg"
              >
                <BookOpen className="w-4 h-4" />
                Article
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'there'}! 👋
          </h2>
          <p className="text-gray-600">
            Your personalized wellness journey starts here. Choose from the sections below to begin.
          </p>
        </div>

        {/* Main Page Sections - All 7 sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Profile Assessment Section */}
          <div 
            onClick={() => navigate('/profile-assessment')}
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 cursor-pointer group"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-[#52C878]/10 p-4 rounded-full group-hover:bg-[#52C878]/20 transition-colors">
                <Target className="w-8 h-8 text-[#52C878]" />
              </div>
              <h3 className="text-2xl font-bold text-[#2C3E50]">Profile Assessment</h3>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Complete your personalized health profile to get tailored nutrition and fitness recommendations based on your metabolic type and goals.
            </p>
            <div className="flex items-center text-[#52C878] text-sm font-medium">
              Start Assessment <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>

          {/* Transformation Tracker Section */}
          <div 
            onClick={() => navigate('/transformation-tracker')}
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 cursor-pointer group"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-[#4A90E2]/10 p-4 rounded-full group-hover:bg-[#4A90E2]/20 transition-colors">
                <TrendingUp className="w-8 h-8 text-[#4A90E2]" />
              </div>
              <h3 className="text-2xl font-bold text-[#2C3E50]">Transformation Tracker</h3>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Track your progress with photos, measurements, and milestones. Monitor your transformation journey and celebrate your achievements.
            </p>
            <div className="flex items-center text-[#4A90E2] text-sm font-medium">
              Track Progress <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>

          {/* Meal Plan Section */}
          <div 
            onClick={() => navigate('/meal-plan')}
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 cursor-pointer group"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-[#52C878]/10 p-4 rounded-full group-hover:bg-[#52C878]/20 transition-colors">
                <Utensils className="w-8 h-8 text-[#52C878]" />
              </div>
              <h3 className="text-2xl font-bold text-[#2C3E50]">Meal Plan</h3>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Create personalized meal plans with precise ounce measurements and safety checks. 
              Track your daily nutrition goals with intelligent food recommendations and macro balancing.
            </p>
            <div className="flex items-center text-[#52C878] text-sm font-medium">
              Start Planning <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>

          {/* Fitness Section */}
          <div 
            onClick={() => navigate('/fitness')}
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 cursor-pointer group"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-[#4A90E2]/10 p-4 rounded-full group-hover:bg-[#4A90E2]/20 transition-colors">
                <Activity className="w-8 h-8 text-[#4A90E2]" />
              </div>
              <h3 className="text-2xl font-bold text-[#2C3E50]">Fitness</h3>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Build custom workout routines and track exercise calories. 
              Monitor your fitness progress with personalized exercise recommendations and calorie burn calculations.
            </p>
            <div className="flex items-center text-[#4A90E2] text-sm font-medium">
              Start Workout <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>

          {/* Supplement Section */}
          <div 
            onClick={() => navigate('/supplement')}
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 cursor-pointer group"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-[#52C878]/10 p-4 rounded-full group-hover:bg-[#52C878]/20 transition-colors">
                <Pill className="w-8 h-8 text-[#52C878]" />
              </div>
              <h3 className="text-2xl font-bold text-[#2C3E50]">Supplement</h3>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Get personalized supplement recommendations based on your metabolic profile. 
              Optimize your nutrition with targeted supplements for your health goals.
            </p>
            <div className="flex items-center text-[#52C878] text-sm font-medium">
              View Supplements <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>

          {/* Nutritional Protocol Section */}
          <div 
            onClick={() => navigate('/nutritional-protocol')}
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 cursor-pointer group"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-[#4A90E2]/10 p-4 rounded-full group-hover:bg-[#4A90E2]/20 transition-colors">
                <Pill className="w-8 h-8 text-[#4A90E2]" />
              </div>
              <h3 className="text-2xl font-bold text-[#2C3E50]">Nutritional Protocol</h3>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Access comprehensive nutritional protocols tailored to your metabolic type. 
              Follow evidence-based nutrition strategies for optimal health and performance.
            </p>
            <div className="flex items-center text-[#4A90E2] text-sm font-medium">
              View Protocol <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>

          {/* Article Section */}
          <div 
            onClick={() => navigate('/article')}
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 cursor-pointer group"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-[#52C878]/10 p-4 rounded-full group-hover:bg-[#52C878]/20 transition-colors">
                <BookOpen className="w-8 h-8 text-[#52C878]" />
              </div>
              <h3 className="text-2xl font-bold text-[#2C3E50]">Article</h3>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Discover educational wellness articles and expert insights. 
              Stay informed with the latest nutrition and fitness research to support your health journey.
            </p>
            <div className="flex items-center text-[#52C878] text-sm font-medium">
              Read Articles <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardNew;
