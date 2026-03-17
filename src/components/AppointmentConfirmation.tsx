// components/AppointmentConfirmation.tsx
'use client';

import { motion } from 'framer-motion';
import type { Appointment } from '@/lib/types';

export default function AppointmentConfirmation({ appointment }: { appointment: Appointment }) {
  const date = new Date(appointment.date + 'T12:00:00');
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const details = [
    { icon: '📅', label: 'Date', value: formattedDate },
    { icon: '🕐', label: 'Time', value: appointment.time },
    { icon: '👨‍⚕️', label: 'Doctor', value: appointment.doctorName },
    { icon: '🏥', label: 'Specialty', value: appointment.specialty },
    { icon: '📋', label: 'Reason', value: appointment.patient.reason },
    { icon: '📍', label: 'Location', value: '123 Health Plaza, Suite 400, Boston, MA 02101' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(0, 180, 216, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 180, 216, 0.1)',
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center gap-3"
        style={{ background: 'linear-gradient(135deg, rgba(27,58,107,0.8), rgba(0,180,216,0.3))', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: '#22c55e' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.div>
        <div>
          <h3 className="font-semibold text-white text-sm">Appointment Confirmed!</h3>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(144,224,239,0.7)' }}>
            Ref #{appointment.id.slice(0, 8).toUpperCase()}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="p-5 space-y-3">
        {details.map((detail, i) => (
          <motion.div
            key={detail.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="flex items-start gap-3"
          >
            <span className="text-base flex-shrink-0 mt-0.5">{detail.icon}</span>
            <div className="flex-1 min-w-0">
              <span className="text-xs block mb-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {detail.label}
              </span>
              <span className="text-sm font-medium text-white">{detail.value}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="px-5 py-3 flex items-center justify-between"
        style={{ background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#22c55e' }} />
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Confirmation email sent to {appointment.patient.email}
          </span>
        </div>
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Arrive 15 min early
        </span>
      </div>
    </motion.div>
  );
}
