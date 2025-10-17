import React from 'react';
import { ArrowLeft, Pill } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Supplement = () => {
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
                <Pill className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">Supplement</h1>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm p-8">
          <h2 className="text-3xl font-bold text-[#2C3E50] mb-6">Supplement Recommendations</h2>
          <p className="text-gray-600 mb-6">
            Get personalized supplement recommendations based on your metabolic profile and health goals.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#52C878]/5 rounded-xl p-6 border border-[#52C878]/10">
              <h3 className="text-xl font-semibold text-[#2C3E50] mb-3">Metabolic Support</h3>
              <p className="text-gray-600 text-sm mb-4">
                Supplements tailored to your metabolic type (Fast, Slow, or Medium Oxidizer)
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• B-Complex Vitamins</li>
                <li>• Magnesium</li>
                <li>• Chromium</li>
              </ul>
            </div>
            <div className="bg-[#4A90E2]/5 rounded-xl p-6 border border-[#4A90E2]/10">
              <h3 className="text-xl font-semibold text-[#2C3E50] mb-3">Performance Enhancement</h3>
              <p className="text-gray-600 text-sm mb-4">
                Supplements to support your fitness and wellness goals
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Protein Powders</li>
                <li>• Omega-3 Fatty Acids</li>
                <li>• Vitamin D3</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Supplement;
