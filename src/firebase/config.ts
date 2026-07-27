import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check if critical Firebase configuration settings are present
const isConfigValid = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

let app;
let db: ReturnType<typeof getFirestore> | null = null;
let isDemoMode = false;

if (isConfigValid) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
  } catch (error) {
    console.error('Failed to initialize Firebase SDK. Falling back to Demo Mode.', error);
    isDemoMode = true;
  }
} else {
  console.warn(
    'Firebase environment variables are missing. Running in "Demo Mode" with LocalStorage fallback.\n' +
    'To connect to your Firestore database, add a .env file with VITE_FIREBASE_* variables.'
  );
  isDemoMode = true;
}

export { db, isDemoMode };

export interface MessageData {
  id?: string;
  name: string;
  message: string;
  createdAt: any;
  ipHash?: string | null;
  userAgent?: string | null;
  location?: string | null;
}

/**
 * Submits the message data to either Firebase Firestore or falls back to
 * LocalStorage if running in Demo Mode.
 */
export async function submitMessage(data: Omit<MessageData, 'createdAt' | 'id'>): Promise<void> {
  if (isDemoMode || !db) {
    // Simulate realistic network delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Save to LocalStorage for preview demo
    const stored = localStorage.getItem('anon_messages');
    const messages = stored ? JSON.parse(stored) : [];
    const newMessage = {
      ...data,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
    };
    messages.push(newMessage);
    localStorage.setItem('anon_messages', JSON.stringify(messages));
    return;
  }

  // Submit to Firestore
  const messagesCollection = collection(db, 'messages');
  await addDoc(messagesCollection, {
    name: data.name || 'Anonymous',
    message: data.message,
    ipHash: data.ipHash || null,
    userAgent: data.userAgent || null,
    location: data.location || null,
    createdAt: serverTimestamp(),
  });
}

/**
 * Deletes a message by its ID from Firestore or LocalStorage depending on the mode.
 */
export async function deleteMessage(id: string): Promise<void> {
  if (isDemoMode || !db) {
    const stored = localStorage.getItem('anon_messages');
    if (stored) {
      const messages = JSON.parse(stored);
      const filtered = messages.filter((m: any) => m.id !== id);
      localStorage.setItem('anon_messages', JSON.stringify(filtered));
    }
    return;
  }

  const messageDocRef = doc(db, 'messages', id);
  await deleteDoc(messageDocRef);
}
