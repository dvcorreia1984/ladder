import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase';

// Payfast configuration
const PAYFAST_URL = process.env.PAYFAST_ENV === 'production' 
  ? 'https://www.payfast.co.za/eng/process'
  : 'https://sandbox.payfast.co.za/eng/process';

// Generate Payfast payment signature
function generatePayfastSignature(data: Record<string, string>, passphrase: string): string {
  // Remove empty values and signature
  const filteredData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== '' && value !== null)
  );
  
  // Sort alphabetically
  const sortedKeys = Object.keys(filteredData).sort();
  
  // Create query string
  const queryString = sortedKeys
    .map(key => `${key}=${encodeURIComponent(filteredData[key])}`)
    .join('&');
  
  // Add passphrase
  const fullString = queryString + (passphrase ? `&passphrase=${encodeURIComponent(passphrase)}` : '');
  
  // Generate MD5 hash
  return crypto.createHash('md5').update(fullString).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    const admin = getSupabaseAdmin();

    switch (action) {
      case 'initiate':
        // Get Payfast credentials from settings
        const merchantId = await getSetting('payfast_merchant_id');
        const merchantKey = await getSetting('payfast_merchant_key');
        const passphrase = await getSetting('payfast_passphrase') || '';
        
        if (!merchantId || !merchantKey) {
          return NextResponse.json(
            { error: 'Payfast credentials not configured. Please configure in Admin settings.' },
            { status: 400 }
          );
        }

        // Create payment record
        const { data: payment, error: paymentError } = await admin
          .from('payments')
          .insert({
            player_id: params.player_id,
            amount: params.amount,
            currency: params.currency || 'ZAR',
            status: 'pending',
            payment_method: 'payfast',
          })
          .select()
          .single();

        if (paymentError) throw paymentError;

        // Prepare Payfast payment data
        const payfastData: Record<string, string> = {
          merchant_id: merchantId,
          merchant_key: merchantKey,
          return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/return?payment_id=${payment.id}`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/cancel?payment_id=${payment.id}`,
          notify_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payment/notify`,
          name_first: params.first_name || '',
          name_last: params.last_name || '',
          email_address: params.email || '',
          cell_number: params.cell_number || '',
          amount: params.amount.toFixed(2),
          item_name: params.description || `Payment for Player ${params.player_id}`,
          custom_int1: payment.id, // Payment ID for tracking
        };

        // Generate signature
        const signature = generatePayfastSignature(payfastData, passphrase);
        payfastData.signature = signature;

        return NextResponse.json({
          success: true,
          payment_id: payment.id,
          payfast_url: PAYFAST_URL,
          payfast_data: payfastData,
        });

      case 'status':
        const { data: paymentStatus, error: statusError } = await admin
          .from('payments')
          .select('*, player:players(*)')
          .eq('id', params.payment_id)
          .single();

        if (statusError) throw statusError;
        return NextResponse.json({ success: true, payment: paymentStatus });

      case 'getSetting':
        const value = await getSetting(params.key);
        return NextResponse.json({ success: true, value });

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Payment API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Helper function to get settings
async function getSetting(key: string): Promise<string | null> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('settings')
    .select('value')
    .eq('key', key)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data?.value || null;
}

// ITN (Instant Transaction Notification) handler
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Handle Payfast ITN callback
  if (searchParams.has('payment_id')) {
    const paymentId = searchParams.get('payment_id');
    const admin = getSupabaseAdmin();
    
    const { data: payment, error } = await admin
      .from('payments')
      .select('*, player:players(*)')
      .eq('id', paymentId)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, payment });
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
}

