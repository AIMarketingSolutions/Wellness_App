@@ .. @@
   return (
   )
-    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 flex items-center justify-center p-4">
+    <div className="min-h-screen bg-gradient-to-br from-[#52C878]/5 via-[#4A90E2]/5 to-white flex items-center justify-center p-4">
       <div className="w-full max-w-2xl mx-auto text-center space-y-12">
         {/* Header Section */}
         <div className="space-y-6">
           <div className="flex justify-center mb-6">
-            <div className="bg-gradient-to-r from-blue-600 to-emerald-600 p-4 rounded-full shadow-lg">
+            <div className="bg-gradient-to-r from-[#52C878] to-[#4A90E2] p-4 rounded-full shadow-lg">
               <Dumbbell className="w-12 h-12 text-white" />
             </div>
           </div>
           
-          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 leading-tight tracking-tight">
+          <h1 className="text-4xl md:text-6xl font-bold text-[#2C3E50] leading-tight tracking-tight">
             Welcome to
-            <span className="block bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
+            <span className="block bg-gradient-to-r from-[#52C878] to-[#4A90E2] bg-clip-text text-transparent">
               Nutrition One Fitness Inc.
             </span>
           </h1>
@@ .. @@
         <div className="flex flex-col sm:flex-row gap-6 justify-center items-center max-w-lg mx-auto">
           <button 
             onClick={() => setCurrentPage('login')}
-            className="w-full sm:w-auto px-12 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-lg rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-out focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50"
+            className="w-full sm:w-auto px-12 py-4 bg-gradient-to-r from-[#52C878] to-[#4A90E2] hover:from-[#52C878]/90 hover:to-[#4A90E2]/90 text-white font-semibold text-lg rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-out focus:outline-none focus:ring-4 focus:ring-[#52C878]/30 focus:ring-opacity-50"
           >
             Login
           </button>
           
           <button 
             onClick={() => setCurrentPage('signup')}
-            className="w-full sm:w-auto px-12 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold text-lg rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-out focus:outline-none focus:ring-4 focus:ring-emerald-300 focus:ring-opacity-50">
+            className="w-full sm:w-auto px-12 py-4 bg-gradient-to-r from-[#4A90E2] to-[#52C878] hover:from-[#4A90E2]/90 hover:to-[#52C878]/90 text-white font-semibold text-lg rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-out focus:outline-none focus:ring-4 focus:ring-[#4A90E2]/30 focus:ring-opacity-50">
             Signup
           </button>
         </div>

         {/* Feature Highlights */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 max-w-4xl mx-auto">
           <div className="text-center space-y-4 p-6 bg-white/50 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
             <div className="flex justify-center">
-              <div className="bg-blue-100 p-3 rounded-full">
-                <Heart className="w-8 h-8 text-blue-600" />
+              <div className="bg-[#52C878]/10 p-3 rounded-full">
+                <Heart className="w-8 h-8 text-[#52C878]" />
               </div>
             </div>
-            <h3 className="text-xl font-semibold text-gray-800">Personalized Plans</h3>
+            <h3 className="text-xl font-semibold text-[#2C3E50]">Personalized Plans</h3>
             <p className="text-gray-600 text-sm leading-relaxed">
               Customize your nutrition and fitness plans designed specifically for you, aligning with your individual goals and lifestyle needs.
             </p>
@@ .. @@
           <div className="text-center space-y-4 p-6 bg-white/50 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
             <div className="flex justify-center">
-              <div className="bg-emerald-100 p-3 rounded-full">
-                <Target className="w-8 h-8 text-emerald-600" />
+              <div className="bg-[#4A90E2]/10 p-3 rounded-full">
+                <Target className="w-8 h-8 text-[#4A90E2]" />
               </div>
             </div>
-            <h3 className="text-xl font-semibold text-gray-800">Expert Guidance</h3>
+            <h3 className="text-xl font-semibold text-[#2C3E50]">Expert Guidance</h3>
             <p className="text-gray-600 text-sm leading-relaxed">
               Work with a Registered Nutritional Consulting Practitioner (RNCP) and certified fitness professionals to achieve optimal results.
             </p>
@@ .. @@
          <div className="text-center space-y-4 p-6 bg-white/50 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex justify-center">
-              <div className="bg-purple-100 p-3 rounded-full">
-                <Dumbbell className="w-8 h-8 text-purple-600" />
+              <div className="bg-gradient-to-r from-[#52C878]/10 to-[#4A90E2]/10 p-3 rounded-full">
+                <Dumbbell className="w-8 h-8 text-[#52C878]" />
               </div>
             </div>
-            <h3 className="text-xl font-semibold text-gray-800">Proven Results</h3>
+            <h3 className="text-xl font-semibold text-[#2C3E50]">Proven Results</h3>
             <p className="text-gray-600 text-sm leading-relaxed">
               Transform your health and fitness like thousands before you—join a community of success and achieve your lifestyle goals today!
             </p>
@@ .. @@
   );
 }