// lib/doctors.ts
// Hardcoded doctors and their availability for the next 30-60 days

export interface TimeSlot {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM AM/PM
  available: boolean;
}

export interface Doctor {
  id: string;
  name: string;
  title: string;
  specialty: string;
  bodyParts: string[]; // keywords for semantic matching
  description: string;
  availability: TimeSlot[];
}

// Generate dates from today + 3 days to today + 60 days
function generateDates(daysAhead: number[], times: string[]): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const today = new Date();
  
  daysAhead.forEach(day => {
    const date = new Date(today);
    date.setDate(today.getDate() + day);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) return;
    
    const dateStr = date.toISOString().split('T')[0];
    times.forEach(time => {
      slots.push({ date: dateStr, time, available: true });
    });
  });
  
  return slots;
}

export const DOCTORS: Doctor[] = [
  {
    id: "dr-smith",
    name: "Dr. Emily Smith",
    title: "MD, Orthopedic Surgeon",
    specialty: "Orthopedics",
    bodyParts: [
      "knee", "knees", "hip", "hips", "shoulder", "shoulders",
      "back", "spine", "joint", "joints", "bone", "bones",
      "ankle", "ankles", "wrist", "elbow", "orthopedic",
      "fracture", "arthritis", "sports injury", "muscle", "tendon",
      "ligament", "cartilage"
    ],
    description: "Specializes in joint replacement, sports injuries, and fracture care.",
    availability: generateDates(
      [3,4,5,7,8,10,11,12,14,15,17,18,19,21,22,24,25,26,28,29,31,32,33,35,36,38,39,40,42,43],
      ["9:00 AM", "10:30 AM", "2:00 PM", "3:30 PM"]
    )
  },
  {
    id: "dr-patel",
    name: "Dr. Raj Patel",
    title: "MD, Ophthalmologist",
    specialty: "Ophthalmology",
    bodyParts: [
      "eye", "eyes", "vision", "sight", "glasses", "contacts",
      "cataract", "glaucoma", "retina", "cornea", "eyelid",
      "blurry vision", "eye pain", "eye infection", "eye irritation",
      "optic", "pupil", "iris", "floaters", "blind spot"
    ],
    description: "Expert in eye diseases, vision correction, and eye surgery.",
    availability: generateDates(
      [3,5,6,8,9,11,12,13,15,16,18,19,20,22,23,25,26,27,29,30,32,33,34,36,37,39,40,41,43,44],
      ["8:30 AM", "11:00 AM", "1:30 PM", "4:00 PM"]
    )
  },
  {
    id: "dr-chen",
    name: "Dr. Linda Chen",
    title: "MD, Cardiologist",
    specialty: "Cardiology",
    bodyParts: [
      "heart", "chest", "chest pain", "palpitations", "heartbeat",
      "blood pressure", "hypertension", "cardiac", "cardiovascular",
      "artery", "arteries", "vein", "veins", "circulation",
      "shortness of breath", "irregular heartbeat", "cholesterol",
      "heart attack", "stroke risk", "ecg", "ekg"
    ],
    description: "Specializes in heart disease, hypertension, and cardiovascular health.",
    availability: generateDates(
      [4,5,7,8,10,11,12,14,15,17,18,21,22,24,25,28,29,31,32,35,36,38,39,42,43,45],
      ["9:30 AM", "11:30 AM", "2:30 PM", "4:30 PM"]
    )
  },
  {
    id: "dr-jones",
    name: "Dr. Marcus Jones",
    title: "MD, Dermatologist",
    specialty: "Dermatology",
    bodyParts: [
      "skin", "rash", "acne", "mole", "moles", "eczema", "psoriasis",
      "dermatitis", "hives", "itching", "itchy", "sunburn", "wound",
      "scar", "hair loss", "nail", "nails", "wart", "warts",
      "melanoma", "skin cancer", "dry skin", "oily skin", "pimple",
      "blackhead", "cyst", "abscess", "ringworm", "fungal"
    ],
    description: "Expert in skin conditions, cosmetic procedures, and skin cancer screening.",
    availability: generateDates(
      [3,4,6,7,9,10,13,14,16,17,20,21,23,24,27,28,30,31,34,35,37,38,41,42,44,45],
      ["10:00 AM", "12:00 PM", "3:00 PM", "5:00 PM"]
    )
  }
];

// Practice info for other workflows
export const PRACTICE_INFO = {
  name: "Kyron Medical Group",
  address: "123 Health Plaza, Suite 400, Boston, MA 02101",
  phone: "(617) 555-0100",
  email: "info@kyronmedical.com",
  hours: {
    monday: "8:00 AM - 6:00 PM",
    tuesday: "8:00 AM - 6:00 PM",
    wednesday: "8:00 AM - 8:00 PM",
    thursday: "8:00 AM - 6:00 PM",
    friday: "8:00 AM - 5:00 PM",
    saturday: "9:00 AM - 1:00 PM",
    sunday: "Closed"
  },
  parking: "Free parking available in the building garage",
  insurance: "We accept most major insurance plans including Blue Cross, Aetna, Cigna, UnitedHealth, and Medicare."
};

// Find available slots for a doctor (next 10 available)
export function getAvailableSlots(doctorId: string, limit = 8): TimeSlot[] {
  const doctor = DOCTORS.find(d => d.id === doctorId);
  if (!doctor) return [];
  
  const today = new Date();
  return doctor.availability
    .filter(slot => slot.available && new Date(slot.date) > today)
    .slice(0, limit);
}

// Format slot for display
export function formatSlot(slot: TimeSlot): string {
  const date = new Date(slot.date + 'T12:00:00');
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  return `${dayName}, ${dateStr} at ${slot.time}`;
}

// Book a slot (mark as unavailable)
export function bookSlot(doctorId: string, date: string, time: string): boolean {
  const doctor = DOCTORS.find(d => d.id === doctorId);
  if (!doctor) return false;
  
  const slot = doctor.availability.find(s => s.date === date && s.time === time);
  if (!slot || !slot.available) return false;
  
  slot.available = false;
  return true;
}
