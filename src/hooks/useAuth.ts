import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';
import { createProfile } from '../lib/database';

export function useAuth() {
  const setUser = useAuthStore((state) => state.setUser);
  const setSession = useAuthStore((state) => state.setSession);
  const deviceId = useAuthStore((state) => state.deviceId);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const userDeviceId = session.user.user_metadata.deviceId;
        if (userDeviceId && userDeviceId !== deviceId) {
          supabase.auth.signOut();
        } else {
          setSession(session);
          setUser(session.user);
          // Create profile if it doesn't exist
          createProfile({
            id: session.user.id,
            email: session.user.email!,
            full_name: session.user.user_metadata.full_name || null
          }).catch(console.error);
        }
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Create profile when user signs in
        await createProfile({
          id: session.user.id,
          email: session.user.email!,
          full_name: session.user.user_metadata.full_name || null
        }).catch(console.error);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setSession, deviceId]);
}