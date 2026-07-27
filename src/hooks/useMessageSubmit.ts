import { useState } from 'react';
import { submitMessage } from '../firebase/config';
import { getClientLocation } from '../utils/ip';
import { sha256 } from '../utils/hash';
import { useToast } from './useToast';

/**
 * Custom hook to handle anonymous message submission to Firebase/LocalStorage.
 * Manages loading, success, and error states, and triggers toast alerts.
 */
export function useMessageSubmit() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const sendMessage = async (name: string, message: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // 1. Gather analytics and location details
      const userAgent = navigator.userAgent || null;

      let ipHash: string | null = null;
      let location: string | null = 'Unknown Location';
      let lat: number | null = null;
      let lng: number | null = null;
      let accurateGps = false;

      try {
        const details = await getClientLocation();
        if (details.ip) {
          ipHash = await sha256(details.ip);
        }
        if (details.location) {
          location = details.location;
        }
        if (details.lat != null) lat = details.lat;
        if (details.lng != null) lng = details.lng;
        if (details.accurateGps) accurateGps = true;
      } catch (locErr) {
        console.warn('Could not collect client location metrics:', locErr);
      }

      // 2. Validate content
      const cleanName = name.trim() ? name.trim() : 'Anonymous';
      const cleanMessage = message.trim();

      if (!cleanMessage) {
        throw new Error('Message is required.');
      }

      // 3. Submit details
      await submitMessage({
        name: cleanName,
        message: cleanMessage,
        userAgent,
        ipHash,
        location,
        lat,
        lng,
        accurateGps,
      });

      setSuccess(true);
      return true;
    } catch (err: any) {
      console.error('Error submitting message:', err);
      const errMsg = err?.message || 'Failed to send message. Please check your network and try again.';
      setError(errMsg);
      toast.error(errMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSuccess(false);
    setError(null);
  };

  return { sendMessage, loading, success, error, reset };
}
