import { z } from "zod";

export const recipeSchema = z.object({
  name: z.string().min(3, "Recipe name must be at least 3 characters long."),
  category: z.enum(['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack'], {
    errorMap: () => ({ message: "Please select a category." }),
  }),
  prepTime: z.coerce.number().min(0, "Prep time can't be negative."),
  cookTime: z.coerce.number().min(0, "Cook time can't be negative."),
  servings: z.coerce.number().min(1, "Servings must be at least 1."),
  ingredients: z.string().min(10, "Ingredients must be at least 10 characters long."),
  instructions: z.string().min(20, "Instructions must be at least 20 characters long."),
  imageUrl: z.string().min(1, { message: "Please upload an image." }).startsWith("data:image/", { message: "Please upload a valid image." }),
});
