export type Recipe = {
  id: string;
  name: string;
  category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Dessert' | 'Snack';
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  servings: number;
  ingredients: string;
  instructions: string;
  imageUrl: string;
  tags: string[];
};
