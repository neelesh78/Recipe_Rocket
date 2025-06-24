'use server';
/**
 * @fileOverview An AI flow for generating recipe details.
 *
 * - generateRecipeDetails - A function that generates recipe details from a description.
 * - GenerateRecipeDetailsInput - The input type for the generateRecipeDetails function.
 * - GenerateRecipeDetailsOutput - The return type for the generateRecipeDetails function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const GenerateRecipeDetailsInputSchema = z.object({
  description: z.string().describe('A description of the recipe to generate.'),
});
export type GenerateRecipeDetailsInput = z.infer<typeof GenerateRecipeDetailsInputSchema>;

export const GenerateRecipeDetailsOutputSchema = z.object({
  name: z.string().describe("The name of the recipe. Should be catchy and descriptive."),
  category: z.enum(['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack']).describe("The category of the meal."),
  prepTime: z.number().describe("The preparation time in minutes."),
  cookTime: z.number().describe("The cooking time in minutes."),
  servings: z.number().describe("The number of servings the recipe makes."),
  ingredients: z.string().describe("A list of ingredients, each on a new line."),
  instructions: z.string().describe("The step-by-step instructions, with each step on a new line and numbered."),
});
export type GenerateRecipeDetailsOutput = z.infer<typeof GenerateRecipeDetailsOutputSchema>;

export async function generateRecipeDetails(input: GenerateRecipeDetailsInput): Promise<GenerateRecipeDetailsOutput> {
  return generateRecipeDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRecipeDetailsPrompt',
  input: { schema: GenerateRecipeDetailsInputSchema },
  output: { schema: GenerateRecipeDetailsOutputSchema },
  prompt: `You are a master chef. A user wants to create a new recipe.
Based on their description, generate a full recipe for them.
Be creative and detailed.
The ingredients and instructions should be formatted as a single string with newlines separating each item/step.

Recipe Description: {{{description}}}`,
});

const generateRecipeDetailsFlow = ai.defineFlow(
  {
    name: 'generateRecipeDetailsFlow',
    inputSchema: GenerateRecipeDetailsInputSchema,
    outputSchema: GenerateRecipeDetailsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
