import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase';

// Payfast ITN (Instant Transaction Notification) handler
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const data: Record<string, string> = {};
    
    // Convert FormData to object
    for (const [key, value] of formData.entries()) {
      data[key] = value.toString();
    }

    // Verify signature
    const passphrase = await getSetting('payfast_passphrase') || '';
    const signature = generatePayfastSignature(data, passphrase);

    if (signature !== data.signature) {
      console.error('Invalid Payfast signature');
      return new NextResponse('Invalid signature', { status: 400 });
    }

    // Get payment ID from custom_int1
    const paymentId = data.custom_int1;
    if (!paymentId) {
      return new NextResponse('Payment ID missing', { status: 400 });
    }

    const admin = getSupabaseAdmin();

    // Update payment status
    let status: 'pending' | 'completed' | 'failed' | 'cancelled' = 'pending';
    if (data.payment_status === 'COMPLETE') {
      status = 'completed';
    } else if (data.payment_status === 'CANCELLED') {
      status = 'cancelled';
    } else if (data.payment_status === 'FAILED') {
      status = 'failed';
    }

    const { error } = await admin
      .from('payments')
      .update({
        status,
        transaction_id: data.pf_payment_id,
        payfast_payment_id: data.pf_payment_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentId);

    if (error) {
      console.error('Error updating payment:', error);
      return new NextResponse('Database error', { status: 500 });
    }

    // Return success response to Payfast
    return new NextResponse('OK', { status: 200 });
  } catch (error: any) {
    console.error('ITN handler error:', error);
    return new NextResponse('Error processing notification', { status: 500 });
  }
}

// Generate Payfast signature
function generatePayfastSignature(data: Record<string, string>, passphrase: string): string {
  // Remove empty values and signature
  const filteredData = Object.fromEntries(
    Object.entries(data).filter(([key, value]) => key !== 'signature' && value !== '' && value !== null)
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

