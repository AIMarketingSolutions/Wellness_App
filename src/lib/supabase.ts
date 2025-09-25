import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file contains VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
}

// Validate URL format
try {
  new URL(supabaseUrl)
} catch {
  throw new Error(`Invalid VITE_SUPABASE_URL format: "${supabaseUrl}". Expected format: https://your-project-id.supabase.co`)
}

// Validate that the URL is not a placeholder
if (supabaseUrl.includes('your-project-ref') || supabaseUrl.includes('placeholder')) {
  throw new Error('VITE_SUPABASE_URL appears to be a placeholder. Please replace with your actual Supabase project URL from your Supabase dashboard.')
}

// Validate that the anon key is not a placeholder
if (supabaseAnonKey.includes('your-anon-key') || supabaseAnonKey.includes('placeholder') || supabaseAnonKey.length < 100) {
  throw new Error('VITE_SUPABASE_ANON_KEY appears to be invalid or a placeholder. Please replace with your actual anon key from your Supabase dashboard.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helper functions
export const signUp = async (email: string, password: string, name: string) => {
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