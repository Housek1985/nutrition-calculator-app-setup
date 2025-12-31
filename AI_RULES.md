# AI Rules for Buildify Nutrition App

This document outlines the core technologies and specific library usage guidelines for the Buildify Nutrition Calculator application. Adhering to these rules ensures consistency, maintainability, and leverages the strengths of our chosen tech stack.

## Tech Stack Overview

*   **Frontend Framework:** React (v18.x) for building dynamic user interfaces.
*   **Language:** TypeScript for type safety and improved code quality.
*   **Build Tool:** Vite for a fast development experience and optimized builds.
*   **Styling:** Tailwind CSS for utility-first styling, ensuring a consistent and responsive design.
*   **UI Components:** shadcn/ui, built on Radix UI, provides a set of accessible and customizable UI components.
*   **Routing:** React Router DOM for declarative navigation within the application.
*   **State Management/Data Fetching:** React Query (`@tanstack/react-query`) for managing server state, caching, and asynchronous data operations.
*   **Icons:** Lucide React for a comprehensive and customizable icon set.
*   **Form Handling & Validation:** React Hook Form for efficient form management, paired with Zod for schema validation.
*   **Notifications:** Sonner for elegant and customizable toast notifications.

## Library Usage Rules

*   **UI Components:**
    *   **Always** prioritize `shadcn/ui` components for all UI elements (e.g., `Button`, `Card`, `Input`, `Tabs`, `Progress`, `ScrollArea`).
    *   If a required component is not available in `shadcn/ui`, create a new, small, and focused component in `src/components/` using Tailwind CSS for styling. **Do not modify existing `shadcn/ui` component files.**
*   **Styling:**
    *   **Exclusively** use Tailwind CSS classes for all styling. Avoid inline styles or separate CSS modules unless absolutely necessary for third-party integrations.
    *   Utilize the `cn` utility function from `src/lib/utils.ts` for conditionally combining Tailwind classes.
*   **Icons:**
    *   Use icons from the `lucide-react` library. Import them directly by name (e.g., `import { Plus, Trash2 } from 'lucide-react';`).
*   **Routing:**
    *   Manage all application routes using `react-router-dom`.
    *   Define all primary routes within `src/App.tsx`.
*   **State Management:**
    *   For server-side data fetching, caching, and synchronization, use `@tanstack/react-query`.
    *   For simple, component-level UI state, `useState` and `useReducer` are appropriate.
*   **Forms:**
    *   Implement all forms using `react-hook-form` for controlled inputs and validation.
    *   Use `zod` schemas with `@hookform/resolvers` for robust form validation.
*   **Notifications:**
    *   Use `sonner` for all toast notifications to provide user feedback. Import `toast` from `sonner` (e.g., `import { toast } from 'sonner';`).
*   **Date Handling:**
    *   For any date manipulation or formatting, use `date-fns`.
*   **Theming:**
    *   `next-themes` is available for implementing light/dark mode functionality.

---