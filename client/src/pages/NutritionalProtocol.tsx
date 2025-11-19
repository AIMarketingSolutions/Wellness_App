import { Link } from "wouter";
import { ArrowLeft, BookOpen, Bug, Heart, Flame, Sparkles, Droplet, Zap, Shield } from "lucide-react";

export default function NutritionalProtocol() {
  const topics = [
    { 
      title: "Parasite Symptom Assessment", 
      desc: "Identify hidden parasitic burdens affecting digestion, immunity, and energy", 
      icon: Bug, 
      color: "from-[#52C878] to-[#4A90E2]",
      details: "Assess symptoms such as bloating, cravings, fatigue, skin issues, sleep disturbances, and irregular bowel movements"
    },
    { 
      title: "Leaky Gut", 
      desc: "Restore intestinal barrier integrity and reduce inflammation", 
      icon: Shield, 
      color: "from-[#4A90E2] to-[#52C878]",
      details: "Address intestinal permeability, improve nutrient absorption, and reduce food sensitivities and autoimmune triggers"
    },
    { 
      title: "Adrenal Stress & Cortisol Balance", 
      desc: "Restore energy and support stress hormone recovery", 
      icon: Heart, 
      color: "from-[#52C878] to-[#4A90E2]",
      details: "Evaluate adrenal fatigue indicators including morning tiredness, afternoon crashes, anxiety, and sugar cravings"
    },
    { 
      title: "Heavy Metal Detox Support", 
      desc: "Reduce toxic load from mercury, lead, cadmium, aluminum, and arsenic", 
      icon: Flame, 
      color: "from-[#4A90E2] to-[#52C878]",
      details: "Improve brain health, digestion, energy, and cellular repair through safe detoxification"
    },
    { 
      title: "Whole Body Detox", 
      desc: "Support all major elimination pathways for complete wellness", 
      icon: Sparkles, 
      color: "from-[#52C878] to-[#4A90E2]",
      details: "Enhance liver, kidneys, colon, lungs, lymphatic system, and skin function"
    },
    { 
      title: "Liver Detox & Regeneration", 
      desc: "Optimize your primary fat-burning and detox organ", 
      icon: Zap, 
      color: "from-[#4A90E2] to-[#52C878]",
      details: "Improve fat metabolism, hormonal balance, immunity, and toxin removal"
    },
    { 
      title: "Kidney Detox", 
      desc: "Filter acids, toxins, and metabolic waste effectively", 
      icon: Droplet, 
      color: "from-[#52C878] to-[#4A90E2]",
      details: "Support electrolyte balance, hydration, cellular function, and reduce inflammation"
    },
    { 
      title: "Gallbladder Flush & Bile Flow", 
      desc: "Optimize fat digestion and toxin elimination", 
      icon: BookOpen, 
      color: "from-[#52C878] to-[#4A90E2]",
      details: "Improve bile flow, reduce digestive discomfort, and support natural flushing of gallstones"
    },
  ];

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

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {topics.map((topic) => (
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
