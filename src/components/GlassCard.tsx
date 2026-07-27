import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        type: 'spring', 
        stiffness: 110, 
        damping: 20, 
        mass: 1.1 
      }}
      className={`ngl-card relative w-full overflow-hidden p-8 sm:p-10 ${className}`}
    >
      {/* Subtle shine details on the NGL gradient card */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none" />
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-44 h-44 bg-white/10 rounded-full filter blur-2xl pointer-events-none" />
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};
