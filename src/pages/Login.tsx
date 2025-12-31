import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next'; // Popravljena sintaksa uvoza
import { useNavigate } from 'react-router-dom';
import useLocalStorage from '@/hooks/use-local-storage';
import { useEffect } from 'react';
import { Salad } from 'lucide-react'; // Import Salad icon

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isGuest, setIsGuest] = useLocalStorage('is-guest', false);

  useEffect(() => {
    if (isGuest) {
      navigate('/');
    }
  }, [isGuest, navigate]);

  const handleGuestLogin = () => {
    setIsGuest(true);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-4xl font-bold text-center mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center justify-center gap-2">
          <Salad className="h-9 w-9 text-primary" /> {/* Added Salad icon here */}
          {t('login.welcome')}
        </h1>
        <div className="bg-card p-6 rounded-lg shadow-lg border border-border">
          <Auth
            supabaseClient={supabase}
            providers={[]} // Only email/password, no social providers for now
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(var(--primary))',
                    brandAccent: 'hsl(var(--accent))',
                    brandButtonText: 'hsl(var(--primary-foreground))',
                    inputBackground: 'hsl(var(--input))',
                    inputBorder: 'hsl(var(--border))',
                    inputBorderHover: 'hsl(var(--ring))',
                    inputBorderFocus: 'hsl(var(--ring))',
                    inputText: 'hsl(var(--foreground))',
                    inputLabelText: 'hsl(var(--muted-foreground))',
                    anchorTextColor: 'hsl(var(--primary))',
                    anchorTextHoverColor: 'hsl(var(--accent))',
                  },
                },
              },
            }}
            theme="light" // Use light theme, will be overridden by ThemeProvider if dark mode is active
          />
        </div>
        <div className="text-center">
          <Button variant="outline" onClick={handleGuestLogin} className="w-full">
            {t('login.continueAsGuest')}
          </Button>
        </div>
      </div>
    </div>
  );
}