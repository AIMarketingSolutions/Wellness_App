import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, BookOpen, Bug, Heart, Flame, Sparkles, Droplet, Zap, ChevronDown, ChevronUp, Clock, Coffee, Utensils } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface QuizAnswer {
  [key: string]: boolean;
}

interface ProtocolState {
  quizAnswers: QuizAnswer;
  quizScore: number | null;
  isExpanded: boolean;
}

interface Supplement {
  name: string;
  timing: "with_meal" | "empty_stomach" | "before_meal";
  dosing: string;
}

interface ProtocolConfig {
  id: string;
  title: string;
  icon: any;
  color: string;
  description: string;
  quizQuestions: Array<{ id: string; label: string; category: string; score: number }>;
  handoutSections: Array<{ title: string; content: string; bullets: string[] }>;
  supplements: Supplement[];
}

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

const leakyGutSupplements: Supplement[] = [
  { name: "L-Glutamine", timing: "empty_stomach", dosing: "5-10g daily" },
  { name: "Bone Broth Powder", timing: "with_meal", dosing: "1-2 scoops daily" },
  { name: "Zinc Carnosine", timing: "empty_stomach", dosing: "75mg twice daily" },
  { name: "Slippery Elm", timing: "before_meal", dosing: "400-500mg twice daily" },
  { name: "Aloe Vera", timing: "empty_stomach", dosing: "2-3 oz daily" },
  { name: "Probiotics", timing: "empty_stomach", dosing: "25-50 billion CFU daily" },
];

const parasiteQuizQuestions = [
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

const leakyGutQuizQuestions = [
  { id: "bloating_lg", label: "Bloating after meals", category: "digestive", score: 1 },
  { id: "gas_lg", label: "Gas and cramping", category: "digestive", score: 1 },
  { id: "diarrhea_lg", label: "Diarrhea or loose stools", category: "digestive", score: 1 },
  { id: "food_sensitivities", label: "Food sensitivities or intolerances", category: "digestive", score: 2 },
  { id: "abdominal_pain", label: "Abdominal pain or discomfort", category: "digestive", score: 1 },
  { id: "brain_fog_lg", label: "Brain fog or mental fatigue", category: "energy", score: 2 },
  { id: "fatigue_lg", label: "Chronic fatigue", category: "energy", score: 1 },
  { id: "joint_pain", label: "Joint or muscle pain", category: "skin", score: 1 },
  { id: "skin_issues", label: "Skin issues (eczema, acne, psoriasis)", category: "skin", score: 1 },
  { id: "food_reactions", label: "Reactions to foods previously tolerated", category: "appetite", score: 2 },
  { id: "autoimmune", label: "Autoimmune symptoms", category: "energy", score: 2 },
  { id: "infections", label: "Recurring infections or immune issues", category: "sleep", score: 1 },
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

const leakyGutHandoutSections = [
  {
    title: "What is Leaky Gut?",
    content: "Leaky gut (intestinal permeability) occurs when the tight junctions in the intestinal lining become compromised.",
    bullets: ["Allows partially digested food and toxins to pass into the bloodstream", "Triggers immune responses and inflammation", "Can contribute to food sensitivities and autoimmune conditions"],
  },
  {
    title: "Common Symptoms",
    content: "Leaky gut manifests through various symptoms.",
    bullets: ["Digestive issues including bloating and cramping", "Food sensitivities that develop suddenly", "Brain fog and cognitive issues", "Joint and muscle pain", "Skin conditions like eczema or acne"],
  },
];

const protocols: ProtocolConfig[] = [
  {
    id: "parasite",
    title: "Parasite Symptom",
    icon: Bug,
    color: "from-[#52C878] to-[#4A90E2]",
    description: "Identify and support parasitic burdens affecting digestion and immunity",
    quizQuestions: parasiteQuizQuestions,
    handoutSections: parasiteHandoutSections,
    supplements: parasiteSupplements,
  },
  {
    id: "leaky_gut",
    title: "Leaky Gut",
    icon: Heart,
    color: "from-[#4A90E2] to-[#52C878]",
    description: "Restore intestinal barrier integrity and reduce inflammation",
    quizQuestions: leakyGutQuizQuestions,
    handoutSections: leakyGutHandoutSections,
    supplements: leakyGutSupplements,
  },
];

const otherProtocols = [
  { title: "Adrenal Stress & Cortisol Balance", desc: "Restore energy and support stress hormone recovery", icon: Heart, color: "from-[#4A90E2] to-[#52C878]" },
  { title: "Heavy Metal Detox Support", desc: "Reduce toxic load from mercury, lead, cadmium, aluminum, and arsenic", icon: Flame, color: "from-[#52C878] to-[#4A90E2]" },
  { title: "Whole Body Detox", desc: "Support all major elimination pathways", icon: Sparkles, color: "from-[#4A90E2] to-[#52C878]" },
  { title: "Liver Detox & Regeneration", desc: "Optimize your primary fat-burning and detox organ", icon: Zap, color: "from-[#52C878] to-[#4A90E2]" },
  { title: "Kidney Detox", desc: "Filter acids, toxins, and metabolic waste effectively", icon: Droplet, color: "from-[#4A90E2] to-[#52C878]" },
  { title: "Gallbladder Flush & Bile Flow", desc: "Optimize fat digestion and toxin elimination", icon: BookOpen, color: "from-[#52C878] to-[#4A90E2]" },
];

function ProtocolSection({ protocol }: { protocol: ProtocolConfig }) {
  const [state, setState] = useState<ProtocolState>({
    quizAnswers: {},
    quizScore: null,
    isExpanded: false,
  });

  const handleQuizAnswer = (questionId: string, value: boolean) => {
    setState(prev => ({
      ...prev,
      quizAnswers: { ...prev.quizAnswers, [questionId]: value }
    }));
  };

  const submitQuiz = () => {
    let score = 0;
    protocol.quizQuestions.forEach(q => {
      if (state.quizAnswers[q.id]) score += q.score;
    });
    setState(prev => ({ ...prev, quizScore: score }));
  };

  const getRiskLevel = (score: number) => {
    if (score <= 7) return { label: "Low", color: "text-green-600", bgColor: "bg-green-50" };
    if (score <= 15) return { label: "Moderate", color: "text-yellow-600", bgColor: "bg-yellow-50" };
    if (score <= 24) return { label: "High", color: "text-orange-600", bgColor: "bg-orange-50" };
    return { label: "Very High", color: "text-red-600", bgColor: "bg-red-50" };
  };

  return (
    <div className="mb-8">
      <button
        onClick={() => setState(prev => ({ ...prev, isExpanded: !prev.isExpanded }))}
        className={`w-full bg-gradient-to-r ${protocol.color} text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-between hover:shadow-lg transition-all mb-2`}
        data-testid={`button-toggle-${protocol.id}`}
      >
        <div className="flex items-center gap-3">
          <protocol.icon className="w-6 h-6" />
          <span>{protocol.title}</span>
        </div>
        {state.isExpanded ? <ChevronUp /> : <ChevronDown />}
      </button>

      {state.isExpanded && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100 space-y-6">
          {/* Body Health Assessment */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <h3 className="text-2xl font-bold text-[#2C3E50] mb-3">Body Health Assessment</h3>
            <p className="text-gray-600 mb-4 text-sm">Complete this assessment to determine if support may be beneficial.</p>

            <div className="space-y-4 max-h-80 overflow-y-auto pr-2 mb-4">
              {["digestive", "energy", "skin", "sleep", "appetite", "exposure"].map(category => {
                const categoryQuestions = protocol.quizQuestions.filter(q => q.category === category);
                if (categoryQuestions.length === 0) return null;
                return (
                  <div key={category}>
                    <h4 className="font-semibold text-[#2C3E50] mb-2 text-sm capitalize">{category === "digestive" ? "Digestive" : category === "energy" ? "Energy" : category === "skin" ? "Skin" : category === "sleep" ? "Sleep" : category === "appetite" ? "Appetite" : "Exposure"}</h4>
                    <div className="space-y-2">
                      {categoryQuestions.map(q => (
                        <label key={q.id} className="flex items-center gap-2 cursor-pointer text-sm hover:bg-white/50 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={state.quizAnswers[q.id] || false}
                            onChange={(e) => handleQuizAnswer(q.id, e.target.checked)}
                            className="w-4 h-4 rounded"
                            data-testid={`checkbox-${q.id}`}
                          />
                          <span className="text-gray-700">{q.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={submitQuiz}
              className="w-full bg-gradient-to-r from-[#4A90E2] to-[#52C878] text-white py-2 px-4 rounded-lg font-semibold hover:shadow-lg transition-all text-sm"
              data-testid={`button-submit-${protocol.id}`}
            >
              Get Results
            </button>

            {state.quizScore !== null && (
              <div className={`mt-4 p-3 rounded-lg ${getRiskLevel(state.quizScore).bgColor}`}>
                <p className={`font-semibold ${getRiskLevel(state.quizScore).color} text-sm`}>
                  Risk Level: {getRiskLevel(state.quizScore).label} (Score: {state.quizScore})
                </p>
              </div>
            )}
          </div>

          {/* Tabs for Symptom Tracker, Education, Supplements */}
          <Tabs defaultValue="symptom-tracker" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="symptom-tracker" data-testid={`tab-symptom-${protocol.id}`}>Symptom Tracker</TabsTrigger>
              <TabsTrigger value="education" data-testid={`tab-education-${protocol.id}`}>Education</TabsTrigger>
              <TabsTrigger value="supplements" data-testid={`tab-supplements-${protocol.id}`}>Supplements</TabsTrigger>
            </TabsList>

            {/* Symptom Tracker */}
            <TabsContent value="symptom-tracker" className="space-y-4">
              <h4 className="font-bold text-[#2C3E50]">Daily Symptom Tracker</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <h5 className="font-semibold text-sm text-[#2C3E50] mb-2">Digestive</h5>
                  {["Bloating", "Gas", "Cramping", "Discomfort"].map(s => (
                    <div key={s} className="flex justify-between items-center text-xs py-1">
                      <span>{s}</span>
                      <input type="range" min="0" max="10" className="w-16" data-testid={`slider-${protocol.id}-${s}`} />
                    </div>
                  ))}
                </div>
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <h5 className="font-semibold text-sm text-[#2C3E50] mb-2">Energy & Mood</h5>
                  {["Energy", "Brain Fog", "Mood", "Sleep"].map(s => (
                    <div key={s} className="flex justify-between items-center text-xs py-1">
                      <span>{s}</span>
                      <input type="range" min="0" max="10" className="w-16" data-testid={`slider-${protocol.id}-${s}`} />
                    </div>
                  ))}
                </div>
              </div>
              <button className="w-full bg-gradient-to-r from-[#4A90E2] to-[#52C878] text-white py-2 rounded-lg font-semibold text-sm hover:shadow-lg transition-all" data-testid={`button-save-${protocol.id}`}>Save Entry</button>
            </TabsContent>

            {/* Education */}
            <TabsContent value="education" className="space-y-3">
              {protocol.handoutSections.map((section, idx) => (
                <div key={idx} className="border-l-4 border-[#52C878] pl-3 py-2">
                  <h4 className="font-semibold text-[#2C3E50] text-sm mb-1">{section.title}</h4>
                  <p className="text-gray-700 text-xs mb-2">{section.content}</p>
                  <ul className="list-disc list-inside space-y-1">
                    {section.bullets.map((bullet, bidx) => (
                      <li key={bidx} className="text-xs text-gray-600">{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </TabsContent>

            {/* Supplements */}
            <TabsContent value="supplements" className="space-y-3">
              <div className="space-y-2">
                <div className="bg-orange-50 rounded-lg p-3 border-l-4 border-orange-400">
                  <div className="flex items-center gap-2 mb-2">
                    <Utensils className="w-4 h-4 text-orange-500" />
                    <h5 className="font-semibold text-sm text-gray-800">With Meals</h5>
                  </div>
                  {protocol.supplements.filter(s => s.timing === "with_meal").map((supp, idx) => (
                    <div key={idx} className="text-xs text-gray-700 py-1">
                      <p className="font-medium">{supp.name}</p>
                      <p className="text-gray-600">{supp.dosing}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-400">
                  <div className="flex items-center gap-2 mb-2">
                    <Coffee className="w-4 h-4 text-blue-500" />
                    <h5 className="font-semibold text-sm text-gray-800">Empty Stomach</h5>
                  </div>
                  {protocol.supplements.filter(s => s.timing === "empty_stomach").map((supp, idx) => (
                    <div key={idx} className="text-xs text-gray-700 py-1">
                      <p className="font-medium">{supp.name}</p>
                      <p className="text-gray-600">{supp.dosing}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-purple-50 rounded-lg p-3 border-l-4 border-purple-400">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-purple-500" />
                    <h5 className="font-semibold text-sm text-gray-800">30 Min Before Meals</h5>
                  </div>
                  {protocol.supplements.filter(s => s.timing === "before_meal").map((supp, idx) => (
                    <div key={idx} className="text-xs text-gray-700 py-1">
                      <p className="font-medium">{supp.name}</p>
                      <p className="text-gray-600">{supp.dosing}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}

export default function NutritionalProtocol() {
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

        {/* Protocol Sections with Independent Assessments */}
        <div className="space-y-6 mb-12">
          {protocols.map(protocol => (
            <ProtocolSection key={protocol.id} protocol={protocol} />
          ))}
        </div>

        {/* Other Protocols */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#2C3E50] mb-6 text-center">Additional Support Protocols</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {otherProtocols.map((topic) => (
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
