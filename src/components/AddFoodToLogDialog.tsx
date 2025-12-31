import { useState, ReactNode } from 'react';
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
import { Plus } from 'lucide-react';
import { FoodItem, MealEntry } from '@/types/nutrition';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface AddFoodToLogDialogProps {
  foodItem: FoodItem;
  onAddFood: (foodItem: FoodItem, servings: number, mealType: MealEntry['mealType']) => void;
  children: ReactNode;
}

export default function AddFoodToLogDialog({ foodItem, onAddFood, children }: AddFoodToLogDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [servings, setServings] = useState<number>(1);
  const [mealType, setMealType] = useState<MealEntry['mealType']>('snack');

  const handleAddFood = () => {
    if (servings <= 0) {
      toast.error(t('toast.invalidServings'));
      return;
    }
    onAddFood(foodItem, servings, mealType);
    setOpen(false);
    setServings(1); // Reset servings for next use
    setMealType('snack'); // Reset meal type for next use
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('nutritionCalculator.addFoodToLogTitle', { foodName: foodItem.name })}</DialogTitle>
          <DialogDescription>
            {t('nutritionCalculator.addFoodToLogDescriptionDialog')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="servings" className="text-right">
              {t('nutritionCalculator.servings')}
            </Label>
            <Input
              id="servings"
              type="number"
              value={servings}
              onChange={(e) => setServings(parseFloat(e.target.value))}
              min="0.1"
              step="0.1"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="mealType" className="text-right">
              {t('nutritionCalculator.mealType')}
            </Label>
            <Select onValueChange={(value: MealEntry['mealType']) => setMealType(value)} value={mealType}>
              <SelectTrigger id="mealType" className="col-span-3">
                <SelectValue placeholder={t('nutritionCalculator.selectMealType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">{t('nutritionCalculator.breakfast')}</SelectItem>
                <SelectItem value="lunch">{t('nutritionCalculator.lunch')}</SelectItem>
                <SelectItem value="dinner">{t('nutritionCalculator.dinner')}</SelectItem>
                <SelectItem value="snack">{t('nutritionCalculator.snack')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t('nutritionCalculator.cancel')}
          </Button>
          <Button onClick={handleAddFood}>
            <Plus className="h-4 w-4 mr-2" /> {t('nutritionCalculator.add')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}