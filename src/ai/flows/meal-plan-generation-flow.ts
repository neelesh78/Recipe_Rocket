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
import type { DayOfWeek } from '@/lib/types';

// The input passed to the flow function
const FlowInputSchema = z.object({
  description: z.string().describe('A description of the kind of meal plan to generate (e.g., "a week of healthy, high-protein vegetarian meals").'),
  recipes: z.array(z.object({
    id: z.string(),
    name: z.string().optional(),
    tags: z.array(z.string()).optional(),
    imageUrl: z.string().optional(),
  })).describe('A list of available recipes to choose from for the meal plan.'),
});
export type GenerateMealPlanInput = z.infer<typeof FlowInputSchema>;


const PlannedMealSchema = z.object({
    recipeId: z.string().describe("The ID of the chosen recipe."),
    recipeName: z.string().describe("The name of the chosen recipe."),
    recipeImageUrl: z.string().optional().describe("The image URL of the chosen recipe."),
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

// A simplified schema for the AI model to output, to avoid complexity errors.
const AiOutputMealSchema = z.string().nullable().describe("The ID of a recipe from the provided list, or null if no suitable recipe is found for this meal slot.");

const AiOutputSchema = z.object({
  monday: z.object({ breakfast: AiOutputMealSchema, lunch: AiOutputMealSchema, dinner: AiOutputMealSchema }),
  tuesday: z.object({ breakfast: AiOutputMealSchema, lunch: AiOutputMealSchema, dinner: AiOutputMealSchema }),
  wednesday: z.object({ breakfast: AiOutputMealSchema, lunch: AiOutputMealSchema, dinner: AiOutputMealSchema }),
  thursday: z.object({ breakfast: AiOutputMealSchema, lunch: AiOutputMealSchema, dinner: AiOutputMealSchema }),
  friday: z.object({ breakfast: AiOutputMealSchema, lunch: AiOutputMealSchema, dinner: AiOutputMealSchema }),
  saturday: z.object({ breakfast: AiOutputMealSchema, lunch: AiOutputMealSchema, dinner: AiOutputMealSchema }),
  sunday: z.object({ breakfast: AiOutputMealSchema, lunch: AiOutputMealSchema, dinner: AiOutputMealSchema }),
});


const prompt = ai.definePrompt({
  name: 'generateMealPlanPrompt',
  input: { schema: PromptInputSchema },
  output: { schema: AiOutputSchema }, // Use the simplified schema for the AI
  prompt: `You are an expert meal planner. A user wants you to create a weekly meal plan for them based on their preferences and a list of available recipes.
Fill out a plan for each day of the week (Monday to Sunday) for breakfast, lunch, and dinner.
Use the provided recipes. Only use recipes from this list and return only their ID. If no suitable recipe is found for a slot, you must return null.

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
    outputSchema: GenerateMealPlanOutputSchema, // The flow returns the rich object
  },
  async (input) => {
    const recipeListAsText = input.recipes
      .map(r => `ID: ${r.id}, Name: ${r.name || 'Untitled'}, Tags: [${(r.tags || []).join(', ')}]`)
      .join('\n');
    
    // Create a map for easy lookup of recipe details by ID.
    const recipeMap = new Map(input.recipes.map(r => [r.id, r]));

    const { output: aiOutput } = await prompt({ description: input.description, recipeListAsText });

    if (!aiOutput) {
        throw new Error("AI did not return a meal plan.");
    }

    // Transform the AI output (recipe IDs) into the full GenerateMealPlanOutput format.
    const finalOutput: GenerateMealPlanOutput = {
      monday: { breakfast: null, lunch: null, dinner: null },
      tuesday: { breakfast: null, lunch: null, dinner: null },
      wednesday: { breakfast: null, lunch: null, dinner: null },
      thursday: { breakfast: null, lunch: null, dinner: null },
      friday: { breakfast: null, lunch: null, dinner: null },
      saturday: { breakfast: null, lunch: null, dinner: null },
      sunday: { breakfast: null, lunch: null, dinner: null },
    };
    
    const days: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    for (const day of days) {
        for (const mealType of ['breakfast', 'lunch', 'dinner'] as const) {
            const recipeId = aiOutput[day]?.[mealType];
            if (recipeId) {
                const recipe = recipeMap.get(recipeId);
                if (recipe) {
                    finalOutput[day][mealType] = {
                        recipeId: recipe.id,
                        recipeName: recipe.name || 'Untitled Recipe',
                        recipeImageUrl: recipe.imageUrl,
                    };
                }
            } else {
                 finalOutput[day][mealType] = null;
            }
        }
    }
    
    return finalOutput;
  }
);
