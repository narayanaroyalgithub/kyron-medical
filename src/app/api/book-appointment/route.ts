// app/api/book-appointment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { DOCTORS, bookSlot, formatSlot } from '@/lib/doctors';
import { v4 as uuidv4 } from 'uuid';
import type { Appointment, PatientInfo } from '@/lib/types';

// In-memory store (replace with Supabase in production)
const appointments: Appointment[] = [];

export async function POST(req: NextRequest) {
  try {
    const { doctorId, date, time, patient } = await req.json();

    if (!doctorId || !date || !time || !patient) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const doctor = DOCTORS.find(d => d.id === doctorId);
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    // Book the slot
    const success = bookSlot(doctorId, date, time);
    if (!success) {
      return NextResponse.json({ error: 'Slot no longer available' }, { status: 409 });
    }

    const appointment: Appointment = {
      id: uuidv4(),
      patient: patient as PatientInfo,
      doctorId,
      doctorName: doctor.name,
      specialty: doctor.specialty,
      date,
      time,
      bookedAt: new Date().toISOString(),
    };

    appointments.push(appointment);

    return NextResponse.json({
      success: true,
      appointment,
      formattedSlot: formatSlot({ date, time, available: false }),
    });

  } catch (error) {
    console.error('Book appointment error:', error);
    return NextResponse.json({ error: 'Failed to book appointment' }, { status: 500 });
  }
}
