import { RecipeForm } from '@/components/RecipeForm';

export default function AddRecipePage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold font-headline text-foreground">Add a New Recipe</h1>
        <p className="text-muted-foreground mt-2">
          Fill in the details manually or describe your ideal dish and let our AI chef create a recipe for you.
        </p>
      </div>
      <RecipeForm />
    </div>
  );
}
