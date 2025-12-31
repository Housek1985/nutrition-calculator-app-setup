import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, Search, Apple, Flame, Beef, Wheat, Utensils, Settings as SettingsIcon, Sun, Moon, Salad, Candy, Droplet, Globe, UtensilsCrossed } from 'lucide-react';
import { foodDatabase } from '@/data/foodDatabase';
import { DailyGoals, FoodItem, SavedMeal } from '@/types/nutrition'; // Removed MealEntry, NutritionTotals
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from 'next-themes';
import CreateSavedMealDialog from './CreateSavedMealDialog';
import SavedMealsList from './SavedMealsList';
import useLocalStorage from '@/hooks/use-local-storage';
import SettingsDialog from './SettingsDialog';
import CreateCustomFoodDialog from './CreateCustomFoodDialog';

export default function NutritionCalculator() {
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();

  // Removed meals state
  const [savedMeals, setSavedMeals] = useLocalStorage<SavedMeal[]>('nutrition-saved-meals', []);
  const [customFoods, setCustomFoods] = useLocalStorage<FoodItem[]>('nutrition-custom-foods', []);
  
  const [searchQuery, setSearchQuery] = useState('');
  // Removed selectedMealType state
  const [dailyGoals, setDailyGoals] = useLocalStorage<DailyGoals>('nutrition-daily-goals', {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fats: 65,
    fiber: 30,
    sugar: 25,
    sodium: 2300,
  });

  const allAvailableFoods = useMemo(() => {
    return [...foodDatabase, ...customFoods];
  }, [foodDatabase, customFoods]);

  const filteredFoods = useMemo(() => {
    return allAvailableFoods.filter(food =>
      food.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, allAvailableFoods]);

  // Removed totals calculation

  // Removed addMeal function
  // Removed addSavedMealToLog function
  // Removed removeMeal function
  // Removed updateServings function
  // Removed getMealsByType function

  const handleSaveNewMeal = (newMeal: SavedMeal) => {
    setSavedMeals(prev => [...prev, newMeal]);
  };

  const handleDeleteSavedMeal = (id: string) => {
    setSavedMeals(prev => prev.filter(meal => meal.id !== id));
    toast.info(t('toast.savedMealRemoved'));
  };

  const handleSaveCustomFood = (newFood: FoodItem) => {
    setCustomFoods(prev => [...prev, newFood]);
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {t('nutritionCalculator.title')}
        </h1>
        <p className="text-muted-foreground">{t('nutritionCalculator.description')}</p>
        <div className="mt-4 flex justify-center items-center gap-2">
          {/* Settings Dialog Trigger */}
          <SettingsDialog dailyGoals={dailyGoals} setDailyGoals={setDailyGoals}>
            <Button variant="outline" size="icon">
              <SettingsIcon className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">{t('settings.title')}</span>
            </Button>
          </SettingsDialog>

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

          {/* Language Toggle Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => changeLanguage(language === 'en' ? 'sl' : 'en')}
          >
            <Globe className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">Toggle language</span>
          </Button>
        </div>
      </div>

      {/* Food Search and Custom Food Button */}
      <div className="flex gap-2 mx-auto max-w-md mt-6 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('nutritionCalculator.searchFoods')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <CreateCustomFoodDialog onSave={handleSaveCustomFood}>
          <Button variant="outline" size="icon">
            <Plus className="h-4 w-4" />
            <span className="sr-only">{t('nutritionCalculator.createCustomFood')}</span>
          </Button>
        </CreateCustomFoodDialog>
      </div>

      {/* Removed all progress cards */}
      {/* Removed Nutrition Charts */}

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        {/* Food Database */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Apple className="h-5 w-5" />
              {t('nutritionCalculator.foodDatabase')}
            </CardTitle>
            <CardDescription>{t('nutritionCalculator.foodDatabaseDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Removed Tabs for meal types */}
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-2">
                  {filteredFoods.map((food) => (
                    <Card key={food.id} className="p-3 hover:bg-accent/5 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm mb-1">{food.name}</h4>
                          <p className="text-xs text-muted-foreground mb-2">{food.serving}</p>
                          <div className="flex flex-wrap gap-2 text-xs">
                            <Badge variant="secondary" className="font-normal">
                              {food.calories} cal
                            </Badge>
                            <Badge variant="outline" className="font-normal">
                              P: {food.protein}g
                            </Badge>
                            <Badge variant="outline" className="font-normal">
                              C: {food.carbs}g
                            </Badge>
                            <Badge variant="outline" className="font-normal">
                              F: {food.fats}g
                            </Badge>
                            <Badge variant="outline" className="font-normal">
                              V: {food.fiber}g
                            </Badge>
                            <Badge variant="outline" className="font-normal">
                              S: {food.sugar}g
                            </Badge>
                            <Badge variant="outline" className="font-normal">
                              Na: {food.sodium}mg
                            </Badge>
                          </div>
                        </div>
                        {/* Removed Add button for individual food items */}
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>

        {/* Saved Meals List */}
        <SavedMealsList
          savedMeals={savedMeals}
          onDeleteMeal={handleDeleteSavedMeal} // Removed onAddMealToLog
        />
      </div>

      {/* Removed Daily Log Card */}

      {/* Button to create new saved meal */}
      <div className="mt-6 flex justify-end">
        <CreateSavedMealDialog onSave={handleSaveNewMeal}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t('nutritionCalculator.createSavedMeal')}
          </Button>
        </CreateSavedMealDialog>
      </div>
    </div>
  );
}