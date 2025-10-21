import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { Dumbbell, LogOut, User, Target, TrendingUp, Activity, Pill, BookOpen, Apple } from "lucide-react";

export default function Dashboard() {
  const { user, signOut } = useAuth();

  const features = [
    {
      id: "profile",
      name: "Profile Assessment",
      description: "Complete your health profile & metabolic assessment",
      icon: Target,
      color: "from-[#52C878] to-[#4A90E2]",
      bgColor: "bg-[#52C878]/10",
      href: "/profile-assessment"
    },
    {
      id: "tracker",
      name: "Transformation Tracker",
      description: "Track your body composition & progress over time",
      icon: TrendingUp,
      color: "from-[#4A90E2] to-[#52C878]",
      bgColor: "bg-[#4A90E2]/10",
      href: "/transformation-tracker"
    },
    {
      id: "meal-planner",
      name: "Daily Meal Calculator",
      description: "Track daily meals, macros, water & hit your targets",
      icon: Apple,
      color: "from-[#52C878] to-[#4A90E2]",
      bgColor: "bg-[#52C878]/10",
      href: "/meal-planner"
    },
    {
      id: "fitness",
      name: "Fitness System",
      description: "Custom workout plans & exercise tracking",
      icon: Activity,
      color: "from-[#4A90E2] to-[#52C878]",
      bgColor: "bg-[#4A90E2]/10",
      href: "/fitness"
    },
    {
      id: "supplements",
      name: "Supplement Guide",
      description: "Personalized supplement recommendations",
      icon: Pill,
      color: "from-[#52C878] to-[#4A90E2]",
      bgColor: "bg-[#52C878]/10",
      href: "/supplement"
    },
    {
      id: "protocol",
      name: "Nutritional Protocol",
      description: "Evidence-based nutrition strategies",
      icon: BookOpen,
      color: "from-[#4A90E2] to-[#52C878]",
      bgColor: "bg-[#4A90E2]/10",
      href: "/nutritional-protocol"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#52C878]/5 via-[#4A90E2]/5 to-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#52C878] to-[#4A90E2] text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">Nutrition One Fitness</h1>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-white/90">
                <User className="w-5 h-5" />
                <span className="font-medium" data-testid="text-username">
                  {user?.fullName || user?.email || 'User'}
                </span>
              </div>
              <button
                onClick={() => signOut()}
                data-testid="button-signout"
                className="flex items-center gap-2 px-4 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-[#2C3E50] mb-3">
            Welcome Back, {user?.fullName?.split(' ')[0] || 'Friend'}!
          </h2>
          <p className="text-lg text-gray-600">
            Ready to continue your wellness journey? Choose from the tools below to track your progress and reach your goals.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature) => (
            <Link
              key={feature.id}
              href={feature.href}
              className="group"
              data-testid={`card-${feature.id}`}
            >
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#52C878]/30 h-full flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className={`${feature.bgColor} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-6 h-6 text-[#52C878]" />
                  </div>
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${feature.color} opacity-20 group-hover:opacity-40 transition-opacity duration-300`} />
                </div>
                
                <h3 className="text-xl font-bold text-[#2C3E50] mb-2 group-hover:text-[#52C878] transition-colors duration-300">
                  {feature.name}
                </h3>
                
                <p className="text-gray-600 text-sm flex-grow">
                  {feature.description}
                </p>
                
                <div className="mt-4 flex items-center text-[#52C878] font-medium text-sm group-hover:translate-x-2 transition-transform duration-300">
                  Get Started →
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Stats / Info Section */}
        <div className="bg-gradient-to-r from-[#52C878] to-[#4A90E2] rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold">Your Wellness Toolkit</h3>
          </div>
          <p className="text-white/90 text-lg mb-6">
            You now have access to a comprehensive suite of tools designed by nutrition and fitness professionals. 
            Start by completing your Profile Assessment to get personalized recommendations.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-3xl font-bold mb-1">{features.length}</p>
              <p className="text-white/80 text-sm">Wellness Tools</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-3xl font-bold mb-1">24/7</p>
              <p className="text-white/80 text-sm">Access Anytime</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-3xl font-bold mb-1">100%</p>
              <p className="text-white/80 text-sm">Personalized</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-gray-200">
        <div className="text-center text-gray-600 text-sm">
          <p>© 2025 Nutrition One Fitness Inc. All rights reserved.</p>
          <p className="mt-2">Powered by expert nutrition and fitness guidance</p>
        </div>
      </footer>
    </div>
  );
}
