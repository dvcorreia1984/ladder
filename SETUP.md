# Setup Instructions

## Getting Your Supabase Anon Key

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/bdzdzyfkhikunyiednyq

2. Navigate to **Settings** → **API**

3. Copy the **anon/public** key

4. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://bdzdzyfkhikunyiednyq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The app will be available at http://localhost:3000

## First Time Setup

1. Open the app in your browser
2. Click "Admin" and enter PIN: `1234`
3. Go to the "Players" tab
4. Click "Seed Sample Players" to add 8 sample players
5. Start recording matches!

## Service Role Key (Optional)

For production deployments, you may want to create API routes that use the service role key for admin operations instead of client-side operations. Currently, the app uses the anon key with RLS policies.

To get the service role key:
1. Go to **Settings** → **API**
2. Copy the **service_role** key (keep this secret!)
3. Add it to `.env.local` as `SUPABASE_SERVICE_ROLE_KEY`

Note: The service role key bypasses RLS and should never be exposed in client-side code.
