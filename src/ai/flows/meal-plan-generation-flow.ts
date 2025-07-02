'use server';
/**
 * @fileOverview An AI flow for generating a weekly meal plan.
 *
 * - generateMealPlan - A function that generates a meal plan based on a description.
 * - GenerateMealPlanInput - The input type for the generateMealPlan function.
 * - GenerateMealPlanOutput - The return type for the generateMealPlan function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// The input passed to the flow function
const FlowInputSchema = z.object({
  description: z.string().describe('A description of the kind of meal plan to generate (e.g., "a week of healthy, high-protein vegetarian meals").'),
  recipes: z.array(z.object({
    id: z.string(),
    name: z.string().optional(),
    tags: z.array(z.string()).optional(),
  })).describe('A list of available recipes to choose from for the meal plan.'),
});
export type GenerateMealPlanInput = z.infer<typeof FlowInputSchema>;


const PlannedMealSchema = z.object({
    recipeId: z.string().describe("The ID of the chosen recipe."),
    recipeName: z.string().describe("The name of the chosen recipe."),
});

const DailyPlanSchema = z.object({
    breakfast: PlannedMealSchema.nullable(),
    lunch: PlannedMealSchema.nullable(),
    dinner: PlannedMealSchema.nullable(),
});

const GenerateMealPlanOutputSchema = z.object({
    monday: DailyPlanSchema,
    tuesday: DailyPlanSchema,
    wednesday: DailyPlanSchema,
    thursday: DailyPlanSchema,
    friday: DailyPlanSchema,
    saturday: DailyPlanSchema,
    sunday: DailyPlanSchema,
});
export type GenerateMealPlanOutput = z.infer<typeof GenerateMealPlanOutputSchema>;


export async function generateMealPlan(input: GenerateMealPlanInput): Promise<GenerateMealPlanOutput> {
  return generateMealPlanFlow(input);
}


// The input for the prompt itself, after processing
const PromptInputSchema = z.object({
  description: z.string(),
  recipeListAsText: z.string(),
});

const prompt = ai.definePrompt({
  name: 'generateMealPlanPrompt',
  input: { schema: PromptInputSchema },
  output: { schema: GenerateMealPlanOutputSchema },
  prompt: `You are an expert meal planner. A user wants you to create a weekly meal plan for them based on their preferences and a list of available recipes.
Fill out a plan for each day of the week (Monday to Sunday) for breakfast, lunch, and dinner.
Use the provided recipes. If no suitable recipe is found for a slot, you can leave it as null.
The user's preferences are: {{{description}}}

Here is the list of available recipes you must choose from. Only use recipes from this list:
---
{{{recipeListAsText}}}
---
`,
});

const generateMealPlanFlow = ai.defineFlow(
  {
    name: 'generateMealPlanFlow',
    inputSchema: FlowInputSchema,
    outputSchema: GenerateMealPlanOutputSchema,
  },
  async (input) => {
    const recipeListAsText = input.recipes
      .map(r => `ID: ${r.id}, Name: ${r.name || 'Untitled'}, Tags: [${(r.tags || []).join(', ')}]`)
      .join('\n');
    
    const { output } = await prompt({ description: input.description, recipeListAsText });
    return output!;
  }
);
