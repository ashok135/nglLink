import React, { useState } from 'react';
import { useToast } from '../hooks/useToast';
import { Spinner } from './Spinner';
import { GlassCard } from './GlassCard';

interface MessageFormProps {
  onSubmit: (name: string, message: string) => Promise<boolean>;
  loading: boolean;
}

export const MessageForm: React.FC<MessageFormProps> = ({ onSubmit, loading }) => {
  const [message, setMessage] = useState('');
  const toast = useToast();

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value.slice(0, 500));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const trimmedMsg = message.trim();
    if (!trimmedMsg) {
      toast.error('Please write a message before sending.');
      return;
    }

    // Name is omitted for NGL layout, default to "Anonymous"
    const success = await onSubmit('Anonymous', message);
    if (success) {
      setMessage('');
    }
  };

  const charCount = message.length;
  
  // Character counter color adjustments for status warnings
  let counterColorClass = 'text-white/40';
  if (charCount >= 480) {
    counterColorClass = 'text-rose-300 font-bold';
  } else if (charCount >= 400) {
    counterColorClass = 'text-amber-200';
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center w-full max-w-sm">
      <GlassCard>
        {/* NGL Style Card Header */}
        <header className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display leading-tight">
            Send me anonymous messages!
          </h1>
        </header>
        
        {/* NGL Style Capsule Textarea */}
        <div className="relative text-left">
          <textarea
            id="message-input"
            value={message}
            onChange={handleMessageChange}
            disabled={loading}
            placeholder="Reply to me"
            rows={4}
            className="w-full px-6 py-8 rounded-[2rem] border-none bg-white/20 placeholder-white/50 text-white text-center text-lg focus:outline-none focus:ring-2 focus:ring-white/30 hover:bg-white/25 transition-all duration-300 disabled:opacity-50 resize-none font-medium leading-normal shadow-inner"
          />
          <span className={`text-xs font-mono text-right block mt-2 pr-4 transition-colors duration-200 ${counterColorClass}`}>
            {charCount}/500
          </span>
        </div>
      </GlassCard>

      {/* NGL Style Black Capsule Reply Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full mt-8 py-4 px-6 rounded-full font-bold text-white bg-black hover:bg-neutral-900 shadow-xl shadow-black/10 hover:shadow-black/20 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2"
      >
        {loading ? <Spinner size="sm" /> : null}
        <span className="text-lg">Reply</span>
      </button>
    </form>
  );
};
