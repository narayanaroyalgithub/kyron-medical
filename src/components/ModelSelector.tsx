// components/ModelSelector.tsx
'use client';

import { motion } from 'framer-motion';

export type ModelOption = 'gpt-4o' | 'claude' | 'gemini';

interface Props {
  selected: ModelOption;
  onChange: (model: ModelOption) => void;
}

const MODELS = [
  {
    id: 'gpt-4o' as ModelOption,
    label: 'GPT-4o',
    provider: 'OpenAI',
    color: '#10a37f',
    icon: '⚡',
    note: 'Best accuracy',
  },
  {
    id: 'claude' as ModelOption,
    label: 'Claude',
    provider: 'Anthropic',
    color: '#cc785c',
    icon: '🧠',
    note: 'Most nuanced',
  },
  {
    id: 'gemini' as ModelOption,
    label: 'Gemini',
    provider: 'Google',
    color: '#4285f4',
    icon: '✨',
    note: 'Fast responses',
  },
];

export default function ModelSelector({ selected, onChange }: Props) {
  return (
    <div className="flex items-center gap-2 px-1 mb-2">
      <span className="text-xs flex-shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }}>
        AI Model:
      </span>
      <div className="flex gap-1.5">
        {MODELS.map(m => (
          <motion.button
            key={m.id}
            onClick={() => onChange(m.id)}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
            style={{
              background: selected === m.id
                ? `${m.color}22`
                : 'rgba(255,255,255,0.04)',
              border: `1px solid ${selected === m.id ? m.color + '66' : 'rgba(255,255,255,0.08)'}`,
              color: selected === m.id ? m.color : 'rgba(255,255,255,0.4)',
            }}
          >
            <span>{m.icon}</span>
            <span>{m.label}</span>
            {selected === m.id && (
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: m.color }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
