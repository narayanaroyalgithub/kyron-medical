// components/ChatMessage.tsx
'use client';

import React from 'react';
import type { Message } from '@/lib/types';

interface Props {
  message: Message;
}

// Simple markdown renderer (bold, italic, line breaks, lists, code blocks)
function renderMarkdown(text: string) {
  const elements: React.ReactNode[] = [];
  const lines = text.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block: ```[lang] ... ```
    if (line.trim().startsWith('```')) {
      const codeLines: string[] = [];
      i++; // skip opening fence
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      elements.push(
        <pre
          key={`code-${i}`}
          style={{
            background: 'rgba(0,0,0,0.35)',
            border: '1px solid rgba(0,180,216,0.2)',
            borderRadius: 8,
            padding: '10px 14px',
            fontSize: 13,
            overflowX: 'auto',
            margin: '6px 0',
            color: '#90E0EF',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {codeLines.join('\n')}
        </pre>
      );
      continue;
    }

    // Inline code: `code`
    let processed = line.replace(/`([^`]+)`/g, '<code style="background:rgba(0,0,0,0.3);padding:1px 5px;border-radius:4px;font-family:monospace;font-size:13px;color:#90E0EF">$1</code>');
    // Bold
    processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italic
    processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Bullet points
    if (processed.trim().startsWith('•') || processed.trim().match(/^[-*]\s/)) {
      elements.push(
        <div key={i} className="flex gap-2 my-0.5">
          <span style={{ color: '#00B4D8' }}>•</span>
          <span dangerouslySetInnerHTML={{ __html: processed.replace(/^[•\-*]\s*/, '') }} />
        </div>
      );
    } else if (processed.trim() === '') {
      elements.push(<br key={i} />);
    } else {
      elements.push(
        <span key={i}>
          <span dangerouslySetInnerHTML={{ __html: processed }} />
          {i < lines.length - 1 && <br />}
        </span>
      );
    }
    i++;
  }

  return elements;
}

const AI_AVATAR = (
  <div
    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
    style={{ background: 'linear-gradient(135deg, #1B3A6B, #00B4D8)' }}
  >
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M8 12h2M14 12h2M12 8v2M12 14v2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.5" fill="none"/>
    </svg>
  </div>
);

export default function ChatMessage({ message }: Props) {
  const isUser = message.role === 'user';
  const time = message.timestamp.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (isUser) {
    return (
      <div className="flex justify-end items-end gap-2">
        <div className="flex flex-col items-end gap-1 max-w-[75%]">
          <div
            className="bubble-user px-4 py-3 text-sm leading-relaxed"
            style={{ fontSize: '14px' }}
          >
            {message.content}
          </div>
          <span className="text-xs px-1" style={{ color: 'rgba(255,255,255,0.25)' }}>{time}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-3">
      {AI_AVATAR}
      <div className="flex flex-col gap-1 max-w-[80%]">
        <div
          className="bubble-ai px-4 py-3 leading-relaxed"
          style={{ fontSize: '14px' }}
        >
          {renderMarkdown(message.content)}
        </div>
        <span className="text-xs px-1" style={{ color: 'rgba(255,255,255,0.25)' }}>{time}</span>
      </div>
    </div>
  );
}
