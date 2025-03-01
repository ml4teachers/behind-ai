# KI-Erklaer-App Development Guide

## Commands
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Run production build
- `npm run lint` - Run ESLint

## Code Style
- TypeScript with strict mode
- Use Next.js App Router conventions
- PascalCase for components, camelCase for functions/variables
- Use typed props with explicit interfaces/types
- Use path aliases (@/ for src/, @/components, @/lib, etc.)
- Prefer arrow functions for component definitions
- Use React.forwardRef pattern for UI components
- Organize by feature within src/app and reusable UI in src/components

## UI Guidelines
- Use shadcn/ui components with New York style
- Use Tailwind CSS for styling with custom theme variables
- Mobile-first responsive design
- Use CSS variables for theming
- Accessible components with Radix UI primitives
- Data visualization with D3/Recharts

## State Management
- Use React hooks for local state
- Zustand for global state management
- Prefer server components where possible