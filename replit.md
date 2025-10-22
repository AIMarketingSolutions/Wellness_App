# Overview

Nutrition One Fitness Inc. is a comprehensive wellness application that provides personalized nutrition planning, fitness tracking, and health assessment tools. Its primary purpose is to help users achieve their health goals through metabolic profiling, customized meal planning, exercise tracking, and progress monitoring, aiming to be a complete solution for personalized health and fitness.

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