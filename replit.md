# Overview

Nutrition One Fitness Inc. is a comprehensive wellness application that provides personalized nutrition planning, fitness tracking, and health assessment tools. The application helps users achieve their health goals through metabolic profiling, customized meal planning, exercise tracking, and progress monitoring.

## Recent Updates (October 2025)

### Automatic Macro Calculation & Display (Latest)
After users complete their Personal Profile Assessment, the system automatically calculates and displays recommended macros per meal in the Transformation Tracker:

**Calculation Process:**
1. **Daily Calorie Target (DCT)** = TEE - Weight Loss Deficit, with safety minimums (1500 cal men, 1200 cal women)
2. **Macro Percentages** from Metabolic Profile (Fast/Slow/Medium Oxidizer or custom ratios)
3. **Daily Macros in Grams**: Protein (cal×%/4), Carbs (cal×%/4), Fat (cal×%/9)
4. **Per-Meal Distribution** based on Meal Plan Type:
   - 3 Meals: 33.33% each
   - 3 Meals + 1 Snack: 30% each + 10% snack
   - 3 Meals + 2 Snacks: 26.67% each + 10% per snack

**Display:**
- Daily Targets section showing DCT, total protein/carbs/fat in grams with percentages
- Per-meal cards for Breakfast, Lunch, Dinner showing calories and macros
- Conditional Snack cards based on meal plan type
- Helper text linking to Daily Meal Calculator for meal planning

**Technical Implementation:**
- `calculateMacros()` function in TransformationTracker component
- Automatic calculation triggered when profile data changes via React Query
- Guards for incomplete profile data (returns null if TEE unavailable or required fields missing)
- UI conditionally renders based on calculation result

### Daily Meal Calculator - Waterfall Calculation System
A sophisticated meal composition calculator that determines recommended food portions using a three-step waterfall algorithm:

**Workflow:**
1. **Food Selection**: Users select one or more foods from three required categories:
   - Carbohydrate sources (Brown Rice, Oats, Sweet Potato, etc.)
   - Protein sources (Chicken, Salmon, Eggs, Greek Yogurt, etc.)
   - Fat sources (Olive Oil, Avocado, Almonds, Butter, etc.)

2. **Calculation Process**: After clicking "Calculate", the system uses a waterfall algorithm:
   - **Step 1**: Calculate carbohydrate quantities in ounces to match the meal's carb target
   - **Step 2**: Subtract protein from carbs, then calculate protein quantities in ounces for the remaining protein needed
   - **Step 3**: Subtract fat from carbs and proteins, then calculate fat quantities in ounces for the remaining fat needed

3. **Results Display**: Shows recommended ounces for each selected food with macro contribution breakdown

**Key Features:**
- **Daily Calorie Target (DCT)**: Auto-calculates based on TEE, weight loss goals, with safety minimums (1500 cal men, 1200 cal women)
- **Meal Plan Support**: Distributes macros across 3 meals, 3 meals + 1 snack, or 3 meals + 2 snacks
- **Metabolic Profile Integration**: Uses Fast/Slow/Medium Oxidizer profiles for macro ratios
- **Three-Category Food Selection**: Checkbox interface for selecting multiple foods per category
- **Ounce-Based Output**: All recommendations displayed in ounces (1 oz = 28.3495g)
- **Macro Tracking**: Shows total calories, protein, carbs, and fat achieved by recommended portions

**Technical Implementation:**
- Waterfall calculation algorithm distributes macros sequentially
- Even distribution when multiple foods selected per category
- Database-driven food categorization (carbohydrate, protein, fat)
- React Query for data fetching
- 30 seed foods across all three categories
- TypeScript typing throughout

**Database:**
- `food_items` table with category field supporting carbohydrate/protein/fat classification
- Seed data includes 10 carb sources, 10 protein sources, 10 fat sources
- All foods validated to have non-zero macros in their primary category

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

### Technology Stack
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Styling**: Tailwind CSS with custom gradient themes
- **Build Tool**: Vite for fast development and optimized production builds

### Design Patterns
- **Component-Based Architecture**: Modular React components organized by feature domains (auth, dashboard, wellness calculator, meal planning, fitness system)
- **Context Pattern**: AuthContext for global authentication state management
- **Custom Hooks**: Centralized authentication logic through `useAuth` hook
- **Route-Based Code Splitting**: Separate route components for different features (Dashboard, ProfileAssessment, MealPlan, Fitness, etc.)

### UI/UX Approach
- Gradient-based color scheme using brand colors (#52C878 green, #4A90E2 blue, #2C3E50 dark)
- Responsive design with mobile-first approach
- Glass morphism effects (backdrop blur) for modern aesthetic
- Consistent spacing and component patterns across features

## Backend Architecture

### Technology Stack
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript with ES modules
- **ORM**: Drizzle ORM for type-safe database operations
- **Database Driver**: Neon Serverless for PostgreSQL connections
- **Session Management**: express-session with cookie-based sessions
- **Password Security**: bcryptjs for password hashing

### Architecture Pattern
- **API-First Design**: RESTful API endpoints under `/api` namespace
- **Session-Based Authentication**: Server-side sessions with httpOnly cookies
- **Middleware Chain**: Express middleware for JSON parsing, cookie parsing, session management
- **Storage Abstraction**: Repository pattern through `storage` module for data access

### Server Configuration
- Development server runs on port 5000
- Vite middleware integration for SPA development
- Session cookies configured for production security (secure flag, httpOnly, 7-day expiration)

## Data Storage Solutions

### Database Schema
The application uses PostgreSQL with the following core tables:

1. **users**: Authentication data (email, password hash, full name)
2. **user_profiles**: Extended user information (physical metrics, preferences, metabolic profile)
3. **tee_calculations**: Total Energy Expenditure calculation history
4. **body_fat_calculations**: Body composition tracking
5. **food_items**: Nutrition database (macronutrients per 100g, CNF codes for Canadian Nutrient File integration)
6. **meal_plans**: User meal planning data
7. **meals**: Individual meal entries with target macros
8. **meal_foods**: Food items within meals with quantities
9. **water_intake**: Daily hydration tracking (up to 20 glasses)
10. **exercise_types**: Exercise database with calorie burn rates
11. **exercise_plans**: Workout planning
12. **daily_exercises**: Exercise log entries
13. **supplements**: Supplement database
14. **user_supplements**: User-specific supplement tracking
15. **grocery_lists**: Shopping list generation
16. **nutrition_questionnaire**: User health assessment data
17. **favorite_meals**: Saved meal combinations with macros
18. **favorite_meal_foods**: Food items in favorite meals
19. **recipes**: Multi-ingredient recipes with per-serving macros
20. **recipe_ingredients**: Ingredients in recipes

### Data Relationships
- **Cascade Deletes**: User deletion cascades to all related records
- **Foreign Keys**: Enforce referential integrity between users and their data
- **UUID Primary Keys**: All tables use UUID for distributed-friendly identifiers
- **Timestamps**: Created/updated timestamps for audit trails

### ORM Strategy
- Drizzle ORM provides type-safe queries with TypeScript inference
- Schema defined in shared module for frontend/backend consistency
- Zod integration for runtime validation via drizzle-zod

## Authentication and Authorization

### Authentication Flow
1. **Signup**: Email/password with bcrypt hashing (10 salt rounds)
2. **Signin**: Credential verification with bcrypt comparison
3. **Session Management**: Server-side sessions stored in memory (production would use persistent store)
4. **Auto-creation**: User profile automatically created on signup

### Authorization Mechanism
- **requireAuth Middleware**: Protects API routes requiring authentication
- **Session Validation**: Checks session userId and verifies user exists in database
- **Request Context**: Authenticated user ID attached to Express request object

### Security Measures
- Password minimum length enforcement
- HttpOnly cookies prevent XSS attacks
- Secure flag for HTTPS-only cookies in production
- Session secret configuration via environment variables

## External Dependencies

### Core Services
- **Supabase**: Originally intended for authentication and database (configuration files present but implementation uses custom Express auth)
- **Neon Database**: Serverless PostgreSQL hosting via `@neondatabase/serverless`
- **WebSocket**: WebSocket support through `ws` package (configured but usage not evident in provided code)

### Development Tools
- **TypeScript**: Strict type checking across frontend and backend
- **ESLint**: Code quality with React-specific rules
- **PostCSS**: CSS processing with Autoprefixer for browser compatibility
- **Drizzle Kit**: Database migration management

### Frontend Libraries
- **Lucide React**: Icon library for consistent UI icons
- **React Hook Form**: Form state management with validation
- **@hookform/resolvers**: Integration with Zod for schema validation
- **TanStack Query**: Server state caching and synchronization

### Build and Deployment
- **Netlify**: Target deployment platform (configured in netlify.toml)
- **Environment Variables**: Vite environment variable support for Supabase credentials
- **SPA Routing**: Client-side routing with fallback to index.html

### Configuration Notes
- Application can run with or without Supabase credentials (placeholder detection)
- Database URL required via DATABASE_URL environment variable
- Development uses Vite dev server with Express API proxy
- Production build outputs to `dist` directory