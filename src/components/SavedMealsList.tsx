import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, Utensils } from 'lucide-react';
import { SavedMeal, NutritionTotals } from '@/types/nutrition';
import { useTranslation } from 'react-i18next';

interface SavedMealsListProps {
  savedMeals: SavedMeal[];
  onAddMealToLog: (meal: SavedMeal) => void;
  onDeleteMeal: (id: string) => void;
}

export default function SavedMealsList({ savedMeals, onAddMealToLog, onDeleteMeal }: SavedMealsListProps) {
  const { t } = useTranslation();

  const calculateMealTotals = (meal: SavedMeal): NutritionTotals => {
    return meal.items.reduce(
      (acc, item) => ({
        calories: acc.calories + item.foodItem.calories * item.servings,
        protein: acc.protein + item.foodItem.protein * item.servings,
        carbs: acc.carbs + item.foodItem.carbs * item.servings,
        fats: acc.fats + item.foodItem.fats * item.servings,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Utensils className="h-5 w-5" />
          {t('nutritionCalculator.savedMeals')}
        </CardTitle>
        <CardDescription>{t('nutritionCalculator.savedMealsDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {savedMeals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t('nutritionCalculator.noSavedMeals')}
              </div>
            ) : (
              savedMeals.map((meal) => {
                const totals = calculateMealTotals(meal);
                return (
                  <Card key={meal.id} className="p-3 hover:bg-accent/5 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm mb-1">{meal.name}</h4>
                        <div className="flex flex-wrap gap-2 text-xs mb-2">
                          <Badge variant="secondary" className="font-normal">
                            {totals.calories.toFixed(0)} cal
                          </Badge>
                          <Badge variant="outline" className="font-normal">
                            P: {totals.protein.toFixed(1)}g
                          </Badge>
                          <Badge variant="outline" className="font-normal">
                            C: {totals.carbs.toFixed(1)}g
                          </Badge>
                          <Badge variant="outline" className="font-normal">
                            F: {totals.fats.toFixed(1)}g
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {meal.items.map(item => `${item.foodItem.name} (${item.servings})`).join(', ')}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          onClick={() => onAddMealToLog(meal)}
                          className="shrink-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDeleteMeal(meal.id)}
                          className="shrink-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}