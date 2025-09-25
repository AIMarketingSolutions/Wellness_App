import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create a mock client if credentials are missing or placeholders
const isPlaceholder = !supabaseUrl || !supabaseAnonKey || 
  supabaseUrl.includes('your-project-ref') || 
  supabaseUrl.includes('placeholder') ||
  supabaseAnonKey.includes('your-anon-key') || 
  supabaseAnonKey.includes('placeholder') ||
  supabaseAnonKey.length < 100;

// Use placeholder values for development if real credentials aren't available
const finalUrl = isPlaceholder ? 'https://placeholder.supabase.co' : supabaseUrl;
const finalKey = isPlaceholder ? 'placeholder-key' : supabaseAnonKey;

export const supabase = createClient(finalUrl, finalKey)

// Auth helper functions
export const signUp = async (email: string, password: string, name: string) => {
  if (isPlaceholder) {
    return { 
      data: null, 
      error: { 
        message: 'Supabase not configured. Please set up your Supabase credentials in the .env file. Go to https://supabase.com/dashboard to get your project URL and anon key.',
        details: 'Missing or placeholder Supabase credentials'
      } 
    }
  }
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: name,
        }
      }
    })
    return { data, error }
  } catch (networkError) {
    return { 
      data: null, 
      error: { 
        message: 'Network error: Unable to connect to Supabase. Please check your internet connection and Supabase configuration.',
        details: networkError
      } 
    }
  }
}

export const signIn = async (email: string, password: string) => {
  if (isPlaceholder) {
    return { 
      data: null, 
      error: { 
        message: 'Supabase not configured. Please set up your Supabase credentials in the .env file. Go to https://supabase.com/dashboard to get your project URL and anon key.',
        details: 'Missing or placeholder Supabase credentials'
      } 
    }
  }
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  } catch (networkError) {
    return { 
      data: null, 
      error: { 
        message: 'Network error: Unable to connect to Supabase. Please check your internet connection and Supabase configuration.',
        details: networkError
      } 
    }
  }
}

export const signOut = async () => {
  if (isPlaceholder) {
    return { 
      error: { 
        message: 'Supabase not configured. Please set up your Supabase credentials in the .env file.',
        details: 'Missing or placeholder Supabase credentials'
      } 
    }
  }
  
  try {
    const { error } = await supabase.auth.signOut()
    return { error }
  } catch (networkError) {
    return { 
      error: { 
        message: 'Network error: Unable to connect to Supabase. Please check your internet connection and Supabase configuration.',
        details: networkError
      } 
    }
  }
}

export const getCurrentUser = async () => {
  if (isPlaceholder) {
    return { 
      user: null, 
      error: { 
        message: 'Supabase not configured. Please set up your Supabase credentials in the .env file.',
        details: 'Missing or placeholder Supabase credentials'
      } 
    }
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  } catch (networkError) {
    return { 
      user: null, 
      error: { 
        message: 'Network error: Unable to connect to Supabase. Please check your internet connection and Supabase configuration.',
        details: networkError
      } 
    }
  }
}

export const resendConfirmationEmail = async (email: string) => {
  if (isPlaceholder) {
    return { 
      data: null, 
      error: { 
        message: 'Supabase not configured. Please set up your Supabase credentials in the .env file.',
        details: 'Missing or placeholder Supabase credentials'
      } 
    }
  }
  
  try {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    })
    return { data, error }
  } catch (networkError) {
    return { 
      data: null, 
      error: { 
        message: 'Network error: Unable to connect to Supabase. Please check your internet connection and Supabase configuration.',
        details: networkError
      } 
    }
  }
}