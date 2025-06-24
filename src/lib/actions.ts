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


export async function addRecipe(values: z.infer<typeof recipeSchema>) {
  // Server-side validation
  const validatedFields = recipeSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      error: 'Invalid data provided. Please check the form fields.',
    };
  }

  try {
    await saveRecipe(validatedFields.data);
  } catch (error) {
    return {
      error: 'Database Error: Failed to save recipe.',
    };
  }
  
  revalidatePath('/');
  redirect('/');
}
