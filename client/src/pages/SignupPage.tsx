import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { ArrowLeft, Eye, EyeOff, AlertCircle, ShieldAlert } from "lucide-react";
import { Link } from "wouter";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [goals, setGoals] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signUp(email, password, fullName);
      await new Promise(resolve => setTimeout(resolve, 100));
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred during signup");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111827] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>

        <div className="mt-6 space-y-2">
          <h1 className="text-4xl font-extrabold text-white">Apply for Access</h1>
          <p className="text-gray-400 text-base leading-relaxed">
            Submit your details and we'll get in touch once your application
            is approved by Nutrition One Fitness.
          </p>
        </div>

        <div className="mt-6 flex items-start gap-3 bg-white/5 border border-gray-700 rounded-xl px-4 py-3" data-testid="banner-invitation-only">
          <ShieldAlert className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-400">
            Signup is by invitation only.{" "}
            <span className="text-gray-300 font-medium">Contact Nutrition One Fitness to request access.</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {error && (
            error.toLowerCase().includes("not on the approved") ? (
              <div className="flex items-start gap-3 bg-amber-900/30 border border-amber-600 rounded-xl p-4" data-testid="error-not-approved">
                <ShieldAlert className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-300">Access Not Approved</p>
                  <p className="text-sm text-amber-200/80 mt-0.5">{error}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 bg-red-900/40 border border-red-700 rounded-xl p-4" data-testid="error-general">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300 font-medium">{error}</p>
              </div>
            )
          )}

          <div className="space-y-2">
            <label htmlFor="fullName" className="block text-sm font-semibold text-gray-200">
              Full name
            </label>
            <input
              type="text"
              id="fullName"
              data-testid="input-fullname"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-4 bg-transparent border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all"
              placeholder="Jane Smith"
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-200">
              Email address
            </label>
            <input
              type="email"
              id="email"
              data-testid="input-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-4 bg-transparent border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all"
              placeholder="jane@example.com"
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-200">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                data-testid="input-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-4 pr-12 bg-transparent border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all"
                placeholder="Create a secure password"
                disabled={loading}
                required
              />
              <button
                type="button"
                data-testid="button-toggle-password"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="goals" className="block text-sm font-semibold text-gray-200">
              Tell us about your health goals{" "}
              <span className="text-gray-500 font-normal">(optional)</span>
            </label>
            <textarea
              id="goals"
              data-testid="input-goals"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              rows={4}
              className="w-full px-4 py-4 bg-transparent border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all resize-none"
              placeholder="What are you hoping to achieve with Nutrition One Fitness?"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            data-testid="button-submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-[#FF6B5B] to-[#FF8C69] hover:from-[#FF5A47] hover:to-[#FF7A55] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none transition-all duration-200"
          >
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-gray-300 hover:text-white font-semibold transition-colors duration-200"
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
