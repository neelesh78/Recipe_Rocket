'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, ChefHat, ArrowLeft } from 'lucide-react';
import { getRecipeById } from '@/lib/recipe-store';
import type { Recipe } from '@/lib/types';

export default function RecipeDetailPage({ params }: { params: { id: string } }) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchedRecipe = getRecipeById(params.id);
    if (fetchedRecipe) {
      setRecipe(fetchedRecipe);
    }
    setLoading(false);
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <p>Loading...</p>
      </div>
    );
  }

  if (!recipe) {
    notFound();
  }

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
  const ingredientsList = recipe.ingredients?.split('\n').map(item => item.trim()).filter(Boolean) || [];
  const instructionsList = recipe.instructions?.split('\n').filter(item => item.trim()).map(item => item.replace(/^\d+\.\s*/, '').trim()) || [];

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
       <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" />
        Back to Recipes
      </Link>
      <article className="bg-card text-card-foreground rounded-lg shadow-lg overflow-hidden">
        {recipe.imageUrl && (
          <div className="relative w-full h-96">
            <Image
              src={recipe.imageUrl}
              alt={recipe.name || 'Recipe image'}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="p-8">
          <div className="mb-4">
            {recipe.category && (
              <Badge variant="secondary" className="text-sm mb-2">{recipe.category}</Badge>
            )}
            <h1 className="text-4xl font-bold font-headline text-foreground mb-4">
              {recipe.name || 'Untitled Recipe'}
            </h1>
            {recipe.tags && recipe.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {recipe.tags.map((tag) => (
                  <Badge key={tag} variant="accent">{tag}</Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 mb-8 text-muted-foreground border-y py-4">
            {totalTime > 0 && (
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <div>
                  <p className="font-semibold">Total Time</p>
                  <p>{totalTime} min</p>
                </div>
              </div>
            )}
            {recipe.servings && (
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                 <div>
                  <p className="font-semibold">Servings</p>
                  <p>{recipe.servings} servings</p>
                </div>
              </div>
            )}
             {recipe.prepTime && (
              <div className="flex items-center gap-2">
                <ChefHat className="h-5 w-5" />
                 <div>
                  <p className="font-semibold">Prep Time</p>
                  <p>{recipe.prepTime} min</p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <h2 className="text-2xl font-headline font-bold mb-4">Ingredients</h2>
              {ingredientsList.length > 0 ? (
                <ul className="list-disc list-inside space-y-2">
                  {ingredientsList.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                  ))}
                </ul>
              ) : (
                <p>No ingredients listed.</p>
              )}
            </div>
            <div className="md:col-span-2">
              <h2 className="text-2xl font-headline font-bold mb-4">Instructions</h2>
              {instructionsList.length > 0 ? (
                <ol className="list-decimal list-inside space-y-4">
                  {instructionsList.map((instruction, index) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ol>
              ) : (
                <p>No instructions provided.</p>
              )}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
