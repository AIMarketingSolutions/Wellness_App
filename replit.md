# Overview

Nutrition One Fitness Inc. is a comprehensive wellness application that provides personalized nutrition planning, fitness tracking, and health assessment tools. Its primary purpose is to help users achieve their health goals through metabolic profiling, customized meal planning, exercise tracking, and progress monitoring, aiming to be a complete solution for personalized health and fitness.

# Recent Changes

## December 13, 2025 - Client-Facing Tool Renaming & Hydration Tracker
- **Tool name updates**: Renamed all 6 main tools across the application UI:
  - Profile Assessment → Client Intake Profile
  - Transformation Tracker → Momentum Tracker
  - Meal Plan → Smart Meal Planning
  - Fitness → Daily Workout Plan
  - Supplement → Supplement Shop
  - Nutritional Protocol → Wellness Protocol Builder
- **Subtitles added**: Each tool card on dashboard now displays a descriptive subtitle
- **Hydration tracker**: Added water intake tracking to Smart Meal Planning with progress bar, quick-add buttons (+1/+2 glasses), and remove functionality
- **Routes preserved**: All internal routes (/profile-assessment, /meal-plan, etc.) kept stable for backwards compatibility

## November 22, 2025 - Admin Database Seeding System
- **Admin seeding tool**: Created `/admin-seed` page and `/api/admin/seed-database` endpoint to populate production database with food items, exercise types, and supplements
- **Admin authorization**: Implemented `requireAdmin` middleware that checks user email against `ADMIN_EMAIL` environment variable for secure admin-only access
- **Database population**: Seeds 30 food items (10 carbs, 10 proteins, 10 fats), 3 exercise types, and 10 supplements
- **Idempotent seeding**: Uses `onConflictDoNothing()` to safely run multiple times without duplicating data
- **Environment requirement**: `ADMIN_EMAIL` must be set in both development and production environments to access admin features

## November 21, 2025 - Production Deployment Fixes
- **Fixed wildcard route crash**: Changed SPA fallback route from `app.get("*", ...")` to `app.get(/^\/(?!api).*/, ...)` to be compatible with path-to-regexp library, preventing deployment crash loop
- **Added production session store**: Implemented PostgreSQL-backed session storage using `connect-pg-simple` for production deployments, enabling session persistence across multiple server instances
- **Database setup**: Completed production PostgreSQL database configuration with all tables migrated successfully
- **Session security**: Configured secure cookies for HTTPS in production while maintaining compatibility with HTTP in development
- **Fixed deployment run command**: Created `start.sh` wrapper script and configured deployment to use `run = ["bash", "start.sh"]` as workaround for Replit's deployment configuration tool limitations
- **Fixed static file path**: Corrected server static file path from `dist/public/` to `dist/` to match Vite's actual build output directory, resolving ENOENT errors when serving index.html and assets in production

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend

### Technology Stack
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack Query (React Query) for server state
- **Styling**: Tailwind CSS with custom gradient themes
- **Build Tool**: Vite

### UI/UX Approach
- Gradient-based color scheme using brand colors (#52C878 green, #4A90E2 blue, #2C3E50 dark)
- Responsive design with a mobile-first approach
- Glass morphism effects (backdrop blur) for a modern aesthetic
- Consistent spacing and component patterns across features

### Key Features and Implementations
- **Automatic Macro Calculation & Display**: Calculates and displays recommended macros per meal based on a Personal Profile Assessment, Daily Calorie Target (DCT), and metabolic profile. This includes a safety minimum for calorie intake and per-meal distribution based on meal plan type.
- **Fitness System Integration with Daily Macro Adjustment**: Dynamically adjusts daily calorie targets and meal macros based on selected workouts. Users select exercise type and duration, which updates calorie breakdown and macro targets across the application. Workout selection occurs in Fitness System page; Calorie Breakdown display (4 cards: TEE, Weight Loss Goal, Daily Fitness Routine, DCT) shown in Daily Meal Calculator. All calorie calculations use unrounded values internally with rounding only for display.
- **Daily Meal Calculator - Waterfall Calculation System**: Determines recommended food portions using a three-step waterfall algorithm (carbohydrates, then protein, then fat) to meet meal-specific macro targets. All macro contributions are calculated from actual portion sizes using formula `(gramsNeeded / 100) * macroPer100g` to ensure accuracy and consistency. Supports three-category food selection (carbohydrate, protein, fat) and provides ounce-based recommendations.
- **Detox & Organ Support Protocol**: Comprehensive wellness page featuring independent, collapsible protocol sections (Parasite Symptom, Leaky Gut, and 6 additional protocols). Each protocol includes: (1) Independent Body Health Assessment quiz with protocol-specific questions for accurate risk assessment; (2) Symptom Tracker with 0-10 scales for daily monitoring of digestive, energy, mood, and sleep symptoms; (3) Education section with evidence-based information on causes, symptoms, and support strategies; (4) Supplement Protocol with color-coded timing guide (with meals, on empty stomach, 30 minutes before meals) showing optimal absorption times. Parasite Symptom includes 36 assessment questions across 6 categories with 9 targeted supplements. Leaky Gut includes 12 assessment questions with 6 gut-healing supplements. Additional protocols: Adrenal Stress & Cortisol Balance, Heavy Metal Detox Support, Whole Body Detox, Liver Detox & Regeneration, Kidney Detox, Gallbladder Flush & Bile Flow Optimization.

## Backend

### Technology Stack
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript with ES modules
- **ORM**: Drizzle ORM
- **Database Driver**: Neon Serverless for PostgreSQL
- **Session Management**: `express-session`
- **Password Security**: `bcryptjs`

### Architecture Pattern
- **API-First Design**: RESTful API endpoints under `/api`.
- **Session-Based Authentication**: Server-side sessions with httpOnly cookies.
- **Middleware Chain**: Utilizes Express middleware for various functionalities.
- **Storage Abstraction**: Repository pattern for data access.

## Data Storage

### Database Schema
A PostgreSQL database with tables for:
- User authentication (`users`), profiles (`user_profiles`), and health assessments (`nutrition_questionnaire`).
- Metabolic calculations (`tee_calculations`, `body_fat_calculations`).
- Food items (`food_items`), meal planning (`meal_plans`, `meals`, `meal_foods`, `favorite_meals`, `favorite_meal_foods`, `recipes`, `recipe_ingredients`), and grocery lists (`grocery_lists`).
- Fitness tracking (`exercise_types`, `exercise_plans`, `daily_exercises`).
- Hydration (`water_intake`) and supplements (`supplements`, `user_supplements`).

### Data Relationships
- Cascade deletes for user-related data.
- Foreign keys ensure referential integrity.
- UUIDs for primary keys.
- Timestamps for audit trails.

## Authentication and Authorization

### Authentication Flow
- **Signup**: Email/password with bcrypt hashing.
- **Signin**: Credential verification.
- **Session Management**: Server-side sessions with auto-creation of user profiles on signup.

### Authorization Mechanism
- `requireAuth` middleware protects authenticated API routes.
- Session validation checks user ID and existence.

### Security Measures
- Password minimum length enforcement.
- HttpOnly and secure cookies to prevent XSS.
- Session secret via environment variables.

# External Dependencies

## Core Services
- **Neon Database**: Serverless PostgreSQL hosting.
- **WebSocket**: `ws` package for WebSocket support.

## Development Tools
- **TypeScript**: Strict type checking.
- **ESLint**: Code quality.
- **PostCSS**: CSS processing with Autoprefixer.
- **Drizzle Kit**: Database migration management.

## Frontend Libraries
- **Lucide React**: Icon library.
- **React Hook Form**: Form state management with validation.
- **@hookform/resolvers**: Zod integration for schema validation.
- **TanStack Query**: Server state caching and synchronization.

## Build and Deployment
- **Netlify**: Target deployment platform (configured via `netlify.toml`).
- **Vite**: Environment variable support and build process.