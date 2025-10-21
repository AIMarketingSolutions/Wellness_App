import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { ArrowLeft, User, Scale, Ruler, Activity, Target, Check, TrendingDown, Apple } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface ProfileFormData {
  fullName: string;
  gender: "male" | "female";
  age: string;
  weightKg: string;
  heightCm: string;
  waistCm: string;
  neckCm: string;
  hipCm: string;
  goalWaistCm: string;
  goalNeckCm: string;
  goalHipCm: string;
  startingWeightKg: string;
  currentWeightKg: string;
  goalWeightKg: string;
  activityLevel: "sedentary" | "lightly_active" | "moderately_active" | "very_active";
  metabolicProfile: "fast_oxidizer" | "slow_oxidizer" | "medium_oxidizer" | "custom";
  customProteinPercentage: string;
  customCarbPercentage: string;
  customFatPercentage: string;
  weightLossGoal: "maintain" | "lose_0_5" | "lose_1" | "lose_1_5" | "lose_2";
  mealPlanType: "three_meals" | "three_meals_one_snack" | "three_meals_two_snacks";
}

export default function ProfileAssessment() {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: user?.fullName || "",
    gender: "male",
    age: "",
    weightKg: "",
    heightCm: "",
    waistCm: "",
    neckCm: "",
    hipCm: "",
    goalWaistCm: "",
    goalNeckCm: "",
    goalHipCm: "",
    startingWeightKg: "",
    currentWeightKg: "",
    goalWeightKg: "",
    activityLevel: "moderately_active",
    metabolicProfile: "medium_oxidizer",
    customProteinPercentage: "",
    customCarbPercentage: "",
    customFatPercentage: "",
    weightLossGoal: "maintain",
    mealPlanType: "three_meals",
  });

  const [bmr, setBmr] = useState<number>(0);
  const [tee, setTee] = useState<number>(0);
  const [dailyCaloriesWithDeficit, setDailyCaloriesWithDeficit] = useState<number>(0);

  // Fetch existing profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ["/api/profile"],
  });

  // Load profile data when available
  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || user?.fullName || "",
        gender: profile.gender || "male",
        age: profile.age?.toString() || "",
        weightKg: profile.weightKg || "",
        heightCm: profile.heightCm || "",
        waistCm: profile.waistCm || "",
        neckCm: profile.neckCm || "",
        hipCm: profile.hipCm || "",
        goalWaistCm: profile.goalWaistCm || "",
        goalNeckCm: profile.goalNeckCm || "",
        goalHipCm: profile.goalHipCm || "",
        startingWeightKg: profile.startingWeightKg || "",
        currentWeightKg: profile.currentWeightKg || "",
        goalWeightKg: profile.goalWeightKg || "",
        activityLevel: profile.activityLevel || "moderately_active",
        metabolicProfile: profile.metabolicProfile || "medium_oxidizer",
        customProteinPercentage: profile.customProteinPercentage || "",
        customCarbPercentage: profile.customCarbPercentage || "",
        customFatPercentage: profile.customFatPercentage || "",
        weightLossGoal: profile.weightLossGoal || "maintain",
        mealPlanType: profile.mealPlanType || "three_meals",
      });
    }
  }, [profile, user]);

  // Calculate BMR and TEE
  useEffect(() => {
    const age = parseFloat(formData.age);
    const weight = parseFloat(formData.weightKg);
    const height = parseFloat(formData.heightCm);

    if (age && weight && height) {
      let calculatedBmr = 0;
      
      if (formData.gender === "male") {
        calculatedBmr = 66.5 + (13.75 * weight) + (5.003 * height) - (6.755 * age);
      } else {
        calculatedBmr = 655.1 + (9.563 * weight) + (1.850 * height) - (4.676 * age);
      }

      setBmr(calculatedBmr);

      const activityMultipliers = {
        sedentary: 1.2,
        lightly_active: 1.375,
        moderately_active: 1.55,
        very_active: 1.725,
      };

      const calculatedTee = calculatedBmr * activityMultipliers[formData.activityLevel];
      setTee(calculatedTee);

      // Calculate daily calories with deficit
      const deficits = {
        maintain: 0,
        lose_0_5: 250,
        lose_1: 500,
        lose_1_5: 750,
        lose_2: 1000,
      };

      const deficit = deficits[formData.weightLossGoal];
      setDailyCaloriesWithDeficit(calculatedTee - deficit);
    }
  }, [formData.age, formData.weightKg, formData.heightCm, formData.gender, formData.activityLevel, formData.weightLossGoal]);

  // Save profile mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const dataToSave = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : null,
        weightKg: formData.weightKg || null,
        heightCm: formData.heightCm || null,
        waistCm: formData.waistCm || null,
        neckCm: formData.neckCm || null,
        hipCm: formData.hipCm || null,
        goalWaistCm: formData.goalWaistCm || null,
        goalNeckCm: formData.goalNeckCm || null,
        goalHipCm: formData.goalHipCm || null,
        startingWeightKg: formData.startingWeightKg || null,
        currentWeightKg: formData.currentWeightKg || null,
        goalWeightKg: formData.goalWeightKg || null,
        customProteinPercentage: formData.customProteinPercentage || null,
        customCarbPercentage: formData.customCarbPercentage || null,
        customFatPercentage: formData.customFatPercentage || null,
      };

      return apiRequest("/api/profile", {
        method: profile ? "PATCH" : "POST",
        body: JSON.stringify(dataToSave),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate custom ratios if metabolic profile is custom
    if (formData.metabolicProfile === "custom") {
      const protein = parseFloat(formData.customProteinPercentage) || 0;
      const carbs = parseFloat(formData.customCarbPercentage) || 0;
      const fat = parseFloat(formData.customFatPercentage) || 0;
      
      if (Math.abs(protein + carbs + fat - 100) > 0.1) {
        alert("Custom macros must total 100%");
        return;
      }
    }
    
    await saveMutation.mutateAsync();
  };

  const activityLevels = [
    {
      value: "sedentary",
      title: "Sedentary",
      description: "Spend most of the day sitting (e.g. bank teller, desk job)",
      multiplier: 1.2,
    },
    {
      value: "lightly_active",
      title: "Lightly Active",
      description: "Spend a good part of the day on your feet (e.g. teacher, salesperson)",
      multiplier: 1.375,
    },
    {
      value: "moderately_active",
      title: "Moderately Active",
      description: "Spend a good part of the day doing some physical activity (e.g. food server, postal carrier)",
      multiplier: 1.55,
    },
    {
      value: "very_active",
      title: "Very Active",
      description: "Spend most of the day doing heavy physical activity (e.g. bike messenger, carpenter)",
      multiplier: 1.725,
    },
  ];

  const metabolicProfiles = [
    {
      value: "fast_oxidizer",
      title: "Fast Oxidizer",
      protein: 25,
      carbs: 35,
      fat: 40,
      description: [
        "Slender build with narrow shoulders and hips",
        "Lean with little muscle or fat",
        "Challenging to gain weight or muscle",
        "Blood type tendency: A"
      ],
    },
    {
      value: "slow_oxidizer",
      title: "Slow Oxidizer",
      protein: 35,
      carbs: 25,
      fat: 40,
      description: [
        "Muscular and athletic with well-defined physique",
        "Broad shoulders, narrow waist",
        "Gains muscle and loses fat easily",
        "Blood type tendency: O"
      ],
    },
    {
      value: "medium_oxidizer",
      title: "Medium Oxidizer",
      protein: 30,
      carbs: 30,
      fat: 40,
      description: [
        "Rounder body shape with higher body fat proportion",
        "Easier to gain weight, struggles with weight loss",
        "Blood type tendency: B"
      ],
    },
  ];

  const weightLossGoals = [
    {
      value: "maintain",
      title: "Maintain Weight",
      deficit: 0,
      weeklyLoss: "0 lbs",
      description: "No caloric deficit - maintain current weight",
    },
    {
      value: "lose_0_5",
      title: "Lose 0.5 lbs/week",
      deficit: 250,
      weeklyLoss: "0.5 lbs",
      description: "1,750 calorie deficit per week",
    },
    {
      value: "lose_1",
      title: "Lose 1 lb/week",
      deficit: 500,
      weeklyLoss: "1 lb",
      description: "3,500 calorie deficit per week",
    },
    {
      value: "lose_1_5",
      title: "Lose 1.5 lbs/week",
      deficit: 750,
      weeklyLoss: "1.5 lbs",
      description: "5,250 calorie deficit per week",
    },
    {
      value: "lose_2",
      title: "Lose 2 lbs/week",
      deficit: 1000,
      weeklyLoss: "2 lbs",
      description: "7,000 calorie deficit per week",
    },
  ];

  const mealPlanTypes = [
    {
      value: "three_meals",
      title: "Three Meals",
      description: "Each meal = 33.33% of daily calories",
      breakdown: "Breakfast, Lunch, Dinner (33.33% each)",
    },
    {
      value: "three_meals_one_snack",
      title: "Three Meals + One Snack",
      description: "Snack = 10%, Meals = 30% each",
      breakdown: "3 Meals at 30% + 1 Snack at 10%",
    },
    {
      value: "three_meals_two_snacks",
      title: "Three Meals + Two Snacks",
      description: "Snacks = 10% each, Meals = 26.67% each",
      breakdown: "3 Meals at 26.67% + 2 Snacks at 10% each",
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#52C878]/5 via-[#4A90E2]/5 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#52C878] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#52C878]/5 via-[#4A90E2]/5 to-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#52C878] to-[#4A90E2] text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/dashboard" data-testid="link-dashboard" className="flex items-center gap-2 text-white/90 hover:text-white transition-colors group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-[#52C878] to-[#4A90E2] p-4 rounded-full">
              <User className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-[#2C3E50] mb-3">Personal Profile Assessment</h1>
          <p className="text-lg text-gray-600">
            Complete your health profile to get personalized recommendations
          </p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Basic Information */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-[#2C3E50] flex items-center gap-2 mb-6">
              <User className="w-6 h-6 text-[#52C878]" />
              Section 1: Basic Information
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  data-testid="input-fullname"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#52C878]/20 focus:border-[#52C878]"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2C3E50] mb-3">
                  Gender
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    data-testid="button-gender-male"
                    onClick={() => setFormData({ ...formData, gender: "male" })}
                    className={`py-3 px-6 rounded-xl border-2 font-semibold transition-all ${
                      formData.gender === "male"
                        ? "border-[#52C878] bg-[#52C878]/10 text-[#52C878]"
                        : "border-gray-200 text-gray-600 hover:border-[#52C878]/50"
                    }`}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    data-testid="button-gender-female"
                    onClick={() => setFormData({ ...formData, gender: "female" })}
                    className={`py-3 px-6 rounded-xl border-2 font-semibold transition-all ${
                      formData.gender === "female"
                        ? "border-[#52C878] bg-[#52C878]/10 text-[#52C878]"
                        : "border-gray-200 text-gray-600 hover:border-[#52C878]/50"
                    }`}
                  >
                    Female
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
                    Age (years)
                  </label>
                  <input
                    type="number"
                    data-testid="input-age"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#52C878]/20 focus:border-[#52C878]"
                    placeholder="Age"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    data-testid="input-weight"
                    value={formData.weightKg}
                    onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#52C878]/20 focus:border-[#52C878]"
                    placeholder="Weight"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    data-testid="input-height"
                    value={formData.heightCm}
                    onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#52C878]/20 focus:border-[#52C878]"
                    placeholder="Height"
                    required
                  />
                </div>
              </div>

              {/* Weight Tracking Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
                    Starting Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    data-testid="input-starting-weight"
                    value={formData.startingWeightKg}
                    onChange={(e) => setFormData({ ...formData, startingWeightKg: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#52C878]/20 focus:border-[#52C878]"
                    placeholder="Starting weight"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
                    Current Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    data-testid="input-current-weight"
                    value={formData.currentWeightKg}
                    onChange={(e) => setFormData({ ...formData, currentWeightKg: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#52C878]/20 focus:border-[#52C878]"
                    placeholder="Current weight"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
                    Goal Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    data-testid="input-goal-weight"
                    value={formData.goalWeightKg}
                    onChange={(e) => setFormData({ ...formData, goalWeightKg: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#52C878]/20 focus:border-[#52C878]"
                    placeholder="Goal weight"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Body Measurements */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-[#2C3E50] flex items-center gap-2 mb-6">
              <Ruler className="w-6 h-6 text-[#52C878]" />
              Section 2: Body Measurements
            </h2>
            
            <div className="space-y-6">
              {/* Waist Measurements */}
              <div>
                <h3 className="text-lg font-semibold text-[#2C3E50] mb-3">
                  Waist Measurement
                  <span className="block text-xs font-normal text-gray-500 mt-1">At the belly button</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
                      Current Measurement (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      data-testid="input-waist"
                      value={formData.waistCm}
                      onChange={(e) => setFormData({ ...formData, waistCm: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#52C878]/20 focus:border-[#52C878]"
                      placeholder="Current waist"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
                      Goal Measurement (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      data-testid="input-goal-waist"
                      value={formData.goalWaistCm}
                      onChange={(e) => setFormData({ ...formData, goalWaistCm: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#52C878]/20 focus:border-[#52C878]"
                      placeholder="Goal waist"
                    />
                  </div>
                </div>
              </div>

              {/* Neck Measurements */}
              <div>
                <h3 className="text-lg font-semibold text-[#2C3E50] mb-3">
                  Neck Measurement
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
                      Current Measurement (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      data-testid="input-neck"
                      value={formData.neckCm}
                      onChange={(e) => setFormData({ ...formData, neckCm: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#52C878]/20 focus:border-[#52C878]"
                      placeholder="Current neck"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
                      Goal Measurement (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      data-testid="input-goal-neck"
                      value={formData.goalNeckCm}
                      onChange={(e) => setFormData({ ...formData, goalNeckCm: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#52C878]/20 focus:border-[#52C878]"
                      placeholder="Goal neck"
                    />
                  </div>
                </div>
              </div>

              {/* Hip Measurements (Female Only) */}
              {formData.gender === "female" && (
                <div>
                  <h3 className="text-lg font-semibold text-[#2C3E50] mb-3">
                    Hip Measurement
                    <span className="block text-xs font-normal text-gray-500 mt-1">At their widest point</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
                        Current Measurement (cm)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        data-testid="input-hip"
                        value={formData.hipCm}
                        onChange={(e) => setFormData({ ...formData, hipCm: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#52C878]/20 focus:border-[#52C878]"
                        placeholder="Current hip"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
                        Goal Measurement (cm)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        data-testid="input-goal-hip"
                        value={formData.goalHipCm}
                        onChange={(e) => setFormData({ ...formData, goalHipCm: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#52C878]/20 focus:border-[#52C878]"
                        placeholder="Goal hip"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Total Energy Expenditure */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-[#2C3E50] flex items-center gap-2 mb-6">
              <Activity className="w-6 h-6 text-[#52C878]" />
              Section 3: Total Energy Expenditure (TEE)
            </h2>

            {/* BMR Display */}
            {bmr > 0 && (
              <div className="mb-6 p-4 bg-gradient-to-r from-[#52C878]/10 to-[#4A90E2]/10 rounded-xl border border-[#52C878]/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Basal Metabolic Rate (BMR)</p>
                    <p className="text-3xl font-bold text-[#2C3E50]" data-testid="text-bmr">{Math.round(bmr)} calories/day</p>
                  </div>
                  {tee > 0 && (
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-600">Total Daily Calories</p>
                      <p className="text-3xl font-bold text-[#52C878]" data-testid="text-tee">{Math.round(tee)} calories/day</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <h3 className="text-lg font-semibold text-[#2C3E50] mb-4">Select Your Activity Level</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activityLevels.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  data-testid={`button-activity-${level.value}`}
                  onClick={() => setFormData({ ...formData, activityLevel: level.value as any })}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    formData.activityLevel === level.value
                      ? "border-[#52C878] bg-[#52C878]/10"
                      : "border-gray-200 hover:border-[#52C878]/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold text-[#2C3E50] mb-1">{level.title}</h4>
                      <p className="text-sm text-gray-600">{level.description}</p>
                    </div>
                    {formData.activityLevel === level.value && (
                      <Check className="w-6 h-6 text-[#52C878] ml-2 flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Weekly Weight Loss Goal */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-[#2C3E50] flex items-center gap-2 mb-6">
              <TrendingDown className="w-6 h-6 text-[#52C878]" />
              Section 4: Weekly Weight Loss Goal
            </h2>

            <p className="text-sm text-gray-600 mb-6">
              Select your target weight loss per week. Each pound of fat equals 3,500 calories.
            </p>

            <div className="space-y-3">
              {weightLossGoals.map((goal) => (
                <button
                  key={goal.value}
                  type="button"
                  data-testid={`button-weightloss-${goal.value}`}
                  onClick={() => setFormData({ ...formData, weightLossGoal: goal.value as any })}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    formData.weightLossGoal === goal.value
                      ? "border-[#52C878] bg-[#52C878]/10"
                      : "border-gray-200 hover:border-[#52C878]/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-bold text-[#2C3E50]">{goal.title}</h4>
                        {goal.deficit > 0 && (
                          <span className="text-sm font-semibold text-red-600">-{goal.deficit} cal/day</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                    </div>
                    {formData.weightLossGoal === goal.value && (
                      <Check className="w-6 h-6 text-[#52C878] ml-4 flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Daily Calories with Deficit */}
            {dailyCaloriesWithDeficit > 0 && formData.weightLossGoal !== "maintain" && (
              <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-600">Your Target Daily Calories</p>
                  <p className="text-3xl font-bold text-orange-600" data-testid="text-daily-calories">
                    {Math.round(dailyCaloriesWithDeficit)} calories/day
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    (TEE: {Math.round(tee)} - Deficit: {weightLossGoals.find(g => g.value === formData.weightLossGoal)?.deficit})
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Meal Plan Type */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-[#2C3E50] flex items-center gap-2 mb-6">
              <Apple className="w-6 h-6 text-[#52C878]" />
              Section 5: Meal Plan Type
            </h2>

            <p className="text-sm text-gray-600 mb-6">
              Choose how you want to distribute your daily calories across meals and snacks.
            </p>

            <div className="space-y-4">
              {mealPlanTypes.map((plan) => (
                <button
                  key={plan.value}
                  type="button"
                  data-testid={`button-mealplan-${plan.value}`}
                  onClick={() => setFormData({ ...formData, mealPlanType: plan.value as any })}
                  className={`w-full p-5 rounded-xl border-2 text-left transition-all ${
                    formData.mealPlanType === plan.value
                      ? "border-[#52C878] bg-[#52C878]/10"
                      : "border-gray-200 hover:border-[#52C878]/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold text-[#2C3E50] mb-1">{plan.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{plan.description}</p>
                      <p className="text-xs text-gray-500">{plan.breakdown}</p>
                    </div>
                    {formData.mealPlanType === plan.value && (
                      <Check className="w-6 h-6 text-[#52C878] ml-4 flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 6: Metabolic Profile */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-[#2C3E50] flex items-center gap-2 mb-6">
              <Target className="w-6 h-6 text-[#52C878]" />
              Section 6: Metabolic Profile Selection
            </h2>

            <div className="space-y-4 mb-6">
              {metabolicProfiles.map((profile) => (
                <button
                  key={profile.value}
                  type="button"
                  data-testid={`button-profile-${profile.value}`}
                  onClick={() => setFormData({ ...formData, metabolicProfile: profile.value as any })}
                  className={`w-full p-5 rounded-xl border-2 text-left transition-all ${
                    formData.metabolicProfile === profile.value
                      ? "border-[#52C878] bg-[#52C878]/10"
                      : "border-gray-200 hover:border-[#52C878]/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-[#2C3E50] mb-2">{profile.title}</h3>
                      <div className="mb-3 flex gap-4 text-sm font-semibold">
                        <span className="text-[#52C878]">Protein: {profile.protein}%</span>
                        <span className="text-[#4A90E2]">Carbs: {profile.carbs}%</span>
                        <span className="text-[#2C3E50]">Fat: {profile.fat}%</span>
                      </div>
                      <ul className="space-y-1">
                        {profile.description.map((desc, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-start">
                            <span className="mr-2">•</span>
                            <span>{desc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {formData.metabolicProfile === profile.value && (
                      <Check className="w-6 h-6 text-[#52C878] ml-4 flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}

              {/* Custom Ratio Option */}
              <button
                type="button"
                data-testid="button-profile-custom"
                onClick={() => setFormData({ ...formData, metabolicProfile: "custom" })}
                className={`w-full p-5 rounded-xl border-2 text-left transition-all ${
                  formData.metabolicProfile === "custom"
                    ? "border-[#52C878] bg-[#52C878]/10"
                    : "border-gray-200 hover:border-[#52C878]/50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-[#2C3E50] mb-3">Custom Ratio</h3>
                    {formData.metabolicProfile === "custom" && (
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div>
                          <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
                            Protein %
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            data-testid="input-protein"
                            value={formData.customProteinPercentage}
                            onChange={(e) => setFormData({ ...formData, customProteinPercentage: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#52C878]/20 focus:border-[#52C878]"
                            placeholder="25"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
                            Carbohydrate %
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            data-testid="input-carbs"
                            value={formData.customCarbPercentage}
                            onChange={(e) => setFormData({ ...formData, customCarbPercentage: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#52C878]/20 focus:border-[#52C878]"
                            placeholder="35"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
                            Fat %
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            data-testid="input-fat"
                            value={formData.customFatPercentage}
                            onChange={(e) => setFormData({ ...formData, customFatPercentage: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#52C878]/20 focus:border-[#52C878]"
                            placeholder="40"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                    )}
                    {formData.metabolicProfile === "custom" && (
                      <p className="text-sm text-gray-600 mt-3">
                        Total: {(
                          (parseFloat(formData.customProteinPercentage) || 0) +
                          (parseFloat(formData.customCarbPercentage) || 0) +
                          (parseFloat(formData.customFatPercentage) || 0)
                        ).toFixed(1)}% (must equal 100%)
                      </p>
                    )}
                  </div>
                  {formData.metabolicProfile === "custom" && (
                    <Check className="w-6 h-6 text-[#52C878] ml-4 flex-shrink-0" />
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              data-testid="button-save-profile"
              disabled={saveMutation.isPending}
              className="px-12 py-4 bg-gradient-to-r from-[#52C878] to-[#4A90E2] text-white font-bold text-lg rounded-2xl hover:shadow-xl transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {saveMutation.isPending ? "Saving..." : "Save Profile"}
            </button>
          </div>

          {saveMutation.isSuccess && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-center" data-testid="text-success">
              <p className="text-green-700 font-semibold">Profile saved successfully!</p>
            </div>
          )}
        </form>
      </main>
    </div>
  );
}
