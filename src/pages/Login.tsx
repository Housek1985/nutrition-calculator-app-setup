import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Salad, Globe } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSession } from '@/contexts/SessionContext';

export default function Login() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isGuest: sessionIsGuest, setIsGuest: setSessionIsGuest, session } = useSession(); // Also get 'session' to check if already authenticated
  const { language, changeLanguage } = useLanguage();

  useEffect(() => {
    // If already authenticated or is guest, redirect to home
    if (session || sessionIsGuest) {
      navigate('/');
    }
    // Ensure language is set to 'sl' on initial load if not already 'sl' or 'en'
    if (i18n.language !== 'sl' && i18n.language !== 'en') {
      changeLanguage('sl');
    }
  }, [session, sessionIsGuest, navigate, i18n, changeLanguage]); // Added 'session' to dependencies

  const handleGuestLogin = () => {
    setSessionIsGuest(true); // Update guest status in SessionContext and localStorage
    // No explicit navigate here, AuthWrapper will handle the redirect based on updated isGuest state
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-4xl font-bold text-center mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center justify-center gap-2">
          <Salad className="h-9 w-9 text-primary" />
          {t('login.welcome')}
        </h1>
        <div className="bg-card p-6 rounded-lg shadow-lg border border-border">
          <Auth
            supabaseClient={supabase}
            providers={['google']}
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
            theme="light"
          />
        </div>
        <div className="text-center space-y-4">
          <Button variant="outline" onClick={handleGuestLogin} className="w-full">
            {t('login.continueAsGuest')}
          </Button>
          <div className="flex items-center justify-center gap-2">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <Select onValueChange={(value) => changeLanguage(value as 'en' | 'sl')} value={language}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('settings.language')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="sl">Slovenščina</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}