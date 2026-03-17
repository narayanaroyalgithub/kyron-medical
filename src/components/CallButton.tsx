// components/CallButton.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Message, PatientInfo, Appointment } from '@/lib/types';

interface Props {
  phoneNumber: string;
  patientName?: string;
  messages: Message[];
  patientInfo: Partial<PatientInfo>;
  appointment: Appointment | null;
}

export default function CallButton({ phoneNumber, patientName, messages, patientInfo, appointment }: Props) {
  const [state, setState] = useState<'idle' | 'calling' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const hasPhone = !!phoneNumber;

  const handleCall = async () => {
    if (!hasPhone) return;

    setState('calling');
    setErrorMsg('');

    try {
      const res = await fetch('/api/vapi-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, patientName, chatHistory: messages, patientInfo, appointment }),
      });

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Call failed');
      setState('success');
    } catch (err: any) {
      setState('error');
      setErrorMsg(err.message || 'Could not connect call. Please try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${hasPhone ? 'rgba(0,180,216,0.3)' : 'rgba(255,255,255,0.08)'}`,
        opacity: hasPhone ? 1 : 0.55,
      }}
    >
      <div className="p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: hasPhone ? 'linear-gradient(135deg,#1B3A6B,#00B4D8)' : 'rgba(255,255,255,0.1)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.06 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </div>
            {state === 'idle' && hasPhone && (
              <div className="absolute inset-0 rounded-full animate-ping" style={{ background: 'rgba(0,180,216,0.3)' }} />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Prefer to talk instead?</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {hasPhone
                ? <span>We'll call <span style={{ color: '#90E0EF' }}>{phoneNumber}</span> — AI continues your chat by voice</span>
                : 'Available after we collect your phone number in the chat'}
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {state === 'idle' && (
            <motion.button key="idle"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              onClick={handleCall}
              disabled={!hasPhone}
              className="flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200"
              style={{
                background: hasPhone ? 'linear-gradient(135deg,#1B3A6B,#00B4D8)' : 'rgba(255,255,255,0.08)',
                whiteSpace: 'nowrap',
                cursor: hasPhone ? 'pointer' : 'not-allowed',
              }}
            >
              📞 Call Me
            </motion.button>
          )}
          {state === 'calling' && (
            <motion.div key="calling" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl"
              style={{ background: 'rgba(0,180,216,0.15)', border: '1px solid rgba(0,180,216,0.3)' }}
            >
              <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: '#00B4D8', borderTopColor: 'transparent' }} />
              <span className="text-sm font-medium" style={{ color: '#90E0EF' }}>Connecting…</span>
            </motion.div>
          )}
          {state === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl"
              style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}
            >
              <span style={{ color: '#22c55e' }}>✓</span>
              <span className="text-sm font-medium" style={{ color: '#22c55e' }}>Calling now!</span>
            </motion.div>
          )}
          {state === 'error' && (
            <motion.button key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={handleCall}
              className="flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}
            >
              Retry
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {state === 'success' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="px-4 pb-3">
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>📱 Answer your phone — Kyra will greet you and continue this conversation by voice.</p>
          </motion.div>
        )}
        {state === 'error' && errorMsg && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="px-4 pb-3">
            <p className="text-xs" style={{ color: '#f87171' }}>⚠️ {errorMsg}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
