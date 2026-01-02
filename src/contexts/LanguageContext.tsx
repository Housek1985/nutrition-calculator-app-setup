
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Language = 'en' | 'sl';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Header
    'app.title': 'Nutrition Calculator',
    'app.subtitle': 'Track your daily nutrition intake',
    'theme.light': 'Light',
    'theme.dark': 'Dark',
    
    // Tabs
    'tab.calculator': 'Calculator',
    'tab.goals': 'Daily Goals',
    
    // Food Database
    'food.search': 'Search foods...',
    'food.database': 'Food Database',
    'food.select': 'Select a food to add to your meal',
    'food.add': 'Add',
    
    // Meal Types
    'meal.breakfast': 'Breakfast',
    'meal.lunch': 'Lunch',
    'meal.dinner': 'Dinner',
    'meal.snack': 'Snack',
    
    // Nutrition
    'nutrition.calories': 'Calories',
    'nutrition.protein': 'Protein',
    'nutrition.carbs': 'Carbs',
    'nutrition.fats': 'Fats',
    'nutrition.per100g': 'per 100g',
    'nutrition.servings': 'Servings',
    
    // Today's Meals
    'meals.today': "Today's Meals",
    'meals.empty': 'No meals added yet. Start by searching and adding foods!',
    'meals.total': 'Total',
    
    // Daily Goals
    'goals.title': 'Set Your Daily Goals',
    'goals.description': 'Customize your daily nutrition targets',
    'goals.save': 'Save Goals',
    'goals.saved': 'Goals saved successfully!',
    
    // Actions
    'action.remove': 'Remove',
    'action.clear': 'Clear All',
    
    // Progress
    'progress.of': 'of',
    'progress.goal': 'goal',
  },
  sl: {
    // Header
    'app.title': 'Kalkulator Prehrane',
    'app.subtitle': 'Spremljajte svoj dnevni vnos hranil',
    'theme.light': 'Svetla',
    'theme.dark': 'Temna',
    
    // Tabs
    'tab.calculator': 'Kalkulator',
    'tab.goals': 'Dnevni Cilji',
    
    // Food Database
    'food.search': 'Išči živila...',
    'food.database': 'Baza Živil',
    'food.select': 'Izberite živilo za dodajanje k obroku',
    'food.add': 'Dodaj',
    
    // Meal Types
    'meal.breakfast': 'Zajtrk',
    'meal.lunch': 'Kosilo',
    'meal.dinner': 'Večerja',
    'meal.snack': 'Prigrizek',
    
    // Nutrition
    'nutrition.calories': 'Kalorije',
    'nutrition.protein': 'Beljakovine',
    'nutrition.carbs': 'Ogljikovi hidrati',
    'nutrition.fats': 'Maščobe',
    'nutrition.per100g': 'na 100g',
    'nutrition.servings': 'Porcije',
    
    // Today's Meals
    'meals.today': 'Današnji Obroki',
    'meals.empty': 'Še niste dodali nobenega obroka. Začnite z iskanjem in dodajanjem živil!',
    'meals.total': 'Skupaj',
    
    // Daily Goals
    'goals.title': 'Nastavite Dnevne Cilje',
    'goals.description': 'Prilagodite svoje dnevne cilje prehrane',
    'goals.save': 'Shrani Cilje',
    'goals.saved': 'Cilji uspešno shranjeni!',
    
    // Actions
    'action.remove': 'Odstrani',
    'action.clear': 'Počisti Vse',
    
    // Progress
    'progress.of': 'od',
    'progress.goal': 'cilja',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}