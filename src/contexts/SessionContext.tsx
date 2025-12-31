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
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useLocalStorage('is-guest', false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user || null);
        setIsLoading(false);

        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          setIsGuest(false); // If user signs in, they are no longer a guest
          navigate('/');
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          if (!isGuest) { // Only redirect to login if not already a guest
            navigate('/login');
          }
        }
      }
    );

    // Check initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user || null);
      setIsLoading(false);
      if (!initialSession && !isGuest) {
        navigate('/login');
      } else if (initialSession || isGuest) {
        navigate('/');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, isGuest, setIsGuest]);

  const logout = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setIsGuest(false); // Clear guest status on explicit logout
      navigate('/login');
    } else {
      console.error('Error logging out:', error.message);
    }
    setIsLoading(false);
  };

  return (
    <SessionContext.Provider value={{ session, user, isLoading, isGuest, logout }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};