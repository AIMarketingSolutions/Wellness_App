import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, BookOpen, Bug, Heart, Flame, Sparkles, Droplet, Zap, Shield, ChevronDown, ChevronUp, CheckCircle, AlertCircle, Clock, Coffee, Utensils } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface QuizAnswer {
  [key: string]: boolean;
}

interface Supplement {
  name: string;
  timing: "with_meal" | "empty_stomach" | "before_meal";
  dosing: string;
}

const supplements: Supplement[] = [
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

const quizQuestions = [
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

const parasiteHandoutSections = [
  {
    title: "What Are Parasites?",
    content: "Parasites are organisms that live in or on the human body and use your nutrients to survive. They can inhabit the digestive tract, liver, blood, and other tissues.",
    bullets: ["Parasites may come from food, water, soil, or contact with animals.", "They can interfere with digestion, nutrient absorption, and immune health.", "Many people with mild infections do not realize parasites may be involved."],
  },
  {
    title: "Common Symptoms of Possible Parasite Involvement",
    content: "Symptoms vary widely, but some patterns are common.",
    bullets: ["Digestive issues: bloating, gas, constipation, diarrhea, cramping", "Unexplained fatigue or low energy", "Brain fog or difficulty concentrating", "Skin issues such as itching, rashes, or hives", "Sugar or refined carbohydrate cravings", "Sleep disturbances, including waking between 1–3 AM", "Unexplained weight loss or difficulty gaining weight"],
  },
  {
    title: "Where Do Parasites Come From?",
    content: "Parasites often enter the body through everyday exposures.",
    bullets: ["Undercooked or raw meat and fish", "Unwashed fruits and vegetables", "Contaminated or untreated water", "Travel to regions with lower sanitation standards", "Close contact with pets and animals", "Soil contact while gardening or farming"],
  },
  {
    title: "Why Untreated Parasites Can Be a Problem",
    content: "Unchecked parasites can contribute to broader health challenges.",
    bullets: ["Ongoing digestive discomfort and altered bowel habits", "Nutrient deficiencies due to poor absorption", "Chronic fatigue or low resilience", "Increased inflammation and immune activation", "Disruption of the gut–brain connection, affecting mood and cognition"],
  },
];

export default function NutritionalProtocol() {
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [showParasiteSection, setShowParasiteSection] = useState(false);
  const [expandedParasiteTab, setExpandedParasiteTab] = useState<string | null>(null);
  const [trackerEntries, setTrackerEntries] = useState<any[]>([]);

  const otherTopics = [
    { 
      title: "Adrenal Stress & Cortisol Balance", 
      desc: "Restore energy and support stress hormone recovery", 
      icon: Heart, 
      color: "from-[#4A90E2] to-[#52C878]",
    },
    { 
      title: "Heavy Metal Detox Support", 
      desc: "Reduce toxic load from mercury, lead, cadmium, aluminum, and arsenic", 
      icon: Flame, 
      color: "from-[#52C878] to-[#4A90E2]",
    },
    { 
      title: "Whole Body Detox", 
      desc: "Support all major elimination pathways for complete wellness", 
      icon: Sparkles, 
      color: "from-[#4A90E2] to-[#52C878]",
    },
    { 
      title: "Liver Detox & Regeneration", 
      desc: "Optimize your primary fat-burning and detox organ", 
      icon: Zap, 
      color: "from-[#52C878] to-[#4A90E2]",
    },
    { 
      title: "Kidney Detox", 
      desc: "Filter acids, toxins, and metabolic waste effectively", 
      icon: Droplet, 
      color: "from-[#4A90E2] to-[#52C878]",
    },
    { 
      title: "Gallbladder Flush & Bile Flow", 
      desc: "Optimize fat digestion and toxin elimination", 
      icon: BookOpen, 
      color: "from-[#52C878] to-[#4A90E2]",
    },
  ];

  const handleQuizAnswer = (questionId: string, value: boolean) => {
    setQuizAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const submitQuiz = () => {
    let score = 0;
    quizQuestions.forEach(q => {
      if (quizAnswers[q.id]) score += q.score;
    });
    setQuizScore(score);
    
    if (score >= 16) {
      setShowParasiteSection(true);
      setExpandedParasiteTab("symptom-tracker");
    }
  };

  const getRiskLevel = (score: number) => {
    if (score <= 7) return { label: "Low likelihood", color: "text-green-600", bgColor: "bg-green-50" };
    if (score <= 15) return { label: "Moderate likelihood", color: "text-yellow-600", bgColor: "bg-yellow-50" };
    if (score <= 24) return { label: "High likelihood", color: "text-orange-600", bgColor: "bg-orange-50" };
    return { label: "Very high likelihood", color: "text-red-600", bgColor: "bg-red-50" };
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
          <p className="text-lg text-gray-600">
            Comprehensive detoxification and wellness strategies from certified nutritional practitioners
          </p>
        </div>

        {/* Body Health Assessment - Top Center */}
        <div className="mb-12 max-w-2xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-blue-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-r from-[#4A90E2] to-[#52C878] p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-[#2C3E50]">Body Health Assessment</h2>
            </div>
            
            <p className="text-gray-600 mb-6">Complete this assessment to determine if parasite support may be beneficial for you. Select all symptoms you've experienced.</p>

            <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
              {["digestive", "energy", "skin", "sleep", "appetite", "exposure"].map(category => (
                <div key={category} className="border-b pb-4">
                  <h4 className="font-semibold text-[#2C3E50] mb-3 capitalize">{category === "digestive" ? "Digestive" : category === "energy" ? "Energy & Cognitive" : category === "skin" ? "Skin & Allergy" : category === "sleep" ? "Sleep & Mood" : category === "appetite" ? "Appetite & Cravings" : "Exposure & Risk"}</h4>
                  <div className="space-y-2">
                    {quizQuestions.filter(q => q.category === category).map(q => (
                      <label key={q.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition">
                        <input
                          type="checkbox"
                          checked={quizAnswers[q.id] || false}
                          onChange={(e) => handleQuizAnswer(q.id, e.target.checked)}
                          className="w-4 h-4 rounded text-[#52C878]"
                          data-testid={`checkbox-${q.id}`}
                        />
                        <span className="text-gray-700">{q.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={submitQuiz}
              className="mt-6 w-full bg-gradient-to-r from-[#4A90E2] to-[#52C878] text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
              data-testid="button-submit-assessment"
            >
              Get Results
            </button>

            {quizScore !== null && (
              <div className={`mt-6 p-4 rounded-lg ${getRiskLevel(quizScore).bgColor}`}>
                <div className="flex items-start gap-3">
                  <AlertCircle className={`w-5 h-5 ${getRiskLevel(quizScore).color} mt-1 flex-shrink-0`} />
                  <div>
                    <p className={`font-semibold ${getRiskLevel(quizScore).color}`}>
                      Risk Level: {getRiskLevel(quizScore).label}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">Score: {quizScore} points</p>
                    {quizScore >= 16 && (
                      <p className="text-sm text-gray-700 mt-2">Your assessment indicates a high likelihood of parasite involvement. Review the Parasite Symptom section below for support options.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Parasite Symptom Section - Auto-open if high likelihood */}
        {(showParasiteSection || quizScore === null) && (
          <div className="mb-12">
            <button
              onClick={() => setShowParasiteSection(!showParasiteSection)}
              className="w-full bg-gradient-to-r from-[#52C878] to-[#4A90E2] text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-between hover:shadow-lg transition-all mb-2"
              data-testid="button-toggle-parasite"
            >
              <div className="flex items-center gap-3">
                <Bug className="w-6 h-6" />
                <span>Parasite Symptom</span>
              </div>
              {showParasiteSection ? <ChevronUp /> : <ChevronDown />}
            </button>

            {showParasiteSection && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-green-100">
                <Tabs defaultValue={expandedParasiteTab || "symptom-tracker"} className="space-y-6">
                  <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg">
                    <TabsTrigger value="symptom-tracker" data-testid="tab-symptom-tracker">Tracker</TabsTrigger>
                    <TabsTrigger value="handout" data-testid="tab-handout">Education</TabsTrigger>
                    <TabsTrigger value="supplements" data-testid="tab-supplements">Supplements</TabsTrigger>
                  </TabsList>

                  {/* Symptom Tracker */}
                  <TabsContent value="symptom-tracker" className="space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold text-[#2C3E50] mb-2">Daily Symptom Tracker</h3>
                      <p className="text-gray-600 mb-4">Track your symptoms daily during your parasite support protocol. Use a 0-10 scale where 0 = none and 10 = very severe.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                        <h4 className="font-semibold text-[#2C3E50] mb-2">Digestive Symptoms</h4>
                        {["Bloating", "Gas", "Cramping", "Anal Itching"].map(symptom => (
                          <div key={symptom} className="flex items-center justify-between py-2">
                            <span className="text-sm text-gray-700">{symptom}</span>
                            <input type="range" min="0" max="10" className="w-24" data-testid={`slider-${symptom}`} />
                          </div>
                        ))}
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                        <h4 className="font-semibold text-[#2C3E50] mb-2">Energy & Mood</h4>
                        {["Energy Level", "Brain Fog", "Mood", "Sleep Quality"].map(symptom => (
                          <div key={symptom} className="flex items-center justify-between py-2">
                            <span className="text-sm text-gray-700">{symptom}</span>
                            <input type="range" min="0" max="10" className="w-24" data-testid={`slider-${symptom}`} />
                          </div>
                        ))}
                      </div>
                    </div>

                    <button className="w-full bg-gradient-to-r from-[#4A90E2] to-[#52C878] text-white py-2 px-4 rounded-lg font-semibold hover:shadow-lg transition-all" data-testid="button-save-tracker">Save Daily Entry</button>
                  </TabsContent>

                  {/* Client Handout */}
                  <TabsContent value="handout" className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold text-[#2C3E50] mb-2">Parasites 101 – What You Need to Know</h3>
                      <p className="text-gray-600 mb-4">Understanding symptoms, risks, and safe support strategies.</p>
                    </div>

                    {parasiteHandoutSections.map((section, idx) => (
                      <div key={idx} className="border-l-4 border-[#52C878] pl-4 py-2">
                        <h4 className="font-semibold text-[#2C3E50] mb-2">{section.title}</h4>
                        <p className="text-gray-700 mb-2">{section.content}</p>
                        <ul className="list-disc list-inside space-y-1">
                          {section.bullets.map((bullet, bidx) => (
                            <li key={bidx} className="text-sm text-gray-600">{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </TabsContent>

                  {/* Supplement Protocol with Timing Chart */}
                  <TabsContent value="supplements" className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold text-[#2C3E50] mb-2">Parasite Support Supplement Framework</h3>
                      <p className="text-gray-600 mb-4">This framework is for professional education only. All supplements should be personalized and supervised by a qualified healthcare provider.</p>
                    </div>

                    {/* Supplement Timing Chart */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200 space-y-4">
                      <h4 className="font-semibold text-[#2C3E50] text-lg mb-4">Daily Supplement Timing Guide</h4>
                      
                      {/* With Meals */}
                      <div className="bg-white rounded-lg p-4 border-l-4 border-orange-400">
                        <div className="flex items-center gap-2 mb-3">
                          <Utensils className="w-5 h-5 text-orange-500" />
                          <h5 className="font-semibold text-gray-800">Take With Meals</h5>
                        </div>
                        <div className="space-y-2">
                          {supplements.filter(s => s.timing === "with_meal").map((supp, idx) => (
                            <div key={idx} className="flex items-start justify-between text-sm bg-orange-50 p-2 rounded">
                              <div>
                                <p className="font-medium text-gray-800">{supp.name}</p>
                                <p className="text-xs text-gray-600">{supp.dosing}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* On Empty Stomach */}
                      <div className="bg-white rounded-lg p-4 border-l-4 border-blue-400">
                        <div className="flex items-center gap-2 mb-3">
                          <Coffee className="w-5 h-5 text-blue-500" />
                          <h5 className="font-semibold text-gray-800">Take on Empty Stomach</h5>
                        </div>
                        <div className="space-y-2">
                          {supplements.filter(s => s.timing === "empty_stomach").map((supp, idx) => (
                            <div key={idx} className="flex items-start justify-between text-sm bg-blue-50 p-2 rounded">
                              <div>
                                <p className="font-medium text-gray-800">{supp.name}</p>
                                <p className="text-xs text-gray-600">{supp.dosing}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 30 Minutes Before Meals */}
                      <div className="bg-white rounded-lg p-4 border-l-4 border-purple-400">
                        <div className="flex items-center gap-2 mb-3">
                          <Clock className="w-5 h-5 text-purple-500" />
                          <h5 className="font-semibold text-gray-800">Take 30 Minutes Before Meals</h5>
                        </div>
                        <div className="space-y-2">
                          {supplements.filter(s => s.timing === "before_meal").map((supp, idx) => (
                            <div key={idx} className="flex items-start justify-between text-sm bg-purple-50 p-2 rounded">
                              <div>
                                <p className="font-medium text-gray-800">{supp.name}</p>
                                <p className="text-xs text-gray-600">{supp.dosing}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                      <p className="font-semibold mb-2">⚠️ Important Disclaimer</p>
                      <p>This protocol is for professional education and client discussion only. It is not a prescription or individualized medical advice. All supplement use should be personalized and supervised by a qualified healthcare provider.</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        )}

        {/* Other Detox Sections */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#2C3E50] mb-6 text-center">Additional Support Protocols</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {otherTopics.map((topic) => (
              <div key={topic.title} className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer group">
                <div className={`bg-gradient-to-r ${topic.color} p-4 rounded-xl inline-block mb-4 group-hover:scale-110 transition-transform`}>
                  <topic.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-[#2C3E50] mb-2 group-hover:text-[#52C878] transition-colors">{topic.title}</h3>
                <p className="text-gray-600">{topic.desc}</p>
                <div className="mt-4 text-[#52C878] font-medium flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn More →
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-gradient-to-r from-[#4A90E2] to-[#52C878] rounded-2xl p-8 text-white shadow-xl">
          <h3 className="text-2xl font-bold mb-4">Professional Detox & Wellness Guidance</h3>
          <p className="text-white/90 text-lg mb-6">
            Our detoxification and organ support protocols are developed by Registered Nutritional Consulting Practitioners (RNCP) 
            and focus on safe, effective methods to restore vitality, reduce toxic burden, and optimize metabolic function.
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
