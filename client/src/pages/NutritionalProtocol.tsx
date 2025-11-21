import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, BookOpen, Bug, Heart, Flame, Sparkles, Droplet, Zap, Leaf, Droplets } from "lucide-react";

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
                  <p className={`${getRiskLevel(quizScore).color} font-semibold mb-3`}>Total Score: {quizScore} points</p>
                  {quizScore >= 16 && (
                    <p className="text-gray-800 font-semibold">Your assessment indicates a potential parasitic burden. See the Parasite Symptoms section below for targeted support strategies.</p>
                  )}
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
