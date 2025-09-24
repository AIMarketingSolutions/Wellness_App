import React, { useState, useEffect } from 'react';
import { User, LogOut, Dumbbell, Target, TrendingUp, Calendar, Settings, Home, Utensils, Activity, Pill, Droplets, BookOpen } from 'lucide-react';
import { signOut, getCurrentUser } from '../lib/supabase';
import WellnessCalculator from './WellnessCalculator';

interface DashboardProps {
  onLogout: () => void;
}

function Dashboard({ onLogout }: DashboardProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'dashboard' | 'meal-plan' | 'fitness' | 'supplements' | 'water' | 'blog' | 'profile-assessment' | 'transformation-tracker' | 'calculator'>('dashboard');

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
    onLogout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      {/* Enhanced Header with Green Theme */}
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

          {/* Secondary Navigation Bar */}
          <div className="flex justify-between items-center h-12 bg-white/10">
            <div className="flex items-center gap-8">
              <button
                onClick={() => setActiveView('profile-assessment')}
                className={`px-4 py-2 font-medium transition-colors duration-200 ${
                  activeView === 'profile-assessment'
                    ? 'text-white bg-white/20 rounded-lg'
                    : 'text-white/80 hover:text-white hover:bg-white/10 rounded-lg'
                }`}
              >
                Profile Assessment
              </button>
              <button
                onClick={() => setActiveView('transformation-tracker')}
                className={`px-4 py-2 font-medium transition-colors duration-200 ${
                  activeView === 'transformation-tracker'
                    ? 'text-white bg-white/20 rounded-lg'
                    : 'text-white/80 hover:text-white hover:bg-white/10 rounded-lg'
                }`}
              >
                Transformation Tracker
              </button>
            </div>
            <div className="text-white font-semibold">
              Total Daily Calories: {user ? '2,150' : '---'}
            </div>
          </div>

          {/* Main Navigation */}
          <div className="flex justify-center items-center h-14 bg-white/5">
            <nav className="flex items-center gap-12">
              <button
                onClick={() => setActiveView('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors duration-200 ${
                  activeView === 'dashboard'
                    ? 'text-white bg-white/20 rounded-lg'
                    : 'text-white/80 hover:text-white hover:bg-white/10 rounded-lg'
                }`}
              >
                <Home className="w-4 h-4" />
                Dashboard
              </button>
              <button
                onClick={() => setActiveView('meal-plan')}
                className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors duration-200 ${
                  activeView === 'meal-plan'
                    ? 'text-white bg-white/20 rounded-lg'
                    : 'text-white/80 hover:text-white hover:bg-white/10 rounded-lg'
                }`}
              >
                <Utensils className="w-4 h-4" />
                Meal Plan
              </button>
              <button
                onClick={() => setActiveView('fitness')}
                className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors duration-200 ${
                  activeView === 'fitness'
                    ? 'text-white bg-white/20 rounded-lg'
                    : 'text-white/80 hover:text-white hover:bg-white/10 rounded-lg'
                }`}
              >
                <Activity className="w-4 h-4" />
                Fitness
              </button>
              <button
                onClick={() => setActiveView('supplements')}
                className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors duration-200 ${
                  activeView === 'supplements'
                    ? 'text-white bg-white/20 rounded-lg'
                    : 'text-white/80 hover:text-white hover:bg-white/10 rounded-lg'
                }`}
              >
                <Pill className="w-4 h-4" />
                Supplements
              </button>
              <button
                onClick={() => setActiveView('water')}
                className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors duration-200 ${
                  activeView === 'water'
                    ? 'text-white bg-white/20 rounded-lg'
                    : 'text-white/80 hover:text-white hover:bg-white/10 rounded-lg'
                }`}
              >
                <Droplets className="w-4 h-4" />
                Water
              </button>
              <button
                onClick={() => setActiveView('blog')}
                className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors duration-200 ${
                  activeView === 'blog'
                    ? 'text-white bg-white/20 rounded-lg'
                    : 'text-white/80 hover:text-white hover:bg-white/10 rounded-lg'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Blog
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Conditional Content */}
      {activeView === 'calculator' || activeView === 'profile-assessment' ? (
        <main className="py-8">
          <WellnessCalculator />
        </main>
      ) : activeView === 'transformation-tracker' ? (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Transformation Tracker</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* TEE Display - No Formula */}
              <div className="bg-gradient-to-br from-[#52C878]/10 to-[#4A90E2]/10 p-6 rounded-2xl border border-[#52C878]/20">
                <h3 className="text-xl font-semibold text-[#2C3E50] mb-4">Total Energy Expenditure</h3>
                <div className="text-center">
                  <p className="text-4xl font-bold text-[#52C878] mb-2">2,150</p>
                  <p className="text-[#2C3E50] font-medium">calories per day</p>
                  <p className="text-sm text-gray-600 mt-2">Based on your activity level and metabolism</p>
                </div>
              </div>
              
              {/* Body Fat Percentage - No Formula */}
              <div className="bg-gradient-to-br from-[#4A90E2]/10 to-[#52C878]/10 p-6 rounded-2xl border border-[#4A90E2]/20">
                <h3 className="text-xl font-semibold text-[#2C3E50] mb-4">Body Fat Percentage</h3>
                <div className="text-center">
                  <p className="text-4xl font-bold text-[#4A90E2] mb-2">18.5%</p>
                  <p className="text-[#2C3E50] font-medium">estimated body fat</p>
                  <p className="text-sm text-gray-600 mt-2">Within healthy range for your profile</p>
                </div>
              </div>
            </div>
            
            {/* Progress Charts Placeholder */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white/80 p-6 rounded-2xl border border-gray-100">
                <h4 className="text-lg font-semibold text-[#2C3E50] mb-4">Weight Progress</h4>
                <div className="h-48 bg-[#F8F9FA] rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Progress chart coming soon</p>
                </div>
              </div>
              <div className="bg-white/80 p-6 rounded-2xl border border-gray-100">
                <h4 className="text-lg font-semibold text-[#2C3E50] mb-4">Body Composition</h4>
                <div className="h-48 bg-[#F8F9FA] rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Composition chart coming soon</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      ) : activeView === 'meal-plan' ? (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm p-8">
            <h2 className="text-3xl font-bold text-[#2C3E50] mb-6">Meal Planning</h2>
            <p className="text-gray-600">Comprehensive meal planning functionality will be available here.</p>
          </div>
        </main>
      ) : activeView === 'fitness' ? (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm p-8">
            <h2 className="text-3xl font-bold text-[#2C3E50] mb-6">Fitness Programs</h2>
            <p className="text-gray-600">Personalized fitness programs and workout tracking will be available here.</p>
          </div>
        </main>
      ) : activeView === 'supplements' ? (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm p-8">
            <h2 className="text-3xl font-bold text-[#2C3E50] mb-6">Supplement Recommendations</h2>
            <p className="text-gray-600">Personalized supplement recommendations based on your profile will be available here.</p>
          </div>
        </main>
      ) : activeView === 'water' ? (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm p-8">
            <h2 className="text-3xl font-bold text-[#2C3E50] mb-6">Water Intake Tracking</h2>
            <p className="text-gray-600">Daily water intake tracking and hydration goals will be available here.</p>
          </div>
        </main>
      ) : activeView === 'blog' ? (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm p-8">
            <h2 className="text-3xl font-bold text-[#2C3E50] mb-6">Wellness Blog</h2>
            <p className="text-gray-600">Educational content, tips, and wellness articles will be available here.</p>
          </div>
        </main>
      ) : (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Content */}
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'there'}! 👋
          </h2>
          <p className="text-gray-600">
            Ready to continue your fitness journey? Here's your personalized dashboard.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-[#52C878]/10 p-3 rounded-full">
                <Target className="w-6 h-6 text-[#52C878]" />
              </div>
              <span className="text-2xl font-bold text-[#2C3E50]">12</span>
            </div>
            <h3 className="font-semibold text-[#2C3E50] mb-1">Goals Completed</h3>
            <p className="text-sm text-gray-600">This month</p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-[#4A90E2]/10 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-[#4A90E2]" />
              </div>
              <span className="text-2xl font-bold text-[#2C3E50]">85%</span>
            </div>
            <h3 className="font-semibold text-[#2C3E50] mb-1">Progress Rate</h3>
            <p className="text-sm text-gray-600">Overall improvement</p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-r from-[#52C878]/10 to-[#4A90E2]/10 p-3 rounded-full">
                <Dumbbell className="w-6 h-6 text-[#52C878]" />
              </div>
              <span className="text-2xl font-bold text-[#2C3E50]">24</span>
            </div>
            <h3 className="font-semibold text-[#2C3E50] mb-1">Workouts</h3>
            <p className="text-sm text-gray-600">This month</p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-[#4A90E2]/10 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-[#4A90E2]" />
              </div>
              <span className="text-2xl font-bold text-[#2C3E50]">7</span>
            </div>
            <h3 className="font-semibold text-[#2C3E50] mb-1">Streak Days</h3>
            <p className="text-sm text-gray-600">Current streak</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's Plan */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-[#2C3E50] mb-4">Today's Plan</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-[#52C878]/5 rounded-xl border border-[#52C878]/10">
                <div className="bg-[#52C878] p-2 rounded-lg">
                  <Dumbbell className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-[#2C3E50]">Upper Body Workout</h4>
                  <p className="text-sm text-gray-600">45 minutes • 3:00 PM</p>
                </div>
                <button className="px-4 py-2 bg-[#52C878] text-white rounded-lg hover:bg-[#52C878]/90 transition-colors duration-200">
                  Start
                </button>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-[#4A90E2]/5 rounded-xl border border-[#4A90E2]/10">
                <div className="bg-[#4A90E2] p-2 rounded-lg">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-[#2C3E50]">Nutrition Check-in</h4>
                  <p className="text-sm text-gray-600">Log your meals</p>
                </div>
                <button className="px-4 py-2 bg-[#4A90E2] text-white rounded-lg hover:bg-[#4A90E2]/90 transition-colors duration-200">
                  Log
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-[#2C3E50] mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 border-l-4 border-[#52C878] bg-[#F8F9FA] rounded-r-lg">
                <div className="text-sm">
                  <p className="font-medium text-[#2C3E50]">Completed leg day workout</p>
                  <p className="text-gray-600">Yesterday, 6:30 PM</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-3 border-l-4 border-[#4A90E2] bg-[#F8F9FA] rounded-r-lg">
                <div className="text-sm">
                  <p className="font-medium text-[#2C3E50]">Logged daily nutrition</p>
                  <p className="text-gray-600">Yesterday, 8:00 PM</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-3 border-l-4 border-[#52C878] bg-[#F8F9FA] rounded-r-lg">
                <div className="text-sm">
                  <p className="font-medium text-[#2C3E50]">Reached weekly goal</p>
                  <p className="text-gray-600">2 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      )}
    </div>
  );
}

export default Dashboard;