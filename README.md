# Orania Squashclub Ladder App

A kiosk-friendly squash ladder management system built with Next.js and Supabase.

## Features

- 📊 **Ladder Screen**: View ranked players with challenge functionality
- 🏆 **Record Match**: Record match results with automatic ranking updates
- 📜 **History**: Complete audit log of all matches
- ⚙️ **Admin Panel**: PIN-protected admin access for player management
- 🖥️ **Kiosk Mode**: Full-screen mode with large, touch-friendly buttons
- 📥 **CSV Import/Export**: Import and export player data
- 🔒 **Duplicate Prevention**: Prevents duplicate matches within 5 minutes
- 🌱 **Seed Players**: Quick setup with sample players

## Ranking Rules

When a lower-ranked player beats a higher-ranked player:
- The winner takes the higher rank
- The loser moves one place down
- Players between the old positions are shifted accordingly

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase project (already configured)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=https://bdzdzyfkhikunyiednyq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Default Admin PIN

The default admin PIN is `1234`. Change it in the Admin panel after first login.

## Database Schema

The app uses Supabase with the following tables:

- **players**: Stores player information and ranks
- **matches**: Records all match results with scores
- **settings**: Stores app settings including admin PIN

## Kiosk Mode

Enable kiosk mode by clicking the "Kiosk Mode" button. This will:
- Enter full-screen mode
- Use larger buttons and text for touch interfaces
- Optimize the UI for on-site kiosks

## CSV Import/Export

### Export
Click "Export CSV" in the Admin panel to download all players as a CSV file.

### Import
Click "Import CSV" and select a CSV file with a "Name" column. Each row will create a new player.

## Testing the Ranking System

To verify that the ranking system works correctly:

1. Open the app in your browser
2. Go to the **Ladder** screen
3. Find a player ranked #2 or lower (e.g., Rank #5)
4. Click the **Challenge** button next to a higher-ranked player (e.g., Rank #2)
5. Enter the scores (winner score must be higher)
6. Click **Record Match**
7. The modal will close and the ladder will refresh
8. Verify that:
   - The winner now has the loser's old rank
   - The loser moved down by 1 position
   - All players between the old positions shifted down by 1

Alternatively, you can use the **Record Match** tab to record a match and see the same ranking updates apply.

## Deployment

The app can be deployed to:
- Vercel (recommended for Next.js)
- Netlify
- Any platform supporting Next.js

Make sure to set the environment variables in your deployment platform.

## License

MIT
