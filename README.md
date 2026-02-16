# React Re-render Simulator

A production-grade web application for visualizing and understanding React component re-renders through static analysis and rule-based simulation.

## Features

- **Component Code Editor**: Write and validate React function components
- **Scenario Builder**: Create custom render scenarios (prop changes, state updates, parent re-renders, effects)
- **Static Code Analysis**: Detects inline functions, inline objects, useEffect patterns, React.memo usage, and state hooks
- **Simulation Engine**: Heuristic-based simulation of component re-renders (not a real React runtime)
- **Optimization Suggestions**: AI-powered recommendations to improve component performance
- **Performance Metrics**: Track total renders, avoidable renders, average duration, and optimization score
- **Interactive Timeline**: Visualize render events with color-coded status indicators

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript** (strict mode)
- **Tailwind CSS**
- **Feature-based architecture**

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
```

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

## How It Works

### Static Analysis

The `analyzeComponent` function performs static code analysis to detect:
- Inline arrow functions in JSX
- Inline object literals in JSX
- useEffect hooks with/without dependency arrays
- React.memo usage
- State hooks (useState) and their names

### Simulation Engine

The `simulateRenders` function uses heuristic rules to simulate renders:
- Initial render always occurs
- Prop changes trigger expected renders
- State changes trigger expected renders
- Parent re-renders are avoidable if component is not memoized
- Effects without dependencies are marked as avoidable

### Optimization Rules

The rules engine generates suggestions based on:
- Component analysis results
- Render event patterns
- Performance metrics

## Code Quality

- ✅ No `any` types
- ✅ Strict TypeScript
- ✅ Pure logic separation (no React in logic files)
- ✅ No console.logs
- ✅ Production-ready code

## License

MIT
