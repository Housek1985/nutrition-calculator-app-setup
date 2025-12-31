import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Flame, Beef, Wheat, Salad, Candy, Droplet, Utensils, Search } from 'lucide-react';
import { DailyGoals, FoodItem, MealEntry, NutritionTotals, SavedMeal } from '@/types/nutrition';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface DailyLogTabProps {
  dailyEntries: MealEntry[];
  onRemoveEntry: (id: string) => void;
  dailyGoals: DailyGoals;
  allAvailableFoods: FoodItem[];
  onAddFoodToDailyLog: (foodItem: FoodItem, servings: number, mealType: MealEntry['mealType']) => void;
  savedMeals: SavedMeal[];
}

export default function DailyLogTab({
  dailyEntries,
  onRemoveEntry,
  dailyGoals,
  allAvailableFoods,
  onAddFoodToDailyLog,
  savedMeals,
}: DailyLogTabProps) {
  const { t } = useTranslation();
  // Removed states for selectedFoodId, servings, mealType, searchQuery, selectedSavedMealId
  // as the "Add Food / Meal to Log" card is being removed.

  const dailyTotals: NutritionTotals = useMemo(() => {
    return dailyEntries.reduce(
      (acc, entry) => ({
        calories: acc.calories + entry.foodItem.calories * entry.servings,
        protein: acc.protein + entry.foodItem.protein * entry.servings,
        carbs: acc.carbs + entry.foodItem.carbs * entry.servings,
        fats: acc.fats + entry.foodItem.fats * entry.servings,
        fiber: acc.fiber + (entry.foodItem.fiber || 0) * entry.servings,
        sugar: acc.sugar + (entry.foodItem.sugar || 0) * entry.servings,
        sodium: acc.sodium + (entry.foodItem.sodium || 0) * entry.servings,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, sugar: 0, sodium: 0 }
    );
  }, [dailyEntries]);

  // Removed handleAddFood and handleAddSavedMeal functions

  const getProgress = (current: number, goal: number) => {
    if (goal === 0) return 0;
    return Math.min(100, (current / goal) * 100);
  };

  const getProgressColor = (current: number, goal: number) => {
    const percentage = getProgress(current, goal);
    if (percentage >= 100) return 'bg-green-500';
    if (percentage > 75) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Today's Intake Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5" />
            {t('nutritionCalculator.todaysIntake')}
          </CardTitle>
          <CardDescription>{t('nutritionCalculator.todaysIntakeDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t('nutritionCalculator.calories')}</Label>
              <Progress
                value={getProgress(dailyTotals.calories, dailyGoals.calories)}
                className="h-2"
                indicatorClassName={getProgressColor(dailyTotals.calories, dailyGoals.calories)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {dailyTotals.calories.toFixed(0)} / {dailyGoals.calories} cal
              </p>
            </div>
            <div>
              <Label>{t('nutritionCalculator.protein')}</Label>
              <Progress
                value={getProgress(dailyTotals.protein, dailyGoals.protein)}
                className="h-2"
                indicatorClassName={getProgressColor(dailyTotals.protein, dailyGoals.protein)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {dailyTotals.protein.toFixed(1)} / {dailyGoals.protein} g
              </p>
            </div>
            <div>
              <Label>{t('nutritionCalculator.carbs')}</Label>
              <Progress
                value={getProgress(dailyTotals.carbs, dailyGoals.carbs)}
                className="h-2"
                indicatorClassName={getProgressColor(dailyTotals.carbs, dailyGoals.carbs)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {dailyTotals.carbs.toFixed(1)} / {dailyGoals.carbs} g
              </p>
            </div>
            <div>
              <Label>{t('nutritionCalculator.fats')}</Label>
              <Progress
                value={getProgress(dailyTotals.fats, dailyGoals.fats)}
                className="h-2"
                indicatorClassName={getProgressColor(dailyTotals.fats, dailyGoals.fats)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {dailyTotals.fats.toFixed(1)} / {dailyGoals.fats} g
              </p>
            </div>
            <div>
              <Label>{t('nutritionCalculator.fiber')}</Label>
              <Progress
                value={getProgress(dailyTotals.fiber, dailyGoals.fiber)}
                className="h-2"
                indicatorClassName={getProgressColor(dailyTotals.fiber, dailyGoals.fiber)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {dailyTotals.fiber.toFixed(1)} / {dailyGoals.fiber} g
              </p>
            </div>
            <div>
              <Label>{t('nutritionCalculator.sugar')}</Label>
              <Progress
                value={getProgress(dailyTotals.sugar, dailyGoals.sugar)}
                className="h-2"
                indicatorClassName={getProgressColor(dailyTotals.sugar, dailyGoals.sugar)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {dailyTotals.sugar.toFixed(1)} / {dailyGoals.sugar} g
              </p>
            </div>
            <div>
              <Label>{t('nutritionCalculator.sodium')}</Label>
              <Progress
                value={getProgress(dailyTotals.sodium, dailyGoals.sodium)}
                className="h-2"
                indicatorClassName={getProgressColor(dailyTotals.sodium, dailyGoals.sodium)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {dailyTotals.sodium.toFixed(0)} / {dailyGoals.sodium} mg
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Removed "Add Food / Meal to Log" card */}

      {/* Daily Log Entries */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            {t('nutritionCalculator.dailyLogEntries')}
          </CardTitle>
          <CardDescription>{t('nutritionCalculator.dailyLogEntriesDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          {dailyEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('nutritionCalculator.noEntriesYet')}
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {dailyEntries
                  .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()) // Sort by newest first
                  .map((entry) => (
                    <Card key={entry.id} className="p-3 hover:bg-accent/5 transition-colors">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm mb-1">{entry.foodItem.name}</h4>
                          <p className="text-xs text-muted-foreground mb-1">
                            {entry.servings} {t('nutritionCalculator.servings')} - {t(`nutritionCalculator.${entry.mealType}`)}
                          </p>
                          <div className="flex flex-wrap gap-2 text-xs">
                            <Badge variant="secondary" className="font-normal">
                              {(entry.foodItem.calories * entry.servings).toFixed(0)} cal
                            </Badge>
                            <Badge variant="outline" className="font-normal">
                              P: {(entry.foodItem.protein * entry.servings).toFixed(1)}g
                            </Badge>
                            <Badge variant="outline" className="font-normal">
                              C: {(entry.foodItem.carbs * entry.servings).toFixed(1)}g
                            </Badge>
                            <Badge variant="outline" className="font-normal">
                              F: {(entry.foodItem.fats * entry.servings).toFixed(1)}g
                            </Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onRemoveEntry(entry.id)}
                          className="shrink-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}