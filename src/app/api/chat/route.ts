// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { buildSystemPrompt } from '@/lib/systemPrompt';

type ModelOption = 'gpt-4o' | 'claude' | 'gemini';

async function callGemini(systemPrompt: string, messages: { role: string; content: string }[]): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  // Build contents array — Gemini needs alternating user/model roles
  // We convert the full conversation into a single user prompt with history embedded
  const conversationText = messages
    .map(m => `${m.role === 'user' ? 'Patient' : 'Kyra'}: ${m.content}`)
    .join('\n');

  const fullPrompt = `${systemPrompt}\n\nConversation so far:\n${conversationText}\n\nKyra:`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig: { maxOutputTokens: 800, temperature: 0.7 },
      }),
    }
  );

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(`Gemini error: ${JSON.stringify(data)}`);
  }

  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function callClaude(systemPrompt: string, messages: { role: string; content: string }[]): Promise<string> {
  const Anthropic = await import('@anthropic-ai/sdk');
  const anthropic = new Anthropic.default({ apiKey: process.env.ANTHROPIC_API_KEY });
  const res = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 800,
    system: systemPrompt,
    messages: messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  });
  return (res.content[0] as { text: string }).text || '';
}

async function callGPT(systemPrompt: string, messages: { role: string; content: string }[]): Promise<string> {
  const { default: OpenAI } = await import('openai');
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ],
    temperature: 0.7,
    max_tokens: 800,
  });
  return completion.choices[0]?.message?.content || '';
}

export async function POST(req: NextRequest) {
  try {
    const { messages, patientInfo, conversationId, model = 'gpt-4o' } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages required' }, { status: 400 });
    }

    const systemPrompt = buildSystemPrompt();
    let contextNote = '';
    if (patientInfo && Object.keys(patientInfo).length > 0) {
      contextNote = `\n\nALREADY COLLECTED FROM PATIENT: ${JSON.stringify(patientInfo)}. Do not ask for info you already have.`;
    }

    const fullPrompt = systemPrompt + contextNote;
    let responseText = '';

    if (model === 'gemini') {
      responseText = await callGemini(fullPrompt, messages);
    } else if (model === 'claude') {
      responseText = await callClaude(fullPrompt, messages);
    } else {
      responseText = await callGPT(fullPrompt, messages);
    }

    let cleanResponse = responseText;
    let action = null;
    let extractedPatientData = null;

    const patientDataMatch = responseText.match(/PATIENT_DATA:(\{.*?\})/s);
    if (patientDataMatch) {
      try {
        extractedPatientData = JSON.parse(patientDataMatch[1]);
        cleanResponse = cleanResponse.replace(/PATIENT_DATA:\{.*?\}/s, '').trim();
      } catch (e) { console.error('Failed to parse patient data:', e); }
    }

    const actionMatch = responseText.match(/ACTION:(\w+):(\{.*?\})/s);
    if (actionMatch) {
      try {
        action = { type: actionMatch[1], data: JSON.parse(actionMatch[2]) };
        cleanResponse = cleanResponse.replace(/ACTION:\w+:\{.*?\}/s, '').trim();
      } catch (e) { console.error('Failed to parse action:', e); }
    }

    return NextResponse.json({
      message: cleanResponse,
      action,
      extractedPatientData,
      conversationId,
      modelUsed: model,
    });

  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process message. Please try again.' },
      { status: 500 }
    );
  }
}