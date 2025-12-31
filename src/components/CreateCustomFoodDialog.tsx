import { useState } from 'react';
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
import { Plus, UtensilsCrossed } from 'lucide-react';
import { FoodItem } from '@/types/nutrition';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface CreateCustomFoodDialogProps {
  onSave: (food: FoodItem) => void;
  children: React.ReactNode;
}

export default function CreateCustomFoodDialog({ onSave, children }: CreateCustomFoodDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [serving, setServing] = useState('100g');
  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fats, setFats] = useState(0);
  const [fiber, setFiber] = useState(0);
  const [sugar, setSugar] = useState(0);
  const [sodium, setSodium] = useState(0);

  const resetForm = () => {
    setName('');
    setServing('100g');
    setCalories(0);
    setProtein(0);
    setCarbs(0);
    setFats(0);
    setFiber(0);
    setSugar(0);
    setSodium(0);
  };

  const handleSaveFood = () => {
    if (!name.trim()) {
      toast.error(t('toast.foodNameRequired'));
      return;
    }

    const newFood: FoodItem = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      serving: serving.trim(),
      calories: Math.max(0, calories),
      protein: Math.max(0, protein),
      carbs: Math.max(0, carbs),
      fats: Math.max(0, fats),
      fiber: Math.max(0, fiber),
      sugar: Math.max(0, sugar),
      sodium: Math.max(0, sodium),
    };

    onSave(newFood);
    toast.success(t('toast.customFoodSaved', { foodName: name.trim() }));
    resetForm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5" />
            {t('nutritionCalculator.createCustomFood')}
          </DialogTitle>
          <DialogDescription>
            {t('nutritionCalculator.createCustomFoodDescription')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 flex-grow overflow-y-auto pr-2">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="food-name" className="text-right">
              {t('nutritionCalculator.foodName')}
            </Label>
            <Input
              id="food-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="serving-size" className="text-right">
              {t('nutritionCalculator.servingSize')}
            </Label>
            <Input
              id="serving-size"
              value={serving}
              onChange={(e) => setServing(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="calories" className="text-right">
              {t('nutritionCalculator.calories')}
            </Label>
            <Input
              id="calories"
              type="number"
              value={calories}
              onChange={(e) => setCalories(parseFloat(e.target.value))}
              min="0"
              step="1"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="protein" className="text-right">
              {t('nutritionCalculator.protein')} (g)
            </Label>
            <Input
              id="protein"
              type="number"
              value={protein}
              onChange={(e) => setProtein(parseFloat(e.target.value))}
              min="0"
              step="0.1"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="carbs" className="text-right">
              {t('nutritionCalculator.carbs')} (g)
            </Label>
            <Input
              id="carbs"
              type="number"
              value={carbs}
              onChange={(e) => setCarbs(parseFloat(e.target.value))}
              min="0"
              step="0.1"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fats" className="text-right">
              {t('nutritionCalculator.fats')} (g)
            </Label>
            <Input
              id="fats"
              type="number"
              value={fats}
              onChange={(e) => setFats(parseFloat(e.target.value))}
              min="0"
              step="0.1"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fiber" className="text-right">
              {t('nutritionCalculator.fiber')} (g)
            </Label>
            <Input
              id="fiber"
              type="number"
              value={fiber}
              onChange={(e) => setFiber(parseFloat(e.target.value))}
              min="0"
              step="0.1"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sugar" className="text-right">
              {t('nutritionCalculator.sugar')} (g)
            </Label>
            <Input
              id="sugar"
              type="number"
              value={sugar}
              onChange={(e) => setSugar(parseFloat(e.target.value))}
              min="0"
              step="0.1"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sodium" className="text-right">
              {t('nutritionCalculator.sodium')} (mg)
            </Label>
            <Input
              id="sodium"
              type="number"
              value={sodium}
              onChange={(e) => setSodium(parseFloat(e.target.value))}
              min="0"
              step="1"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t('nutritionCalculator.cancel')}
          </Button>
          <Button onClick={handleSaveFood}>
            <Plus className="h-4 w-4 mr-2" /> {t('nutritionCalculator.saveFood')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}