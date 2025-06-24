import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { mockRecipes } from '@/lib/data';
import { RecipeCard } from '@/components/RecipeCard';
import { PlusCircle } from 'lucide-react';

export default function Home() {
  const recipeHints: Record<string, string> = {
    '1': 'tomato basil',
    '2': 'avocado egg',
    '3': 'roast chicken',
    '4': 'chocolate brownies',
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-headline text-foreground">My Recipes</h1>
        <Button asChild>
          <Link href="/add-recipe">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Recipe
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mockRecipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} aiHint={recipeHints[recipe.id]} />
        ))}
      </div>
    </div>
  );
}
