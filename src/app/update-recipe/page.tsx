'use client';

import { useState, useEffect } from 'react';
import { RecipeForm } from '@/components/RecipeForm';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { getRecipes } from '@/lib/recipe-store';
import type { Recipe } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function UpdateRecipePage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    setRecipes(getRecipes());
  }, []);

  const handleRecipeSelect = (recipeId: string) => {
    const recipe = recipes.find(r => r.id === recipeId) || null;
    setSelectedRecipe(recipe);
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
       <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
        &larr; Back to Recipes
      </Link>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold font-headline text-foreground">Update a Recipe</h1>
        <p className="text-muted-foreground mt-2">
          Select a recipe from the dropdown to edit its details.
        </p>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
            <CardTitle className="font-headline text-2xl">Select a Recipe</CardTitle>
        </CardHeader>
        <CardContent>
             <Label htmlFor="recipe-select" className="sr-only">Select Recipe to Update</Label>
            <Select onValueChange={handleRecipeSelect} value={selectedRecipe?.id || ''}>
            <SelectTrigger id="recipe-select" className="w-full">
                <SelectValue placeholder="Choose a recipe to edit..." />
            </SelectTrigger>
            <SelectContent>
                {recipes.length > 0 ? (
                    recipes.map(recipe => (
                    <SelectItem key={recipe.id} value={recipe.id}>
                        {recipe.name || 'Untitled Recipe'}
                    </SelectItem>
                    ))
                ) : (
                    <div className="p-4 text-sm text-muted-foreground">No recipes found. <Button variant="link" asChild className="p-0 h-auto"><Link href="/add-recipe">Add one!</Link></Button></div>
                )}
            </SelectContent>
            </Select>
        </CardContent>
      </Card>

      {selectedRecipe && <RecipeForm initialData={selectedRecipe} />}
    </div>
  );
}
