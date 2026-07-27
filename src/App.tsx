import { useState, useEffect } from 'react';
import { ToastProvider } from './components/Toast';
import { GlassCard } from './components/GlassCard';
import { MessageForm } from './components/MessageForm';
import { SuccessState } from './components/SuccessState';
import { Admin } from './pages/Admin';
import { useMessageSubmit } from './hooks/useMessageSubmit';
import { isDemoMode } from './firebase/config';
import { AlertTriangle, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Helper function for state-based client routing
const navigate = (path: string) => {
  window.history.pushState({}, '', path);
  const navEvent = new PopStateEvent('popstate');
  window.dispatchEvent(navEvent);
};

function AppContent() {
  const { sendMessage, loading, success, reset } = useMessageSubmit();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Sync pathname on browser navigation (back/forward)
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // Floating bubbles data for NGL organic background
  const bubbles = [
    { size: 'w-24 h-24', top: '12%', left: '15%', delay: 0 },
    { size: 'w-32 h-32', top: '65%', left: '8%', delay: 2 },
    { size: 'w-20 h-20', top: '25%', right: '12%', delay: 4 },
    { size: 'w-40 h-40', top: '75%', right: '15%', delay: 1 },
    { size: 'w-28 h-28', top: '45%', right: '8%', delay: 3 },
    { size: 'w-16 h-16', top: '85%', left: '45%', delay: 5 },
  ];

  const isAdminRoute = currentPath === '/admin';

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between items-center p-4 bg-[#fafafa] overflow-x-hidden select-none">
      
      {/* Floating bubbles background layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {bubbles.map((b, idx) => (
          <div
            key={idx}
            className={`bubble ${b.size}`}
            style={{
              top: b.top,
              left: b.left,
              right: b.right,
              animationDelay: `${b.delay}s`,
              animationDuration: `${12 + idx * 2}s`
            }}
          />
        ))}
      </div>

      {/* Demo mode top banner */}
      {isDemoMode && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.5 }}
          className="fixed top-20 z-50 flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/25 bg-amber-50/80 backdrop-blur-md text-amber-800 text-xs font-semibold shadow-md mx-4 text-center"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>Local storage preview mode (Firebase credentials missing)</span>
        </motion.div>
      )}

      {/* NGL Top Bar with navigation items */}
      <header className="w-full max-w-sm sm:max-w-xl flex justify-between items-center py-4 z-10 text-neutral-400">
        {/* Click warning triangle to secretly navigate to /admin */}
        <button 
          onClick={() => navigate(isAdminRoute ? '/' : '/admin')}
          className="p-2 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer" 
          aria-label="Toggle Admin"
          title="Toggle Admin View"
        >
          <AlertTriangle className={`w-6 h-6 stroke-[1.8] ${isAdminRoute ? 'text-rose-500' : ''}`} />
        </button>
        <button 
          onClick={() => navigate('/')}
          className="p-2 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer" 
          aria-label="Go Home"
          title="Return to main page"
        >
          <X className="w-6 h-6 stroke-[1.8]" />
        </button>
      </header>

      {/* Main card area with animations */}
      <main className="w-full max-w-sm sm:max-w-4xl flex-1 flex flex-col justify-center items-center z-10 py-6">
        <AnimatePresence mode="wait">
          {isAdminRoute ? (
            <motion.div
              key="admin-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="w-full flex justify-center"
            >
              <Admin />
            </motion.div>
          ) : !success ? (
            <motion.div
              key="form-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="w-full flex justify-center"
            >
              <MessageForm onSubmit={sendMessage} loading={loading} />
            </motion.div>
          ) : (
            <motion.div
              key="success-page"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-sm"
            >
              <GlassCard>
                <SuccessState onReset={reset} />
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer copyright */}
      <footer className="w-full py-6 text-center text-xs text-neutral-400 tracking-wider font-semibold z-10">
        &copy; {new Date().getFullYear()} NGL Inc. All rights reserved.
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
