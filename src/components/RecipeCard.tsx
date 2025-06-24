import Link from 'next/link';
import Image from 'next/image';
import { Clock, Users } from 'lucide-react';
import type { Recipe } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type RecipeCardProps = {
  recipe: Recipe;
  aiHint?: string;
};

export function RecipeCard({ recipe, aiHint }: RecipeCardProps) {
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    <Card className="flex flex-col overflow-hidden transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl">
      <CardHeader className="p-0">
        <Link href={`/recipe/${recipe.id}`} aria-label={`View recipe: ${recipe.name || 'Untitled Recipe'}`}>
            <Image
              src={recipe.imageUrl || 'https://placehold.co/600x400.png'}
              alt={recipe.name || 'Untitled Recipe'}
              width={600}
              height={400}
              className="w-full h-48 object-cover"
              data-ai-hint={aiHint}
            />
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        {recipe.category && <Badge variant="secondary" className="mb-2">{recipe.category}</Badge>}
        <CardTitle className="font-headline text-xl mb-2 leading-tight">
          <Link href={`/recipe/${recipe.id}`} className="hover:text-primary transition-colors">
            {recipe.name || 'Untitled Recipe'}
          </Link>
        </CardTitle>
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {recipe.tags.map((tag) => (
              <Badge key={tag} variant="accent">{tag}</Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 text-sm text-muted-foreground flex justify-between border-t mt-auto">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>{totalTime > 0 ? `${totalTime} min` : 'N/A'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          {recipe.servings ? <span>{recipe.servings} servings</span> : <span>N/A</span>}
        </div>
      </CardFooter>
    </Card>
  );
}
