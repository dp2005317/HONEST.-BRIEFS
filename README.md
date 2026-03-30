# HONEST. BRIEFS - Luxury Magazine News Aggregator

An elegantly designed, high-end editorial-style news aggregator built with Next.js, Firebase, and TailwindCSS. HONEST. BRIEFS goes beyond standard news sites by offering a sophisticated, asymmetric magazine UI featuring a cinematic cover hero, editorial grids, and bold condensed typography set against a premium dark luxury aesthetic with gold accents.

## Features

- **Cinematic Cover Hero**: Immersive, full-screen featured news presentation.
- **Editorial Grids**: Asymmetric layout styled after premium print magazines.
- **Luxury Aesthetic**: Dark mode primary UI with sophisticated gold accents.
- **Real-Time News**: Aggregates and displays latest news via RSS with SWR.
- **Smooth Animations**: Glassmorphism and micro-animations driven by Framer Motion.
- **Firebase Integration**: Robust backend support for preferences, authentication, and data sync.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (React 19)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Backend/DB**: [Firebase](https://firebase.google.com/)
- **Data Fetching**: [SWR](https://swr.vercel.app/) & [rss-parser](https://www.npmjs.com/package/rss-parser)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Configuration & Environment Variables

You will need to set up Firebase environment variables to connect the app to your own Firebase project. Check `.env.local` for the expected format.

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

