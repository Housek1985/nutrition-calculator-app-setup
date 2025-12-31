import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, Search } from 'lucide-react';
import { FoodItem, SavedMeal, SavedMealFoodItem } from '@/types/nutrition';
import { foodDatabase } from '@/data/foodDatabase';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface CreateSavedMealDialogProps {
  onSave: (meal: SavedMeal) => void;
  children: React.ReactNode;
}

export default function CreateSavedMealDialog({ onSave, children }: CreateSavedMealDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [mealName, setMealName] = useState('');
  const [selectedFoodId, setSelectedFoodId] = useState<string | undefined>(undefined);
  const [servings, setServings] = useState<number>(1);
  const [currentMealItems, setCurrentMealItems] = useState<SavedMealFoodItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFoods = useMemo(() => {
    return foodDatabase.filter(food =>
      food.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleAddFoodToMeal = () => {
    if (selectedFoodId && servings > 0) {
      const food = foodDatabase.find(f => f.id === selectedFoodId);
      if (food) {
        const existingItemIndex = currentMealItems.findIndex(item => item.foodItem.id === food.id);
        if (existingItemIndex > -1) {
          // Update existing item's servings
          const updatedItems = [...currentMealItems];
          updatedItems[existingItemIndex].servings += servings;
          setCurrentMealItems(updatedItems);
        } else {
          setCurrentMealItems([...currentMealItems, { foodItem: food, servings }]);
        }
        setSelectedFoodId(undefined);
        setServings(1);
        setSearchQuery('');
      }
    }
  };

  const handleRemoveFoodFromMeal = (foodId: string) => {
    setCurrentMealItems(currentMealItems.filter(item => item.foodItem.id !== foodId));
  };

  const handleSaveMeal = () => {
    if (!mealName.trim()) {
      toast.error(t('toast.mealNameRequired'));
      return;
    }
    if (currentMealItems.length === 0) {
      toast.error(t('toast.mealItemsRequired'));
      return;
    }

    const newSavedMeal: SavedMeal = {
      id: Date.now().toString(),
      name: mealName.trim(),
      items: currentMealItems,
    };
    onSave(newSavedMeal);
    toast.success(t('toast.mealSaved', { mealName: mealName.trim() }));
    resetForm();
    setOpen(false);
  };

  const resetForm = () => {
    setMealName('');
    setSelectedFoodId(undefined);
    setServings(1);
    setCurrentMealItems([]);
    setSearchQuery('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t('nutritionCalculator.createSavedMeal')}</DialogTitle>
          <DialogDescription>
            {t('nutritionCalculator.createSavedMealDescription')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 flex-grow overflow-y-auto">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="mealName" className="text-right">
              {t('nutritionCalculator.mealName')}
            </Label>
            <Input
              id="mealName"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="foodSearch" className="text-right">
              {t('nutritionCalculator.addFood')}
            </Label>
            <div className="col-span-3 flex flex-col gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="foodSearch"
                  placeholder={t('nutritionCalculator.searchFoods')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select onValueChange={setSelectedFoodId} value={selectedFoodId}>
                <SelectTrigger>
                  <SelectValue placeholder={t('nutritionCalculator.selectFood')} />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-[200px]">
                    {filteredFoods.map((food) => (
                      <SelectItem key={food.id} value={food.id}>
                        {food.name} ({food.calories} cal)
                      </SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder={t('nutritionCalculator.servings')}
                  value={servings}
                  onChange={(e) => setServings(parseFloat(e.target.value))}
                  min="0.1"
                  step="0.1"
                  className="w-24"
                />
                <Button onClick={handleAddFoodToMeal} disabled={!selectedFoodId || servings <= 0}>
                  <Plus className="h-4 w-4 mr-2" /> {t('nutritionCalculator.add')}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm">{t('nutritionCalculator.mealContents')}</h4>
            {currentMealItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('nutritionCalculator.noItemsInMeal')}</p>
            ) : (
              <ScrollArea className="h-[150px] border rounded-md p-2">
                <div className="space-y-2">
                  {currentMealItems.map((item) => (
                    <div key={item.foodItem.id} className="flex items-center justify-between text-sm">
                      <span>
                        {item.foodItem.name} ({item.servings} {t('nutritionCalculator.servings')})
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFoodFromMeal(item.foodItem.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t('nutritionCalculator.cancel')}
          </Button>
          <Button onClick={handleSaveMeal}>{t('nutritionCalculator.saveMeal')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}