import React from 'react';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Article = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      <header className="bg-gradient-to-r from-[#52C878] to-[#4A90E2] text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/main-page')}
                className="flex items-center gap-2 px-4 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Main Page
              </button>
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">Article</h1>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm p-8">
          <h2 className="text-3xl font-bold text-[#2C3E50] mb-6">Wellness Articles</h2>
          <p className="text-gray-600 mb-6">
            Discover educational wellness articles and expert insights to support your health journey.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-[#52C878]/5 rounded-xl p-6 border border-[#52C878]/10 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-[#2C3E50] mb-3">Understanding Metabolic Types</h3>
              <p className="text-gray-600 text-sm mb-4">
                Learn about Fast, Slow, and Medium Oxidizers and how they affect your nutrition needs.
              </p>
              <div className="text-[#52C878] text-sm font-medium">Read More →</div>
            </div>
            <div className="bg-[#4A90E2]/5 rounded-xl p-6 border border-[#4A90E2]/10 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-[#2C3E50] mb-3">Macronutrient Balance</h3>
              <p className="text-gray-600 text-sm mb-4">
                The science behind protein, carbohydrates, and fats in your daily nutrition.
              </p>
              <div className="text-[#4A90E2] text-sm font-medium">Read More →</div>
            </div>
            <div className="bg-[#52C878]/5 rounded-xl p-6 border border-[#52C878]/10 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-[#2C3E50] mb-3">Exercise & Nutrition</h3>
              <p className="text-gray-600 text-sm mb-4">
                How to fuel your workouts and recover properly with the right nutrition timing.
              </p>
              <div className="text-[#52C878] text-sm font-medium">Read More →</div>
            </div>
            <div className="bg-[#4A90E2]/5 rounded-xl p-6 border border-[#4A90E2]/10 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-[#2C3E50] mb-3">Supplement Guide</h3>
              <p className="text-gray-600 text-sm mb-4">
                Essential supplements for different metabolic types and health goals.
              </p>
              <div className="text-[#4A90E2] text-sm font-medium">Read More →</div>
            </div>
            <div className="bg-[#52C878]/5 rounded-xl p-6 border border-[#52C878]/10 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-[#2C3E50] mb-3">Meal Planning Tips</h3>
              <p className="text-gray-600 text-sm mb-4">
                Practical strategies for planning nutritious meals that fit your lifestyle.
              </p>
              <div className="text-[#52C878] text-sm font-medium">Read More →</div>
            </div>
            <div className="bg-[#4A90E2]/5 rounded-xl p-6 border border-[#4A90E2]/10 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-[#2C3E50] mb-3">Hydration & Health</h3>
              <p className="text-gray-600 text-sm mb-4">
                The importance of proper hydration and its impact on your overall wellness.
              </p>
              <div className="text-[#4A90E2] text-sm font-medium">Read More →</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Article;
