import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { seedSamplePlayers, getSetting, setSetting } from '@/lib/api';

// This API route can be used for admin operations in production
// Make sure to add authentication/authorization middleware

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'seed':
        await seedSamplePlayers();
        return NextResponse.json({ success: true, message: 'Players seeded successfully' });
      
      case 'getSetting':
        const value = await getSetting(params.key);
        return NextResponse.json({ success: true, value });
      
      case 'setSetting':
        await setSetting(params.key, params.value);
        return NextResponse.json({ success: true, message: 'Setting updated' });
      
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
