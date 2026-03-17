// app/api/vapi-call/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, patientName, chatHistory, patientInfo, appointment } = await req.json();

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number required' }, { status: 400 });
    }

    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+1${phoneNumber}`;

    const chatSummary = chatHistory
      ?.slice(-8)
      .map((m: { role: string; content: string }) => 
        `${m.role === 'user' ? 'Patient' : 'Kyra'}: ${m.content}`)
      .join('\n') || '';

    const systemPrompt = `You are Kyra, a warm medical receptionist at Kyron Medical Group. 
You are on a phone call continuing a web chat conversation.

PREVIOUS CHAT:
${chatSummary}

${patientInfo?.firstName ? `Patient name: ${patientInfo.firstName} ${patientInfo.lastName || ''}` : ''}
${appointment ? `Appointment booked: ${appointment.doctorName} on ${appointment.date} at ${appointment.time}` : ''}

RULES:
- Be warm and conversational
- Never give medical advice or diagnoses  
- If emergency, tell them to call 911
- Keep responses short and natural for voice
- You already know the patient from the chat`;

    const vapiResponse = await fetch('https://api.vapi.ai/call/phone', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
        customer: {
          number: formattedPhone,
        },
        assistant: {
          firstMessage: `Hi ${patientInfo?.firstName || 'there'}, this is Kyra from Kyron Medical. I'm continuing from our chat. How can I help you?`,
          model: {
            provider: 'openai',
            model: 'gpt-4o',
            messages: [{ role: 'system', content: systemPrompt }],
          },
          voice: {
            provider: 'openai',
            voiceId: 'alloy',
          },
          endCallFunctionEnabled: true,
          silenceTimeoutSeconds: 20,
          maxDurationSeconds: 600,
        },
      }),
    });

    const vapiData = await vapiResponse.json();

    if (!vapiResponse.ok) {
      console.error('Vapi error:', vapiData);
      return NextResponse.json(
        { error: JSON.stringify(vapiData) },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, callId: vapiData.id });

  } catch (error) {
    console.error('Vapi call error:', error);
    return NextResponse.json({ error: 'Failed to initiate call' }, { status: 500 });
  }
}