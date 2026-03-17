// components/Header.tsx
'use client';

import { motion } from 'framer-motion';

export default function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-strong border-b py-4 px-6 flex items-center justify-between"
      style={{ borderColor: 'rgba(255,255,255,0.08)' }}
    >
      {/* Logo & Name */}
      <div className="flex items-center gap-3">
        {/* Logo mark */}
        <div className="relative">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1B3A6B, #00B4D8)' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"
                fill="white"
                opacity="0.3"
              />
              <path
                d="M11 7h2v2h-2zM11 11h2v6h-2z"
                fill="white"
              />
              <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.5" fill="none" opacity="0.4"/>
              <path d="M8 12h2M14 12h2M12 8v2M12 14v2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          {/* Online dot */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-navy" style={{ background: '#22c55e', borderColor: '#0A1628' }} />
        </div>

        <div>
          <h1 className="font-display font-semibold text-white" style={{ fontSize: '16px', letterSpacing: '-0.3px' }}>
            Kyron Medical
          </h1>
          <p className="text-xs" style={{ color: 'rgba(144, 224, 239, 0.7)' }}>
            AI Patient Portal
          </p>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 glass rounded-full px-4 py-2">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-xs font-medium" style={{ color: '#90E0EF' }}>
          Kyra is online
        </span>
      </div>
    </motion.header>
  );
}
