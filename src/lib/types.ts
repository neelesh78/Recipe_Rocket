export type Recipe = {
  id: string;
  name?: string;
  category?: string;
  prepTime?: number; // in minutes
  cookTime?: number; // in minutes
  servings?: number;
  ingredients?: string;
  instructions?: string;
  imageUrl?: string;
  tags?: string[];
};

export type PlannedMeal = {
  recipeId: string;
  recipeName: string;
  recipeImageUrl?: string;
};

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface DailyPlan {
  breakfast: PlannedMeal | null;
  lunch: PlannedMeal | null;
  dinner: PlannedMeal | null;
  snack: PlannedMeal | null;
}

export type MealPlan = {
  title: string;
  monday: DailyPlan;
  tuesday: DailyPlan;
  wednesday: DailyPlan;
  thursday: DailyPlan;
  friday: DailyPlan;
  saturday: DailyPlan;
  sunday: DailyPlan;
};
