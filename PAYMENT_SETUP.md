# Payment Integration Setup Guide

Die betalingsfunksie is geïntegreer met Payfast, 'n Suid-Afrikaanse betalingsplatform.

## Database Setup

Voeg die volgende tabel by aan jou Supabase database:

```sql
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'ZAR',
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  payment_method VARCHAR(50) DEFAULT 'payfast',
  transaction_id VARCHAR(255),
  payfast_payment_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_player_id ON payments(player_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
```

## Payfast Setup

1. **Registreer 'n Payfast rekening**
   - Gaan na https://www.payfast.co.za/
   - Skep 'n handelaar rekening
   - Kry jou Merchant ID en Merchant Key

2. **Stel Payfast geloofsbriewe in**
   - Gaan na Admin paneel → Settings tab
   - Vul jou Payfast Merchant ID in
   - Vul jou Payfast Merchant Key in
   - Vul jou Payfast Passphrase in (indien beskikbaar)
   - Klik "Save Payment Settings"

## Environment Variables

Voeg die volgende by jou `.env.local`:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Of jou produksie URL
PAYFAST_ENV=sandbox  # Of 'production' vir produksie
```

## Testing

Vir toetsing, gebruik Payfast se sandbox omgeving:
- Sandbox URL: https://sandbox.payfast.co.za/eng/process
- Test kaart nommers kan gevind word op Payfast se dokumentasie

## Gebruik

1. **Betalings maak:**
   - Gaan na die Ladder skerm
   - Klik op die 💳 betalingsknoppie langs 'n speler
   - Vul die betalingsvorm in
   - Klik "Proceed to Payfast"
   - Voltooi die betaling op Payfast se platform

2. **Betalingsstatus:**
   - Na betaling sal gebruikers na `/payment/return` gelei word
   - Die status sal automaties opgedateer word via Payfast se ITN (Instant Transaction Notification)

## Features

- ✅ Payfast integrasie vir Suid-Afrikaanse betalings
- ✅ Veilige betalingsverwerking
- ✅ Automatiese status updates
- ✅ Betalingsgeskiedenis (kan uitgebrei word)
- ✅ Ondersteuning vir beide sandbox en produksie omgewings
- ✅ Volledige Afrikaans en Engels vertalings

## Notas

- Die betalingsfunksie gebruik Payfast se form-gebaseerde integrasie
- Alle betalings word in die `payments` tabel gestoor
- Betalingsstatus word opgedateer deur Payfast se ITN callback
- Admin gebruikers kan Payfast instellings konfigureer in die Admin paneel

