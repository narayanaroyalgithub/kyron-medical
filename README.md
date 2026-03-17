# Kyron Medical — AI Patient Portal

A patient-facing web app where patients chat with an AI receptionist to schedule appointments, with a live handoff to a voice call that remembers the full conversation.

Built in under 24 hours for the Kyron Medical engineering interview.

**Live:** https://kyron-medical-omega.vercel.app  
**GitHub:** https://github.com/narayanaroyalgithub/kyron-medical

---

## What it does

- Patient chats with Kyra, an AI medical receptionist
- Collects name, DOB, phone, email, and reason for visit
- Semantically matches the patient to the right doctor based on symptoms
- Shows available slots and books the appointment conversationally
- Sends a branded confirmation email automatically via Resend
- Patient clicks Call Me — Vapi calls their phone within seconds and Kyra continues the exact same conversation by voice, with full chat context retained

## Doctors

| Doctor | Specialty | Treats |
|---|---|---|
| Dr. Emily Smith | Orthopedics | Knees, back, shoulders, joints |
| Dr. Raj Patel | Ophthalmology | Eyes, vision, cataracts |
| Dr. Linda Chen | Cardiology | Heart, chest, blood pressure |
| Dr. Marcus Jones | Dermatology | Skin, rashes, acne, moles |

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 14 | Fast, production-ready, great for API routes |
| AI | GPT-4o | Best structured output for scheduling workflows |
| Voice | Vapi.ai | End-to-end voice AI, handles calling and transcription |
| Email | Resend | Simple transactional email, clean API |
| Hosting | Vercel | Instant HTTPS, zero config deploys |
| Animations | Framer Motion | Smooth state transitions throughout |

## Environment Variables

API keys are stored in `.env.local` which is blocked by `.gitignore` and never committed to GitHub. To run locally, copy the example file and fill in your own keys:
```bash
cp .env.local.example .env.local
```

Keys needed:
```
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
RESEND_API_KEY=your_resend_api_key_here
VAPI_API_KEY=your_vapi_api_key_here
VAPI_PHONE_NUMBER_ID=your_vapi_phone_number_id_here
```

## Safety

The AI is explicitly instructed to never provide medical advice, never diagnose, and always direct emergencies to 911. Tested and verified.
