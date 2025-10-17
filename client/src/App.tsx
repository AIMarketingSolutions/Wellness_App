import { Route, Switch, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import Dashboard from "@/pages/Dashboard";
import ProfileAssessment from "@/pages/ProfileAssessment";
import TransformationTracker from "@/pages/TransformationTracker";
import MealPlan from "@/pages/MealPlan";
import Fitness from "@/pages/Fitness";
import Supplement from "@/pages/Supplement";
import NutritionalProtocol from "@/pages/NutritionalProtocol";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#52C878]/5 via-[#4A90E2]/5 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#52C878] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return <Component />;
}

function AppRoutes() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={HomePage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignupPage} />
      
      {/* Protected Routes */}
      <Route path="/dashboard">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>
      <Route path="/profile-assessment">
        {() => <ProtectedRoute component={ProfileAssessment} />}
      </Route>
      <Route path="/transformation-tracker">
        {() => <ProtectedRoute component={TransformationTracker} />}
      </Route>
      <Route path="/meal-plan">
        {() => <ProtectedRoute component={MealPlan} />}
      </Route>
      <Route path="/fitness">
        {() => <ProtectedRoute component={Fitness} />}
      </Route>
      <Route path="/supplement">
        {() => <ProtectedRoute component={Supplement} />}
      </Route>
      <Route path="/nutritional-protocol">
        {() => <ProtectedRoute component={NutritionalProtocol} />}
      </Route>
      
      {/* Default redirect for unknown routes */}
      <Route>
        <Redirect to="/" />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
