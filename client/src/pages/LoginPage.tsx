import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Dumbbell, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";

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
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Login failed" }));
        throw new Error(errorData.error || "Invalid email or password");
      }

      const data = await response.json();
      
      // Store token in localStorage as backup for cookie auth
      if (data.token) {
        localStorage.setItem("auth_token", data.token);
      }
      
      // Redirect to dashboard
      window.location.href = "/dashboard";
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Invalid email or password");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#52C878]/5 via-[#4A90E2]/5 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center gap-2 text-gray-600 hover:text-[#52C878] transition-colors duration-200 group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
          <span className="font-medium">Back to Home</span>
        </Link>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 space-y-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-gradient-to-r from-[#52C878] to-[#4A90E2] p-4 rounded-full">
              <Dumbbell className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[#2C3E50]">Welcome Back</h1>
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

            <div className="pt-4">
              <button
                type="submit"
                data-testid="button-submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-[#52C878] to-[#4A90E2] hover:from-[#52C878]/90 hover:to-[#4A90E2]/90 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold text-lg rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:transform-none transition-all duration-300 ease-out focus:outline-none focus:ring-4 focus:ring-[#52C878]/30"
              >
                {loading ? "Signing in..." : "Login"}
              </button>
            </div>
          </form>

          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/signup" className="text-[#52C878] hover:text-[#4A90E2] font-semibold transition-colors duration-200">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
