import { Link } from "wouter";
import { Check, Target } from "lucide-react";
import logoImage from "@assets/Nutrition_One_Fitness_1772220291190.png";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#EEF5F3] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto text-center space-y-12">
        {/* Header Section */}
        <div className="space-y-6">
          <div className="flex justify-center mb-6">
            <img 
              src={logoImage} 
              alt="Nutrition One Fitness" 
              className="w-36 h-36 object-contain"
            />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold text-[#2C3E50] leading-tight tracking-tight">
            Welcome to
            <span className="block bg-gradient-to-r from-[#6DD891] to-[#4A90E2] bg-clip-text text-transparent font-black">
              Nutrition One Fitness Inc.
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 font-semibold max-w-xl mx-auto leading-relaxed">
            Transform Your Health from the Inside Out
          </p>

          <p className="text-lg text-gray-600 max-w-xl mx-auto leading-relaxed">
            True wellness isn't just about losing weight; it's about healing your body at the root. At Nutrition One Fitness, we help you restore balance through science-backed wellness protocols, personalized nutrition, and targeted fitness coaching that address the real issues holding you back.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center max-w-lg mx-auto">
          <Link 
            to="/login"
            className="w-full sm:w-auto px-12 py-4 bg-gradient-to-r from-[#6DD891] to-[#4A90E2] hover:from-[#6DD891]/90 hover:to-[#4A90E2]/90 text-white font-semibold text-lg rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-out focus:outline-none focus:ring-4 focus:ring-[#6DD891]/30 focus:ring-opacity-50"
            data-testid="button-login"
          >
            Login
          </Link>
          
          <Link 
            to="/signup"
            className="w-full sm:w-auto px-12 py-4 bg-gradient-to-r from-[#4A90E2] to-[#6DD891] hover:from-[#4A90E2]/90 hover:to-[#6DD891]/90 text-white font-semibold text-lg rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-out focus:outline-none focus:ring-4 focus:ring-[#4A90E2]/30 focus:ring-opacity-50"
            data-testid="button-signup"
          >
            Signup
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-12 max-w-4xl mx-auto">
          <div className="text-left space-y-3 p-6 bg-white/50 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-start gap-4">
              <div className="bg-gradient-to-r from-[#6DD891] to-[#4A90E2] p-2 rounded-lg flex-shrink-0">
                <Check className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#2C3E50] mb-2">Expert Guidance</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Partner with a Registered Nutritional Consulting Practitioner (RNCP) and certified fitness professionals who understand how to help your body function at its best naturally and sustainably.
                </p>
              </div>
            </div>
          </div>

          <div className="text-left space-y-3 p-6 bg-white/50 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-start gap-4">
              <div className="bg-gradient-to-r from-[#6DD891] to-[#4A90E2] p-2 rounded-lg flex-shrink-0">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#2C3E50] mb-2">Nutritional Consulting</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Fatigue, brain fog, stubborn weight, and low energy aren't "just aging." They're signals that your body needs support. Our step-by-step protocols help you eliminate parasites, strengthen your adrenal system, repair leaky gut, and rebalance your metabolism, creating the conditions for effortless weight loss and long-term vitality.
                </p>
              </div>
            </div>
          </div>

          <div className="text-left space-y-3 p-6 bg-white/50 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-start gap-4">
              <div className="bg-gradient-to-r from-[#6DD891] to-[#4A90E2] p-2 rounded-lg flex-shrink-0">
                <Check className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#2C3E50] mb-2">Personalized Plans</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  No cookie-cutter diets. Every plan is designed around your goals, lifestyle, metabolic profile, and health needs, giving you a structure you can follow and the flexibility to make it work.
                </p>
              </div>
            </div>
          </div>

          <div className="text-left space-y-3 p-6 bg-white/50 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-start gap-4">
              <div className="bg-gradient-to-r from-[#6DD891] to-[#4A90E2] p-2 rounded-lg flex-shrink-0">
                <Check className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#2C3E50] mb-2">Proven Results</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Join thousands who've reclaimed their energy, confidence, and health. Experience a fundamental transformation through protocols engineered for lasting success, not temporary fixes.
                </p>
              </div>
            </div>
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
