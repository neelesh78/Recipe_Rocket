'use server';

import { z } from 'zod';
import { recipeSchema } from './validators';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// This is a mock function. In a real app, this would write to a database.
const saveRecipe = async (recipe: z.infer<typeof recipeSchema>) => {
  console.log('Saving recipe:', recipe);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('Recipe saved!');
  return { success: true, message: 'Recipe added successfully!' };
};


export async function addRecipe(prevState: any, formData: FormData) {
  const validatedFields = recipeSchema.safeParse({
    name: formData.get('name'),
    category: formData.get('category'),
    prepTime: formData.get('prepTime'),
    cookTime: formData.get('cookTime'),
    servings: formData.get('servings'),
    ingredients: formData.get('ingredients'),
    instructions: formData.get('instructions'),
    imageUrl: formData.get('imageUrl'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Error: Please check the form for errors.',
    };
  }

  try {
    await saveRecipe(validatedFields.data);
  } catch (error) {
    return {
      message: 'Database Error: Failed to save recipe.',
    };
  }
  
  revalidatePath('/');
  redirect('/');
}
