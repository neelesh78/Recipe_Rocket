'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect } from 'react';
import { addRecipe } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {pending ? "Submitting..." : "Add Recipe"}
        </Button>
    );
}

const initialState = {
    message: '',
    errors: {} as Record<string, string[] | undefined>
};

export function RecipeForm() {
  const [state, formAction] = useFormState(addRecipe, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message.startsWith('Error:')) {
      toast({
        title: 'Error',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, toast]);

  return (
    <Card>
      <form action={formAction}>
        <CardHeader>
          <CardTitle className="font-headline">Recipe Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Recipe Name</Label>
            <Input id="name" name="name" placeholder="e.g. Grandma's Apple Pie" required />
            {state?.errors?.name && <p className="text-sm text-destructive">{state.errors.name[0]}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" required>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Breakfast">Breakfast</SelectItem>
                  <SelectItem value="Lunch">Lunch</SelectItem>
                  <SelectItem value="Dinner">Dinner</SelectItem>
                  <SelectItem value="Dessert">Dessert</SelectItem>
                  <SelectItem value="Snack">Snack</SelectItem>
                </SelectContent>
              </Select>
              {state?.errors?.category && <p className="text-sm text-destructive">{state.errors.category[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="servings">Servings</Label>
              <Input id="servings" name="servings" type="number" placeholder="e.g. 4" required />
              {state?.errors?.servings && <p className="text-sm text-destructive">{state.errors.servings[0]}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="prepTime">Prep Time (minutes)</Label>
              <Input id="prepTime" name="prepTime" type="number" placeholder="e.g. 15" required />
              {state?.errors?.prepTime && <p className="text-sm text-destructive">{state.errors.prepTime[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cookTime">Cook Time (minutes)</Label>
              <Input id="cookTime" name="cookTime" type="number" placeholder="e.g. 30" required />
              {state?.errors?.cookTime && <p className="text-sm text-destructive">{state.errors.cookTime[0]}</p>}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="ingredients">Ingredients</Label>
            <Textarea id="ingredients" name="ingredients" placeholder="List each ingredient on a new line..." rows={6} required />
            {state?.errors?.ingredients && <p className="text-sm text-destructive">{state.errors.ingredients[0]}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea id="instructions" name="instructions" placeholder="Step-by-step instructions..." rows={8} required />
            {state?.errors?.instructions && <p className="text-sm text-destructive">{state.errors.instructions[0]}</p>}
          </div>

        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
