import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { NutritionTotals, DailyGoals, MealEntry } from '@/types/nutrition';
import { useTranslation } from 'react-i18next';
import { ChartBar } from 'lucide-react';

interface NutritionChartsProps {
  meals: MealEntry[];
  dailyGoals: DailyGoals;
}

export default function NutritionCharts({ meals, dailyGoals }: NutritionChartsProps) {
  const { t } = useTranslation();

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

  const chartData = [
    {
      name: t('nutritionCalculator.calories'),
      current: totals.calories,
      goal: dailyGoals.calories,
    },
    {
      name: t('nutritionCalculator.protein'),
      current: totals.protein,
      goal: dailyGoals.protein,
    },
    {
      name: t('nutritionCalculator.carbs'),
      current: totals.carbs,
      goal: dailyGoals.carbs,
    },
    {
      name: t('nutritionCalculator.fats'),
      current: totals.fats,
      goal: dailyGoals.fats,
    },
    {
      name: t('nutritionCalculator.fiber'),
      current: totals.fiber,
      goal: dailyGoals.fiber,
    },
    {
      name: t('nutritionCalculator.sugar'),
      current: totals.sugar,
      goal: dailyGoals.sugar,
    },
    {
      name: t('nutritionCalculator.sodium'),
      current: totals.sodium,
      goal: dailyGoals.sodium,
    },
  ];

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChartBar className="h-5 w-5" />
          {t('nutritionCalculator.dailySummary')}
        </CardTitle>
        <CardDescription>{t('nutritionCalculator.dailySummaryDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
              <YAxis stroke="hsl(var(--foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '0.5rem',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend />
              <Bar dataKey="current" name={t('nutritionCalculator.current')} fill="hsl(var(--primary))" />
              <Bar dataKey="goal" name={t('nutritionCalculator.goal')} fill="hsl(var(--accent))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}