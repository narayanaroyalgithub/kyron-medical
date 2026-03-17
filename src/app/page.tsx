// app/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import type { Message, PatientInfo, Appointment } from '@/lib/types';
import ChatMessage from '@/components/ChatMessage';
import TypingIndicator from '@/components/TypingIndicator';
import CallButton from '@/components/CallButton';
import ModelSelector, { type ModelOption } from '@/components/ModelSelector';
import AppointmentConfirmation from '@/components/AppointmentConfirmation';
import Header from '@/components/Header';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [patientInfo, setPatientInfo] = useState<Partial<PatientInfo>>({});
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [showCallPrompt, setShowCallPrompt] = useState(false);
  const [conversationId] = useState(() => uuidv4());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasGreeted = useRef(false);
  const [selectedModel, setSelectedModel] = useState<ModelOption>('gpt-4o');

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Initial greeting
  useEffect(() => {
    if (hasGreeted.current) return;
    hasGreeted.current = true;

    const greeting: Message = {
      id: uuidv4(),
      role: 'assistant',
      content: "Welcome to **Kyron Medical Group**.\n\nI'm Kyra, your virtual care coordinator. I can assist you with scheduling appointments, prescription refills, and general practice information.\n\nHow may I assist you today?",
      timestamp: new Date(),
    };
    setMessages([greeting]);
  }, []);

  const sendMessage = async (messageText?: string) => {
    const text = (messageText || input).trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          patientInfo,
          conversationId,
          model: selectedModel
        }),
      });

      const data = await response.json();

      if (data.error) throw new Error(data.error);

      // Update patient info if extracted
      if (data.extractedPatientData) {
        setPatientInfo(prev => ({ ...prev, ...data.extractedPatientData }));
      }
      // Update patient info if extracted
      if (data.extractedPatientData) {
        setPatientInfo(prev => ({ ...prev, ...data.extractedPatientData }));
      }

      // Fallback: scan last user message for phone number
      const lastUserMsg = [...messages, userMessage].filter(m => m.role === 'user').pop();
      if (lastUserMsg) {
        const phoneMatch = lastUserMsg.content.match(/\b(\d{10}|\d{3}[-.\s]\d{3}[-.\s]\d{4}|\(\d{3}\)\s?\d{3}[-.\s]\d{4})\b/);
      if (phoneMatch) {
        setPatientInfo(prev => ({ 
          ...prev, 
        phone: phoneMatch[1].replace(/[-.\s()]/g, '') 
        }));
      }
}


      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Handle booking action
      if (data.action?.type === 'BOOK_APPOINTMENT') {
        await handleBookAppointment(data.action.data);
      }

      // Show call button once we have their phone number
      if (patientInfo.phone || data.extractedPatientData?.phone) {
        setShowCallPrompt(true);
      }

    } catch (error) {
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: "I'm sorry, I ran into a technical issue. Please try again or call us at **(617) 555-0100**.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleBookAppointment = async (actionData: {
    doctorId: string;
    date: string;
    time: string;
  }) => {
    try {
      const bookRes = await fetch('/api/book-appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...actionData,
          patient: patientInfo,
        }),
      });

      const bookData = await bookRes.json();
      if (!bookData.success) return;

      setAppointment(bookData.appointment);

      // Send confirmation email & SMS
      await fetch('/api/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointment: bookData.appointment,
          sendSms: patientInfo.smsOptIn,
        }),
      });

    } catch (error) {
      console.error('Booking error:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickReplies = [
    "Schedule an appointment",
    "Request a prescription refill",
    "Office hours & location",
    "Insurance information",
  ];

  return (
    <main className="main-bg h-screen w-screen overflow-hidden relative flex flex-col">
      {/* Background orbs */}
      {/* Background orbs */}
<div className="orb" style={{ width: 500, height: 500, background: '#0d2a4a', top: '-150px', right: '-100px', animationDelay: '0s', opacity: 0.6 }} />
<div className="orb" style={{ width: 300, height: 300, background: '#0d2a4a', top: '20%', left: '-50px', animationDelay: '2s', opacity: 0.4 }} />

      {/* Header */}
      <Header />

      {/* Chat area */}
      <div className="flex-1 overflow-hidden flex flex-col max-w-4xl w-full mx-auto px-4 pb-4">
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <ChatMessage message={message} />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <TypingIndicator />
            </motion.div>
          )}

          {/* Appointment confirmation card */}
          {appointment && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <AppointmentConfirmation appointment={appointment} />
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Model selector */}
        <ModelSelector selected={selectedModel} onChange={setSelectedModel} />

        {/* Quick replies (show only at start) */}
        {messages.length <= 1 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2 mb-3"
          >
            {quickReplies.map((reply) => (
              <button
                key={reply}
                onClick={() => sendMessage(reply)}
                className="quick-reply"
                style={{ fontSize: '13px' }}
              >
                {reply}
              </button>
            ))}
          </motion.div>
        )}

        {/* Call button — shows after greeting, uses collected phone or placeholder */}
        {messages.length >= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3"
          >
            <CallButton
              phoneNumber={patientInfo.phone || ''}
              patientName={patientInfo.firstName}
              messages={messages}
              patientInfo={patientInfo}
              appointment={appointment}
            />
          </motion.div>
        )}

        {/* Input area */}
        <div className="glass-strong rounded-2xl p-3 flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="chat-input flex-1 bg-transparent rounded-xl px-4 py-3 text-sm"
            disabled={isLoading}
            autoFocus
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 flex-shrink-0"
            style={{ background: 'background: radial-gradient(ellipse at top, #1a0533 0%, #0d0d1a 50%, #0a2a3d 100%)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <p className="text-center text-xs mt-2" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Kyra AI • Not a substitute for professional medical advice
        </p>
      </div>
    </main>
  );
}
