# UI & Styling Guide

This document outlines the UI components and styling conventions used in the Recipe Rocket application.

## Component Library: ShadCN UI

We use [ShadCN UI](https://ui.shadcn.com/) as our primary component library. It provides a set of beautifully designed, accessible, and composable components built on top of Radix UI and styled with Tailwind CSS.

All UI components are located in the `src/components/ui` directory. These are not installed as a package but are part of the application's source code, allowing for easy customization.

### Key Components Used

-   **Card**: For displaying recipe summaries (`RecipeCard.tsx`).
-   **Button**: For all interactive actions.
-   **Input**, **Textarea**, **Select**: For form fields in `RecipeForm.tsx`.
-   **Dialog**: For the "View Database" modal.
-   **Badge**: For displaying recipe tags.
-   **Toast**: For showing notifications (e.g., successful AI generation, errors).
-   **ScrollArea**: Used in the "View Database" dialog for long content.

## Styling: Tailwind CSS

All styling is handled by [Tailwind CSS](https://tailwindcss.com/). We use a utility-first approach to build our UI.

### Theme & Colors

The application's color palette and theme are defined using CSS variables in `src/app/globals.css`. This file contains definitions for both light and dark modes. The core colors are inspired by a warm, culinary theme.

-   `--background`: Main page background color.
-   `--foreground`: Main text color.
-   `--primary`: Primary accent color (e.g., buttons, links).
-   `--secondary`: Secondary color for UI elements like badges.
-   `--accent`: An additional accent color.
-   `--card`: Background color for card components.

These variables are consumed by Tailwind's color utilities (e.g., `bg-background`, `text-primary`).

### Fonts

The application uses custom fonts from Google Fonts:
-   **Playfair Display**: For headlines and titles (`font-headline`).
-   **PT Sans**: For body text (`font-body`).

These are configured in `tailwind.config.ts` and loaded in `src/app/layout.tsx`.
