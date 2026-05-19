# Quran Recall

Quran Recall is a professional, distraction-free Quranic memorization tracking dashboard designed to assist users in maintaining their Hifdh (memorization) using spaced repetition. 

The application calculates the retention decay of memorized verses over time, guiding memorizers on when to revise specific verses before they slip from active memory.

## Architectural Overview

The application tracks the user's reading history and applies an Ebbinghaus-derived decay model to calculate memory strength for each verse (ayah). Based on this memory strength, it generates a prioritized revision queue and a comprehensive memorization heatmap.

### Key Components

- **Decay Engine**: Implements the Ebbinghaus forgetting curve, adjusting memory state based on elapsed time, recall frequency, and historical difficulty settings.
- **Revision Queue**: Auto-generates a list of verses requiring revision, sorting by urgency so the user knows exactly what to revise next.
- **Sanctuary Interface**: Designed with minimal UI noise, warm display typography (EB Garamond), and responsive layouts to maximize focus during reading sessions.
- **Onboarding Flow**: Synchronizes automatically with Quran.com reading history or allows users to manually specify their current progress.

---

## Technical Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Vanilla CSS
- **Components**: shadcn/ui primitives, Radix UI
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Package Manager**: npm

---

## Getting Started

### Prerequisites

Ensure you have Node.js 18.x or later installed on your system.

### Environment Setup

Create a `.env.local` file in the root directory and configure the following variables using your credentials:

```env
NEXT_PUBLIC_QURAN_CLIENT_ID=your_client_id
QURAN_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_QURAN_AUTH_URL=https://oauth2.quran.foundation
NEXT_PUBLIC_QURAN_API_BASE=https://apis.quran.foundation/content/api/v4
```

### Installation

Install the project dependencies:

```bash
npm install
```

### Running Locally

To start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### Building for Production

To create a production build:

```bash
npm run build
```

To run the production server:

```bash
npm start
```

---

## Project Structure

```text
├── src/
│   ├── app/                 # Next.js pages, layouts, and API routes
│   ├── components/          # Reusable UI components and feature-specific blocks
│   ├── data/                # Static metadata (e.g., surah definitions)
│   ├── hooks/               # Custom React hooks (auth, query hooks)
│   ├── lib/                 # Core utilities (decay algorithm, api wrappers)
│   └── types/               # TypeScript interface definitions
├── public/                  # Static assets
├── tailwind.config.ts       # Tailwind CSS configuration
└── tsconfig.json            # TypeScript configuration
```

---

## Quality Assurance

### Linting and Formatting

Run ESLint to check for code issues:

```bash
npm run lint
```

Run Prettier to check file formatting:

```bash
npm run format:check
```

To auto-format code files:

```bash
npm run format:write
```

### Type Checking

To verify TypeScript compilation and static typing:

```bash
npx tsc --noEmit
```
