export interface FoodItem {
  id: string;
  name: string;
  serving: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
}

export interface MealEntry {
  id: string;
  foodItem: FoodItem;
  servings: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  timestamp: Date;
}

export interface DailyGoals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface NutritionTotals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

// New interface for a food item within a saved meal
export interface SavedMealFoodItem {
  foodItem: FoodItem;
  servings: number;
}

// New interface for a saved meal
export interface SavedMeal {
  id: string;
  name: string;
  items: SavedMealFoodItem[];
}