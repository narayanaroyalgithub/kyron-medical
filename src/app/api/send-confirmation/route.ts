// app/api/send-confirmation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import type { Appointment } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { appointment, sendSms } = await req.json();
    const appt = appointment as Appointment;

    const results: { email?: string; sms?: string; errors: string[] } = { errors: [] };

    const apptDate = new Date(appt.date + 'T12:00:00');
    const formattedDate = apptDate.toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    });

    // ── Email via Resend ──────────────────────────────────────────
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY || '');

      const emailHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8">
<style>
body{font-family:'Helvetica Neue',Arial,sans-serif;background:#f0f4f8;margin:0;padding:20px}
.container{max-width:600px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)}
.header{background:linear-gradient(135deg,#0A1628 0%,#1B3A6B 50%,#00B4D8 100%);padding:40px 32px;text-align:center}
.header h1{color:white;margin:0;font-size:28px;font-weight:700}
.header p{color:#90E0EF;margin:8px 0 0;font-size:14px}
.body{padding:32px}
.greeting{font-size:18px;color:#1B3A6B;font-weight:600;margin-bottom:8px}
.subtitle{color:#64748b;margin-bottom:24px}
.highlight{background:linear-gradient(135deg,#0A1628,#00B4D8);color:white;border-radius:8px;padding:16px 24px;text-align:center;margin:24px 0}
.highlight .date{font-size:22px;font-weight:700}
.highlight .time{font-size:16px;opacity:0.9;margin-top:4px}
.card{background:linear-gradient(135deg,#f8fafc,#e8f4f8);border:1px solid #e2e8f0;border-radius:12px;padding:24px;margin:24px 0}
.detail-row{display:flex;align-items:center;margin:10px 0}
.detail-label{color:#64748b;font-size:13px;width:100px;flex-shrink:0}
.detail-value{color:#0A1628;font-weight:600;font-size:15px}
.note{background:#fef9ec;border-left:4px solid #f59e0b;padding:12px 16px;border-radius:0 8px 8px 0;font-size:13px;color:#92400e;margin:16px 0}
.footer{background:#f8fafc;padding:24px 32px;text-align:center;border-top:1px solid #e2e8f0}
.footer p{color:#94a3b8;font-size:12px;margin:4px 0}
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>✓ Appointment Confirmed</h1>
    <p>Kyron Medical Group</p>
  </div>
  <div class="body">
    <p class="greeting">Hi ${appt.patient.firstName}!</p>
    <p class="subtitle">Your appointment has been successfully scheduled.</p>
    <div class="highlight">
      <div class="date">📅 ${formattedDate}</div>
      <div class="time">🕐 ${appt.time}</div>
    </div>
    <div class="card">
      <div class="detail-row"><span class="detail-label">Doctor</span><span class="detail-value">${appt.doctorName}</span></div>
      <div class="detail-row"><span class="detail-label">Specialty</span><span class="detail-value">${appt.specialty}</span></div>
      <div class="detail-row"><span class="detail-label">Reason</span><span class="detail-value">${appt.patient.reason}</span></div>
      <div class="detail-row"><span class="detail-label">Location</span><span class="detail-value">123 Health Plaza, Suite 400, Boston, MA 02101</span></div>
      <div class="detail-row"><span class="detail-label">Ref #</span><span class="detail-value">${appt.id.slice(0,8).toUpperCase()}</span></div>
    </div>
    <div class="note">⚠️ Please arrive 15 minutes early. Bring a photo ID and insurance card.</div>
    <p style="color:#64748b;font-size:13px">Need to reschedule? Call <strong>(617) 555-0100</strong></p>
  </div>
  <div class="footer">
    <p>Kyron Medical Group • 123 Health Plaza, Suite 400, Boston, MA 02101</p>
    <p>(617) 555-0100 • info@kyronmedical.com</p>
  </div>
</div>
</body>
</html>`;

      await resend.emails.send({
        from: 'Kyron Medical <onboarding@resend.dev>',
        to: [appt.patient.email],
        subject: `Appointment Confirmed: ${formattedDate} at ${appt.time}`,
        html: emailHtml,
      });

      results.email = 'sent';
    } catch (emailError) {
      console.error('Email error:', emailError);
      results.errors.push('Email failed to send');
    }

    // ── SMS via Twilio ────────────────────────────────────────────
    if (sendSms && appt.patient.smsOptIn && appt.patient.phone) {
      try {
        const twilio = require('twilio');
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        await client.messages.create({
          body: `Hi ${appt.patient.firstName}! Appt confirmed at Kyron Medical: ${formattedDate} at ${appt.time} with ${appt.doctorName}. Ref: ${appt.id.slice(0,8).toUpperCase()}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: appt.patient.phone,
        });
        results.sms = 'sent';
      } catch (smsError) {
        console.error('SMS error:', smsError);
        results.errors.push('SMS failed to send');
      }
    }

    return NextResponse.json({ success: true, results });

  } catch (error) {
    console.error('Send confirmation error:', error);
    return NextResponse.json({ error: 'Failed to send confirmation' }, { status: 500 });
  }
}