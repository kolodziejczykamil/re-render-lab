# React Re-render Simulator

A production-grade web application for visualizing and understanding React component re-renders through static analysis and rule-based simulation.

## Features

- **Component Code Editor**: Write and validate React function components
- **Scenario Builder**: Create custom render scenarios (prop changes, state updates, parent re-renders, effects)
- **Static Code Analysis**: Detects inline functions, inline objects, useEffect patterns, React.memo usage, and state hooks
- **Simulation Engine**: Heuristic-based simulation of component re-renders (not a real React runtime)
- **Optimization Suggestions**: Rule-based recommendations to improve component performance
- **Performance Metrics**: Track total renders, avoidable renders, average duration, and optimization score
- **Interactive Timeline**: Visualize render events with color-coded status indicators

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript** (strict mode)
- **Tailwind CSS**
- **Vitest** (testing)
- **Husky** (git hooks)
- **Feature-based architecture**

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage

### Git Hooks

This project uses Husky for git hooks:

- **pre-commit**: Runs type-check, lint, and tests before committing
- **pre-push**: Runs build before pushing

To set up Husky:
```bash
npm run prepare
```

## Project Structure

```
src/
  app/                    # Next.js app router
  components/
    ui/                   # Reusable UI components
    layout/               # Layout components (Header, Footer)
    features/             # Feature-specific components
  features/
    simulator/
      logic/              # Core business logic (analyzer, simulator, metrics)
      types/              # TypeScript type definitions
      hooks/              # React hooks (useSimulator)
      rules/              # Optimization rules engine
  lib/                    # Shared utilities
  test/                   # Test setup
```

## Testing

Tests are written with Vitest and React Testing Library. Run tests with:

```bash
npm run test
```

## Deployment

The application is optimized for deployment on Vercel.

### Build for Production

```bash
npm run build
npm run start
```

### Vercel Deployment

1. Push your code to GitHub
2. Import your repository in Vercel
3. Vercel will automatically detect Next.js and configure the build
4. No environment variables are required for basic functionality

## Code Quality

- ✅ No `any` types
- ✅ Strict TypeScript
- ✅ Pure logic separation (no React in logic files)
- ✅ No console.logs
- ✅ Production-ready code
- ✅ Comprehensive test coverage
- ✅ ESLint + Prettier configured
- ✅ Husky git hooks

## License

MIT
