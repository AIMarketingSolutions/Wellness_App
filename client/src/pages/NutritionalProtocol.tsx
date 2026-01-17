import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, BookOpen, Bug, Heart, Flame, Sparkles, Droplet, Zap, Leaf, Droplets } from "lucide-react";

interface Supplement {
  name: string;
  timing: "with_meal" | "empty_stomach" | "before_meal";
  dosing: string;
}

// Universal Body Health Assessment Questions consolidated from all 10 protocols
const bodyHealthQuestions = [
  // Digestive
  { id: "bloating", label: "Bloating", category: "digestive", score: 1 },
  { id: "gas", label: "Excess gas", category: "digestive", score: 1 },
  { id: "constipation", label: "Constipation", category: "digestive", score: 1 },
  { id: "diarrhea", label: "Diarrhea", category: "digestive", score: 1 },
  { id: "itchy_anus", label: "Itchy anus, especially at night", category: "digestive", score: 2 },
  { id: "nausea_fatty", label: "Nausea after fatty meals", category: "digestive", score: 2 },
  { id: "abdominal_discomfort", label: "Upper right abdominal discomfort", category: "digestive", score: 2 },
  { id: "stomach_cramps", label: "Stomach cramps or abdominal pain", category: "digestive", score: 1 },
  { id: "mucus_stool", label: "Mucus in stool", category: "digestive", score: 2 },
  { id: "undigested_food", label: "Undigested food visible in stool", category: "digestive", score: 1 },
  
  // Energy & Brain
  { id: "morning_fatigue", label: "Morning fatigue", category: "energy", score: 1 },
  { id: "afternoon_crash", label: "Afternoon energy crashes", category: "energy", score: 1 },
  { id: "brain_fog", label: "Brain fog", category: "energy", score: 2 },
  { id: "headaches", label: "Frequent headaches", category: "energy", score: 1 },
  { id: "fatigue_meals", label: "Fatigue after meals", category: "energy", score: 1 },
  { id: "dizziness", label: "Dizziness or lightheadedness", category: "energy", score: 1 },
  { id: "shortness_breath", label: "Shortness of breath", category: "energy", score: 1 },

  // Skin & Allergies
  { id: "itchy_skin", label: "Itchy skin", category: "skin", score: 1 },
  { id: "rashes", label: "Rashes", category: "skin", score: 1 },
  { id: "eczema", label: "Eczema", category: "skin", score: 1 },
  { id: "acne", label: "Acne", category: "skin", score: 1 },
  { id: "food_sensitivities", label: "Food sensitivities", category: "skin", score: 2 },
  { id: "yellow_skin", label: "Yellowish skin or eyes", category: "skin", score: 3 },
  { id: "pale_skin", label: "Pale skin, lips, or nail beds", category: "skin", score: 2 },
  { id: "body_odor", label: "Unexplained body odor", category: "skin", score: 1 },

  // Sleep & Mood
  { id: "stress_anxiety", label: "Stress or anxiety", category: "sleep", score: 1 },
  { id: "sleep_difficulties", label: "Sleep difficulties / Insomnia", category: "sleep", score: 1 },
  { id: "mood_changes", label: "Mood changes or irritability", category: "sleep", score: 1 },
  { id: "hot_flashes", label: "Hot flashes or night sweats", category: "sleep", score: 2 },
  
  // Cravings & Appetite
  { id: "sugar_cravings", label: "Cravings for sugar or refined carbs", category: "appetite", score: 1 },
  { id: "salty_cravings", label: "Cravings for salty foods", category: "appetite", score: 1 },
  { id: "hungry_after_meals", label: "Feeling hungry soon after meals", category: "appetite", score: 1 },
  { id: "poor_appetite", label: "Poor appetite", category: "appetite", score: 1 },
  { id: "weight_gain", label: "Unexplained weight gain", category: "appetite", score: 1 },
  { id: "weight_loss", label: "Unexplained weight loss", category: "appetite", score: 1 },

  // Pain & Physical
  { id: "inflammation", label: "Inflammation", category: "pain", score: 1 },
  { id: "joint_muscle_pain", label: "Joint or muscle pain", category: "pain", score: 1 },
  { id: "swelling", label: "Swelling in extremities", category: "pain", score: 1 },
  { id: "cold_hands_feet", label: "Cold hands and feet", category: "pain", score: 1 },
  { id: "urination_issues", label: "Frequent or painful urination", category: "pain", score: 2 },
  { id: "high_blood_pressure", label: "High blood pressure", category: "pain", score: 1 },
  { id: "vaginal_dryness", label: "Vaginal dryness", category: "pain", score: 2 },

  // History & Exposure
  { id: "travel_history", label: "Travel to high-risk regions", category: "exposure", score: 1 },
  { id: "raw_foods", label: "Frequent raw/undercooked foods", category: "exposure", score: 1 },
  { id: "unfiltered_water", label: "Drinking unfiltered/untreated water", category: "exposure", score: 1 },
  { id: "pets_contact", label: "Close contact with pets", category: "exposure", score: 1 },
  { id: "gardening", label: "Regular gardening/soil exposure", category: "exposure", score: 1 },
  { id: "metal_exposure", label: "Exposure to seafood, dental fillings, old paint, batteries", category: "exposure", score: 1 },
  { id: "toxin_exposure", label: "Exposure to environmental toxins", category: "exposure", score: 1 },
  { id: "medication_history", label: "History of heavy alcohol or medication use", category: "exposure", score: 1 },
  { id: "kidney_history", label: "History of kidney stones or UTIs", category: "exposure", score: 1 },
];

const protocolDetails: { [key: string]: { 
  education: string; 
  whyItMatters: string[]; 
  supplements: Supplement[];
} } = {
  "Parasite Symptoms": {
    education: "Parasites are organisms that live in or on your body and feed on nutrients meant for you. They can inhabit the digestive tract, liver, blood, or tissues. Even low-level infections can cause digestive issues, fatigue, and immune stress.",
    whyItMatters: [
      "Disrupts digestion and nutrient absorption (bloating, gas, diarrhea).",
      "Weakens immunity, increasing susceptibility to infections.",
      "Triggers sugar cravings, as some parasites thrive on glucose.",
      "Can cause skin rashes, eczema, or unexplained itching."
    ],
    supplements: [
      { name: "Black Walnut Hull Extract", timing: "with_meal", dosing: "500–1000 mg" },
      { name: "Wormwood", timing: "with_meal", dosing: "200–400 mg" },
      { name: "Clove Extract", timing: "with_meal", dosing: "350–500 mg" },
      { name: "Oregano Oil", timing: "with_meal", dosing: "1–2 softgels" },
      { name: "Digestive Enzymes", timing: "with_meal", dosing: "1 capsule" },
      { name: "Milk Thistle", timing: "with_meal", dosing: "150–300 mg" },
      { name: "Probiotics", timing: "empty_stomach", dosing: "20–50 billion CFU" },
      { name: "Activated Charcoal", timing: "empty_stomach", dosing: "2 capsules" },
      { name: "Magnesium Glycinate", timing: "before_meal", dosing: "200–400 mg (evening)" }
    ]
  },
  "Leaky Gut": {
    education: "Leaky gut occurs when the intestinal lining becomes permeable, allowing toxins, bacteria, and undigested food to enter the bloodstream. This triggers inflammation, food sensitivities, and autoimmune reactions.",
    whyItMatters: [
      "Causes inflammation throughout the body.",
      "Impairs nutrient absorption, affecting energy, hormone balance, and brain function.",
      "Contributes to skin conditions, fatigue, digestive issues, and mood changes."
    ],
    supplements: [
      { name: "L-Glutamine", timing: "with_meal", dosing: "5–10 g" },
      { name: "Zinc Carnosine", timing: "with_meal", dosing: "75 mg" },
      { name: "Aloe Vera Extract", timing: "with_meal", dosing: "100–200 mg" },
      { name: "Digestive Enzymes", timing: "with_meal", dosing: "With meals" },
      { name: "Probiotics", timing: "empty_stomach", dosing: "20–50 billion CFU" },
      { name: "Omega-3", timing: "empty_stomach", dosing: "1000–2000 mg" },
      { name: "Magnesium Glycinate", timing: "before_meal", dosing: "200–400 mg" }
    ]
  },
  "Adrenal Stress & Cortisol Balance": {
    education: "Adrenal stress occurs when the adrenal glands are overworked, disrupting cortisol production. Cortisol regulates energy, sleep, inflammation, and blood sugar. Chronic stress leads to fatigue, insomnia, mood swings, and metabolic imbalance.",
    whyItMatters: [
      "High cortisol: anxiety, insomnia, midsection weight gain",
      "Low cortisol: fatigue, poor stress recovery, brain fog",
      "Affects blood sugar regulation, immune function, and hormone balance"
    ],
    supplements: [
      { name: "Vitamin C", timing: "with_meal", dosing: "500–1000 mg" },
      { name: "B Complex", timing: "with_meal", dosing: "Daily" },
      { name: "Adaptogens (Ashwagandha, Rhodiola)", timing: "with_meal", dosing: "Daily" },
      { name: "Magnesium Glycinate", timing: "empty_stomach", dosing: "200–400 mg" },
      { name: "L-Theanine", timing: "before_meal", dosing: "100–200 mg" }
    ]
  },
  "Heavy Metal Detox Support": {
    education: "Heavy metals (mercury, lead, cadmium, aluminum, arsenic) accumulate over time from food, environment, and lifestyle. They impair enzyme function, nerve signaling, and detox pathways.",
    whyItMatters: [
      "Causes fatigue, brain fog, headaches",
      "Increases oxidative stress and inflammation",
      "Contributes to joint pain, digestive issues, and cardiovascular risk"
    ],
    supplements: [
      { name: "Chlorella", timing: "with_meal", dosing: "2–5 g" },
      { name: "Cilantro Extract", timing: "with_meal", dosing: "500 mg" },
      { name: "Alpha Lipoic Acid", timing: "with_meal", dosing: "200–400 mg" },
      { name: "Selenium", timing: "with_meal", dosing: "100–200 mcg" },
      { name: "Activated Charcoal", timing: "empty_stomach", dosing: "2 capsules" },
      { name: "Magnesium Glycinate", timing: "before_meal", dosing: "200–400 mg" }
    ]
  },
  "Whole Body Detox": {
    education: "Detoxification is your body’s natural elimination of metabolic waste, environmental toxins, and excess hormones. Supporting liver, kidneys, lymph, gut, and skin pathways optimizes energy and overall wellness.",
    whyItMatters: [
      "Reduces fatigue and brain fog",
      "Improves skin clarity, digestion, and immune function",
      "Enhances metabolism and overall vitality"
    ],
    supplements: [
      { name: "Milk Thistle", timing: "with_meal", dosing: "150–300 mg" },
      { name: "NAC", timing: "with_meal", dosing: "600–1200 mg" },
      { name: "Fiber (Psyllium, Flaxseed)", timing: "with_meal", dosing: "Daily" },
      { name: "Probiotics", timing: "empty_stomach", dosing: "20–50 billion CFU" },
      { name: "Activated Charcoal", timing: "empty_stomach", dosing: "2 capsules" },
      { name: "Magnesium Citrate/Glycinate", timing: "before_meal", dosing: "200–400 mg" }
    ]
  },
  "Liver Detox & Regeneration": {
    education: "The liver metabolizes nutrients, produces bile, stores vitamins, and detoxifies chemicals. Supporting liver health optimizes fat metabolism and reduces toxin load.",
    whyItMatters: [
      "Liver stress causes fatigue, digestive discomfort, and hormonal imbalance",
      "Supports detoxification, energy, and overall metabolism"
    ],
    supplements: [
      { name: "Milk Thistle", timing: "with_meal", dosing: "150–300 mg" },
      { name: "Dandelion Root", timing: "with_meal", dosing: "500–1000 mg" },
      { name: "Artichoke Extract", timing: "with_meal", dosing: "500 mg" },
      { name: "NAC", timing: "with_meal", dosing: "600 mg" },
      { name: "Probiotics", timing: "empty_stomach", dosing: "20–50 billion CFU" },
      { name: "Magnesium Glycinate", timing: "before_meal", dosing: "200–400 mg" }
    ]
  },
  "Kidney Detox": {
    education: "The kidneys filter waste, maintain electrolyte balance, and regulate fluids. Supporting kidney function ensures efficient elimination of toxins and metabolic byproducts.",
    whyItMatters: [
      "Kidney stress causes swelling, fatigue, high blood pressure, and toxin buildup",
      "Supports energy, metabolic balance, and circulatory health"
    ],
    supplements: [
      { name: "Cranberry Extract", timing: "with_meal", dosing: "500–1000 mg" },
      { name: "Dandelion Leaf", timing: "with_meal", dosing: "500 mg" },
      { name: "Magnesium Citrate", timing: "with_meal", dosing: "200–400 mg" },
      { name: "NAC", timing: "empty_stomach", dosing: "600–1200 mg" }
    ]
  },
  "Gallbladder Flush & Bile Flow": {
    education: "The gallbladder stores and releases bile for fat digestion and toxin elimination. Poor bile flow affects digestion, fat absorption, and liver detoxification.",
    whyItMatters: [
      "Improves fat-soluble vitamin absorption (A, D, E, K)",
      "Reduces bloating, nausea, and constipation",
      "Supports liver detox and metabolism"
    ],
    supplements: [
      { name: "Ox Bile", timing: "with_meal", dosing: "500–1000 mg" },
      { name: "Artichoke Extract", timing: "with_meal", dosing: "500 mg" },
      { name: "Milk Thistle", timing: "with_meal", dosing: "150–300 mg" },
      { name: "Probiotics", timing: "empty_stomach", dosing: "20–50 billion CFU" }
    ]
  },
  "Menopausal Symptoms": {
    education: "Menopause is marked by declining estrogen and progesterone. Hormonal shifts affect sleep, metabolism, bone density, and mood.",
    whyItMatters: [
      "Hot flashes, night sweats, and mood swings are common",
      "Impacts energy, quality of life, and long-term health",
      "Supporting hormones naturally reduces symptoms and improves vitality"
    ],
    supplements: [
      { name: "Black Cohosh", timing: "with_meal", dosing: "40–80 mg" },
      { name: "Red Clover", timing: "with_meal", dosing: "40–80 mg" },
      { name: "Omega-3", timing: "with_meal", dosing: "1000–2000 mg" },
      { name: "Vitamin D3/K2", timing: "with_meal", dosing: "1000–2000 IU" },
      { name: "Probiotics", timing: "empty_stomach", dosing: "20–50 billion CFU" },
      { name: "Magnesium Glycinate", timing: "before_meal", dosing: "200–400 mg" }
    ]
  },
  "Anemia": {
    education: "Anemia is a condition where the body lacks healthy red blood cells or hemoglobin, often due to iron deficiency, poor absorption, or blood loss.",
    whyItMatters: [
      "Reduces oxygen delivery to tissues causing fatigue, weakness, and poor concentration",
      "Affects energy, cardiovascular function, and immunity",
      "Supporting iron, vitamin B12, and folate restores healthy red blood cell formation"
    ],
    supplements: [
      { name: "Copper", timing: "with_meal", dosing: "500 mg" },
      { name: "Vitamin C", timing: "with_meal", dosing: "500 mg" },
      { name: "B12 (Methylcobalamin)", timing: "with_meal", dosing: "1000 mcg" },
      { name: "Folate", timing: "with_meal", dosing: "400–800 mcg" },
      { name: "Probiotics", timing: "empty_stomach", dosing: "20–50 billion CFU" }
    ]
  }
};

export default function NutritionalProtocol() {
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: boolean }>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState<string | null>(null);

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

  const handleQuizAnswer = (questionId: string, value: boolean) => {
    setQuizAnswers(prev => ({ ...prev, [questionId]: value }));
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

  const renderProtocolDetails = (title: string) => {
    const details = protocolDetails[title];
    if (!details) return null;

    return (
      <div className="mt-8 space-y-6 border-t border-gray-100 pt-6 animate-in fade-in slide-in-from-top-4 duration-300">
        <div>
          <h4 className="text-lg font-bold text-[#2C3E50] mb-2 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#52C878]" />
            Education
          </h4>
          <p className="text-gray-700 text-sm leading-relaxed">
            {details.education}
          </p>
        </div>

        <div>
          <h4 className="text-lg font-bold text-[#2C3E50] mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#4A90E2]" />
            Why It Matters
          </h4>
          <ul className="list-disc list-inside space-y-2">
            {details.whyItMatters.map((item, i) => (
              <li key={i} className="text-gray-600 text-sm">{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-bold text-[#2C3E50] mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-400" />
            Supplement Protocol
          </h4>
          <div className="grid grid-cols-1 gap-4">
            {["with_meal", "empty_stomach", "before_meal"].map(timing => {
              const timingSupps = details.supplements.filter(s => s.timing === timing);
              if (timingSupps.length === 0) return null;

              const timingLabels: { [key: string]: { label: string, color: string, border: string } } = {
                with_meal: { label: "With Meals", color: "bg-orange-50", border: "border-orange-400" },
                empty_stomach: { label: "Empty Stomach", color: "bg-blue-50", border: "border-blue-400" },
                before_meal: { label: "30 Min Before Meals", color: "bg-purple-50", border: "border-purple-400" }
              };

              return (
                <div key={timing} className={`${timingLabels[timing].color} rounded-lg p-4 border-l-4 ${timingLabels[timing].border}`}>
                  <h5 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${timingLabels[timing].border.replace('border', 'bg')}`}></div>
                    {timingLabels[timing].label}
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {timingSupps.map((supp, idx) => (
                      <div key={idx} className="bg-white/50 p-2 rounded">
                        <p className="font-semibold text-gray-800 text-sm">{supp.name}</p>
                        <p className="text-gray-600 text-xs">{supp.dosing}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
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
          <h1 className="text-4xl font-bold text-[#2C3E50] mb-2">Wellness Protocol Builder</h1>
          <p className="text-sm text-gray-500 italic mb-3">Complete your symptom assessment and generate a personalized support plan.</p>
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
              <div className="max-h-[500px] overflow-y-auto space-y-6 pr-2">
                {["digestive", "energy", "skin", "sleep", "appetite", "pain", "exposure"].map(category => {
                  const categoryQuestions = bodyHealthQuestions.filter(q => q.category === category);
                  const categoryLabels: { [key: string]: string } = {
                    digestive: "Digestive Health",
                    energy: "Energy & Cognition",
                    skin: "Skin & Allergies",
                    sleep: "Sleep & Mood",
                    appetite: "Appetite & Weight",
                    pain: "Pain & Physical",
                    exposure: "Exposure History"
                  };

                  if (categoryQuestions.length === 0) return null;

                  return (
                    <div key={category}>
                      <h4 className="font-semibold text-[#2C3E50] mb-3 text-lg">{categoryLabels[category]}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-gray-50 rounded-lg p-4">
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

        {/* Nutritional Protocols Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {protocols.map((protocol) => (
            <div 
              key={protocol.title} 
              className={`bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer group ${selectedProtocol === protocol.title ? 'ring-2 ring-[#52C878]' : ''}`}
              onClick={() => setSelectedProtocol(selectedProtocol === protocol.title ? null : protocol.title)}
            >
              <div className="flex justify-between items-start">
                <div className={`bg-gradient-to-r ${protocol.color} p-4 rounded-xl inline-block mb-4 group-hover:scale-110 transition-transform`}>
                  <protocol.icon className="w-8 h-8 text-white" />
                </div>
                {selectedProtocol === protocol.title && (
                  <span className="bg-[#52C878]/10 text-[#52C878] text-xs font-bold px-2 py-1 rounded">Active View</span>
                )}
              </div>
              <h3 className="text-2xl font-bold text-[#2C3E50] mb-2 group-hover:text-[#52C878] transition-colors">{protocol.title}</h3>
              <p className="text-gray-600 mb-4">{protocol.desc}</p>
              
              <div className="text-[#52C878] font-medium flex items-center gap-2">
                {selectedProtocol === protocol.title ? 'Hide Details ↑' : 'Learn More ↓'}
              </div>

              {selectedProtocol === protocol.title && renderProtocolDetails(protocol.title)}
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
