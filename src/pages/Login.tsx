import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Salad, Globe, Sun, Moon } from 'lucide-react'; // Dodani Sun in Moon ikoni
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSession } from '@/contexts/SessionContext';
import { useTheme } from 'next-themes'; // Uvozi useTheme

export default function Login() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isGuest: sessionIsGuest, setIsGuest: setSessionIsGuest, session } = useSession();
  const { language, changeLanguage } = useLanguage();
  const { theme, setTheme } = useTheme(); // Uporabi useTheme hook

  useEffect(() => {
    if (session || sessionIsGuest) {
      navigate('/');
    }
    if (i18n.language !== 'sl' && i18n.language !== 'en') {
      changeLanguage('sl');
    }
  }, [session, sessionIsGuest, navigate, i18n, changeLanguage]);

  const handleGuestLogin = () => {
    setSessionIsGuest(true);
    // AuthWrapper bo obravnaval preusmeritev na podlagi posodobljenega stanja isGuest
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
            {/* Theme Toggle Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="h-[1.2rem] w-[1.2rem]" />
              ) : (
                <Moon className="h-[1.2rem] w-[1.2rem]" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
            {/* Language Selector */}
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