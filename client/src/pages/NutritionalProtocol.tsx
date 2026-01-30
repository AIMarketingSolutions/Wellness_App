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
  const [showResults, setShowResults] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { id: "digestive", label: "Digestive Health" },
    { id: "energy", label: "Energy & Cognition" },
    { id: "skin", label: "Skin & Allergies" },
    { id: "sleep", label: "Sleep & Mood" },
    { id: "appetite", label: "Appetite & Weight" },
    { id: "pain", label: "Pain & Physical Function" },
    { id: "exposure", label: "Exposure History" }
  ];

  const handleQuizAnswer = (questionId: string, value: boolean) => {
    setQuizAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const getPriorityData = () => {
    const categories = steps.map(s => s.id);
    const results = categories.map(cat => {
      const catQuestions = bodyHealthQuestions.filter(q => q.category === cat);
      const score = catQuestions.reduce((acc, q) => acc + (quizAnswers[q.id] ? q.score : 0), 0);
      const maxScore = catQuestions.reduce((acc, q) => acc + q.score, 0);
      const ratio = score / maxScore;
      
      let priority: "High" | "Medium" | "Low" = "Low";
      if (ratio > 0.4) priority = "High";
      else if (ratio > 0.1) priority = "Medium";

      // Map categories to relevant protocols
      const protocolMap: { [key: string]: string[] } = {
        digestive: ["Parasite Symptoms", "Leaky Gut", "Gallbladder Flush & Bile Flow"],
        energy: ["Adrenal Stress & Cortisol Balance", "Anemia"],
        skin: ["Leaky Gut", "Whole Body Detox"],
        sleep: ["Adrenal Stress & Cortisol Balance", "Menopausal Symptoms"],
        appetite: ["Liver Detox & Regeneration", "Whole Body Detox"],
        pain: ["Heavy Metal Detox Support", "Whole Body Detox"],
        exposure: ["Heavy Metal Detox Support", "Parasite Symptoms", "Kidney Detox"]
      };

      return {
        category: cat,
        label: steps.find(s => s.id === cat)?.label || cat,
        score,
        priority,
        protocols: protocolMap[cat] || []
      };
    });

    return results.sort((a, b) => {
      const priorityOrder = { High: 0, Medium: 1, Low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  };

  const renderStep = () => {
    const step = steps[currentStep];
    const categoryQuestions = bodyHealthQuestions.filter(q => q.category === step.id);

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-[#2C3E50] text-2xl">{step.label}</h4>
          <span className="text-sm font-medium text-gray-500">Step {currentStep + 1} of {steps.length}</span>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
          <p className="text-gray-600 mb-6 italic">Please select the symptoms you experience on a daily basis.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categoryQuestions.map(q => (
              <label key={q.id} className="flex items-center gap-3 cursor-pointer bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-[#52C878] hover:shadow-md transition-all group">
                <input
                  type="checkbox"
                  checked={quizAnswers[q.id] || false}
                  onChange={(e) => handleQuizAnswer(q.id, e.target.checked)}
                  className="w-5 h-5 rounded accent-[#52C878] cursor-pointer"
                  data-testid={`checkbox-${q.id}`}
                />
                <span className="text-gray-700 font-medium group-hover:text-[#2C3E50]">{q.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          {currentStep > 0 && (
            <button
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="flex-1 px-6 py-4 rounded-xl font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
          )}
          <button
            onClick={() => {
              if (currentStep < steps.length - 1) {
                setCurrentStep(prev => prev + 1);
              } else {
                setShowResults(true);
              }
            }}
            className="flex-[2] bg-gradient-to-r from-[#4A90E2] to-[#52C878] text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all text-lg"
            data-testid={currentStep === steps.length - 1 ? "btn-submit-assessment" : "btn-next-step"}
          >
            {currentStep === steps.length - 1 ? "Submit Assessment" : "Next Section"}
          </button>
        </div>
      </div>
    );
  };

  const renderPriorityResults = () => {
    const priorityData = getPriorityData();
    
    return (
      <div className="space-y-10">
        <div className="text-center mb-10">
          <h3 className="text-3xl font-bold text-[#2C3E50] mb-2">Your Personalized Wellness Roadmap</h3>
          <p className="text-gray-600">Based on your assessment, we've prioritized your support protocols below.</p>
        </div>

        {priorityData.map((data, idx) => (
          <div key={data.category} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
            <div className={`flex items-center justify-between p-4 rounded-xl border-l-8 ${
              data.priority === 'High' ? 'bg-red-50 border-red-500' :
              data.priority === 'Medium' ? 'bg-orange-50 border-orange-500' :
              'bg-green-50 border-green-500'
            }`}>
              <div>
                <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${
                  data.priority === 'High' ? 'bg-red-100 text-red-700' :
                  data.priority === 'Medium' ? 'bg-orange-100 text-orange-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {data.priority} Priority
                </span>
                <h4 className="text-xl font-bold text-[#2C3E50] mt-1">{data.label}</h4>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Symptom Score</p>
                <p className="text-2xl font-black text-[#2C3E50]">{data.score}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {data.protocols.map(protocolName => (
                <div key={protocolName} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-r from-[#4A90E2] to-[#52C878] rounded-xl">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <h5 className="text-2xl font-bold text-[#2C3E50]">{protocolName}</h5>
                  </div>
                  
                  {renderProtocolDetails(protocolName)}

                  <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                    <h6 className="font-bold text-[#2C3E50] mb-3 flex items-center gap-2 text-lg">
                      <Sparkles className="w-6 h-6 text-[#4A90E2]" />
                      Next-Step Guidance
                    </h6>
                    <div className="space-y-3 text-gray-700">
                      <p className="leading-relaxed">
                        {data.priority === 'High' ? (
                          <><strong>Focus First:</strong> This area requires immediate attention. Start with the "Empty Stomach" supplements today and focus on proper hydration.</>
                        ) : data.priority === 'Medium' ? (
                          <><strong>Supporting Focus:</strong> Begin incorporating these supplements after 7 days of your High Priority protocol to avoid detox overwhelm.</>
                        ) : (
                          <><strong>Maintenance:</strong> These areas are currently stable. Re-evaluate in 30 days or if new symptoms emerge.</>
                        )}
                      </p>
                      <p className="text-sm italic font-medium text-gray-500">
                        Consult with your healthcare practitioner for personalized dosing adjustments and long-term support.
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <button
          onClick={() => {
            setShowResults(false);
            setQuizAnswers({});
            setCurrentStep(0);
          }}
          className="w-full bg-white border-2 border-[#4A90E2] text-[#4A90E2] py-4 rounded-xl font-bold hover:bg-blue-50 transition-all text-lg shadow-sm"
          data-testid="btn-retake-assessment"
        >
          Retake Full Assessment
        </button>
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-[#4A90E2] to-[#52C878] p-4 rounded-2xl shadow-lg">
              <BookOpen className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-[#2C3E50] mb-3 tracking-tight">Wellness Protocol Builder</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Complete your symptom assessment and generate a personalized wellness support plan. Comprehensive detoxification and whole-body strategies developed by certified practitioners.
          </p>
        </div>

        {/* Universal Body Health Assessment */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 md:p-10 shadow-xl border border-white mb-12 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Heart className="w-32 h-32 text-[#52C878]" />
          </div>
          
          <div className="relative">
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-gradient-to-br from-[#4A90E2] to-[#52C878] p-3 rounded-xl shadow-inner">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-[#2C3E50]">Body Health Assessment</h2>
                <p className="text-gray-500 font-medium tracking-wide">Evaluate your current health status across key wellness indicators.</p>
              </div>
            </div>

            {!showResults ? renderStep() : renderPriorityResults()}
          </div>
        </div>

        {/* Nutritional Protocols Reference - Only show on results page or at start if needed */}
        {!showResults && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {protocols.map((protocol) => (
              <div 
                key={protocol.title} 
                className={`bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group cursor-pointer`}
                onClick={() => setSelectedProtocol(selectedProtocol === protocol.title ? null : protocol.title)}
              >
                <div className="flex justify-between items-start">
                  <div className={`bg-gradient-to-r ${protocol.color} p-3 rounded-xl inline-block mb-3`}>
                    <protocol.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-[#2C3E50] mb-2">{protocol.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{protocol.desc}</p>
                <div className="text-[#52C878] text-sm font-bold flex items-center gap-1">
                  {selectedProtocol === protocol.title ? 'Hide Details' : 'View Details'}
                </div>
                {selectedProtocol === protocol.title && renderProtocolDetails(protocol.title)}
              </div>
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="bg-gradient-to-r from-[#4A90E2] to-[#52C878] rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
          <div className="relative">
            <h3 className="text-3xl font-extrabold mb-4">Professional Detox & Wellness Guidance</h3>
            <p className="text-white/90 text-xl mb-8 leading-relaxed max-w-2xl">
              Our protocols are developed by Registered Nutritional Consulting Practitioners (RNCP) and focus on safe, effective methods to restore vitality and optimize health.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-colors">
                <p className="text-4xl font-black mb-1">100%</p>
                <p className="text-white/80 font-bold tracking-wider uppercase text-xs">Evidence-Based</p>
              </div>
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-colors">
                <p className="text-4xl font-black mb-1">RNCP</p>
                <p className="text-white/80 font-bold tracking-wider uppercase text-xs">Certified</p>
              </div>
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-colors">
                <p className="text-4xl font-black mb-1">24/7</p>
                <p className="text-white/80 font-bold tracking-wider uppercase text-xs">Access</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

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
