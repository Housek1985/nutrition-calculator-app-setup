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
  setIsGuest: (value: boolean) => void; // Dodana funkcija za posodabljanje stanja gosta
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useLocalStorage('is-guest', false); // Uporabljamo useLocalStorage
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthAndGuestStatus = async () => {
      setIsLoading(true);

      // Pridobi trenutno sejo
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user || null);

      // Pridobi trenutno stanje gosta neposredno iz localStorage, da zagotovimo svežino
      const guestStatusFromLS = localStorage.getItem('is-guest');
      const currentIsGuestFromLS = guestStatusFromLS ? JSON.parse(guestStatusFromLS) : false;
      setIsGuest(currentIsGuestFromLS); // Posodobi stanje isGuest v kontekstu

      if (!currentSession && !currentIsGuestFromLS) {
        // Če ni seje in ni gost, preusmeri na prijavo
        navigate('/login');
      } else if (currentSession || currentIsGuestFromLS) {
        // Če je seja ali je gost, preusmeri na domačo stran
        navigate('/');
      }
      setIsLoading(false);
    };

    // Zaženi začetno preverjanje
    handleAuthAndGuestStatus();

    // Nastavi poslušalca za spremembe stanja avtentikacije
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user || null);
        setIsLoading(false);

        // Ponovno oceni stanje gosta ob dogodkih avtentikacije
        const guestStatusFromLS = localStorage.getItem('is-guest');
        const currentIsGuestFromLS = guestStatusFromLS ? JSON.parse(guestStatusFromLS) : false;
        setIsGuest(currentIsGuestFromLS); // Posodobi stanje isGuest v kontekstu

        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          // Če je prijavljen, zagotovi, da stanje gosta ni aktivno
          setIsGuest(false);
          localStorage.setItem('is-guest', JSON.stringify(false));
          navigate('/');
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          // Če je odjavljen in ni gost, pojdi na prijavo
          if (!currentIsGuestFromLS) {
            navigate('/login');
          }
          // Če je odjavljen in JE gost, ostani na '/' (obravnava AuthWrapper)
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, setIsGuest]); // setIsGuest je stabilna funkcija iz useLocalStorage

  const logout = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setIsGuest(false); // Počisti stanje gosta ob eksplicitni odjavi
      localStorage.setItem('is-guest', JSON.stringify(false));
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