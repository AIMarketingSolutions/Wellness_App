import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, BookOpen, Heart, Sparkles, Zap, Info, AlertTriangle } from "lucide-react";

interface Supplement {
  name: string;
  timing: "with_meal" | "empty_stomach" | "before_meal";
  dosing: string;
}

const bodyHealthQuestions = [
  // Digestive Health
  { id: "Bloating", label: "Bloating", category: "digestive", score: 1 },
  { id: "Gas", label: "Gas", category: "digestive", score: 1 },
  { id: "Constipation", label: "Constipation", category: "digestive", score: 1 },
  { id: "Diarrhea", label: "Diarrhea", category: "digestive", score: 1 },
  { id: "Digestive discomfort", label: "Digestive discomfort", category: "digestive", score: 1 },
  { id: "Irregular stools", label: "Irregular stools", category: "digestive", score: 1 },
  { id: "Upper right abdominal discomfort", label: "Upper right abdominal discomfort", category: "digestive", score: 1 },
  { id: "Nausea after fatty meals", label: "Nausea after fatty meals", category: "digestive", score: 1 },
  
  // Energy & Brain
  { id: "Fatigue", label: "Fatigue or low energy", category: "energy", score: 1 },
  { id: "Morning fatigue", label: "Morning fatigue", category: "energy", score: 1 },
  { id: "Afternoon crashes", label: "Afternoon energy crashes", category: "energy", score: 1 },
  { id: "Brain fog", label: "Brain fog", category: "energy", score: 1 },
  { id: "Headaches", label: "Headaches", category: "energy", score: 1 },
  { id: "Fatigue after meals", label: "Fatigue after meals", category: "energy", score: 1 },
  { id: "Fatigue or weakness", label: "Fatigue or weakness", category: "energy", score: 1 },
  { id: "Fatigue or insomnia", label: "Fatigue or insomnia", category: "energy", score: 1 },

  // Skin & Appearance
  { id: "Rashes", label: "Rashes", category: "skin", score: 1 },
  { id: "Eczema", label: "Eczema", category: "skin", score: 1 },
  { id: "Itchy skin", label: "Itchy skin", category: "skin", score: 1 },
  { id: "Acne", label: "Acne", category: "skin", score: 1 },
  { id: "Yellowish skin or eyes", label: "Yellowish skin or eyes", category: "skin", score: 1 },
  { id: "Pale skin lips or nail beds", label: "Pale skin, lips, or nail beds", category: "skin", score: 1 },
  { id: "Unexplained body odor", label: "Unexplained body odor", category: "skin", score: 1 },

  // Sleep & Mood
  { id: "Stress or anxiety", label: "Stress or anxiety", category: "sleep", score: 1 },
  { id: "Sleep difficulties", label: "Sleep difficulties", category: "sleep", score: 1 },
  { id: "Mood changes", label: "Mood changes", category: "sleep", score: 1 },
  { id: "Hot flashes or night sweats", label: "Hot flashes or night sweats", category: "sleep", score: 1 },
  { id: "Dizziness or lightheadedness", label: "Dizziness or lightheadedness", category: "sleep", score: 1 },
  
  // Appetite & Cravings
  { id: "Sugar or refined carb cravings", label: "Cravings for sugar or refined carbs", category: "appetite", score: 1 },
  { id: "Salty or sweet food cravings", label: "Cravings for salty or sweet foods", category: "appetite", score: 1 },
  { id: "Poor appetite", label: "Poor appetite", category: "appetite", score: 1 },
  { id: "Food sensitivities", label: "Food sensitivities", category: "appetite", score: 1 },
  { id: "Unexplained weight gain", label: "Unexplained weight gain", category: "appetite", score: 1 },

  // Pain & Physical Function
  { id: "Joint or muscle pain", label: "Joint or muscle pain", category: "pain", score: 1 },
  { id: "Swelling in extremities", label: "Swelling in extremities", category: "pain", score: 1 },
  { id: "Cold hands and feet", label: "Cold hands and feet", category: "pain", score: 1 },
  { id: "Shortness of breath", label: "Shortness of breath", category: "pain", score: 1 },
  { id: "Frequent or painful urination", label: "Frequent or painful urination", category: "pain", score: 1 },
  { id: "High blood pressure", label: "High blood pressure", category: "pain", score: 1 },
  { id: "Vaginal dryness", label: "Vaginal dryness", category: "pain", score: 1 },

  // Exposure & History
  { id: "Travel to high-risk regions", label: "Travel to high-risk regions", category: "exposure", score: 1 },
  { id: "Raw or undercooked foods", label: "Raw or undercooked foods consumption", category: "exposure", score: 1 },
  { id: "Unfiltered water", label: "Unfiltered water consumption", category: "exposure", score: 1 },
  { id: "Close contact with pets", label: "Close contact with pets", category: "exposure", score: 1 },
  { id: "Gardening exposure", label: "Gardening or soil exposure", category: "exposure", score: 1 },
  { id: "Seafood consumption", label: "Regular seafood consumption", category: "exposure", score: 1 },
  { id: "Dental fillings", label: "Dental fillings (amalgam/silver)", category: "exposure", score: 1 },
  { id: "Exposure to old paint or batteries", label: "Exposure to old paint or batteries", category: "exposure", score: 1 },
  { id: "Environmental toxins", label: "Exposure to environmental toxins", category: "exposure", score: 1 },
  { id: "Alcohol or medication history", label: "Alcohol or medication history", category: "exposure", score: 1 },
  { id: "History of kidney stones or UTIs", label: "History of kidney stones or UTIs", category: "exposure", score: 1 },
];

const symptomMap: { [key: string]: string[] } = {
  // Digestive Health - from document
  "Bloating": ["Parasite Symptoms", "Leaky Gut", "Gallbladder Flush & Bile Flow", "Liver Detox & Regeneration"],
  "Gas": ["Parasite Symptoms", "Leaky Gut"],
  "Constipation": ["Parasite Symptoms", "Leaky Gut", "Gallbladder Flush & Bile Flow", "Whole Body Detox"],
  "Diarrhea": ["Parasite Symptoms", "Leaky Gut"],
  "Digestive discomfort": ["Liver Detox & Regeneration", "Heavy Metal Detox Support"],
  "Irregular stools": ["Gallbladder Flush & Bile Flow", "Whole Body Detox"],
  "Upper right abdominal discomfort": ["Gallbladder Flush & Bile Flow"],
  "Nausea after fatty meals": ["Gallbladder Flush & Bile Flow"],
  
  // Energy & Brain - from document
  "Fatigue": ["Parasite Symptoms", "Leaky Gut", "Heavy Metal Detox Support", "Whole Body Detox", "Kidney Detox", "Anemia"],
  "Morning fatigue": ["Adrenal Stress & Cortisol Balance"],
  "Afternoon crashes": ["Parasite Symptoms", "Adrenal Stress & Cortisol Balance"],
  "Brain fog": ["Parasite Symptoms", "Leaky Gut", "Heavy Metal Detox Support", "Whole Body Detox"],
  "Headaches": ["Heavy Metal Detox Support"],
  "Fatigue after meals": ["Liver Detox & Regeneration"],
  "Fatigue or weakness": ["Anemia"],
  "Fatigue or insomnia": ["Menopausal Symptoms"],
  
  // Skin & Appearance - from document
  "Rashes": ["Parasite Symptoms", "Leaky Gut", "Whole Body Detox"],
  "Eczema": ["Parasite Symptoms", "Leaky Gut"],
  "Itchy skin": ["Parasite Symptoms"],
  "Acne": ["Leaky Gut", "Whole Body Detox"],
  "Yellowish skin or eyes": ["Liver Detox & Regeneration", "Gallbladder Flush & Bile Flow"],
  "Pale skin lips or nail beds": ["Anemia"],
  "Unexplained body odor": ["Whole Body Detox"],
  
  // Sleep & Mood - from document
  "Stress or anxiety": ["Adrenal Stress & Cortisol Balance"],
  "Sleep difficulties": ["Adrenal Stress & Cortisol Balance"],
  "Mood changes": ["Menopausal Symptoms", "Leaky Gut"],
  "Hot flashes or night sweats": ["Menopausal Symptoms"],
  "Dizziness or lightheadedness": ["Anemia"],
  
  // Appetite & Cravings - from document
  "Sugar or refined carb cravings": ["Parasite Symptoms"],
  "Salty or sweet food cravings": ["Adrenal Stress & Cortisol Balance"],
  "Poor appetite": ["Liver Detox & Regeneration"],
  "Food sensitivities": ["Leaky Gut"],
  "Unexplained weight gain": ["Menopausal Symptoms"],
  
  // Pain & Physical Function - from document
  "Joint or muscle pain": ["Heavy Metal Detox Support"],
  "Swelling in extremities": ["Kidney Detox"],
  "Cold hands and feet": ["Anemia"],
  "Shortness of breath": ["Anemia"],
  "Frequent or painful urination": ["Kidney Detox"],
  "High blood pressure": ["Kidney Detox"],
  "Vaginal dryness": ["Menopausal Symptoms"],
  
  // Exposure & History - from document
  "Travel to high-risk regions": ["Parasite Symptoms"],
  "Raw or undercooked foods": ["Parasite Symptoms"],
  "Unfiltered water": ["Parasite Symptoms"],
  "Close contact with pets": ["Parasite Symptoms"],
  "Gardening exposure": ["Parasite Symptoms"],
  "Seafood consumption": ["Heavy Metal Detox Support"],
  "Dental fillings": ["Heavy Metal Detox Support"],
  "Exposure to old paint or batteries": ["Heavy Metal Detox Support"],
  "Environmental toxins": ["Whole Body Detox"],
  "Alcohol or medication history": ["Liver Detox & Regeneration"],
  "History of kidney stones or UTIs": ["Kidney Detox"]
};

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
    education: "Detoxification is your body's natural elimination of metabolic waste, environmental toxins, and excess hormones. Supporting liver, kidneys, lymph, gut, and skin pathways optimizes energy and overall wellness.",
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
      { name: "Probiotics", timing: "empty_stomach", dosing: "200–50 billion CFU" },
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

const steps = [
  { id: "digestive", label: "Digestive Health" },
  { id: "energy", label: "Energy & Cognition" },
  { id: "skin", label: "Skin & Allergies" },
  { id: "sleep", label: "Sleep & Mood" },
  { id: "appetite", label: "Appetite & Weight" },
  { id: "pain", label: "Pain & Physical Function" },
  { id: "exposure", label: "Exposure History" }
];

const protocols = ["Parasite Symptoms", "Leaky Gut", "Adrenal Stress & Cortisol Balance", "Heavy Metal Detox Support", "Whole Body Detox", "Liver Detox & Regeneration", "Kidney Detox", "Gallbladder Flush & Bile Flow", "Menopausal Symptoms", "Anemia"];

export default function NutritionalProtocol() {
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: boolean }>({});
  const [showResults, setShowResults] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showIntro, setShowIntro] = useState(true);

  const handleQuizAnswer = (questionId: string, value: boolean) => {
    setQuizAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const getPriorityData = () => {
    const protocolScores: { [key: string]: number } = {};
    protocols.forEach(p => protocolScores[p] = 0);

    Object.entries(quizAnswers).forEach(([symptom, answered]) => {
      if (answered && symptomMap[symptom]) {
        symptomMap[symptom].forEach(protocol => {
          if (protocolScores.hasOwnProperty(protocol)) {
            protocolScores[protocol]++;
          }
        });
      }
    });

    const sortedProtocols = Object.entries(protocolScores)
      .sort(([, a], [, b]) => b - a);

    const highestScore = sortedProtocols[0][1];

    const getGrade = (score: number) => {
      if (score === 0) return "Low";
      if (score === highestScore) return "High";
      if (score >= highestScore / 2) return "Medium";
      return "Low";
    };

    // Return only top 2 protocols (primary and secondary)
    return sortedProtocols
      .slice(0, 2)
      .map(([protocol, score]) => ({
        protocol,
        score,
        priority: getGrade(score) as "High" | "Medium" | "Low"
      }));
  };

  const renderProtocolDetails = (title: string) => {
    const details = protocolDetails[title];
    if (!details) return null;

    return (
      <div className="mt-8 space-y-8">
        <div>
          <h4 className="text-xl font-bold text-[#2C3E50] mb-3 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#52C878]" />
            Education
          </h4>
          <p className="text-gray-700 leading-relaxed text-lg">
            {details.education}
          </p>
        </div>

        <div>
          <h4 className="text-xl font-bold text-[#2C3E50] mb-3 flex items-center gap-2">
            <Info className="w-6 h-6 text-[#4A90E2]" />
            Why It Matters
          </h4>
          <ul className="space-y-3">
            {details.whyItMatters.map((item, i) => (
              <li key={i} className="text-gray-600 flex items-start gap-3 text-lg">
                <div className="w-2 h-2 rounded-full bg-[#4A90E2] mt-2.5 shrink-0"></div>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xl font-bold text-[#2C3E50] mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-orange-400" />
            Supplement Protocol
          </h4>
          <div className="grid grid-cols-1 gap-4">
            {["with_meal", "empty_stomach", "before_meal"].map(timing => {
              const timingSupps = details.supplements.filter(s => s.timing === timing);
              if (timingSupps.length === 0) return null;

              const timingLabels: { [key: string]: { label: string, color: string, border: string, sub: string } } = {
                with_meal: { label: "With Meals", color: "bg-orange-50", border: "border-orange-400", sub: "Take during or immediately after eating." },
                empty_stomach: { label: "Empty Stomach", color: "bg-blue-50", border: "border-blue-400", sub: "Take 1 hour before or 2 hours after eating." },
                before_meal: { label: "30 Min Before Meals", color: "bg-purple-50", border: "border-purple-400", sub: "Optimal for enzymatic activity." }
              };

              return (
                <div key={timing} className={`${timingLabels[timing].color} rounded-2xl p-6 border-l-8 ${timingLabels[timing].border} shadow-sm`}>
                  <div className="mb-4">
                    <h5 className="font-black text-gray-800 text-xl flex items-center gap-2">
                      {timingLabels[timing].label}
                    </h5>
                    <p className="text-sm text-gray-500 font-medium">{timingLabels[timing].sub}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {timingSupps.map((supp, idx) => (
                      <div key={idx} className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white/50 shadow-sm">
                        <p className="font-bold text-[#2C3E50] text-lg">{supp.name}</p>
                        <p className="text-[#52C878] font-black text-sm uppercase tracking-wider">{supp.dosing}</p>
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

  const renderIntro = () => {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#52C878]/10 text-[#52C878] px-4 py-2 rounded-full font-bold text-sm uppercase tracking-widest">
            <Sparkles className="w-4 h-4" />
            Personalized Assessment
          </div>
          <h3 className="text-3xl font-black text-[#2C3E50]">Ready to Begin?</h3>
          <p className="text-lg text-gray-600 max-w-xl mx-auto leading-relaxed">
            This comprehensive assessment covers 7 key health categories with {bodyHealthQuestions.length} symptom indicators. 
            Your responses will help us identify the most relevant wellness protocols for your needs.
          </p>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-100">
          <h4 className="font-bold text-[#2C3E50] text-xl mb-4">What to Expect:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="w-8 h-8 bg-gradient-to-r from-[#4A90E2] to-[#52C878] rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <span className="text-gray-700 font-medium">{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => setShowIntro(false)}
            className="bg-gradient-to-r from-[#4A90E2] to-[#52C878] text-white px-12 py-5 rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
            data-testid="btn-start-assessment"
          >
            Start Assessment
          </button>
          <p className="text-sm text-gray-500 mt-4">Takes approximately 3-5 minutes to complete</p>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 border border-gray-100 mt-8">
          <div className="text-center mb-6">
            <h4 className="font-bold text-[#2C3E50] text-2xl mb-2">10 Wellness Protocols Available</h4>
            <p className="text-gray-600">Based on your assessment, you'll receive personalized recommendations from these evidence-based protocols:</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {protocols.map((protocol) => {
              const details = protocolDetails[protocol];
              return (
                <div key={protocol} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-[#52C878]/30 transition-all group">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gradient-to-br from-[#4A90E2]/10 to-[#52C878]/10 rounded-lg group-hover:from-[#4A90E2]/20 group-hover:to-[#52C878]/20 transition-colors">
                      <BookOpen className="w-5 h-5 text-[#4A90E2]" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-bold text-[#2C3E50] text-lg mb-1">{protocol}</h5>
                      <p className="text-sm text-gray-600 line-clamp-2">{details?.education || "Comprehensive wellness support protocol."}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Info className="w-3 h-3" />
                          {details?.supplements?.length || 0} supplements
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderStep = () => {
    const step = steps[currentStep];
    const categoryQuestions = bodyHealthQuestions.filter(q => q.category === step.id);
    const progress = ((currentStep + 1) / steps.length) * 100;

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-[#2C3E50] text-2xl">{step.label}</h4>
          <span className="text-sm font-medium text-gray-500">Step {currentStep + 1} of {steps.length}</span>
        </div>

        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-6">
          <div 
            className="h-full bg-gradient-to-r from-[#4A90E2] to-[#52C878] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
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
              data-testid="btn-previous-step"
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
      <div className="space-y-12 animate-in fade-in duration-700">
        <div className="text-center space-y-4">
          <div className="inline-block bg-green-100 text-green-700 px-4 py-1 rounded-full font-bold text-sm uppercase tracking-widest mb-2">Analysis Complete</div>
          <h3 className="text-4xl font-black text-[#2C3E50]">Your Personalized Wellness Roadmap</h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Based on your assessment, we've prioritized your protocols to address the most critical areas of your health first.</p>
        </div>

        <div className="space-y-10">
          {priorityData.map((data) => (
            <div key={data.protocol} className="space-y-6">
              <div className={`flex items-center justify-between p-6 rounded-3xl border-l-[12px] shadow-lg ${
                data.priority === 'High' ? 'bg-red-50 border-red-500' :
                data.priority === 'Medium' ? 'bg-orange-50 border-orange-500' :
                'bg-green-50 border-green-500'
              }`}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-black uppercase tracking-widest px-2 py-1 rounded ${
                      data.priority === 'High' ? 'bg-red-100 text-red-700' :
                      data.priority === 'Medium' ? 'bg-orange-100 text-orange-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {data.priority} Priority
                    </span>
                    {data.priority === 'High' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                  </div>
                  <h4 className="text-2xl font-black text-[#2C3E50]">{data.protocol}</h4>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Protocol Score</p>
                  <p className="text-3xl font-black text-[#2C3E50]">{data.score}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8">
                <div className="bg-white/90 backdrop-blur-sm rounded-[2rem] p-10 shadow-xl border border-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
                    <Zap className="w-32 h-32 text-[#4A90E2]" />
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="p-4 bg-gradient-to-br from-[#4A90E2] to-[#52C878] rounded-2xl shadow-lg">
                        <Zap className="w-8 h-8 text-white" />
                      </div>
                      <h5 className="text-3xl font-black text-[#2C3E50]">{data.protocol}</h5>
                    </div>
                    
                    {renderProtocolDetails(data.protocol)}

                    <div className="mt-10 p-8 bg-gradient-to-br from-blue-50 to-white rounded-[2rem] border border-blue-100 shadow-inner">
                      <h6 className="font-black text-[#2C3E50] mb-4 flex items-center gap-3 text-xl">
                        <Sparkles className="w-7 h-7 text-[#4A90E2]" />
                        Next-Step Guidance
                      </h6>
                      <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
                        <p>
                          {data.priority === 'High' ? (
                            <><strong>Focus First:</strong> This area requires immediate attention. Start with the "Empty Stomach" supplements today and ensure you are drinking at least 2-3 liters of filtered water daily to support elimination.</>
                          ) : data.priority === 'Medium' ? (
                            <><strong>Supporting Focus:</strong> Begin incorporating these supplements after 7-10 days of your High Priority protocol to prevent detox overwhelm.</>
                          ) : (
                            <><strong>Maintenance:</strong> These indicators are currently stable. Focus on your higher priority areas first and re-evaluate this section in 30 days.</>
                          )}
                        </p>
                        <div className="flex items-start gap-3 p-4 bg-white/50 rounded-xl border border-white italic font-medium text-gray-500 text-sm">
                          <Info className="w-5 h-5 shrink-0 text-[#4A90E2]" />
                          Always consult with your healthcare practitioner before starting any new supplement regimen for personalized dosing and monitoring.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            setShowResults(false);
            setQuizAnswers({});
            setCurrentStep(0);
            setShowIntro(true);
          }}
          className="w-full bg-white border-4 border-[#4A90E2] text-[#4A90E2] py-6 rounded-2xl font-black text-xl hover:bg-blue-50 transition-all shadow-lg"
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

            {showIntro ? renderIntro() : (!showResults ? renderStep() : renderPriorityResults())}
          </div>
        </div>

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
