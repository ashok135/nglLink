import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ArrowLeft } from 'lucide-react';

interface SuccessStateProps {
  onReset: () => void;
}

export const SuccessState: React.FC<SuccessStateProps> = ({ onReset }) => {
  useEffect(() => {
    // Guard against confetti not being fully loaded or resolved in ES Module builds
    if (typeof confetti !== 'function') {
      console.warn('Canvas-confetti library is not available or failed to load.');
      return;
    }

    // Confetti explosion
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      try {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.8 },
          colors: ['#ffffff', '#f43f5e', '#f97316'],
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.8 },
          colors: ['#ffffff', '#f43f5e', '#f97316'],
        });
      } catch (err) {
        console.warn('Confetti burst execution failed:', err);
      }

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    
    frame();
  }, []);

  const pathVariants = {
    initial: { pathLength: 0, opacity: 0 },
    animate: { 
      pathLength: 1, 
      opacity: 1,
      transition: { duration: 0.6, ease: "easeInOut" as const, delay: 0.3 } 
    }
  };

  const circleVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 260, damping: 20 } 
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-6 text-center">
      {/* Checkmark Animation */}
      <div className="relative mb-6">
        <motion.div
          variants={circleVariants}
          initial="initial"
          animate="animate"
          className="w-20 h-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white"
        >
          <svg
            className="w-10 h-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <motion.path
              variants={pathVariants}
              initial="initial"
              animate="animate"
              d="M20 6L9 17l-5-5"
            />
          </svg>
        </motion.div>
        
        {/* Glow backdrop */}
        <div className="absolute inset-0 w-20 h-20 bg-white/10 rounded-full filter blur-xl -z-10 animate-pulse" />
      </div>

      {/* Success Messages */}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="text-2xl font-bold tracking-tight text-white mb-2 font-display"
      >
        Sent!
      </motion.h3>
      
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="text-white/95 text-base max-w-xs leading-relaxed mb-8"
      >
        Your message has been sent successfully ❤️
      </motion.p>

      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        onClick={onReset}
        className="group relative flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-white/20 bg-white/10 hover:bg-white/15 text-white transition-all duration-300 shadow-md cursor-pointer hover:shadow-lg"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span className="font-semibold text-sm">Send Another Message</span>
      </motion.button>
    </div>
  );
};
