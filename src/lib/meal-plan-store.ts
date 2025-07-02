'use client';

import type { MealPlan, DayOfWeek, DailyPlan } from './types';

const MEAL_PLAN_KEY = 'mealPlan';

const DAYS_OF_WEEK: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const getEmptyMealPlan = (): MealPlan => {
    return DAYS_OF_WEEK.reduce((acc, day) => {
        acc[day] = { breakfast: null, lunch: null, dinner: null };
        return acc;
    }, {} as MealPlan);
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
        if (typeof parsed === 'object' && parsed !== null && DAYS_OF_WEEK.every(day => day in parsed)) {
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
        totalMeals = Object.values(mealPlan).reduce((count, dayPlan) => {
            const daily = dayPlan as DailyPlan;
            return count + Object.values(daily).filter(meal => meal !== null).length;
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
