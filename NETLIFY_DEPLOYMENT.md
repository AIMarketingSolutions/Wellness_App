# Netlify Deployment Guide

## Environment Variables Setup

Your app uses Supabase for authentication and database functionality. To deploy successfully on Netlify, you need to set up the following environment variables:

### Required Environment Variables

1. **VITE_SUPABASE_URL** - Your Supabase project URL
2. **VITE_SUPABASE_ANON_KEY** - Your Supabase anonymous/public key

### How to Get These Values

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy the "Project URL" and "anon/public" key

### Setting Environment Variables in Netlify

1. Go to your Netlify site dashboard
2. Navigate to Site settings → Environment variables
3. Add the following variables:
   - `VITE_SUPABASE_URL` = `your-project-ref.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-anon-key-here`

### Important Notes

- These are **PUBLIC** environment variables and are safe to expose in client-side code
- The `netlify.toml` file has been configured to prevent Netlify's secrets scanner from flagging these as sensitive
- Supabase anon keys are designed to be public-facing and used in client applications

## Build Configuration

The project includes a `netlify.toml` file with the following features:

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: 18
- **Secrets scanning**: Configured to ignore Supabase public keys
- **SPA routing**: Redirects all routes to `index.html`
- **Security headers**: Basic security headers included
- **Asset caching**: Static assets are cached for performance

## Deployment Steps

1. Set up environment variables in Netlify (see above)
2. Connect your repository to Netlify
3. Deploy - the build should now succeed!

## Troubleshooting

If you still encounter secrets scanning issues:

1. Verify environment variables are set correctly in Netlify
2. Check that the `netlify.toml` file is in your project root
3. Ensure you're using the correct Supabase project URL and anon key
4. Try redeploying after making changes

## Local Development

For local development, create a `.env.local` file with:

```
VITE_SUPABASE_URL=your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Note**: Never commit `.env.local` to version control!
