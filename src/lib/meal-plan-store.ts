'use client';

import type { MealPlan, DayOfWeek, DailyPlan } from './types';

const MEAL_PLAN_KEY = 'mealPlan';

const DAYS_OF_WEEK: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const getEmptyMealPlan = (): MealPlan => {
    return {
        title: 'My Weekly Meal Plan',
        monday: { breakfast: null, lunch: null, dinner: null },
        tuesday: { breakfast: null, lunch: null, dinner: null },
        wednesday: { breakfast: null, lunch: null, dinner: null },
        thursday: { breakfast: null, lunch: null, dinner: null },
        friday: { breakfast: null, lunch: null, dinner: null },
        saturday: { breakfast: null, lunch: null, dinner: null },
        sunday: { breakfast: null, lunch: null, dinner: null },
    };
};


// This function should only be called on the client side.
export const getMealPlan = (): MealPlan => {
  if (typeof window === 'undefined') {
    return getEmptyMealPlan();
  }
  const mealPlanJson = localStorage.getItem(MEAL_PLAN_KEY);
  if (mealPlanJson) {
    try {
        const parsed = JSON.parse(mealPlanJson);
        if (typeof parsed === 'object' && parsed !== null && 'title' in parsed && DAYS_OF_WEEK.every(day => day in parsed)) {
            return parsed;
        }
    } catch (e) {
        console.error("Failed to parse meal plan from localStorage", e);
    }
  }
  const emptyPlan = getEmptyMealPlan();
  localStorage.setItem(MEAL_PLAN_KEY, JSON.stringify(emptyPlan));
  return emptyPlan;
};

export const saveMealPlan = (mealPlan: MealPlan): { error?: string } => {
    if (typeof window === 'undefined') {
        return { error: 'This function can only be called on the client.' };
    }

    try {
        localStorage.setItem(MEAL_PLAN_KEY, JSON.stringify(mealPlan));
        window.dispatchEvent(new Event("storage_meal_plan"));
        return {};
    } catch (error) {
        console.error('Failed to save meal plan to localStorage', error);
        return { error: 'Failed to save meal plan.' };
    }
};


export const getMealPlanDbStats = (): { total: number; size: number; lastModified: string } => {
    if (typeof window === 'undefined') {
        return { total: 0, size: 0, lastModified: '' };
    }
    const dataString = localStorage.getItem(MEAL_PLAN_KEY) || '{}';
    const dataSize = new Blob([dataString]).size;
    
    let totalMeals = 0;
    try {
        const mealPlan: MealPlan = JSON.parse(dataString);
        totalMeals = DAYS_OF_WEEK.reduce((count, day) => {
            const dayPlan = mealPlan[day];
            if (dayPlan) {
              return count + Object.values(dayPlan).filter(meal => meal !== null).length;
            }
            return count;
        }, 0);
    } catch (e) {
        // ignore parsing errors
    }


    return {
        total: totalMeals,
        size: dataSize,
        lastModified: new Date().toLocaleString(),
    };
};
