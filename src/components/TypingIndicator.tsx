// components/TypingIndicator.tsx
export default function TypingIndicator() {
  return (
    <div className="flex items-end gap-3">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #1B3A6B, #00B4D8)' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M8 12h2M14 12h2M12 8v2M12 14v2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.5" fill="none"/>
        </svg>
      </div>
      <div className="bubble-ai px-4 py-3 flex gap-2 items-center" style={{ minWidth: '64px' }}>
        <div className="typing-dot" />
        <div className="typing-dot" />
        <div className="typing-dot" />
      </div>
    </div>
  );
}
