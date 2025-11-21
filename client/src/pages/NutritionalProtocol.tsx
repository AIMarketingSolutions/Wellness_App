import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, BookOpen, Bug, Heart, Flame, Sparkles, Droplet, Zap, Leaf, Droplets } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface QuizAnswer {
  [key: string]: boolean;
}

interface Supplement {
  name: string;
  timing: "with_meal" | "empty_stomach" | "before_meal";
  dosing: string;
}

// Universal Body Health Assessment (Parasite-focused questions)
const bodyHealthQuestions = [
  { id: "bloating", label: "Bloating", category: "digestive", score: 1 },
  { id: "gas", label: "Excess gas", category: "digestive", score: 1 },
  { id: "constipation", label: "Constipation", category: "digestive", score: 1 },
  { id: "diarrhea", label: "Loose stools or diarrhea", category: "digestive", score: 1 },
  { id: "alternating_bowel", label: "Alternating constipation and diarrhea", category: "digestive", score: 2 },
  { id: "stomach_cramps", label: "Stomach cramps or abdominal pain", category: "digestive", score: 1 },
  { id: "nausea", label: "Nausea (without clear food poisoning)", category: "digestive", score: 1 },
  { id: "mucus_stool", label: "Mucus in stool", category: "digestive", score: 2 },
  { id: "undigested_food", label: "Undigested food visible in stool", category: "digestive", score: 1 },
  { id: "itchy_anus", label: "Itchy anus, especially at night", category: "digestive", score: 2 },
  { id: "visible_worms", label: "Visible string-like pieces or worm-like material in stool", category: "digestive", score: 3 },
  { id: "morning_fatigue", label: "Morning fatigue even after a full night's sleep", category: "energy", score: 1 },
  { id: "afternoon_crash", label: "Afternoon energy crashes", category: "energy", score: 1 },
  { id: "brain_fog", label: "Brain fog or difficulty concentrating", category: "energy", score: 2 },
  { id: "headaches", label: "Frequent or unexplained headaches", category: "energy", score: 1 },
  { id: "itchy_skin", label: "Itchy skin without clear cause", category: "skin", score: 1 },
  { id: "rashes", label: "Rashes or hives", category: "skin", score: 1 },
  { id: "eczema_like", label: "Eczema-like dry or inflamed patches", category: "skin", score: 1 },
  { id: "worsening_allergies", label: "Seasonal or environmental allergies that have worsened", category: "skin", score: 1 },
  { id: "trouble_sleeping", label: "Trouble falling asleep", category: "sleep", score: 1 },
  { id: "waking_1_3am", label: "Waking between 1–3 AM regularly", category: "sleep", score: 2 },
  { id: "night_sweats", label: "Night sweats or feeling overheated at night", category: "sleep", score: 1 },
  { id: "anxiety", label: "Anxiety or feeling 'on edge'", category: "sleep", score: 1 },
  { id: "irritability", label: "Irritability or mood swings", category: "sleep", score: 1 },
  { id: "teeth_grinding", label: "Teeth grinding at night (bruxism)", category: "sleep", score: 2 },
  { id: "sugar_cravings", label: "Strong sugar or refined carb cravings", category: "appetite", score: 2 },
  { id: "constant_hunger", label: "Feeling hungry soon after meals", category: "appetite", score: 1 },
  { id: "low_appetite", label: "Unusually low appetite", category: "appetite", score: 1 },
  { id: "weight_loss", label: "Unexplained weight loss", category: "appetite", score: 2 },
  { id: "difficulty_gaining", label: "Difficulty gaining weight despite adequate intake", category: "appetite", score: 2 },
  { id: "travel_tropical", label: "Travel to tropical or low-sanitation regions", category: "exposure", score: 2 },
  { id: "raw_meat_fish", label: "Frequent consumption of raw or undercooked meat or fish", category: "exposure", score: 2 },
  { id: "untreated_water", label: "History of drinking untreated or questionable water", category: "exposure", score: 2 },
  { id: "food_poisoning_history", label: "History of severe food poisoning or gastroenteritis", category: "exposure", score: 1 },
  { id: "pets", label: "Close contact with pets (dogs, cats) without regular deworming", category: "exposure", score: 1 },
  { id: "gardening_soil", label: "Regular gardening or soil contact without gloves", category: "exposure", score: 1 },
];

const parasiteSupplements: Supplement[] = [
  { name: "Black Walnut Hull Extract", timing: "with_meal", dosing: "500-1000mg daily" },
  { name: "Wormwood", timing: "with_meal", dosing: "200-400mg daily" },
  { name: "Clove Extract", timing: "with_meal", dosing: "350-500mg daily" },
  { name: "Oregano Oil (Softgels)", timing: "with_meal", dosing: "1-2 softgels daily" },
  { name: "Probiotics", timing: "empty_stomach", dosing: "20-50 billion CFU daily" },
  { name: "Digestive Enzymes", timing: "with_meal", dosing: "1 capsule with meals" },
  { name: "Activated Charcoal", timing: "empty_stomach", dosing: "2 capsules as needed" },
  { name: "Magnesium Glycinate", timing: "before_meal", dosing: "200-400mg evening" },
  { name: "Milk Thistle", timing: "with_meal", dosing: "150-300mg daily" },
];

const parasiteHandoutSections = [
  {
    title: "What Are Parasites?",
    content: "Parasites are organisms that live in or on the human body and use your nutrients to survive.",
    bullets: ["They can inhabit the digestive tract, liver, blood, and tissues.", "They interfere with digestion, nutrient absorption, and immune health.", "Many people are unaware parasites may be involved in their health issues."],
  },
  {
    title: "Common Symptoms",
    content: "Symptoms vary widely, but some patterns are common.",
    bullets: ["Digestive issues: bloating, gas, constipation, diarrhea", "Unexplained fatigue or low energy", "Brain fog or difficulty concentrating", "Skin issues and rashes", "Sugar cravings"],
  },
];

const protocols = [
  { title: "Parasite Symptoms", desc: "Identify and support parasitic burdens affecting digestion and immunity", icon: Bug, color: "from-[#52C878] to-[#4A90E2]" },
  { title: "Leaky Gut", desc: "Restore intestinal barrier integrity and reduce inflammation", icon: Heart, color: "from-[#4A90E2] to-[#52C878]" },
  { title: "Adrenal Stress & Cortisol Balance", desc: "Restore energy and support stress hormone recovery", icon: Heart, color: "from-[#4A90E2] to-[#52C878]" },
  { title: "Heavy Metal Detox Support", desc: "Reduce toxic load from mercury, lead, cadmium, aluminum, and arsenic", icon: Flame, color: "from-[#52C878] to-[#4A90E2]" },
  { title: "Whole Body Detox", desc: "Support all major elimination pathways", icon: Sparkles, color: "from-[#4A90E2] to-[#52C878]" },
  { title: "Liver Detox & Regeneration", desc: "Optimize your primary fat-burning and detox organ", icon: Zap, color: "from-[#52C878] to-[#4A90E2]" },
  { title: "Kidney Detox", desc: "Filter acids, toxins, and metabolic waste effectively", icon: Droplet, color: "from-[#4A90E2] to-[#52C878]" },
  { title: "Gallbladder Flush & Bile Flow", desc: "Optimize fat digestion and toxin elimination", icon: BookOpen, color: "from-[#52C878] to-[#4A90E2]" },
  { title: "Menopausal Symptoms", desc: "Support hormonal balance and manage transition symptoms", icon: Leaf, color: "from-[#4A90E2] to-[#52C878]" },
  { title: "Anemia", desc: "Boost iron levels and support healthy blood formation", icon: Droplets, color: "from-[#52C878] to-[#4A90E2]" },
];

export default function NutritionalProtocol() {
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [symptoms, setSymptoms] = useState<{ [key: string]: number }>({
    bloating: 0,
    gas: 0,
    cramping: 0,
    fatigue: 0,
  });

  const handleQuizAnswer = (questionId: string, value: boolean) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const submitQuiz = () => {
    let score = 0;
    bodyHealthQuestions.forEach(q => {
      if (quizAnswers[q.id]) score += q.score;
    });
    setQuizScore(score);
    setShowResults(true);
  };

  const getRiskLevel = (score: number) => {
    if (score <= 7) return { label: "Low", color: "text-green-600", bgColor: "bg-green-50" };
    if (score <= 15) return { label: "Moderate", color: "text-yellow-600", bgColor: "bg-yellow-50" };
    if (score <= 24) return { label: "High", color: "text-orange-600", bgColor: "bg-orange-50" };
    return { label: "Very High", color: "text-red-600", bgColor: "bg-red-50" };
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
              <BookOpen className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-[#2C3E50] mb-3">Detox & Organ Support Protocol</h1>
          <p className="text-lg text-gray-600">Comprehensive detoxification and wellness strategies from certified practitioners</p>
        </div>

        {/* Universal Body Health Assessment */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-gray-100 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-[#4A90E2] to-[#52C878] p-4 rounded-xl">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-[#2C3E50]">Body Health Assessment</h2>
              <p className="text-gray-600">Evaluate your health status across key wellness indicators</p>
            </div>
          </div>

          {!showResults ? (
            <div className="space-y-6">
              <div className="max-h-96 overflow-y-auto space-y-6 pr-2">
                {["digestive", "energy", "skin", "sleep", "appetite", "exposure"].map(category => {
                  const categoryQuestions = bodyHealthQuestions.filter(q => q.category === category);
                  const categoryLabels: { [key: string]: string } = {
                    digestive: "Digestive Health",
                    energy: "Energy & Cognition",
                    skin: "Skin & Allergies",
                    sleep: "Sleep & Mood",
                    appetite: "Appetite & Weight",
                    exposure: "Exposure History"
                  };

                  return (
                    <div key={category}>
                      <h4 className="font-semibold text-[#2C3E50] mb-3 text-lg">{categoryLabels[category]}</h4>
                      <div className="space-y-2 bg-gray-50 rounded-lg p-4">
                        {categoryQuestions.map(q => (
                          <label key={q.id} className="flex items-center gap-3 cursor-pointer hover:bg-white p-2 rounded transition-colors">
                            <input
                              type="checkbox"
                              checked={quizAnswers[q.id] || false}
                              onChange={(e) => handleQuizAnswer(q.id, e.target.checked)}
                              className="w-4 h-4 rounded accent-[#52C878]"
                              data-testid={`checkbox-${q.id}`}
                            />
                            <span className="text-gray-700 text-sm">{q.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={submitQuiz}
                className="w-full bg-gradient-to-r from-[#4A90E2] to-[#52C878] text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow text-lg"
                data-testid="btn-submit-assessment"
              >
                Get Your Results
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {quizScore !== null && (
                <div className={`p-6 rounded-lg ${getRiskLevel(quizScore).bgColor} border-2 border-current`}>
                  <p className={`font-bold text-xl ${getRiskLevel(quizScore).color} mb-2`}>
                    Assessment Result: {getRiskLevel(quizScore).label} Risk Level
                  </p>
                  <p className={`${getRiskLevel(quizScore).color} font-semibold`}>Total Score: {quizScore} points</p>
                </div>
              )}
              <button
                onClick={() => {
                  setShowResults(false);
                  setQuizAnswers({});
                  setQuizScore(null);
                }}
                className="w-full bg-gradient-to-r from-[#4A90E2] to-[#52C878] text-white py-2 rounded-lg font-semibold hover:shadow-lg"
                data-testid="btn-retake-assessment"
              >
                Retake Assessment
              </button>
            </div>
          )}
        </div>

        {/* Parasite Symptom Tracker - Shows when results are displayed */}
        {showResults && quizScore !== null && (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-gray-100 mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-[#52C878] to-[#4A90E2] p-4 rounded-xl">
                <Bug className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-[#2C3E50]">Parasite Symptom Support</h2>
                <p className="text-gray-600">Track symptoms and supplement protocol for parasitic burden</p>
              </div>
            </div>

            <Tabs defaultValue="tracker" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg">
                <TabsTrigger value="tracker" data-testid="tab-tracker">Symptom Tracker</TabsTrigger>
                <TabsTrigger value="education" data-testid="tab-education">Education</TabsTrigger>
                <TabsTrigger value="supplements" data-testid="tab-supplements">Supplements</TabsTrigger>
              </TabsList>

              <TabsContent value="tracker" className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h5 className="font-semibold text-[#2C3E50] mb-4">Daily Symptom Tracker (0-10 Scale)</h5>
                  {Object.keys(symptoms).map(symptom => (
                    <div key={symptom} className="mb-4">
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700 capitalize">{symptom.replace(/_/g, " ")}</label>
                        <span className="text-sm font-bold text-[#52C878]">{symptoms[symptom]}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={symptoms[symptom]}
                        onChange={(e) => setSymptoms(prev => ({ ...prev, [symptom]: parseInt(e.target.value) }))}
                        className="w-full"
                        data-testid={`slider-${symptom}`}
                      />
                    </div>
                  ))}
                </div>
                <button className="w-full bg-gradient-to-r from-[#4A90E2] to-[#52C878] text-white py-2 rounded-lg font-semibold hover:shadow-lg" data-testid="btn-save-tracker">Save Entry</button>
              </TabsContent>

              <TabsContent value="education" className="space-y-4">
                {parasiteHandoutSections.map((section, idx) => (
                  <div key={idx} className="border-l-4 border-[#52C878] pl-4 py-2">
                    <h4 className="font-semibold text-[#2C3E50] mb-2">{section.title}</h4>
                    <p className="text-gray-700 text-sm mb-3">{section.content}</p>
                    <ul className="list-disc list-inside space-y-1">
                      {section.bullets.map((bullet, bidx) => (
                        <li key={bidx} className="text-gray-600 text-sm">{bullet}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="supplements" className="space-y-4">
                <p className="text-sm text-gray-700 mb-4 font-semibold">Supplement Timing Guide for Optimal Absorption</p>
                
                {/* Timing Chart */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* With Meals */}
                  <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-400">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-4 h-4 bg-orange-400 rounded"></div>
                      <h5 className="font-semibold text-gray-800">With Meals</h5>
                    </div>
                    <div className="space-y-3">
                      {parasiteSupplements.filter(s => s.timing === "with_meal").map((supp, idx) => (
                        <div key={idx}>
                          <p className="font-medium text-gray-800 text-sm">{supp.name}</p>
                          <p className="text-gray-600 text-xs">{supp.dosing}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Empty Stomach */}
                  <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-4 h-4 bg-blue-400 rounded"></div>
                      <h5 className="font-semibold text-gray-800">Empty Stomach</h5>
                    </div>
                    <div className="space-y-3">
                      {parasiteSupplements.filter(s => s.timing === "empty_stomach").map((supp, idx) => (
                        <div key={idx}>
                          <p className="font-medium text-gray-800 text-sm">{supp.name}</p>
                          <p className="text-gray-600 text-xs">{supp.dosing}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 30 Min Before Meals */}
                  <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-400">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-4 h-4 bg-purple-400 rounded"></div>
                      <h5 className="font-semibold text-gray-800">30 Min Before Meals</h5>
                    </div>
                    <div className="space-y-3">
                      {parasiteSupplements.filter(s => s.timing === "before_meal").map((supp, idx) => (
                        <div key={idx}>
                          <p className="font-medium text-gray-800 text-sm">{supp.name}</p>
                          <p className="text-gray-600 text-xs">{supp.dosing}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Daily Schedule */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h5 className="font-semibold text-gray-800 mb-4">Sample Daily Schedule</h5>
                  <div className="space-y-3 text-sm">
                    <div className="flex gap-4">
                      <span className="font-medium text-gray-700 min-w-24">6:00 AM</span>
                      <span className="text-gray-600">Probiotics + Activated Charcoal (empty stomach)</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="font-medium text-gray-700 min-w-24">7:00 AM</span>
                      <span className="text-gray-600">Breakfast</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="font-medium text-gray-700 min-w-24">7:15 AM</span>
                      <span className="text-gray-600">Black Walnut, Wormwood, Clove, Oregano Oil, Digestive Enzymes (with meal)</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="font-medium text-gray-700 min-w-24">12:00 PM</span>
                      <span className="text-gray-600">Lunch</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="font-medium text-gray-700 min-w-24">8:00 PM</span>
                      <span className="text-gray-600">Magnesium Glycinate (with evening meal)</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Nutritional Protocols Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {protocols.map((protocol) => (
            <div key={protocol.title} className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer group">
              <div className={`bg-gradient-to-r ${protocol.color} p-4 rounded-xl inline-block mb-4 group-hover:scale-110 transition-transform`}>
                <protocol.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#2C3E50] mb-2 group-hover:text-[#52C878] transition-colors">{protocol.title}</h3>
              <p className="text-gray-600">{protocol.desc}</p>
              <div className="mt-4 text-[#52C878] font-medium flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                Learn More →
              </div>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="bg-gradient-to-r from-[#4A90E2] to-[#52C878] rounded-2xl p-8 text-white shadow-xl">
          <h3 className="text-2xl font-bold mb-4">Professional Detox & Wellness Guidance</h3>
          <p className="text-white/90 text-lg mb-6">
            Our protocols are developed by Registered Nutritional Consulting Practitioners (RNCP) and focus on safe, effective methods to restore vitality and optimize health.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-3xl font-bold mb-1">100%</p>
              <p className="text-white/80 text-sm">Evidence-Based</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-3xl font-bold mb-1">RNCP</p>
              <p className="text-white/80 text-sm">Certified</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-3xl font-bold mb-1">24/7</p>
              <p className="text-white/80 text-sm">Access</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
