import React, { useState, useRef } from 'react';
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
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Camera, Upload, Loader2, Image as ImageIcon, Sparkles } from 'lucide-react'; // Dodan Sparkles
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { FoodItem, MealEntry } from '@/types/nutrition';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ImageFoodRecognizerProps {
  allAvailableFoods: FoodItem[];
  onAddFoodToDailyLog: (foodItem: FoodItem, servings: number, mealType: MealEntry['mealType']) => void;
}

export default function ImageFoodRecognizer({ allAvailableFoods, onAddFoodToDailyLog }: ImageFoodRecognizerProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [recognizedFoods, setRecognizedFoods] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImageBase64(base64String.split(',')[1]); // Get only the base64 part
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedImageFile(null);
      setImageBase64(null);
    }
  };

  const handleRecognizeFood = async () => {
    if (!imageBase64) {
      toast.error(t('toast.noImageSelected'));
      return;
    }

    setIsLoading(true);
    setRecognizedFoods([]); // Clear previous results

    try {
      const { data, error } = await supabase.functions.invoke('recognize-food', {
        body: { imageBase64 },
      });

      if (error) {
        console.error('Supabase Edge Function error:', error);
        toast.error(t('toast.foodRecognitionFailed'));
        return;
      }

      if (data && data.recognizedFoods) {
        setRecognizedFoods(data.recognizedFoods);
        if (data.recognizedFoods.length === 0) {
          toast.info(t('nutritionCalculator.noFoodsRecognized'));
        } else {
          toast.success(t('toast.foodRecognitionSuccess', { count: data.recognizedFoods.length }));
        }
      } else {
        toast.info(t('nutritionCalculator.noFoodsRecognized'));
      }
    } catch (error) {
      console.error('Error invoking Edge Function:', error);
      toast.error(t('toast.foodRecognitionFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToLog = (foodName: string) => {
    // Find the food item in the database, prioritizing localized names
    const foundFood = allAvailableFoods.find(
      (food) => food.name.toLowerCase() === foodName.toLowerCase() ||
                 (food.name_sl && food.name_sl.toLowerCase() === foodName.toLowerCase())
    );

    if (foundFood) {
      onAddFoodToDailyLog(foundFood, 1, 'snack'); // Default to 1 serving, snack
      toast.success(t('toast.foodAddedToLog', { foodName: foundFood.name }));
    } else {
      toast.error(t('toast.foodNotFound', { foodName }));
    }
  };

  const resetDialog = () => {
    setSelectedImageFile(null);
    setImageBase64(null);
    setRecognizedFoods([]);
    setIsLoading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear file input
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => {
      setOpen(o);
      if (!o) resetDialog(); // Reset state when dialog closes
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Camera className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{t('nutritionCalculator.recognizeFoodImage')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            {t('nutritionCalculator.recognizeFoodImage')}
          </DialogTitle>
          <DialogDescription>{t('nutritionCalculator.recognizeFoodImageDescription')}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 flex-grow overflow-y-auto">
          <div className="space-y-2">
            <Label htmlFor="picture">{t('nutritionCalculator.uploadImage')}</Label>
            <Input id="picture" type="file" accept="image/*" onChange={handleImageChange} ref={fileInputRef} />
            {selectedImageFile && (
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">{selectedImageFile.name}</p>
                <img
                  src={URL.createObjectURL(selectedImageFile)}
                  alt="Selected food"
                  className="max-w-full h-auto max-h-48 object-contain mx-auto rounded-md border"
                />
              </div>
            )}
          </div>

          <Button onClick={handleRecognizeFood} disabled={!selectedImageFile || isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            {t('nutritionCalculator.confirmSearch')}
          </Button>

          {recognizedFoods.length > 0 && (
            <div className="space-y-2 mt-4">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                {t('nutritionCalculator.recognizedFoods')}
              </h4>
              <ScrollArea className="h-[150px] border rounded-md p-2">
                <div className="space-y-2">
                  {recognizedFoods.map((foodName, index) => (
                    <Card key={index} className="p-2 flex items-center justify-between text-sm">
                      <span>{foodName}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddToLog(foodName)}
                        className="shrink-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t('settings.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}