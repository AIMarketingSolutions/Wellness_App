import React, { useState, useEffect } from 'react';
import { User, LogOut, Dumbbell, Target, TrendingUp, Calendar, Settings } from 'lucide-react';
import { signOut, getCurrentUser } from '../lib/supabase';

interface DashboardProps {
  onLogout: () => void;
}

function Dashboard({ onLogout }: DashboardProps) {
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
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-emerald-600 p-2 rounded-lg">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-800">Nutrition One Fitness</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-700">
                <User className="w-5 h-5" />
                <span className="font-medium">
                  {user?.user_metadata?.full_name || user?.email || 'User'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
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
            Ready to continue your fitness journey? Here's your personalized dashboard.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-gray-800">12</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Goals Completed</h3>
            <p className="text-sm text-gray-600">This month</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-emerald-100 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
              <span className="text-2xl font-bold text-gray-800">85%</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Progress Rate</h3>
            <p className="text-sm text-gray-600">Overall improvement</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <Dumbbell className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-gray-800">24</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Workouts</h3>
            <p className="text-sm text-gray-600">This month</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-100 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-2xl font-bold text-gray-800">7</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Streak Days</h3>
            <p className="text-sm text-gray-600">Current streak</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's Plan */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Today's Plan</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Dumbbell className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">Upper Body Workout</h4>
                  <p className="text-sm text-gray-600">45 minutes • 3:00 PM</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                  Start
                </button>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl">
                <div className="bg-emerald-600 p-2 rounded-lg">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">Nutrition Check-in</h4>
                  <p className="text-sm text-gray-600">Log your meals</p>
                </div>
                <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200">
                  Log
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 border-l-4 border-blue-500 bg-gray-50 rounded-r-lg">
                <div className="text-sm">
                  <p className="font-medium text-gray-800">Completed leg day workout</p>
                  <p className="text-gray-600">Yesterday, 6:30 PM</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-3 border-l-4 border-emerald-500 bg-gray-50 rounded-r-lg">
                <div className="text-sm">
                  <p className="font-medium text-gray-800">Logged daily nutrition</p>
                  <p className="text-gray-600">Yesterday, 8:00 PM</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-3 border-l-4 border-purple-500 bg-gray-50 rounded-r-lg">
                <div className="text-sm">
                  <p className="font-medium text-gray-800">Reached weekly goal</p>
                  <p className="text-gray-600">2 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;