import { useAuth } from "@/lib/auth";
import { Dumbbell } from "lucide-react";

export default function Dashboard() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-emerald-600 p-3 rounded-full">
                <Dumbbell className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Wellness Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user?.fullName || user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              data-testid="button-signout"
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Sign Out
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl" data-testid="card-profile">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Profile Assessment</h3>
              <p className="text-blue-600 text-sm">Complete your health profile</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl" data-testid="card-meals">
              <h3 className="text-lg font-semibold text-emerald-800 mb-2">Meal Planning</h3>
              <p className="text-emerald-600 text-sm">Customize your nutrition</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl" data-testid="card-fitness">
              <h3 className="text-lg font-semibold text-purple-800 mb-2">Fitness System</h3>
              <p className="text-purple-600 text-sm">Track your workouts</p>
            </div>
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-xl text-white">
            <h2 className="text-2xl font-bold mb-2">Your Wellness Journey Starts Here</h2>
            <p className="text-blue-50">
              The migration from Bolt to Replit is complete! Your wellness app is now running on a full-stack
              Node.js server with PostgreSQL database, authentication, and all the necessary infrastructure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
