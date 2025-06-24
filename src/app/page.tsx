'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { RecipeCard } from '@/components/RecipeCard';
import { Database, Download, PlusCircle, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Recipe } from '@/lib/types';
import { getRecipes, getDbStats } from '@/lib/recipe-store';

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isViewDbOpen, setIsViewDbOpen] = useState(false);
  const [dbStats, setDbStats] = useState({ total: 0, size: 0, lastModified: '' });
  const [dbContent, setDbContent] = useState('');

  useEffect(() => {
    setRecipes(getRecipes());
  }, []);

  const handleRefresh = () => {
    setRecipes(getRecipes());
  };

  const handleViewDatabase = () => {
    const currentRecipes = getRecipes();
    setDbContent(JSON.stringify(currentRecipes, null, 2));
    setDbStats(getDbStats());
    setIsViewDbOpen(true);
  };

  const handleExportDatabase = () => {
    const currentRecipes = getRecipes();
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(currentRecipes, null, 2)
    )}`;
    const link = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    link.href = jsonString;
    link.download = `recipe_database_${date}.json`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold font-headline text-foreground">My Recipes</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw /> Refresh
          </Button>
          <Button variant="outline" onClick={handleViewDatabase}>
            <Database /> View Database
          </Button>
          <Button variant="outline" onClick={handleExportDatabase}>
            <Download /> Export Database
          </Button>
          <Button asChild>
            <Link href="/add-recipe">
              <PlusCircle /> Add New Recipe
            </Link>
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>

      <Dialog open={isViewDbOpen} onOpenChange={setIsViewDbOpen}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Database View</DialogTitle>
            <DialogDescription>
              A JSON view of your recipe data, including database statistics.
            </DialogDescription>
          </DialogHeader>
          <div className="text-sm text-muted-foreground grid grid-cols-1 md:grid-cols-3 gap-4 my-4 p-4 border rounded-lg">
              <div><strong>Total Records:</strong> {dbStats.total}</div>
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
