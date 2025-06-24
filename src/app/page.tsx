'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { mockRecipes } from '@/lib/data';
import { RecipeCard } from '@/components/RecipeCard';
import { Database, Download, PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Home() {
  const recipeHints: Record<string, string> = {
    '1': 'tomato basil',
    '2': 'avocado egg',
    '3': 'roast chicken',
    '4': 'chocolate brownies',
  };

  const [isViewDbOpen, setIsViewDbOpen] = useState(false);
  const [dbStats, setDbStats] = useState({ total: 0, size: 0, lastModified: '' });

  const handleViewDatabase = () => {
    const dataString = JSON.stringify(mockRecipes, null, 2);
    const dataSize = new Blob([dataString]).size;
    setDbStats({
      total: mockRecipes.length,
      size: dataSize,
      lastModified: new Date().toLocaleString(),
    });
    setIsViewDbOpen(true);
  };

  const handleExportDatabase = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(mockRecipes, null, 2)
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
        {mockRecipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} aiHint={recipeHints[recipe.id]} />
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
          <div className="flex-1 relative">
            <ScrollArea className="h-full w-full absolute rounded-md border">
              <pre className="text-sm p-4">
                <code>{JSON.stringify(mockRecipes, null, 2)}</code>
              </pre>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
