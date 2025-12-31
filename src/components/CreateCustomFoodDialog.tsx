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
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { FoodItem } from '@/types/nutrition';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface CreateCustomFoodDialogProps {
  onSave: (foodItem: FoodItem) => void;
  children: ReactNode;
}

// Zod schema for form validation
const formSchema = z.object({
  name: z.string().min(1, { message: "Food name is required." }),
  serving: z.string().min(1, { message: "Serving size is required." }),
  calories: z.coerce.number().min(0, { message: "Calories must be non-negative." }),
  protein: z.coerce.number().min(0, { message: "Protein must be non-negative." }),
  carbs: z.coerce.number().min(0, { message: "Carbs must be non-negative." }),
  fats: z.coerce.number().min(0, { message: "Fats must be non-negative." }),
  fiber: z.coerce.number().min(0, { message: "Fiber must be non-negative." }).optional(),
  sugar: z.coerce.number().min(0, { message: "Sugar must be non-negative." }).optional(),
  sodium: z.coerce.number().min(0, { message: "Sodium must be non-negative." }).optional(),
});

export default function CreateCustomFoodDialog({ onSave, children }: CreateCustomFoodDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      serving: "1 serving",
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const newFood: FoodItem = {
      id: `custom-${Date.now()}`, // Unique ID for custom food
      name: values.name,
      serving: values.serving,
      calories: values.calories,
      protein: values.protein,
      carbs: values.carbs,
      fats: values.fats,
      fiber: values.fiber || 0,
      sugar: values.sugar || 0,
      sodium: values.sodium || 0,
    };
    onSave(newFood);
    toast.success(t('toast.customFoodSaved', { foodName: newFood.name }));
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {t('nutritionCalculator.createCustomFood')}
          </DialogTitle>
          <DialogDescription>{t('nutritionCalculator.createCustomFoodDescription')}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4 flex-grow overflow-y-auto">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('nutritionCalculator.foodName')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('nutritionCalculator.foodNamePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="serving"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('nutritionCalculator.servingSize')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('nutritionCalculator.servingSizePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="calories"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('nutritionCalculator.calories')}</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="protein"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('nutritionCalculator.protein')} (g)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="carbs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('nutritionCalculator.carbs')} (g)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fats"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('nutritionCalculator.fats')} (g)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fiber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('nutritionCalculator.fiber')} (g)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sugar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('nutritionCalculator.sugar')} (g)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sodium"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('nutritionCalculator.sodium')} (mg)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setOpen(false)} type="button">
                {t('nutritionCalculator.cancel')}
              </Button>
              <Button type="submit">
                <Plus className="h-4 w-4 mr-2" /> {t('nutritionCalculator.saveFood')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}