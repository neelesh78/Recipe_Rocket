import { z } from "zod";

export const recipeSchema = z.object({
  name: z.string().optional(),
  category: z.string().optional(),
  prepTime: z.coerce.number().optional(),
  cookTime: z.coerce.number().optional(),
  servings: z.coerce.number().optional(),
  ingredients: z.string().optional(),
  instructions: z.string().optional(),
  imageUrl: z.string().optional(),
  tags: z.string().optional(),
});
