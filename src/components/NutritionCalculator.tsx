import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, Search, Apple, Flame, Beef, Wheat, Utensils, Settings as SettingsIcon, Sun, Moon, Salad, Candy, Droplet, Globe, Sparkles, Camera, LineChart as LineChartIcon } from 'lucide-react';
import { foodDatabase } from '@/data/foodDatabase';
import { DailyGoals, FoodItem, SavedMeal, MealEntry } from '@/types/nutrition';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from 'next-themes';
import CreateSavedMealDialog from './CreateSavedMealDialog';
import SavedMealsList from './SavedMealsList';
import useLocalStorage from '@/hooks/use-local-storage';
import SettingsDialog from './SettingsDialog';
import DailyLogTab from './DailyLogTab';
import AddFoodToLogDialog from './AddFoodToLogDialog';
import ImageFoodRecognizer from './ImageFoodRecognizer';
import NutritionTrendsChart from './NutritionTrendsChart'; // Import the new chart component

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
  const { t, i18n } = useTranslation();
  const { language, changeLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();

  const [savedMeals, setSavedMeals] = useLocalStorage<SavedMeal[]>('nutrition-saved-meals', []);
  const [dailyEntries, setDailyEntries] = useLocalStorage<MealEntry[]>('nutrition-daily-entries', []);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmedSearchQuery, setConfirmedSearchQuery] = useState('');
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
    return foodDatabase.map(food => ({
      ...food,
      name: i18n.language === 'sl' && food.name_sl ? food.name_sl : food.name,
    }));
  }, [foodDatabase, i18n.language]);

  const filteredFoods = useMemo(() => {
    return allAvailableFoods.filter(food =>
      food.name.toLowerCase().includes(confirmedSearchQuery.toLowerCase())
    );
  }, [confirmedSearchQuery, allAvailableFoods]);

  // Function to add a food item to the daily log
  const handleAddFoodToDailyLog = (foodItem: FoodItem, servings: number, mealType: MealEntry['mealType']) => {
    const newEntry: MealEntry = {
      id: Date.now().toString(),
      foodItem,
      servings,
      mealType,
      timestamp: new Date(),
    };
    setDailyEntries(prev => [...prev, newEntry]);
    toast.success(t('toast.foodAddedToLog', { foodName: foodItem.name }));
  };

  // Effect to update recognizedFood based on confirmed search query and add to log
  useEffect(() => {
    if (confirmedSearchQuery.trim() === '') {
      setRecognizedFood(null);
      return;
    }
    // Find the first food that matches the confirmed search query
    const foundFood = foodDatabase.find(food => // Search original foodDatabase for consistent ID
      food.name.toLowerCase().includes(confirmedSearchQuery.toLowerCase()) ||
      (food.name_sl && food.name_sl.toLowerCase().includes(confirmedSearchQuery.toLowerCase()))
    );

    if (foundFood) {
      // Use the localized name for display in toast
      const localizedFoodName = i18n.language === 'sl' && foundFood.name_sl ? foundFood.name_sl : foundFood.name;
      
      // Automatically add to daily log with default 1 serving and 'snack' meal type
      handleAddFoodToDailyLog(foundFood, 1, 'snack'); 
      
      // Clear search input and confirmed search query
      setSearchQuery(''); 
      setConfirmedSearchQuery(''); 
      setRecognizedFood(null); // Clear recognized food to hide the card
    } else {
      setRecognizedFood(null);
      toast.error(t('toast.foodNotFound', { foodName: confirmedSearchQuery })); // New toast message
    }
  }, [confirmedSearchQuery, foodDatabase, i18n.language, t]); // Added i18n.language and t to dependencies

  const displayNutrition = useMemo(() => {
    if (!recognizedFood) return null;

    const per100g = calculateNutritionPer100g(recognizedFood);
    if (per100g) {
      return {
        data: per100g,
        label: t('nutritionCalculator.nutritionPer100g', { foodName: recognizedFood.name }),
        description: t('nutritionCalculator.nutritionPer100gDescription'),
      };
    } else {
      // If 100g conversion is not possible, display nutrition for its default serving
      return {
        data: {
          calories: recognizedFood.calories,
          protein: recognizedFood.protein,
          carbs: recognizedFood.carbs,
          fats: recognizedFood.fats,
          fiber: recognizedFood.fiber,
          sugar: recognizedFood.sugar,
          sodium: recognizedFood.sodium,
        },
        label: t('nutritionCalculator.nutritionPerServing', { foodName: recognizedFood.name, serving: recognizedFood.serving }),
        description: t('nutritionCalculator.nutritionPerServingDescription'),
      };
    }
  }, [recognizedFood, t]);

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

  // Function to remove a food item from the daily log
  const handleRemoveFoodFromDailyLog = (entryId: string) => {
    setDailyEntries(prev => prev.filter(entry => entry.id !== entryId));
    toast.info(t('toast.foodRemovedFromLog'));
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center justify-center gap-2">
          <Salad className="h-9 w-9 text-primary" />
          {t('nutritionCalculator.title')}
        </h1>
        <p className="text-muted-foreground mb-2">{t('nutritionCalculator.description')}</p>
        <p className="text-sm text-primary/80 font-medium">{t('nutritionCalculator.welcomeMessage')}</p>
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

          {/* Image Food Recognizer Button */}
          <ImageFoodRecognizer
            allAvailableFoods={allAvailableFoods}
            onAddFoodToDailyLog={handleAddFoodToDailyLog}
          />
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

      <Tabs defaultValue="daily-log" className="w-full">
        <TabsList className="grid w-full grid-cols-4"> {/* Changed to grid-cols-4 */}
          <TabsTrigger value="daily-log">{t('nutritionCalculator.dailyLog')}</TabsTrigger>
          <TabsTrigger value="food-database">{t('nutritionCalculator.foodDatabase')}</TabsTrigger>
          <TabsTrigger value="saved-meals">{t('nutritionCalculator.savedMeals')}</TabsTrigger>
          <TabsTrigger value="nutrition-trends"> {/* New tab trigger */}
            <LineChartIcon className="h-4 w-4 mr-2" />
            {t('nutritionCalculator.nutritionTrends')}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="daily-log" className="mt-6">
          <DailyLogTab 
            dailyEntries={dailyEntries} 
            onRemoveEntry={handleRemoveFoodFromDailyLog} 
            dailyGoals={dailyGoals} 
            allAvailableFoods={allAvailableFoods}
            onAddFoodToDailyLog={handleAddFoodToDailyLog}
            savedMeals={savedMeals}
          />
        </TabsContent>
        <TabsContent value="food-database" className="mt-6">
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
                    {allAvailableFoods.map((food) => (
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
                          <AddFoodToLogDialog foodItem={food} onAddFood={handleAddFoodToDailyLog}>
                            <Button size="sm" className="shrink-0">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </AddFoodToLogDialog>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="saved-meals" className="mt-6">
          <SavedMealsList
            savedMeals={savedMeals}
            onDeleteMeal={handleDeleteSavedMeal}
            allAvailableFoods={allAvailableFoods}
          />
          <div className="mt-6 flex justify-end">
            <CreateSavedMealDialog onSave={handleSaveNewMeal} allAvailableFoods={allAvailableFoods}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t('nutritionCalculator.createSavedMeal')}
              </Button>
            </CreateSavedMealDialog>
          </div>
        </TabsContent>
        <TabsContent value="nutrition-trends" className="mt-6"> {/* New tab content */}
          <NutritionTrendsChart dailyEntries={dailyEntries} dailyGoals={dailyGoals} />
        </TabsContent>
      </Tabs>
    </div>
  );
}