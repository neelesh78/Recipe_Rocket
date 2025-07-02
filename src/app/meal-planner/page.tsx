'use client';

import { useState, useEffect } from 'react';
import { MealPlanner } from '@/components/MealPlanner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Database, Download, Trash2 } from 'lucide-react';
import type { Recipe, MealPlan } from '@/lib/types';
import { getRecipes } from '@/lib/recipe-store';
import { getMealPlan, saveMealPlan, getMealPlanDbStats, getEmptyMealPlan } from '@/lib/meal-plan-store';
import { generateMealPlan, GenerateMealPlanOutput } from '@/ai/flows/meal-plan-generation-flow';

export default function MealPlannerPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [mealPlan, setMealPlan] = useState<MealPlan>(getEmptyMealPlan());
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const { toast } = useToast();
  
  const [isViewDbOpen, setIsViewDbOpen] = useState(false);
  const [dbStats, setDbStats] = useState({ total: 0, size: 0, lastModified: '' });
  const [dbContent, setDbContent] = useState('');

  useEffect(() => {
    setRecipes(getRecipes());
    setMealPlan(getMealPlan());

    const refreshMealPlan = () => setMealPlan(getMealPlan());
    window.addEventListener('storage_meal_plan', refreshMealPlan);
    return () => window.removeEventListener('storage_meal_plan', refreshMealPlan);
  }, []);

  const handlePlanChange = (newPlan: MealPlan) => {
    setMealPlan(newPlan);
    saveMealPlan(newPlan);
  };

  const handleGenerate = async () => {
    if (!aiPrompt) {
        toast({ title: 'Prompt is empty', description: 'Please describe your ideal meal plan.', variant: 'destructive' });
        return;
    }
    if (recipes.length === 0) {
        toast({ title: 'No Recipes', description: 'You need to add some recipes before generating a meal plan.', variant: 'destructive' });
        return;
    }
    setIsGenerating(true);
    try {
        const recipesForPrompt = recipes.map(({ id, name, tags }) => ({ id, name: name || 'Untitled Recipe', tags }));
        const result = await generateMealPlan({ description: aiPrompt, recipes: recipesForPrompt as any });

        const newPlan = getEmptyMealPlan();
        for (const day in result) {
          if (day in newPlan) {
            Object.assign(newPlan[day as keyof MealPlan], result[day as keyof GenerateMealPlanOutput]);
          }
        }
        
        handlePlanChange(newPlan as MealPlan);
        toast({ title: 'Meal Plan Generated!', description: 'Your weekly meal plan has been created.' });
    } catch (error) {
        toast({ title: 'Error', description: 'Failed to generate meal plan.', variant: 'destructive' });
        console.error(error);
    }
    setIsGenerating(false);
  };
  
  const handleClearPlan = () => {
    handlePlanChange(getEmptyMealPlan());
    toast({ title: 'Plan Cleared', description: 'Your meal plan has been reset.' });
  }
  
  const handleViewDatabase = () => {
    const currentPlan = getMealPlan();
    setDbContent(JSON.stringify(currentPlan, null, 2));
    setDbStats(getMealPlanDbStats());
    setIsViewDbOpen(true);
  };

  const handleExportDatabase = () => {
    const currentPlan = getMealPlan();
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(currentPlan, null, 2)
    )}`;
    const link = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    link.href = jsonString;
    link.download = `meal_plan_database_${date}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8 gap-4 flex-wrap">
        <h1 className="text-3xl font-bold font-headline text-foreground">Meal Planner</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" onClick={handleViewDatabase}>
            <Database /> View Database
          </Button>
          <Button variant="outline" onClick={handleExportDatabase}>
            <Download /> Export Database
          </Button>
          <Button variant="destructive" onClick={handleClearPlan}>
            <Trash2 /> Clear Plan
          </Button>
        </div>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
            <CardTitle className="font-headline text-2xl">Generate with AI</CardTitle>
            <CardDescription>Describe your weekly meal goals, and let AI build a plan for you from your recipe book.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <Textarea
                placeholder="e.g., A week of low-carb meals, with quick lunches and family-friendly dinners."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                rows={3}
            />
            <Button type="button" onClick={handleGenerate} disabled={isGenerating} className="w-full">
                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                {isGenerating ? 'Generating...' : 'Generate Meal Plan'}
            </Button>
        </CardContent>
      </Card>
      
      <MealPlanner recipes={recipes} mealPlan={mealPlan} onPlanChange={handlePlanChange} />
      
      <Dialog open={isViewDbOpen} onOpenChange={setIsViewDbOpen}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Meal Plan Database View</DialogTitle>
            <DialogDescription>
              A JSON view of your meal plan data.
            </DialogDescription>
          </DialogHeader>
          <div className="text-sm text-muted-foreground grid grid-cols-1 md:grid-cols-3 gap-4 my-4 p-4 border rounded-lg">
              <div><strong>Total Planned Meals:</strong> {dbStats.total}</div>
              <div><strong>Database Size:</strong> {(dbStats.size / 1024).toFixed(2)} KB</div>
              <div><strong>Last Modified:</strong> {dbStats.lastModified}</div>
          </div>
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full rounded-md border">
              <pre className="text-sm p-4">
                <code>{dbContent}</code>
              </pre>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
