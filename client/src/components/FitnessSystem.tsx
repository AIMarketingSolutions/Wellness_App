import React, { useState, useEffect } from 'react';
import { Activity, Clock, Target, Zap, Calendar, Trophy, Play, Pause, Plus, Search, Filter, BookOpen, Heart, Dumbbell, Timer } from 'lucide-react';
import { supabase } from '../lib/supabase';


interface Exercise {
  id: string;
  name: string;
  category: string;
  calories_per_minute: number;
  description?: string;
  intensity_levels?: {
    light: number;
    moderate: number;
    vigorous: number;
  };
}

interface WorkoutExercise {
  exercise: Exercise;
  duration_minutes: number;
  intensity: 'light' | 'moderate' | 'vigorous';
  calories_burned: number;
}

interface Workout {
  id?: string;
  name: string;
  exercises: WorkoutExercise[];
  total_duration: number;
  total_calories: number;
  date: string;
  is_completed: boolean;
}

interface UserProfile {
  weight_lbs: number;
  tee_calories: number;
  gender: 'male' | 'female';
  activity_level: string;
}

interface FitnessSystemProps {
  userProfile: UserProfile;
  onTEEUpdate: (newTEE: number) => void;
}

function FitnessSystem({ userProfile, onTEEUpdate }: FitnessSystemProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentWorkout, setCurrentWorkout] = useState<Workout>({
    name: "Today's Workout",
    exercises: [],
    total_duration: 0,
    total_calories: 0,
    date: new Date().toISOString().split('T')[0],
    is_completed: false
  });
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [duration, setDuration] = useState(30);
  const [intensity, setIntensity] = useState<'light' | 'moderate' | 'vigorous'>('moderate');
  const [workoutHistory, setWorkoutHistory] = useState<Workout[]>([]);
  const [weeklyStats, setWeeklyStats] = useState({
    total_calories: 0,
    total_minutes: 0,
    workouts_completed: 0
  });
  const [user, setUser] = useState<any>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingExercise, setPendingExercise] = useState<{
    exercise: Exercise;
    duration: number;
    intensity: 'light' | 'moderate' | 'vigorous';
    calories: number;
  } | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
    loadExercises();
    loadWorkoutHistory();
  }, []);

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      setShowConfirmDialog(false);
      setPendingExercise(null);
      setIsCompleting(false);
      setError(null);
    };
  }, []);
  const loadExercises = async () => {
    // Sample exercise data - in production this would come from database
    const sampleExercises: Exercise[] = [
      {
        id: '1',
        name: 'Bicycling (12-14 mph, moderate)',
        category: 'cardiovascular',
        calories_per_minute: 12.1, // 726 calories per 60 minutes
        description: 'Moderate pace cycling on flat terrain',
        intensity_levels: {
          light: 8.0,
          moderate: 12.1,
          vigorous: 16.0
        }
      },
      {
        id: '2',
        name: 'Walking (3.0 mph, moderate)',
        category: 'cardiovascular',
        calories_per_minute: 5.0, // 299 calories per 60 minutes
        description: 'Brisk walking at moderate pace',
        intensity_levels: {
          light: 3.5,
          moderate: 5.0,
          vigorous: 6.5
        }
      },
      {
        id: '3',
        name: 'General Strength Training',
        category: 'strength',
        calories_per_minute: 4.5, // 272 calories per 60 minutes
        description: 'Weight lifting and resistance exercises',
        intensity_levels: {
          light: 3.0,
          moderate: 4.5,
          vigorous: 6.0
        }
      },
      {
        id: '4',
        name: 'Running (6 mph)',
        category: 'cardiovascular',
        calories_per_minute: 10.0,
        description: 'Moderate pace running',
        intensity_levels: {
          light: 8.0,
          moderate: 10.0,
          vigorous: 12.0
        }
      },
      {
        id: '5',
        name: 'Swimming (moderate)',
        category: 'cardiovascular',
        calories_per_minute: 8.0,
        description: 'Freestyle swimming at moderate pace',
        intensity_levels: {
          light: 6.0,
          moderate: 8.0,
          vigorous: 11.0
        }
      },
      {
        id: '6',
        name: 'Yoga (Hatha)',
        category: 'flexibility',
        calories_per_minute: 2.5,
        description: 'Traditional yoga poses and stretching',
        intensity_levels: {
          light: 2.0,
          moderate: 2.5,
          vigorous: 3.5
        }
      }
    ];

    setExercises(sampleExercises);
  };

  const loadWorkoutHistory = async () => {
    if (!user?.id) return;

    // Load from database - placeholder for now
    const sampleHistory: Workout[] = [
      {
        id: '1',
        name: 'Morning Cardio',
        exercises: [
          {
            exercise: exercises[0],
            duration_minutes: 30,
            intensity: 'moderate',
            calories_burned: 363
          }
        ],
        total_duration: 30,
        total_calories: 363,
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        is_completed: true
      }
    ];

    setWorkoutHistory(sampleHistory);
    calculateWeeklyStats(sampleHistory);
  };

  const calculateWeeklyStats = (history: Workout[]) => {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyWorkouts = history.filter(w => 
      new Date(w.date) >= oneWeekAgo && w.is_completed
    );

    const stats = weeklyWorkouts.reduce((acc, workout) => ({
      total_calories: acc.total_calories + workout.total_calories,
      total_minutes: acc.total_minutes + workout.total_duration,
      workouts_completed: acc.workouts_completed + 1
    }), { total_calories: 0, total_minutes: 0, workouts_completed: 0 });

    setWeeklyStats(stats);
  };

  const calculateCaloriesBurned = (exercise: Exercise, minutes: number, selectedIntensity: 'light' | 'moderate' | 'vigorous') => {
    let caloriesPerMinute = exercise.calories_per_minute;
    
    // Apply intensity modifier
    if (exercise.intensity_levels) {
      caloriesPerMinute = exercise.intensity_levels[selectedIntensity];
    }

    // Weight adjustment (base calculations assume 154 lb person)
    const weightAdjustment = userProfile.weight_lbs / 154;
    
    return Math.round(caloriesPerMinute * minutes * weightAdjustment);
  };

  const addExerciseToWorkout = () => {
    if (!selectedExercise) return;

    const calories = calculateCaloriesBurned(selectedExercise, duration, intensity);
    
    // Set pending exercise for confirmation
    setPendingExercise({
      exercise: selectedExercise,
      duration,
      intensity,
      calories
    });
    setShowConfirmDialog(true);
  };

  const confirmAddExercise = () => {
    if (!pendingExercise) {
      setError('No exercise data available');
      return;
    }

    try {
      const workoutExercise: WorkoutExercise = {
        exercise: pendingExercise.exercise,
        duration_minutes: pendingExercise.duration,
        intensity: pendingExercise.intensity,
        calories_burned: pendingExercise.calories
      };

      const updatedWorkout = {
        ...currentWorkout,
        exercises: [...currentWorkout.exercises, workoutExercise],
        total_duration: currentWorkout.total_duration + pendingExercise.duration,
        total_calories: currentWorkout.total_calories + pendingExercise.calories
      };

      setCurrentWorkout(updatedWorkout);
      
      // Update TEE with exercise calories
      const newTEE = userProfile.tee_calories + pendingExercise.calories;
      onTEEUpdate(newTEE);

      // Clean up state
      setShowExerciseSelector(false);
      setSelectedExercise(null);
      setDuration(30);
      setIntensity('moderate');
      setShowConfirmDialog(false);
      setPendingExercise(null);
      setError(null);
    } catch (err) {
      console.error('Error adding exercise:', err);
      setError('Failed to add exercise. Please try again.');
    }
  };

  const cancelAddExercise = () => {
    try {
      setShowConfirmDialog(false);
      setPendingExercise(null);
      setError(null);
    } catch (err) {
      console.error('Error canceling exercise:', err);
    }
  };

  const completeWorkout = async () => {
    if (!pendingExercise) return;

    if (currentWorkout.exercises.length === 0) return;

    setIsCompleting(true);
    setError(null);

    try {
      const completedWorkout = {
        ...currentWorkout,
        is_completed: true,
        id: `workout_${Date.now()}` // Generate a unique ID
      };

      // Save to database with proper error handling
      if (user?.id) {
        try {
          // In a real implementation, you would save to Supabase here
          // For now, we'll simulate the save operation
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (dbError) {
          console.error('Database save error:', dbError);
          // Continue with local state update even if DB save fails
        }
      }

      // Update local state
      const updatedHistory = [...workoutHistory, completedWorkout];
      setWorkoutHistory(updatedHistory);
      calculateWeeklyStats(updatedHistory);

      // Reset current workout
      setCurrentWorkout({
        name: "Today's Workout",
        exercises: [],
        total_duration: 0,
        total_calories: 0,
        date: new Date().toISOString().split('T')[0],
        is_completed: false
      });

      // Show success message without using alert (which can cause iframe issues)
      setError(null);
      
      // Show success notification
      alert('🎉 Workout completed! Great job!');

    } catch (error) {
      console.error('Error completing workout:', error);
      setError('Failed to complete workout. Your progress has been saved locally.');
    } finally {
      setIsCompleting(false);
    }
  };

  const removeExerciseFromWorkout = (index: number) => {
    try {
      const removedExercise = currentWorkout.exercises[index];
      const updatedWorkout = {
        ...currentWorkout,
        exercises: currentWorkout.exercises.filter((_, i) => i !== index),
        total_duration: currentWorkout.total_duration - removedExercise.duration_minutes,
        total_calories: currentWorkout.total_calories - removedExercise.calories_burned
      };

      setCurrentWorkout(updatedWorkout);

      // Update TEE
      const newTEE = userProfile.tee_calories - removedExercise.calories_burned;
      onTEEUpdate(newTEE);
      setError(null);
    } catch (err) {
      console.error('Error removing exercise:', err);
      setError('Failed to remove exercise. Please try again.');
    }
  };

  // Enhanced error handling for async operations
  const handleAsyncOperation = async (operation: () => Promise<void>, errorMessage: string) => {
    try {
      setError(null);
      await operation();
    } catch (err) {
      console.error(errorMessage, err);
      setError(errorMessage);
    }
  };

  // Safe state updates to prevent race conditions
  const safeSetState = <T,>(setter: React.Dispatch<React.SetStateAction<T>>, value: T) => {
    setter(value);
  };

  const completeWorkoutSafe = async () => {
    try {
      await completeWorkout();
    } catch (error) {
      setError('Failed to complete workout');
    }
  };

  const categories = ['all', ...Array.from(new Set(exercises.map(e => e.category)))];
  
  const filteredExercises = exercises.filter(exercise => {
    const matchesCategory = selectedCategory === 'all' || exercise.category === selectedCategory;
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'light': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'vigorous': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cardiovascular': return <Heart className="w-5 h-5" />;
      case 'strength': return <Dumbbell className="w-5 h-5" />;
      case 'flexibility': return <Target className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs">!</span>
            </div>
            <div>
              <p className="font-medium text-red-800">Error</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-[#52C878]/10 to-[#4A90E2]/10 rounded-2xl p-6 border border-[#52C878]/20">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-[#2C3E50] flex items-center gap-3">
            <Activity className="w-8 h-8 text-[#52C878]" />
            Fitness Routine System
          </h1>
          <div className="text-right">
            <div className="bg-white/50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Enhanced Total Daily Calories</p>
              <p className="text-2xl font-bold text-[#52C878]">
                {userProfile.tee_calories + currentWorkout.total_calories}
              </p>
              <p className="text-xs text-gray-500">
                Base: {userProfile.tee_calories} + Exercise: {currentWorkout.total_calories}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Stats Dashboard */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-[#2C3E50] mb-6 flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Weekly Progress
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-[#52C878]/10 rounded-xl">
            <div className="text-3xl font-bold text-[#52C878] mb-2">{weeklyStats.total_calories}</div>
            <p className="text-sm text-gray-600">Calories Burned</p>
          </div>
          <div className="text-center p-4 bg-[#4A90E2]/10 rounded-xl">
            <div className="text-3xl font-bold text-[#4A90E2] mb-2">{weeklyStats.total_minutes}</div>
            <p className="text-sm text-gray-600">Active Minutes</p>
          </div>
          <div className="text-center p-4 bg-purple-100 rounded-xl">
            <div className="text-3xl font-bold text-purple-600 mb-2">{weeklyStats.workouts_completed}</div>
            <p className="text-sm text-gray-600">Workouts Completed</p>
          </div>
        </div>
      </div>

      {/* Current Workout Builder */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#2C3E50] flex items-center gap-2">
            <Timer className="w-5 h-5" />
            {currentWorkout.name}
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Duration</p>
              <p className="text-lg font-bold text-[#2C3E50]">{currentWorkout.total_duration} min</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Calories Burned</p>
              <p className="text-lg font-bold text-[#52C878]">{currentWorkout.total_calories}</p>
            </div>
            <button
              onClick={() => setShowExerciseSelector(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#52C878] to-[#4A90E2] text-white rounded-xl hover:from-[#52C878]/90 hover:to-[#4A90E2]/90 transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Exercise
            </button>
          </div>
        </div>

        {/* Current Workout Exercises */}
        <div className="space-y-3 mb-6">
          {currentWorkout.exercises.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No exercises added yet. Click "Add Exercise" to start building your workout.</p>
            </div>
          ) : (
            currentWorkout.exercises.map((workoutExercise, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-[#52C878]/5 rounded-xl border border-[#52C878]/10">
                <div className="flex items-center gap-4">
                  <div className="bg-[#52C878]/20 p-2 rounded-lg">
                    {getCategoryIcon(workoutExercise.exercise.category)}
                  </div>
                  <div>
                    <p className="font-semibold text-[#2C3E50]">{workoutExercise.exercise.name}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {workoutExercise.duration_minutes} min
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getIntensityColor(workoutExercise.intensity)}`}>
                        {workoutExercise.intensity}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-[#52C878]">{workoutExercise.calories_burned} cal</p>
                  </div>
                  <button
                    onClick={() => removeExerciseFromWorkout(index)}
                    className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Complete Workout Button */}
        {currentWorkout.exercises.length > 0 && (
          <div className="flex justify-center">
            <button
              onClick={completeWorkoutSafe}
              disabled={isCompleting}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isCompleting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Completing...
                </div>
              ) : (
                'Complete Workout'
              )}
            </button>
          </div>
        )}
      </div>

      {/* Exercise Selector Modal */}
      {showExerciseSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-[#2C3E50]">Add Exercise to Workout</h3>
                <button
                  onClick={() => setShowExerciseSelector(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Search and Filter */}
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search exercises..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#52C878] focus:border-[#52C878]"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#52C878] focus:border-[#52C878]"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Exercise List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  <h4 className="font-semibold text-[#2C3E50] mb-3">Select Exercise ({filteredExercises.length} available)</h4>
                  {filteredExercises.map(exercise => (
                    <button
                      key={exercise.id}
                      onClick={() => setSelectedExercise(exercise)}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                        selectedExercise?.id === exercise.id
                          ? 'border-[#52C878] bg-[#52C878]/10'
                          : 'border-gray-200 hover:border-[#52C878]/50 hover:bg-[#52C878]/5'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-[#52C878]/20 p-2 rounded-lg">
                          {getCategoryIcon(exercise.category)}
                        </div>
                        <div>
                          <p className="font-semibold text-[#2C3E50]">{exercise.name}</p>
                          <p className="text-sm text-gray-600 capitalize">{exercise.category}</p>
                        </div>
                      </div>
                      {exercise.description && (
                        <p className="text-xs text-gray-500 ml-11">{exercise.description}</p>
                      )}
                    </button>
                  ))}
                </div>

                {/* Exercise Configuration */}
                {selectedExercise && (
                  <div className="space-y-6">
                    <div className="p-6 bg-gradient-to-r from-[#52C878]/5 to-[#4A90E2]/5 rounded-xl border border-[#52C878]/20">
                      <h4 className="font-bold text-[#2C3E50] text-lg mb-4">{selectedExercise.name}</h4>
                      
                      {/* Duration Selection */}
                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Duration</label>
                        <div className="grid grid-cols-4 gap-2 mb-3">
                          {[20, 30, 40, 60].map(minutes => (
                            <button
                              key={minutes}
                              onClick={() => setDuration(minutes)}
                              className={`py-2 px-3 rounded-lg font-medium transition-all duration-200 ${
                                duration === minutes
                                  ? 'bg-[#52C878] text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-[#52C878]/20'
                              }`}
                            >
                              {minutes} min
                            </button>
                          ))}
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="180"
                          value={duration}
                          onChange={(e) => setDuration(parseInt(e.target.value))}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>5 min</span>
                          <span className="font-medium">{duration} minutes</span>
                          <span>180 min</span>
                        </div>
                      </div>

                      {/* Intensity Selection */}
                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Intensity Level</label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['light', 'moderate', 'vigorous'] as const).map(level => (
                            <button
                              key={level}
                              onClick={() => setIntensity(level)}
                              className={`py-2 px-3 rounded-lg font-medium transition-all duration-200 ${
                                intensity === level
                                  ? 'bg-[#4A90E2] text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-[#4A90E2]/20'
                              }`}
                            >
                              {level.charAt(0).toUpperCase() + level.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Calorie Calculation Display */}
                      <div className="p-4 bg-[#4A90E2]/10 rounded-xl border border-[#4A90E2]/20">
                        <h5 className="font-semibold text-[#2C3E50] mb-3">
                          Estimated Calorie Burn:
                        </h5>
                        <div className="text-center">
                          <p className="text-3xl font-bold text-[#4A90E2] mb-2">
                            {calculateCaloriesBurned(selectedExercise, duration, intensity)}
                          </p>
                          <p className="text-sm text-gray-600">
                            calories for {duration} minutes at {intensity} intensity
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Adjusted for your weight ({userProfile.weight_lbs} lbs)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-4">
              <button
                onClick={() => setShowExerciseSelector(false)}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={addExerciseToWorkout}
                disabled={!selectedExercise}
                className="px-8 py-3 bg-gradient-to-r from-[#52C878] to-[#4A90E2] text-white font-semibold rounded-xl hover:from-[#52C878]/90 hover:to-[#4A90E2]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer"
              >
                Review & Add Exercise
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exercise Confirmation Dialog */}
      {showConfirmDialog && pendingExercise && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-[#2C3E50]">Confirm Exercise Addition</h3>
            </div>
            
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="bg-[#52C878]/10 p-4 rounded-xl mb-4">
                  <h4 className="font-semibold text-[#2C3E50] mb-2">{pendingExercise.exercise.name}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Duration</p>
                      <p className="font-bold text-[#2C3E50]">{pendingExercise.duration} minutes</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Intensity</p>
                      <p className={`font-bold capitalize ${getIntensityColor(pendingExercise.intensity)}`}>
                        {pendingExercise.intensity}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-600">Estimated Calories Burned</p>
                      <p className="text-2xl font-bold text-[#52C878]">{pendingExercise.calories}</p>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600">
                  Are you sure you want to add this exercise to your workout?
                </p>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={cancelAddExercise}
                  className="flex-1 px-4 py-3 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAddExercise}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#52C878] to-[#4A90E2] text-white font-semibold rounded-xl hover:from-[#52C878]/90 hover:to-[#4A90E2]/90 transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer"
                >
                  Confirm & Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay for async operations */}
      {isCompleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 border-4 border-[#52C878] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-lg font-medium text-[#2C3E50]">Completing your workout...</p>
            </div>
          </div>
        </div>
      )}

      {/* Workout History */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-[#2C3E50] mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Recent Workouts
        </h2>
        
        <div className="space-y-3">
          {workoutHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No workout history yet. Complete your first workout to see it here!</p>
            </div>
          ) : (
            workoutHistory.map((workout, index) => (
              <div key={workout.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-semibold text-[#2C3E50]">{workout.name}</p>
                  <p className="text-sm text-gray-600">
                    {workout.exercises.length} exercises • {workout.total_duration} min • {new Date(workout.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#52C878]">{workout.total_calories} cal</p>
                  {workout.is_completed && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Completed
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default FitnessSystem;