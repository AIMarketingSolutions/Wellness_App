import { useState } from "react";
import { Loader2, CheckCircle, AlertCircle, Database, ShieldAlert } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function AdminSeed() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; details?: any; isAccessDenied?: boolean } | null>(null);

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    setResult(null);

    try {
      const response = await apiRequest("/api/admin/seed-database", {
        method: "POST",
      });

      setResult({
        success: true,
        message: "Database seeded successfully!",
        details: response,
      });
    } catch (error: any) {
      const isAccessDenied = error.message?.includes("Forbidden") || error.message?.includes("Admin access required");
      setResult({
        success: false,
        message: isAccessDenied 
          ? "Access Denied: This page is for administrators only." 
          : error.message || "Failed to seed database",
        isAccessDenied,
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6DD891]/5 via-[#4A90E2]/5 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="backdrop-blur-sm bg-white/90 border border-[#6DD891]/20 rounded-2xl shadow-lg">
          <div className="p-8 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-[#6DD891] to-[#4A90E2] p-3 rounded-lg">
                <Database className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#2C3E50]">
                  Admin Database Seeding
                </h1>
                <p className="text-gray-600 mt-1">
                  Populate your production database with food items, exercise types, and supplements
                </p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <h3 className="font-semibold text-blue-900 mb-3 text-lg">
                What will be seeded:
              </h3>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>30 Food Items (10 carbs, 10 proteins, 10 fats)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>3 Exercise Types (cycling, walking, strength training)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>10 Supplement options</span>
                </li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
              <h3 className="font-semibold text-yellow-900 mb-2 text-lg">
                Note:
              </h3>
              <p className="text-yellow-800">
                This operation is safe to run multiple times. Duplicate items will be automatically skipped.
              </p>
            </div>

            <button
              onClick={handleSeedDatabase}
              disabled={isSeeding}
              className="w-full px-8 py-4 bg-gradient-to-r from-[#6DD891] to-[#4A90E2] hover:from-[#6DD891]/90 hover:to-[#4A90E2]/90 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              data-testid="button-seed-database"
            >
              {isSeeding ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Seeding Database...
                </>
              ) : (
                <>
                  <Database className="h-5 w-5" />
                  Seed Database Now
                </>
              )}
            </button>

            {result && (
              <div
                className={`rounded-xl p-5 border ${
                  result.success
                    ? "border-green-200 bg-green-50"
                    : result.isAccessDenied
                    ? "border-orange-200 bg-orange-50"
                    : "border-red-200 bg-red-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  {result.success ? (
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : result.isAccessDenied ? (
                    <ShieldAlert className="h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div
                    className={result.success ? "text-green-800" : result.isAccessDenied ? "text-orange-800" : "text-red-800"}
                    data-testid="text-seed-result"
                  >
                    <p className="font-semibold text-lg mb-3">{result.message}</p>
                    {result.isAccessDenied && (
                      <p className="text-sm mt-2">
                        This is an administrative tool for populating the production database. Only the site administrator can access this feature.
                      </p>
                    )}
                    {result.details && (
                      <div className="space-y-2 mb-3">
                        <p className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Food Items: {result.details.foodItems}
                        </p>
                        <p className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Exercise Types: {result.details.exerciseTypes}
                        </p>
                        <p className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Supplements: {result.details.supplements}
                        </p>
                      </div>
                    )}
                    {result.success && (
                      <p className="mt-3 text-sm bg-white/50 p-3 rounded-lg">
                        ✅ You can now visit the Daily Meal Calculator to see all the food items!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
