import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { ArrowLeft, Check } from "lucide-react";
import { Link, useLocation } from "wouter";
import logoImage from "@assets/2022_Nutrition One Fitness _1763752383427.png";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
      setLocation("/dashboard");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Invalid email or password");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#52C878]/5 via-[#4A90E2]/5 to-white">
      <div className="container mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-[#52C878] transition-colors duration-200 group mb-8">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
          <span className="font-medium">Back to Home</span>
        </Link>

        <div className="grid lg:grid-cols-2 gap-12 items-start max-w-7xl mx-auto">
          <div className="space-y-8">
            <div className="flex flex-col items-center lg:items-start space-y-6">
              <img 
                src={logoImage} 
                alt="Nutrition One Fitness" 
                className="w-32 h-32 object-contain"
                style={{
                  filter: 'hue-rotate(130deg) saturate(1.2) brightness(0.9)'
                }}
              />
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-[#2C3E50] leading-tight mb-4">
                  Welcome to
                  <span className="block bg-gradient-to-r from-[#52C878] to-[#4A90E2] bg-clip-text text-transparent">
                    Nutrition One Fitness Inc.
                  </span>
                </h1>
                <p className="text-xl text-gray-700 font-semibold mb-6">
                  Transform Your Health from the Inside Out
                </p>
                <p className="text-gray-600 leading-relaxed">
                  True wellness isn't just about losing weight; it's about healing your body at the root. At Nutrition One Fitness, we help you restore balance through science-backed wellness protocols, personalized nutrition, and targeted fitness coaching that address the real issues holding you back.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="bg-gradient-to-r from-[#52C878] to-[#4A90E2] p-3 rounded-xl flex-shrink-0">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#2C3E50] mb-2">Expert Guidance</h3>
                    <p className="text-gray-600">
                      Partner with a Registered Nutritional Consulting Practitioner (RNCP) and certified fitness professionals who understand how to help your body function at its best naturally and sustainably.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="bg-gradient-to-r from-[#52C878] to-[#4A90E2] p-3 rounded-xl flex-shrink-0">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#2C3E50] mb-2">Nutritional Consulting</h3>
                    <p className="text-gray-600">
                      Fatigue, brain fog, stubborn weight, and low energy aren't "just aging." They're signals that your body needs support. Our step-by-step protocols help you eliminate parasites, strengthen your adrenal system, repair leaky gut, and rebalance your metabolism, creating the conditions for effortless weight loss and long-term vitality.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="bg-gradient-to-r from-[#52C878] to-[#4A90E2] p-3 rounded-xl flex-shrink-0">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#2C3E50] mb-2">Personalized Plans</h3>
                    <p className="text-gray-600">
                      No cookie-cutter diets. Every plan is designed around your goals, lifestyle, metabolic profile, and health needs, giving you a structure you can follow and the flexibility to make it work.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="bg-gradient-to-r from-[#52C878] to-[#4A90E2] p-3 rounded-xl flex-shrink-0">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#2C3E50] mb-2">Proven Results</h3>
                    <p className="text-gray-600">
                      Join thousands who've reclaimed their energy, confidence, and health. Experience a fundamental transformation through protocols engineered for lasting success, not temporary fixes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 space-y-8">
              <div className="flex flex-col items-center space-y-4">
                <h2 className="text-3xl font-bold text-[#2C3E50]">Sign In</h2>
                <p className="text-gray-600 text-center">
                  Continue your wellness journey
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-[#2C3E50] mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    data-testid="input-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#52C878]/20 focus:border-[#52C878] transition-all duration-200 text-gray-800 placeholder-gray-400 bg-white/50 backdrop-blur-sm"
                    placeholder="Enter your email address"
                    disabled={loading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-[#2C3E50] mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    data-testid="input-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#52C878]/20 focus:border-[#52C878] transition-all duration-200 text-gray-800 placeholder-gray-400 bg-white/50 backdrop-blur-sm"
                    placeholder="Enter your password"
                    disabled={loading}
                    required
                  />
                </div>

                <button
                  type="submit"
                  data-testid="button-login"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-[#52C878] to-[#4A90E2] text-white font-bold rounded-2xl hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? "Signing in..." : "Login"}
                </button>
              </form>

              <div className="text-center">
                <p className="text-gray-600">
                  Don't have an account?{" "}
                  <Link href="/signup" className="text-[#52C878] font-semibold hover:text-[#4A90E2] transition-colors">
                    Sign up here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
