# Hifdhometer — Project Context

## What This Is
A Quran hifdh (memorization) health tracker built for the Quran Foundation 
Hackathon. Applies spaced repetition / Ebbinghaus decay to memorized ayahs,
showing which are strong, fading, or at risk of being forgotten.

Core loop:
  User declares memorized ayahs → app tracks engagement over time → 
  decay algorithm scores each ayah → heatmap visualizes memory health →
  revision queue surfaces what needs attention today

## Tech Stack
- Next.js 15, TypeScript, Tailwind CSS, App Router
- shadcn/ui, Framer Motion, Recharts, Lucide React
- Zustand (installed, not heavily used yet)
- Raw fetch for Quran Foundation API (SDK auth didn't support Basic Auth)

## API Credentials
- Auth flow: POST to OAuth2 endpoint with Basic Auth header
  (Buffer.from(clientId:clientSecret).toString('base64'))
  body: grant_type=client_credentials&scope=content
- Two required headers on every content request:
  x-auth-token: {access_token}
  x-client-id: {clientId}
- Pre-prod auth URL:    https://prelive-oauth2.quran.foundation
- Pre-prod API base:    https://apis-prelive.quran.foundation/content/api/v4
- Production auth URL:  https://oauth2.quran.foundation
- Production API base:  https://apis.quran.foundation/content/api/v4
- Pre-prod returns only 2 chapters (limited data, all features enabled)
- Production has all 114 chapters (content only, user features pending approval)

## .env.local Structure
NEXT_PUBLIC_QURAN_CLIENT_ID=preprod_client_id
QURAN_CLIENT_SECRET=preprod_client_secret
QURAN_AUTH_URL=https://prelive-oauth2.quran.foundation
NEXT_PUBLIC_QURAN_API_BASE=https://apis-prelive.quran.foundation/content/api/v4

NEXT_PUBLIC_QURAN_CLIENT_ID_PROD=prod_client_id
QURAN_CLIENT_SECRET_PROD=prod_client_secret
QURAN_AUTH_URL_PROD=https://oauth2.quran.foundation
NEXT_PUBLIC_QURAN_API_BASE_PROD=https://apis.quran.foundation/content/api/v4

## User API Status
- Submitted scope request form for: Bookmarks, Reading Sessions, 
  Goals, Streaks, Activity Days, Users
- Awaiting approval — use localStorage (EngagementStore) until approved
- When approved: swap engagementStore source of truth, nothing else changes

## Verse Key Format
Always "2:255" — chapter:verse as string
Import VerseKey type from @/types/hifdh (re-exported from @quranjs/api)

## Real API Response Shapes (verified)
Chapter fields:
  id, name_simple, name_arabic, verses_count, 
  translated_name.name, revelation_place, bismillah_pre

## Files Created So Far
src/types/hifdh.ts         — all types: VerseKey, MemoryState, 
                             AyahEngagement, DecayedAyah, SurahGroup,
                             RevisionQueueItem, HifdhStats, AyahContent,
                             SurahMeta, DifficultyRating

src/lib/decay.ts           — Ebbinghaus decay algorithm
                             DECAY_LAMBDA = 0.05
                             calculateStrengthScore(), getMemoryState(),
                             calculateRevisionUrgency(), applyDecay(),
                             groupBySurah(), buildRevisionQueue(),
                             calculateHifdhStats(), daysSince()

src/data/surahMeta.ts      — all 114 surahs with correct ayah counts
                             exports SURAH_META and SURAH_META_MAP

src/data/mockEngagements.ts — one realistic user's engagement data
                             Juz Amma, Surah Yaseen, Al-Kahf first 10,
                             Ayat Al-Kursi (2:255)
                             Strong/amber/red/untracked distribution

src/lib/engagementStore.ts — localStorage-backed store
                             getAll(), get(), upsert(), markRevised(),
                             setDifficulty(), declareMemorized(),
                             seedIfEmpty(), clear(), isEmpty()
                             Singleton: engagementStore

src/lib/hifdhService.ts    — orchestration layer
                             init(), getDashboardData(), markRevised(),
                             setDifficulty(), getDecayedAyah()
                             Singleton: hifdhService

src/hooks/useHifdh.ts      — React hook wrapping hifdhService
                             returns: surahGroups, stats, revisionQueue,
                             isLoading, markRevised, setDifficulty

src/lib/quranContentApi.ts — raw fetch wrapper (NOT the SDK)
                             Basic Auth token management with caching
                             fetchChapters(), fetchVersesByChapter(),
                             fetchAyahContent()
                             Token cached with 60s expiry buffer
                             401 retry logic built in

## Decay Algorithm
strength = (0.65 × e^(-0.05 × daysSince)) + (0.35 × frequencyBoost)
         × difficultyWeight

frequencyBoost = min(log(1 + count) / log(21), 1.0)
difficultyWeight: easy=1.1, medium=1.0, hard=0.8

States:
  > 0.7  → strong (emerald)
  0.4–0.7 → review (amber)
  > 0 < 0.4 → weak (red)
  0      → untracked (zinc)

## Three-Tier Visual (from traditional hifdh methodology: Sabaq/Sabaq Dhor/Muraja'ah)
Within each color state, opacity varies by recency:
  daysSince <= 7:  opacity 1.0  (new lesson / Sabaq)
  daysSince <= 21: opacity 0.7  (recent / Sabaq Dhor)
  daysSince > 21:  opacity 0.45 (old revision / Muraja'ah)

## Mutashabihat (Similar Verses)
Hardcoded dataset of commonly confused verse pairs.
Similar ayahs get a 2px white dot on their heatmap square.
Full warning shown in detail panel.

## Prayer Time Suggestion (in detail panel)
Based on surah versesCount:
  1-10 ayahs:  "Good length for Fajr sunnah"
  11-30 ayahs: "Good length for Isha sunnah"
  31+ ayahs:   "Suitable for Tahajjud or Taraweeh"

