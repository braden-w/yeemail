## Description

YEEmail is an AI-powered email assistant that automatically extracts event information from your inbox and syncs it with your calendar. Here's how it works:

1. Securely connects to students' Gmail accounts via OAuth.
2. Utilizes Llama 3.1 8B to analyze emails and extract event information.
3. Presents a categorized, curated list of academic and extracurricular opportunities.
4. With one click, syncs approved events to Google Calendar.

No more manual data entry, no more missed opportunities. YEEmail ensures you're always in the loop, saving you hours each week and helping you stay on top of your busy student life.

https://github.com/user-attachments/assets/48f495cc-5231-441e-bcb9-11e741618956

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

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Inspiration

In today's fast-paced academic environment, students are inundated with emails about meetings, workshops, study groups, and extracurricular activities. Managing this constant influx of information is not just time-consuming—it's a bottleneck to campus engagement. YEEmail was born from a vision to revolutionize how students interact with their educational ecosystem, transforming email overload into streamlined opportunity.

## How we built it
- Next.js 14 with React for a dynamic, responsive frontend
- tRPC and TanStack Query for end-to-end typesafe data management
- Supabase for real-time database capabilities and authentication
- Vercel AI SDK integrated with Llama 3.1 8B for powerful, efficient text analysis
- Gmail and GCal APIs for secure email and calendar integration
- Cloudflare Workers and Pages for serverless processing, API interactions, and orchestrating data flow between services

This tech stack enables YEEmail to process complex data swiftly while providing a seamless user experience.

## What's next for YEEmail

Our vision for YEEmail extends beyond individual calendar management:

1. Developing a recommendation system for academic events based on a student's major and interests.
2. Creating a collaborative platform for student organizations to share and manage events.
3. Implementing image processing to extract event details from posters or flyers attached to emails.
4. Expanding our calendar integration to support platforms beyond Google Calendar.
5. Refining our AI model to improve accuracy and handle more complex event descriptions.

YEEmail is poised to become an indispensable tool in higher education, streamlining time management for students. We envision it as a central hub for campus event scheduling, with future features like event recommendations and shared calendars for student organizations. We can't wait to see how it transforms the way students manage their time and engage with their communities!
