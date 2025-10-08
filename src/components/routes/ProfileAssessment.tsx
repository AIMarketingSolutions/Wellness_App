import React from 'react';
import { ArrowLeft, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WellnessCalculator from '../WellnessCalculator';

const ProfileAssessment = () => {
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
                <Target className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">Profile Assessment</h1>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WellnessCalculator />
      </main>
    </div>
  );
};

export default ProfileAssessment;
