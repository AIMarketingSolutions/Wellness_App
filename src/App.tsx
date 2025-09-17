import React from 'react';
import { Dumbbell, Heart, Target } from 'lucide-react';

function App() {
  return (
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
            Transform your health journey with personalized nutrition and fitness solutions designed for lasting results.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center max-w-lg mx-auto">
          <button className="w-full sm:w-auto px-12 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-lg rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-out focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50">
            Login
          </button>
          
          <button className="w-full sm:w-auto px-12 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold text-lg rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-out focus:outline-none focus:ring-4 focus:ring-emerald-300 focus:ring-opacity-50">
            Signup
          </button>
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
              Customized nutrition and fitness programs tailored to your unique goals and lifestyle.
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
              Work with certified nutritionists and fitness professionals to achieve optimal results.
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
              Join thousands of satisfied clients who have transformed their health and fitness.
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
  );
}

export default App;