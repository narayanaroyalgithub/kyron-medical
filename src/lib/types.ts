// lib/types.ts

export interface PatientInfo {
  firstName: string;
  lastName: string;
  dob: string;
  phone: string;
  email: string;
  reason: string;
  smsOptIn?: boolean;
}

export interface Appointment {
  id: string;
  patient: PatientInfo;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  bookedAt: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatState {
  messages: Message[];
  patientInfo: Partial<PatientInfo>;
  selectedDoctor: string | null;
  selectedSlot: { date: string; time: string } | null;
  appointmentBooked: boolean;
  appointment: Appointment | null;
  stage: 
    | 'greeting'
    | 'collecting_info'
    | 'matching_doctor'
    | 'showing_slots'
    | 'confirming'
    | 'booked'
    | 'other_workflow';
}
