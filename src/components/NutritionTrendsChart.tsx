import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DailyGoals, MealEntry } from '@/types/nutrition';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { sl, enUS } from 'date-fns/locale'; // Import locales

interface NutritionTrendsChartProps {
  dailyEntries: MealEntry[];
  dailyGoals: DailyGoals;
}

export default function NutritionTrendsChart({ dailyEntries, dailyGoals }: NutritionTrendsChartProps) {
  const { t, i18n } = useTranslation();

  const chartData = useMemo(() => {
    const dataMap = new Map<string, { date: string; calories: number; protein: number; carbs: number; fats: number }>();

    dailyEntries.forEach(entry => {
      const dateKey = format(entry.timestamp, 'yyyy-MM-dd');
      const currentData = dataMap.get(dateKey) || { date: dateKey, calories: 0, protein: 0, carbs: 0, fats: 0 };

      currentData.calories += entry.foodItem.calories * entry.servings;
      currentData.protein += entry.foodItem.protein * entry.servings;
      currentData.carbs += entry.foodItem.carbs * entry.servings;
      currentData.fats += entry.foodItem.fats * entry.servings;

      dataMap.set(dateKey, currentData);
    });

    // Sort data by date
    const sortedData = Array.from(dataMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    // Format dates for display using current language locale
    const currentLocale = i18n.language === 'sl' ? sl : enUS;
    return sortedData.map(item => ({
      ...item,
      date: format(parseISO(item.date), 'dd.MM.', { locale: currentLocale }), // e.g., 01.01.
    }));
  }, [dailyEntries, i18n.language]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('nutritionCalculator.nutritionTrends')}</CardTitle>
        <CardDescription>{t('nutritionCalculator.nutritionTrendsDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {t('nutritionCalculator.noDataForCharts')}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" stroke="hsl(var(--foreground))" />
              <YAxis stroke="hsl(var(--foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend />
              <Line type="monotone" dataKey="calories" stroke="hsl(var(--chart-1))" name={t('nutritionCalculator.calories')} />
              <Line type="monotone" dataKey="protein" stroke="hsl(var(--chart-2))" name={t('nutritionCalculator.protein')} />
              <Line type="monotone" dataKey="carbs" stroke="hsl(var(--chart-3))" name={t('nutritionCalculator.carbs')} />
              <Line type="monotone" dataKey="fats" stroke="hsl(var(--chart-4))" name={t('nutritionCalculator.fats')} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}