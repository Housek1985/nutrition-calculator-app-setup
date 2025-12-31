import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, Search, Apple, Flame, Beef, Wheat, Utensils, Settings as SettingsIcon, Sun, Moon, Salad, Candy, Droplet, Globe, Sparkles } from 'lucide-react'; // Removed UtensilsCrossed, added Sparkles
import { foodDatabase } from '@/data/foodDatabase';
import { DailyGoals, FoodItem, SavedMeal } from '@/types/nutrition';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from 'next-themes';
import CreateSavedMealDialog from './CreateSavedMealDialog';
import SavedMealsList from './SavedMealsList';
import useLocalStorage from '@/hooks/use-local-storage';
import SettingsDialog from './SettingsDialog';
// Removed import CreateCustomFoodDialog from './CreateCustomFoodDialog';

interface DisplayNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

// Helper function to calculate nutrition per 100g
function calculateNutritionPer100g(food: FoodItem): DisplayNutrition | null {
  let servingInGrams: number | null = null;

  // Try to extract grams from serving string (e.g., "100g", "28g")
  const gramMatch = food.serving.match(/(\d+(\.\d+)?)\s*g/i);
  if (gramMatch && gramMatch[1]) {
    servingInGrams = parseFloat(gramMatch[1]);
  } else {
    // Try to extract ounces and convert to grams (e.g., "1 oz (28g)")
    const ozMatch = food.serving.match(/(\d+(\.\d+)?)\s*oz/i);
    if (ozMatch && ozMatch[1]) {
      const oz = parseFloat(ozMatch[1]);
      servingInGrams = oz * 28.35; // 1 oz = 28.35 grams
    }
  }

  if (servingInGrams && servingInGrams > 0) {
    const factor = 100 / servingInGrams;
    return {
      calories: food.calories * factor,
      protein: food.protein * factor,
      carbs: food.carbs * factor,
      fats: food.fats * factor,
      fiber: food.fiber * factor,
      sugar: food.sugar * factor,
      sodium: food.sodium * factor,
    };
  } else if (food.serving.toLowerCase() === '100g') {
    // If serving is explicitly 100g, use values as is
    return {
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fats: food.fats,
      fiber: food.fiber,
      sugar: food.sugar,
      sodium: food.sodium,
    };
  }
  // Cannot reliably convert to 100g for other units (e.g., "1 cup", "1 medium")
  return null;
}

export default function NutritionCalculator() {
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();

  const [savedMeals, setSavedMeals] = useLocalStorage<SavedMeal[]>('nutrition-saved-meals', []);
  // Removed customFoods state
  
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmedSearchQuery, setConfirmedSearchQuery] = useState(''); // New state for confirmed search
  const [dailyGoals, setDailyGoals] = useLocalStorage<DailyGoals>('nutrition-daily-goals', {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fats: 65,
    fiber: 30,
    sugar: 25,
    sodium: 2300,
  });

  const [recognizedFood, setRecognizedFood] = useState<FoodItem | null>(null);

  const allAvailableFoods = useMemo(() => {
    return [...foodDatabase]; // Removed customFoods
  }, [foodDatabase]);

  const filteredFoods = useMemo(() => {
    return allAvailableFoods.filter(food =>
      food.name.toLowerCase().includes(confirmedSearchQuery.toLowerCase())
    );
  }, [confirmedSearchQuery, allAvailableFoods]);

  // Effect to update recognizedFood based on confirmed search query
  useEffect(() => {
    if (confirmedSearchQuery.trim() === '') {
      setRecognizedFood(null);
      return;
    }
    // Find the first food that matches the confirmed search query
    const foundFood = allAvailableFoods.find(food =>
      food.name.toLowerCase().includes(confirmedSearchQuery.toLowerCase())
    );
    setRecognizedFood(foundFood || null);
  }, [confirmedSearchQuery, allAvailableFoods]);

  const nutritionPer100g = useMemo(() => {
    if (!recognizedFood) return null;
    return calculateNutritionPer100g(recognizedFood);
  }, [recognizedFood]);

  const handleSaveNewMeal = (newMeal: SavedMeal) => {
    setSavedMeals(prev => [...prev, newMeal]);
  };

  const handleDeleteSavedMeal = (id: string) => {
    setSavedMeals(prev => prev.filter(meal => meal.id !== id));
    toast.info(t('toast.savedMealRemoved'));
  };

  const handleConfirmSearch = () => {
    setConfirmedSearchQuery(searchQuery);
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

      {/* Food Search and Confirm Button */}
      <div className="flex gap-2 mx-auto max-w-md mt-6 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('nutritionCalculator.searchFoods')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleConfirmSearch();
              }
            }}
            className="pl-9"
          />
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleConfirmSearch} 
          disabled={!searchQuery.trim()}
        >
          <Sparkles className="h-4 w-4" />
          <span className="sr-only">{t('nutritionCalculator.confirmSearch')}</span>
        </Button>
      </div>

      {/* Recognized Food Nutrition Card */}
      {recognizedFood && nutritionPer100g && (
        <Card className="mx-auto max-w-md mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Apple className="h-5 w-5" />
              {t('nutritionCalculator.nutritionPer100g', { foodName: recognizedFood.name })}
            </CardTitle>
            <CardDescription>{t('nutritionCalculator.nutritionPer100gDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 text-sm">
              <Badge variant="secondary" className="font-normal">
                {nutritionPer100g.calories.toFixed(0)} cal
              </Badge>
              <Badge variant="outline" className="font-normal">
                P: {nutritionPer100g.protein.toFixed(1)}g
              </Badge>
              <Badge variant="outline" className="font-normal">
                C: {nutritionPer100g.carbs.toFixed(1)}g
              </Badge>
              <Badge variant="outline" className="font-normal">
                F: {nutritionPer100g.fats.toFixed(1)}g
              </Badge>
              <Badge variant="outline" className="font-normal">
                V: {nutritionPer100g.fiber.toFixed(1)}g
              </Badge>
              <Badge variant="outline" className="font-normal">
                S: {nutritionPer100g.sugar.toFixed(1)}g
              </Badge>
              <Badge variant="outline" className="font-normal">
                Na: {nutritionPer100g.sodium.toFixed(0)}mg
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

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
          onDeleteMeal={handleDeleteSavedMeal}
        />
      </div>

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