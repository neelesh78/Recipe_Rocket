'use client';

import type { Recipe } from './types';
import { mockRecipes } from './data';
import { recipeSchema } from './validators';
import type { z } from 'zod';

const RECIPES_KEY = 'recipes';

// This function should only be called on the client side.
export const getRecipes = (): Recipe[] => {
  if (typeof window === 'undefined') {
    return mockRecipes; // Return mock for SSR
  }
  const recipesJson = localStorage.getItem(RECIPES_KEY);
  if (recipesJson) {
    try {
        const parsed = JSON.parse(recipesJson);
        // Basic validation to ensure it's an array
        if (Array.isArray(parsed)) {
            return parsed;
        }
    } catch (e) {
        // If parsing fails, fall back to default
        console.error("Failed to parse recipes from localStorage", e);
    }
  }
  // Seed with mock recipes if it's the first time or if data is invalid
  localStorage.setItem(RECIPES_KEY, JSON.stringify(mockRecipes));
  return mockRecipes;
};

export const addRecipe = (values: z.infer<typeof recipeSchema>): { error?: string } => {
    if (typeof window === 'undefined') {
        return { error: 'This function can only be called on the client.' };
    }

    const validatedFields = recipeSchema.safeParse(values);

    if (!validatedFields.success) {
        return {
            error: 'Invalid data provided.',
        };
    }
    
    const { tags, ...restOfData } = validatedFields.data;
    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];

    const newRecipe: Recipe = {
        id: new Date().getTime().toString(), // Simple unique ID
        ...restOfData,
        tags: tagsArray,
        imageUrl: values.imageUrl || 'https://placehold.co/600x400.png',
    };

    try {
        const currentRecipes = getRecipes();
        const updatedRecipes = [...currentRecipes, newRecipe];
        localStorage.setItem(RECIPES_KEY, JSON.stringify(updatedRecipes));
        return {};
    } catch (error) {
        console.error('Failed to save recipe to localStorage', error);
        return { error: 'Failed to save recipe.' };
    }
};

export const updateRecipe = (id: string, values: z.infer<typeof recipeSchema>): { error?: string } => {
    if (typeof window === 'undefined') {
        return { error: 'This function can only be called on the client.' };
    }

    const validatedFields = recipeSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: 'Invalid data provided.' };
    }
    
    const { tags, ...restOfData } = validatedFields.data;
    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];

    const updatedRecipeData: Partial<Recipe> = {
        ...restOfData,
        tags: tagsArray,
        imageUrl: values.imageUrl,
    };

    try {
        const currentRecipes = getRecipes();
        const recipeIndex = currentRecipes.findIndex(r => r.id === id);

        if (recipeIndex === -1) {
            return { error: 'Recipe not found for updating.' };
        }
        
        // Merge existing data with new data
        const updatedRecipe = { ...currentRecipes[recipeIndex], ...updatedRecipeData };

        const updatedRecipes = [...currentRecipes];
        updatedRecipes[recipeIndex] = updatedRecipe;
        
        localStorage.setItem(RECIPES_KEY, JSON.stringify(updatedRecipes));
        return {};
    } catch (error) {
        console.error('Failed to update recipe in localStorage', error);
        return { error: 'Failed to update recipe.' };
    }
};

export const getRecipeById = (id: string): Recipe | undefined => {
    const recipes = getRecipes();
    return recipes.find(r => r.id === id);
};

export const getDbStats = (): { total: number; size: number; lastModified: string } => {
    if (typeof window === 'undefined') {
        return { total: 0, size: 0, lastModified: '' };
    }
    const dataString = localStorage.getItem(RECIPES_KEY) || '[]';
    const data = JSON.parse(dataString);
    const dataSize = new Blob([dataString]).size;
    return {
        total: data.length,
        size: dataSize,
        lastModified: new Date().toLocaleString(),
    };
};
