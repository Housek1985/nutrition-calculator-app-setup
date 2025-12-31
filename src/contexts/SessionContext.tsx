import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from '@/hooks/use-local-storage';

interface SessionContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isGuest: boolean;
  setIsGuest: (value: boolean) => void;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useLocalStorage('is-guest', false);
  const navigate = useNavigate(); // Keep navigate for logout

  useEffect(() => {
    const getInitialSession = async () => {
      setIsLoading(true);
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user || null);
      // The initial isGuest state is already loaded by useLocalStorage
      setIsLoading(false);
    };

    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user || null);
        setIsLoading(false);

        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          // If signed in, ensure guest status is false
          setIsGuest(false);
          localStorage.setItem('is-guest', JSON.stringify(false));
          // AuthWrapper will handle navigation to '/'
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          // If signed out and not a guest, navigate to login
          // AuthWrapper will also handle this, but explicit navigation here ensures immediate redirect
          // if the user was previously authenticated and then signed out.
          const guestStatusFromLS = localStorage.getItem('is-guest');
          const currentIsGuestFromLS = guestStatusFromLS ? JSON.parse(guestStatusFromLS) : false;
          if (!currentIsGuestFromLS) {
            navigate('/login');
          }
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, setIsGuest]); // Dependencies: navigate for logout, setIsGuest for internal state management

  const logout = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setIsGuest(false); // Clear guest status on explicit logout
      localStorage.setItem('is-guest', JSON.stringify(false)); // Explicitly clear local storage
      navigate('/login');
    } else {
      console.error('Napaka pri odjavi:', error.message);
    }
    setIsLoading(false);
  };

  return (
    <SessionContext.Provider value={{ session, user, isLoading, isGuest, setIsGuest, logout }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession mora biti uporabljen znotraj SessionProviderja');
  }
  return context;
};