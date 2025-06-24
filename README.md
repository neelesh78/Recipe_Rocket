# Recipe Rocket 🚀

Welcome to **Recipe Rocket**, your personal AI-powered recipe manager! This application is built with Next.js and Firebase Studio, designed to make creating, storing, and managing your favorite recipes a breeze.

## Features

-   **AI-Powered Recipe Generation**: Don't know what to cook? Just describe your ideal dish, and our AI chef will generate a complete recipe for you, including ingredients, instructions, and even relevant tags.
-   **Add & Manage Recipes**: Easily add new recipes manually or with the help of AI. All your recipes are displayed in a clean, card-based layout on the homepage.
-   **Detailed Recipe View**: Click on any recipe to see a detailed view with prep time, cook time, servings, ingredients, instructions, and tags.
-   **Tagging System**: Organize your recipes with custom tags. Tags are displayed on both the recipe cards and the detail page.
-   **Database Management**:
    -   **View Database**: Get a quick overview of all your recipe data in a clean, formatted JSON view directly in the app. Includes stats like total recipes and database size.
    -   **Export Database**: Download a complete backup of your recipe collection as a JSON file.

## Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) (with App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
-   **Generative AI**: [Google's Genkit](https://firebase.google.com/docs/genkit)
-   **Forms**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)

## Getting Started

### Running the Development Server

To start the development server, run the following command:

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

### Key Files

-   **Homepage**: `src/app/page.tsx`
-   **Add Recipe Page**: `src/app/add-recipe/page.tsx`
-   **Recipe Detail Page**: `src/app/recipe/[id]/page.tsx`
-   **AI Flow**: `src/ai/flows/recipe-generation-flow.ts`
-   **Global Styles**: `src/app/globals.css`
