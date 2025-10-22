import { useState, useMemo, useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, Activity, Plus, Dumbbell, Timer, Flame } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface ExerciseType {
  id: string;
  name: string;
  category: string;
  caloriesPerMinute: string;
  description: string | null;
}

interface DailyExercise {
  id: string;
  userId: string;
  exerciseTypeId: string;
  exerciseDate: string;
  durationMinutes: number;
  caloriesBurned: string;
  isCompleted: boolean;
}

const DURATION_OPTIONS = [60, 40, 30, 20];

export default function Fitness() {
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<number>(0);

  // Fetch exercise types
  const { data: exerciseTypes = [] } = useQuery<ExerciseType[]>({
    queryKey: ["/api/exercise-types"],
  });

  // Fetch today's exercise
  const { data: todayExercise } = useQuery<DailyExercise | null>({
    queryKey: ["/api/daily-exercise/today"],
  });

  // Set selected exercise from today's exercise
  useEffect(() => {
    if (todayExercise) {
      setSelectedExerciseId(todayExercise.exerciseTypeId);
      setSelectedDuration(todayExercise.durationMinutes);
    }
  }, [todayExercise]);

  // Calculate calories burned from exercise
  const exerciseCalories = useMemo(() => {
    if (!selectedExerciseId || !selectedDuration) return 0;
    const exercise = exerciseTypes.find(e => e.id === selectedExerciseId);
    if (!exercise) return 0;
    const caloriesPerMin = parseFloat(exercise.caloriesPerMinute);
    return Math.round(caloriesPerMin * selectedDuration);
  }, [selectedExerciseId, selectedDuration, exerciseTypes]);

  // Save exercise mutation
  const saveExerciseMutation = useMutation({
    mutationFn: async (data: { exerciseTypeId: string; durationMinutes: number; caloriesBurned: number }) => {
      return await apiRequest("/api/daily-exercise", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily-exercise/today"] });
    },
  });

  // Handle workout selection save
  const handleWorkoutSave = () => {
    if (!selectedExerciseId || !selectedDuration) {
      alert('Please select an exercise type and duration');
      return;
    }
    saveExerciseMutation.mutate({
      exerciseTypeId: selectedExerciseId,
      durationMinutes: selectedDuration,
      caloriesBurned: exerciseCalories,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#52C878]/5 via-[#4A90E2]/5 to-white">
      <header className="bg-gradient-to-r from-[#4A90E2] to-[#52C878] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-white/90 hover:text-white transition-colors group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-[#4A90E2] to-[#52C878] p-4 rounded-full">
              <Activity className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-[#2C3E50] mb-3">Fitness System</h1>
          <p className="text-lg text-gray-600">
            Custom workout plans and exercise tracking for optimal results
          </p>
        </div>

        {/* Daily Fitness Routine Section */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Dumbbell className="w-6 h-6 text-[#52C878]" />
            <h2 className="text-2xl font-bold text-[#2C3E50]">Daily Fitness Routine</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Exercise Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Exercise Type
              </label>
              <select
                value={selectedExerciseId}
                onChange={(e) => setSelectedExerciseId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#52C878] focus:border-transparent transition-all"
                data-testid="select-exercise-type"
              >
                <option value="">Select exercise</option>
                {exerciseTypes.map((exercise) => (
                  <option key={exercise.id} value={exercise.id}>
                    {exercise.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Duration (minutes)
              </label>
              <div className="flex gap-2">
                {DURATION_OPTIONS.map((duration) => (
                  <button
                    key={duration}
                    onClick={() => setSelectedDuration(duration)}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                      selectedDuration === duration
                        ? 'bg-gradient-to-r from-[#4A90E2] to-[#52C878] text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    data-testid={`button-duration-${duration}`}
                  >
                    {duration}
                  </button>
                ))}
              </div>
            </div>

            {/* Calories Burned */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Calories Burned
              </label>
              <div className="bg-gradient-to-br from-[#52C878]/10 to-[#4A90E2]/10 rounded-lg p-4 border-2 border-[#52C878]/30">
                <p className="text-4xl font-bold text-[#52C878] text-center" data-testid="text-calories-burned">
                  {exerciseCalories}
                </p>
                <p className="text-sm text-gray-600 text-center mt-1">cal</p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-6">
            <button
              onClick={handleWorkoutSave}
              disabled={saveExerciseMutation.isPending}
              className="w-full px-8 py-4 bg-gradient-to-r from-[#4A90E2] to-[#52C878] hover:from-[#4A90E2]/90 hover:to-[#52C878]/90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              data-testid="button-save-workout"
            >
              {saveExerciseMutation.isPending ? 'Saving...' : 'Save Workout'}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { name: "Workouts This Week", value: "--", icon: Dumbbell, color: "bg-[#4A90E2]/10", textColor: "text-[#4A90E2]" },
            { name: "Total Time", value: "-- min", icon: Timer, color: "bg-[#52C878]/10", textColor: "text-[#52C878]" },
            { name: "Calories Burned", value: "--", icon: Flame, color: "bg-[#4A90E2]/10", textColor: "text-[#4A90E2]" },
          ].map((stat) => (
            <div key={stat.name} className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className={`${stat.color} p-3 rounded-xl inline-block mb-4`}>
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.name}</h3>
              <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Empty State */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-[#4A90E2]/10 p-6 rounded-full">
              <Dumbbell className="w-12 h-12 text-[#4A90E2]" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-[#2C3E50] mb-3">Start Your Fitness Journey</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Track your workouts, monitor your progress, and achieve your fitness goals. 
            Log your first workout to get started!
          </p>
        </div>
      </main>
    </div>
  );
}
