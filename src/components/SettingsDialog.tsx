import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Sun, Moon, Settings as SettingsIcon, Eraser, Globe } from 'lucide-react'; // Dodana ikona Globe
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from 'next-themes';
import { DailyGoals } from '@/types/nutrition';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Uvozi Select komponente

interface SettingsDialogProps {
  dailyGoals: DailyGoals;
  setDailyGoals: (goals: DailyGoals) => void;
  onResetAllData: () => void;
  children: React.ReactNode;
}

export default function SettingsDialog({ dailyGoals, setDailyGoals, onResetAllData, children }: SettingsDialogProps) {
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage(); // Uporabi useLanguage hook
  const { theme, setTheme } = useTheme();

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            {t('settings.title')}
          </DialogTitle>
          <DialogDescription>{t('settings.description')}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Theme Settings */}
          <div className="space-y-2">
            <Label>{t('settings.theme')}</Label>
            <div className="flex gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                onClick={() => setTheme('light')}
              >
                <Sun className="h-4 w-4 mr-2" /> {t('settings.lightTheme')}
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                onClick={() => setTheme('dark')}
              >
                <Moon className="h-4 w-4 mr-2" /> {t('settings.darkTheme')}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Language Settings */}
          <div className="space-y-2">
            <Label htmlFor="language-select" className="flex items-center gap-2">
              <Globe className="h-4 w-4" /> {t('settings.language')}
            </Label>
            <Select onValueChange={(value) => changeLanguage(value as 'en' | 'sl')} value={language}>
              <SelectTrigger id="language-select" className="w-full">
                <SelectValue placeholder={t('settings.language')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="sl">Slovenščina</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Daily Goals Settings */}
          <div className="space-y-2">
            <h3 className="font-semibold text-base">{t('nutritionCalculator.dailyGoals')}</h3>
            <p className="text-sm text-muted-foreground">{t('nutritionCalculator.dailyGoalsDescription')}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="goal-calories-settings">{t('nutritionCalculator.calories')}</Label>
                <Input
                  id="goal-calories-settings"
                  type="number"
                  value={dailyGoals.calories}
                  onChange={(e) => setDailyGoals({ ...dailyGoals, calories: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal-protein-settings">{t('nutritionCalculator.protein')} (g)</Label>
                <Input
                  id="goal-protein-settings"
                  type="number"
                  value={dailyGoals.protein}
                  onChange={(e) => setDailyGoals({ ...dailyGoals, protein: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal-carbs-settings">{t('nutritionCalculator.carbs')} (g)</Label>
                <Input
                  id="goal-carbs-settings"
                  type="number"
                  value={dailyGoals.carbs}
                  onChange={(e) => setDailyGoals({ ...dailyGoals, carbs: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal-fats-settings">{t('nutritionCalculator.fats')} (g)</Label>
                <Input
                  id="goal-fats-settings"
                  type="number"
                  value={dailyGoals.fats}
                  onChange={(e) => setDailyGoals({ ...dailyGoals, fats: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal-fiber-settings">{t('nutritionCalculator.fiber')} (g)</Label>
                <Input
                  id="goal-fiber-settings"
                  type="number"
                  value={dailyGoals.fiber}
                  onChange={(e) => setDailyGoals({ ...dailyGoals, fiber: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal-sugar-settings">{t('nutritionCalculator.sugar')} (g)</Label>
                <Input
                  id="goal-sugar-settings"
                  type="number"
                  value={dailyGoals.sugar}
                  onChange={(e) => setDailyGoals({ ...dailyGoals, sugar: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal-sodium-settings">{t('nutritionCalculator.sodium')} (mg)</Label>
                <Input
                  id="goal-sodium-settings"
                  type="number"
                  value={dailyGoals.sodium}
                  onChange={(e) => setDailyGoals({ ...dailyGoals, sodium: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Data Management */}
          <div className="space-y-2">
            <h3 className="font-semibold text-base">{t('settings.dataManagement')}</h3>
            <p className="text-sm text-muted-foreground">{t('settings.dataManagementDescription')}</p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Eraser className="h-4 w-4 mr-2" />
                  {t('settings.resetAllData')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('settings.confirmResetTitle')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('settings.confirmResetDescription')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('settings.cancel')}</AlertDialogCancel>
                  <AlertDialogAction onClick={onResetAllData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    {t('settings.resetConfirm')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { /* Close dialog logic if needed */ }}>
            {t('settings.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}