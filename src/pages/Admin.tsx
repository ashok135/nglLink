import React, { useState, useEffect } from 'react';
import { db, isDemoMode, deleteMessage } from '../firebase/config';
import type { MessageData } from '../firebase/config';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useToast } from '../hooks/useToast';
import { Spinner } from '../components/Spinner';
import { Trash2, MapPin, Clock, ShieldAlert, LogOut, MessageSquare, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Admin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      setIsLoggedIn(true);
      toast.success('Successfully logged in as Administrator.');
    } else {
      toast.error('Invalid username or password.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    toast.success('Logged out successfully.');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    
    try {
      await deleteMessage(id);
      toast.success('Message deleted successfully.');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to delete message.');
    }
  };

  // Live snapshot listener for Firestore or LocalStorage changes
  useEffect(() => {
    if (!isLoggedIn) return;
    setLoading(true);

    if (isDemoMode || !db) {
      // Fallback local storage loader
      const loadLocal = () => {
        const stored = localStorage.getItem('anon_messages');
        const parsed = stored ? JSON.parse(stored) : [];
        parsed.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setMessages(parsed);
      };
      
      loadLocal();
      setLoading(false);

      const interval = setInterval(loadLocal, 1500);
      return () => clearInterval(interval);
    } else {
      // Real-time Firestore document updates
      const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const fetched: MessageData[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            fetched.push({
              id: doc.id,
              name: data.name || 'Anonymous',
              message: data.message || '',
              createdAt: data.createdAt,
              location: data.location || 'Unknown Location',
              userAgent: data.userAgent || null,
              ipHash: data.ipHash || null,
              lat: data.lat ?? null,
              lng: data.lng ?? null,
              accurateGps: data.accurateGps ?? false,
            });
          });
          setMessages(fetched);
          setLoading(false);
        },
        (error) => {
          console.error('Firestore connection error:', error);
          toast.error('Could not stream messages from database.');
          setLoading(false);
        }
      );
      return () => unsubscribe();
    }
  }, [isLoggedIn]);

  // Utility to format Firestore server timestamp or string dates
  const formatTime = (createdAt: any) => {
    if (!createdAt) return 'Just now';
    
    let date: Date;
    if (createdAt?.seconds) {
      date = new Date(createdAt.seconds * 1000);
    } else {
      date = new Date(createdAt);
    }
    
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="relative w-full max-w-4xl min-h-[75vh] flex flex-col justify-center items-center">
      <AnimatePresence mode="wait">
        {!isLoggedIn ? (
          // Glassmorphic Login Form
          <motion.div
            key="login"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-sm"
          >
            <div className="ngl-card p-8 text-white relative">
              {/* Card light reflection */}
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none rounded-3xl" />
              
              <div className="relative z-10 space-y-6">
                <header className="text-center space-y-2">
                  <ShieldAlert className="w-12 h-12 text-white/90 mx-auto animate-pulse" />
                  <h1 className="text-2xl font-extrabold font-display tracking-tight">Admin Portal</h1>
                  <p className="text-white/60 text-xs font-medium">Please authenticate to access messages.</p>
                </header>

                <form onSubmit={handleLogin} className="space-y-4 text-left">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-white/70">Username</label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="admin"
                      className="w-full px-4 py-3 rounded-xl border-none bg-white/20 placeholder-white/40 text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-300 text-sm font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-white/70">Password</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl border-none bg-white/20 placeholder-white/40 text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-300 text-sm font-semibold"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full mt-2 py-4 bg-black text-white font-bold rounded-full text-center hover:bg-neutral-900 transition-all duration-300 active:scale-[0.98] shadow-lg shadow-black/10 cursor-pointer"
                  >
                    Authenticate
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      window.history.pushState({}, '', '/');
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    }}
                    className="w-full mt-2 py-3 border border-white/20 hover:bg-white/10 text-white font-semibold rounded-full text-center transition-all duration-300 active:scale-[0.98] cursor-pointer text-sm"
                  >
                    Back to Send Message
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        ) : (
          // Admin Dashboard View
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="w-full space-y-6"
          >
            {/* Top Stat and Control bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm w-full">
              <div className="flex items-center gap-3 text-left">
                <div className="p-3 bg-rose-50 rounded-2xl text-rose-500">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-neutral-800 font-display">Admin Dashboard</h2>
                  <p className="text-neutral-400 text-xs font-medium">
                    {loading ? 'Refreshing feed...' : `${messages.length} messages collected`}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    window.history.pushState({}, '', '/');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-neutral-100 text-neutral-800 text-sm font-bold rounded-full hover:bg-neutral-200 transition-all duration-300 active:scale-[0.97] cursor-pointer shadow-sm shrink-0"
                >
                  <span>Go Home</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white text-sm font-bold rounded-full hover:bg-neutral-800 transition-all duration-300 active:scale-[0.97] cursor-pointer shadow-md shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>

            {/* List Feed */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Spinner size="lg" className="text-rose-500" />
                <p className="text-neutral-400 text-sm font-semibold">Streaming messages...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="bg-white rounded-3xl border border-neutral-100 p-16 text-center shadow-sm w-full space-y-4">
                <div className="text-5xl">🤫</div>
                <h3 className="text-lg font-bold text-neutral-700 font-display">No Messages Found</h3>
                <p className="text-neutral-400 text-sm max-w-xs mx-auto">
                  Messages submitted by visitors will stream live to this dashboard dashboard.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 w-full">
                <AnimatePresence initial={false}>
                  {messages.map((msg, index) => (
                    <motion.div
                      key={msg.id || index}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20, transition: { duration: 0.18 } }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25, delay: Math.min(index * 0.04, 0.4) }}
                      className="relative bg-white border border-neutral-100 hover:border-rose-100 p-6 sm:p-8 rounded-3xl text-left shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row justify-between items-start gap-6 group"
                    >
                      <div className="space-y-4 flex-1">
                        <p className="text-neutral-800 text-lg font-medium leading-relaxed break-words whitespace-pre-wrap">
                          "{msg.message}"
                        </p>
                        
                        {/* Meta Tags */}
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-neutral-400">
                          <span className="flex items-center gap-1.5 text-rose-500/80">
                            <Clock className="w-3.5 h-3.5" />
                            {formatTime(msg.createdAt)}
                          </span>

                          {/* Location badge — links to Google Maps if GPS coords available */}
                          {msg.lat != null && msg.lng != null ? (
                            <a
                              href={`https://www.google.com/maps?q=${msg.lat},${msg.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 transition-colors"
                              title="Open in Google Maps"
                            >
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{msg.location || 'View on Map'}</span>
                              {msg.accurateGps && (
                                <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold tracking-wide">
                                  GPS ✓
                                </span>
                              )}
                            </a>
                          ) : (
                            <span className="flex items-center gap-1.5 text-blue-500/80">
                              <MapPin className="w-3.5 h-3.5" />
                              {msg.location || 'Unknown Location'}
                            </span>
                          )}

                          {msg.userAgent && (
                            <span className="flex items-center gap-1.5 text-neutral-400/80 max-w-[250px] truncate" title={msg.userAgent}>
                              <Terminal className="w-3.5 h-3.5 shrink-0" />
                              {msg.userAgent}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => msg.id && handleDelete(msg.id)}
                        className="p-3 bg-neutral-50 text-neutral-400 hover:bg-rose-50 hover:text-rose-500 rounded-full transition-all duration-300 active:scale-95 cursor-pointer shrink-0"
                        title="Delete Message"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
