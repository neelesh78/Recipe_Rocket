'use server';

import { z } from 'zod';
import { recipeSchema } from './validators';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Recipe } from './types';

// This is a mock function. In a real app, this would write to a database.
const saveRecipe = async (recipe: Omit<Recipe, 'id'>) => {
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

  const { tags, ...restOfData } = validatedFields.data;
  const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];

  try {
    await saveRecipe({
      ...restOfData,
      tags: tagsArray,
    });
  } catch (error) {
    return {
      error: 'Database Error: Failed to save recipe.',
    };
  }
  
  revalidatePath('/');
  redirect('/');
}
