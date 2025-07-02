'use client';

import React, { useState, useMemo } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useDroppable } from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GripVertical, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Recipe, MealPlan, PlannedMeal, DayOfWeek, MealType } from '@/lib/types';

const DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

type MealPlannerProps = {
  recipes: Recipe[];
  mealPlan: MealPlan;
  onPlanChange: (newPlan: MealPlan) => void;
};

// Draggable Recipe Item (in the sidebar)
function DraggableRecipe({ recipe }: { recipe: Recipe }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `recipe-${recipe.id}`,
    data: { type: 'recipe', recipe },
  });
  const style = { transform: CSS.Translate.toString(transform) };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="p-2 touch-none">
      <Card className="p-2 flex items-center gap-2 bg-card hover:bg-muted cursor-grab">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm font-medium truncate flex-1">{recipe.name || 'Untitled Recipe'}</span>
      </Card>
    </div>
  );
}

// Planned Meal Item (in a meal slot)
function PlannedMealItem({ meal, day, mealType, onRemove }: { meal: PlannedMeal, day: DayOfWeek, mealType: MealType, onRemove: () => void }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: `planned-${day}-${mealType}`,
        data: { type: 'planned', ...meal },
    });
    const style = { transform: CSS.Translate.toString(transform) };

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="w-full touch-none">
            <Card className="p-1 text-xs bg-primary/10 border-primary/50 flex items-center gap-1 cursor-grab">
                {meal.recipeImageUrl && (
                    <Image src={meal.recipeImageUrl} alt={meal.recipeName} width={24} height={24} className="rounded-sm object-cover aspect-square" />
                )}
                <span className="truncate flex-1 font-semibold">{meal.recipeName}</span>
                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={onRemove}>
                  <X className="h-3 w-3" />
                </Button>
            </Card>
        </div>
    );
}


// Droppable Meal Slot
function MealSlot({ day, mealType, children }: { day: DayOfWeek, mealType: MealType, children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({
    id: `${day}-${mealType}`,
    data: { type: 'slot', day, mealType },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'h-20 p-1 flex items-center justify-center text-center border-t',
        isOver ? 'bg-accent/20' : '',
        mealType === 'breakfast' && 'border-t-0'
      )}
    >
        {children || <span className="text-xs text-muted-foreground capitalize">{mealType}</span>}
    </div>
  );
}

export function MealPlanner({ recipes, mealPlan, onPlanChange }: MealPlannerProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8,
    },
  }));

  const filteredRecipes = useMemo(() => {
    if (!searchTerm) return recipes;
    return recipes.filter(r => 
        r.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        r.tags?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [recipes, searchTerm]);
  
  const activeDragData = useMemo(() => {
      if (!activeId) return null;
      if (activeId.startsWith('recipe-')) {
          const recipe = recipes.find(r => `recipe-${r.id}` === activeId);
          return recipe ? { type: 'recipe', recipe } : null;
      }
      if (activeId.startsWith('planned-')) {
          const [_, day, mealType] = activeId.split('-');
          const meal = mealPlan[day as DayOfWeek]?.[mealType as MealType];
          return meal ? { type: 'planned', meal } : null;
      }
      return null;
  }, [activeId, recipes, mealPlan]);


  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;

    if (!over) return;
    
    const activeId = active.id as string;
    
    if (over.data.current?.type !== 'slot') return;
    
    const { day: toDay, mealType: toMealType } = over.data.current;
    const newPlan = JSON.parse(JSON.stringify(mealPlan));

    let newMealData: PlannedMeal | null = null;
    let fromDay: DayOfWeek | null = null;
    let fromMealType: MealType | null = null;
    
    if (active.data.current?.type === 'recipe') {
        const recipe = active.data.current.recipe as Recipe;
        newMealData = { recipeId: recipe.id, recipeName: recipe.name || 'Untitled', recipeImageUrl: recipe.imageUrl };
    }
    
    if (active.data.current?.type === 'planned') {
        [_, fromDay, fromMealType] = activeId.split('-') as [string, DayOfWeek, MealType];
        newMealData = newPlan[fromDay][fromMealType];
    }
    
    if (!newMealData) return;

    const mealToDisplace = newPlan[toDay][toMealType];
    newPlan[toDay][toMealType] = newMealData;
    
    if (fromDay && fromMealType) {
        if (`${fromDay}-${fromMealType}` !== `${toDay}-${toMealType}`) {
             newPlan[fromDay][fromMealType] = mealToDisplace;
        }
    }

    onPlanChange(newPlan);
  }

  const handleRemoveMeal = (day: DayOfWeek, mealType: MealType) => {
    const newPlan = {...mealPlan};
    newPlan[day][mealType] = null;
    onPlanChange(newPlan);
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <Card className="md:col-span-1 lg:col-span-1 flex flex-col h-[70vh]">
          <CardHeader className="p-2">
            <Input 
                placeholder="Search recipes..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </CardHeader>
          <ScrollArea className="flex-1">
            <div className="p-2">
                {filteredRecipes.length > 0 ? (
                    filteredRecipes.map(recipe => (
                        <DraggableRecipe key={recipe.id} recipe={recipe} />
                    ))
                ) : (
                    <p className="p-4 text-sm text-center text-muted-foreground">No recipes found.</p>
                )}
            </div>
          </ScrollArea>
        </Card>
        
        <div className="md:col-span-3 lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-1">
          {DAYS.map(day => (
            <Card key={day} className="flex flex-col">
              <CardHeader className="p-2 text-center bg-muted">
                <h3 className="font-semibold capitalize">{day}</h3>
              </CardHeader>
              <CardContent className="p-0 flex-1 flex flex-col">
                {MEAL_TYPES.map(mealType => (
                  <MealSlot key={mealType} day={day} mealType={mealType}>
                    {mealPlan[day]?.[mealType] && (
                      <PlannedMealItem 
                        meal={mealPlan[day][mealType]!} 
                        day={day} 
                        mealType={mealType}
                        onRemove={() => handleRemoveMeal(day, mealType)} 
                      />
                    )}
                  </MealSlot>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <DragOverlay>
        {activeDragData?.type === 'recipe' && (
            <Card className="p-2 flex items-center gap-2 bg-card cursor-grabbing">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium truncate flex-1">{activeDragData.recipe.name || 'Untitled Recipe'}</span>
            </Card>
        )}
        {activeDragData?.type === 'planned' && (
             <Card className="p-1 text-xs bg-primary/10 border-primary/50 flex items-center gap-1 cursor-grabbing">
                 {activeDragData.meal.recipeImageUrl && (
                     <Image src={activeDragData.meal.recipeImageUrl} alt={activeDragData.meal.recipeName} width={24} height={24} className="rounded-sm object-cover aspect-square" />
                 )}
                 <span className="truncate flex-1 font-semibold">{activeDragData.meal.recipeName}</span>
             </Card>
        )}
      </DragOverlay>
    </DndContext>
  );
}
