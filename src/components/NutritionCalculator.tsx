import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, Search, Apple, Flame, Beef, Wheat, Utensils, Settings as SettingsIcon, ChartBar, Sun, Moon, Salad, Candy, Droplet, Globe, UtensilsCrossed } from 'lucide-react'; // Import UtensilsCrossed icon
import { foodDatabase } from '@/data/foodDatabase';
import { MealEntry, DailyGoals, NutritionTotals, FoodItem, SavedMeal } from '@/types/nutrition';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from 'next-themes';
import CreateSavedMealDialog from './CreateSavedMealDialog';
import SavedMealsList from './SavedMealsList';
import useLocalStorage from '@/hooks/use-local-storage';
import SettingsDialog from './SettingsDialog';
import NutritionCharts from './NutritionCharts';
import CreateCustomFoodDialog from './CreateCustomFoodDialog'; // Import the new dialog

export default function NutritionCalculator() {
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();

  const [meals, setMeals] = useLocalStorage<MealEntry[]>('nutrition-meals', []);
  const [savedMeals, setSavedMeals] = useLocalStorage<SavedMeal[]>('nutrition-saved-meals', []);
  const [customFoods, setCustomFoods] = useLocalStorage<FoodItem[]>('nutrition-custom-foods', []); // New state for custom foods
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
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
    return [...foodDatabase, ...customFoods]; // Combine default and custom foods
  }, [foodDatabase, customFoods]);

  const filteredFoods = useMemo(() => {
    return allAvailableFoods.filter(food =>
      food.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, allAvailableFoods]);

  const totals = useMemo((): NutritionTotals => {
    return meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.foodItem.calories * meal.servings,
        protein: acc.protein + meal.foodItem.protein * meal.servings,
        carbs: acc.carbs + meal.foodItem.carbs * meal.servings,
        fats: acc.fats + meal.foodItem.fats * meal.servings,
        fiber: acc.fiber + (meal.foodItem.fiber || 0) * meal.servings,
        sugar: acc.sugar + (meal.foodItem.sugar || 0) * meal.servings,
        sodium: acc.sodium + (meal.foodItem.sodium || 0) * meal.servings,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, sugar: 0, sodium: 0 }
    );
  }, [meals]);

  const addMeal = (foodItem: FoodItem, servings: number = 1) => {
    const newMeal: MealEntry = {
      id: Date.now().toString(),
      foodItem,
      servings,
      mealType: selectedMealType,
      timestamp: new Date(),
    };
    setMeals([...meals, newMeal]);
    toast.success(t('toast.foodAdded', { foodName: foodItem.name, mealType: t(`nutritionCalculator.${selectedMealType}`) }));
  };

  const addSavedMealToLog = (savedMeal: SavedMeal) => {
    const newMealEntries: MealEntry[] = savedMeal.items.map(item => ({
      id: Date.now().toString() + '-' + item.foodItem.id,
      foodItem: item.foodItem,
      servings: item.servings,
      mealType: selectedMealType,
      timestamp: new Date(),
    }));
    setMeals(prevMeals => [...prevMeals, ...newMealEntries]);
    toast.success(t('toast.savedMealAdded', { mealName: savedMeal.name, mealType: t(`nutritionCalculator.${selectedMealType}`) }));
  };

  const removeMeal = (id: string) => {
    setMeals(meals.filter(meal => meal.id !== id));
    toast.info(t('toast.mealRemoved'));
  };

  const updateServings = (id: string, servings: number) => {
    setMeals(meals.map(meal => 
      meal.id === id ? { ...meal, servings: Math.max(0.1, servings) } : meal
    ));
  };

  const getMealsByType = (type: string) => {
    return meals.filter(meal => meal.mealType === type);
  };

  const calculatePercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-6">
        {/* Calories Card */}
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Flame className="h-5 w-5 text-primary" />
                {t('nutritionCalculator.calories')}
              </CardTitle>
              <Badge variant="outline">{totals.calories.toFixed(0)} / {dailyGoals.calories}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={calculatePercentage(totals.calories, dailyGoals.calories)} className="h-2" />
          </CardContent>
        </Card>

        {/* Protein Card */}
        <Card className="border-accent/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Beef className="h-5 w-5 text-accent" />
                {t('nutritionCalculator.protein')}
              </CardTitle>
              <Badge variant="outline">{totals.protein.toFixed(1)}g / {dailyGoals.protein}g</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={calculatePercentage(totals.protein, dailyGoals.protein)} className="h-2" />
          </CardContent>
        </Card>

        {/* Carbs Card */}
        <Card className="border-warning/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Wheat className="h-5 w-5 text-warning" />
                {t('nutritionCalculator.carbs')}
              </CardTitle>
              <Badge variant="outline">{totals.carbs.toFixed(1)}g / {dailyGoals.carbs}g</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={calculatePercentage(totals.carbs, dailyGoals.carbs)} className="h-2" />
          </CardContent>
        </Card>

        {/* Fiber Card */}
        <Card className="border-green-500/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Salad className="h-5 w-5 text-green-500" />
                {t('nutritionCalculator.fiber')}
              </CardTitle>
              <Badge variant="outline">{totals.fiber.toFixed(1)}g / {dailyGoals.fiber}g</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={calculatePercentage(totals.fiber, dailyGoals.fiber)} className="h-2" />
          </CardContent>
        </Card>

        {/* Sugar Card */}
        <Card className="border-pink-500/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Candy className="h-5 w-5 text-pink-500" />
                {t('nutritionCalculator.sugar')}
              </CardTitle>
              <Badge variant="outline">{totals.sugar.toFixed(1)}g / {dailyGoals.sugar}g</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={calculatePercentage(totals.sugar, dailyGoals.sugar)} className="h-2" />
          </CardContent>
        </Card>

        {/* Sodium Card */}
        <Card className="border-blue-500/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Droplet className="h-5 w-5 text-blue-500" />
                {t('nutritionCalculator.sodium')}
              </CardTitle>
              <Badge variant="outline">{totals.sodium.toFixed(0)}mg / {dailyGoals.sodium}mg</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={calculatePercentage(totals.sodium, dailyGoals.sodium)} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Nutrition Charts */}
      <NutritionCharts meals={meals} dailyGoals={dailyGoals} />

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
              <div className="flex gap-2">
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

              <Tabs value={selectedMealType} onValueChange={(v) => setSelectedMealType(v as any)}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="breakfast">{t('nutritionCalculator.breakfast')}</TabsTrigger>
                  <TabsTrigger value="lunch">{t('nutritionCalculator.lunch')}</TabsTrigger>
                  <TabsTrigger value="dinner">{t('nutritionCalculator.dinner')}</TabsTrigger>
                  <TabsTrigger value="snack">{t('nutritionCalculator.snack')}</TabsTrigger>
                </TabsList>
              </Tabs>

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
                        <Button
                          size="sm"
                          onClick={() => addMeal(food)}
                          className="shrink-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
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
          onAddMealToLog={addSavedMealToLog}
          onDeleteMeal={handleDeleteSavedMeal}
        />
      </div>

      {/* Daily Log */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('nutritionCalculator.todaysMeals')}</CardTitle>
          <CardDescription>{t('nutritionCalculator.todaysMealsDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">{t('nutritionCalculator.all')}</TabsTrigger>
              <TabsTrigger value="breakfast">{t('nutritionCalculator.breakfast')}</TabsTrigger>
              <TabsTrigger value="lunch">{t('nutritionCalculator.lunch')}</TabsTrigger>
              <TabsTrigger value="dinner">{t('nutritionCalculator.dinner')}</TabsTrigger>
              <TabsTrigger value="snack">{t('nutritionCalculator.snack')}</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[400px] mt-4">
              <TabsContent value="all" className="space-y-2 mt-0">
                {meals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {t('nutritionCalculator.noMealsAdded')}
                  </div>
                ) : (
                  meals.map((meal) => (
                    <Card key={meal.id} className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm">{meal.foodItem.name}</h4>
                            <Badge variant="secondary" className="text-xs">
                              {t(`nutritionCalculator.${meal.mealType}`)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <Input
                              type="number"
                              value={meal.servings}
                              onChange={(e) => updateServings(meal.id, parseFloat(e.target.value))}
                              className="w-20 h-7 text-xs"
                              step="0.5"
                              min="0.1"
                            />
                            <span className="text-xs text-muted-foreground">× {meal.foodItem.serving}</span>
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs">
                            <Badge variant="secondary" className="font-normal">
                              {(meal.foodItem.calories * meal.servings).toFixed(0)} cal
                            </Badge>
                            <Badge variant="outline" className="font-normal">
                              P: {(meal.foodItem.protein * meal.servings).toFixed(1)}g
                            </Badge>
                            <Badge variant="outline" className="font-normal">
                              C: {(meal.foodItem.carbs * meal.servings).toFixed(1)}g
                            </Badge>
                            <Badge variant="outline" className="font-normal">
                              F: {(meal.foodItem.fats * meal.servings).toFixed(1)}g
                            </Badge>
                            <Badge variant="outline" className="font-normal">
                              V: {((meal.foodItem.fiber || 0) * meal.servings).toFixed(1)}g
                            </Badge>
                            <Badge variant="outline" className="font-normal">
                              S: {((meal.foodItem.sugar || 0) * meal.servings).toFixed(1)}g
                            </Badge>
                            <Badge variant="outline" className="font-normal">
                              Na: {((meal.foodItem.sodium || 0) * meal.servings).toFixed(0)}mg
                            </Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeMeal(meal.id)}
                          className="shrink-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </TabsContent>

              {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
                <TabsContent key={type} value={type} className="space-y-2 mt-0">
                  {getMealsByType(type).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {t('nutritionCalculator.noMealsOfTypeAdded', { type: t(`nutritionCalculator.${type}`) })}
                    </div>
                  ) : (
                    getMealsByType(type).map((meal) => (
                      <Card key={meal.id} className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm">{meal.foodItem.name}</h4>
                            <div className="flex items-center gap-2 mb-2">
                              <Input
                                type="number"
                                value={meal.servings}
                                onChange={(e) => updateServings(meal.id, parseFloat(e.target.value))}
                                className="w-20 h-7 text-xs"
                                step="0.5"
                                min="0.1"
                              />
                              <span className="text-xs text-muted-foreground">× {meal.foodItem.serving}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs">
                              <Badge variant="secondary" className="font-normal">
                                {(meal.foodItem.calories * meal.servings).toFixed(0)} cal
                              </Badge>
                              <Badge variant="outline" className="font-normal">
                                P: {(meal.foodItem.protein * meal.servings).toFixed(1)}g
                              </Badge>
                              <Badge variant="outline" className="font-normal">
                                C: {(meal.foodItem.carbs * meal.servings).toFixed(1)}g
                              </Badge>
                              <Badge variant="outline" className="font-normal">
                                F: {(meal.foodItem.fats * meal.servings).toFixed(1)}g
                              </Badge>
                              <Badge variant="outline" className="font-normal">
                                V: {((meal.foodItem.fiber || 0) * meal.servings).toFixed(1)}g
                              </Badge>
                              <Badge variant="outline" className="font-normal">
                                S: {((meal.foodItem.sugar || 0) * meal.servings).toFixed(1)}g
                              </Badge>
                              <Badge variant="outline" className="font-normal">
                                Na: {((meal.foodItem.sodium || 0) * meal.servings).toFixed(0)}mg
                              </Badge>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeMeal(meal.id)}
                            className="shrink-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))
                  )}
                </TabsContent>
              ))}
            </ScrollArea>
          </Tabs>
        </CardContent>
      </Card>

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