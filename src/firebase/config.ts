import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAFa-aPTgnfC8AVXHxpUv0JdllZY6Tc-IQ",
  authDomain: "ngl-1b75b.firebaseapp.com",
  projectId: "ngl-1b75b",
  storageBucket: "ngl-1b75b.firebasestorage.app",
  messagingSenderId: "328139920597",
  appId: "1:328139920597:web:b3c76a903e9143326fbe5c",
  measurementId: "G-JEJ0L14KKR"
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
  lat?: number | null;
  lng?: number | null;
  accurateGps?: boolean;
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

  // Submit to Firestore — directly await so real errors surface properly
  const messagesCollection = collection(db, 'messages');

  console.log('[Firebase] Writing message to Firestore...', { project: firebaseConfig.projectId });

  await addDoc(messagesCollection, {
    name: data.name || 'Anonymous',
    message: data.message,
    ipHash: data.ipHash || null,
    userAgent: data.userAgent || null,
    location: data.location || null,
    lat: data.lat ?? null,
    lng: data.lng ?? null,
    accurateGps: data.accurateGps ?? false,
    createdAt: serverTimestamp(),
  });

  console.log('[Firebase] Message written successfully ✓');
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
