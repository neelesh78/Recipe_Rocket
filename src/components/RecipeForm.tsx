'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { addRecipe } from '@/lib/actions';
import { recipeSchema } from '@/lib/validators';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Sparkles } from 'lucide-react';
import { generateRecipeDetails } from '@/ai/flows/recipe-generation-flow';

type RecipeFormValues = z.infer<typeof recipeSchema>;

export function RecipeForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      name: '',
      category: undefined,
      prepTime: 0,
      cookTime: 0,
      servings: 1,
      ingredients: '',
      instructions: '',
      imageUrl: '',
      tags: '',
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        form.setValue('imageUrl', result, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!aiPrompt) {
        toast({ title: 'Prompt is empty', description: 'Please enter a recipe idea.', variant: 'destructive' });
        return;
    }
    setIsGenerating(true);
    try {
        const result = await generateRecipeDetails({ description: aiPrompt });
        form.setValue('name', result.name, { shouldValidate: true });
        form.setValue('category', result.category, { shouldValidate: true });
        form.setValue('prepTime', result.prepTime, { shouldValidate: true });
        form.setValue('cookTime', result.cookTime, { shouldValidate: true });
        form.setValue('servings', result.servings, { shouldValidate: true });
        form.setValue('ingredients', result.ingredients, { shouldValidate: true });
        form.setValue('instructions', result.instructions, { shouldValidate: true });
        if (result.tags) {
          form.setValue('tags', result.tags.join(', '), { shouldValidate: true });
        }
        toast({ title: 'Recipe Generated!', description: 'The recipe details have been filled in for you.' });
    } catch (error) {
        toast({ title: 'Error', description: 'Failed to generate recipe details.', variant: 'destructive' });
        console.error(error);
    }
    setIsGenerating(false);
  };

  async function onSubmit(values: RecipeFormValues) {
    setIsSubmitting(true);
    const result = await addRecipe(values);
    if (result?.error) {
      toast({
        title: 'Error submitting recipe',
        description: result.error,
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
    // On success, the action redirects, so no need to handle success case here.
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Generate with AI</CardTitle>
                <CardDescription>Describe the recipe you have in mind, and let AI do the heavy lifting.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Textarea
                    placeholder="e.g., A healthy and quick spicy chicken stir-fry for two people"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    rows={3}
                />
                <Button type="button" onClick={handleGenerate} disabled={isGenerating} className="w-full">
                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    {isGenerating ? 'Generating...' : 'Generate Recipe'}
                </Button>
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Recipe Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipe Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Grandma's Apple Pie" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Vegan, Gluten-Free, Quick" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter tags separated by commas.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Breakfast">Breakfast</SelectItem>
                                    <SelectItem value="Lunch">Lunch</SelectItem>
                                    <SelectItem value="Dinner">Dinner</SelectItem>
                                    <SelectItem value="Dessert">Dessert</SelectItem>
                                    <SelectItem value="Snack">Snack</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="servings"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Servings</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="e.g. 4" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="prepTime"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Prep Time (minutes)</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="e.g. 15" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="cookTime"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Cook Time (minutes)</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="e.g. 30" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipe Image</FormLabel>
                  <FormControl>
                    <Input type="file" accept="image/*" onChange={handleImageChange} />
                  </FormControl>
                  {imagePreview && (
                    <div className="mt-4 relative w-full aspect-video rounded-md overflow-hidden">
                      <Image src={imagePreview} alt="Recipe preview" fill className="object-cover" />
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
                control={form.control}
                name="ingredients"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Ingredients</FormLabel>
                    <FormControl>
                        <Textarea placeholder="List each ingredient on a new line..." rows={6} {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="instructions"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Instructions</FormLabel>
                    <FormControl>
                        <Textarea placeholder="Step-by-step instructions..." rows={8} {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isSubmitting ? "Submitting..." : "Add Recipe"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
