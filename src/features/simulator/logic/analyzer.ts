import type { ComponentAnalysis } from '../types';

export function analyzeComponent(code: string): ComponentAnalysis {
  const analysis: ComponentAnalysis = {
    hasInlineArrowFunctions: false,
    hasInlineObjectLiterals: false,
    hasUseEffectWithoutDeps: false,
    hasUseEffectWithDeps: false,
    useEffectDeps: [],
    hasReactMemo: false,
    stateHooksCount: 0,
    stateHookNames: [],
    isValid: false,
  };

  if (!code || code.trim().length === 0) {
    analysis.validationError = 'Code is empty';
    return analysis;
  }

  // Basic validation: check for function component structure
  const hasFunction = /function\s+\w+\s*\(|const\s+\w+\s*=\s*\(|const\s+\w+\s*=\s*\(\(|export\s+(default\s+)?(function\s+\w+|const\s+\w+\s*=)/.test(code);
  const hasReturn = /return\s*\(/.test(code) || /return\s+</.test(code);

  if (!hasFunction || !hasReturn) {
    analysis.validationError = 'Component must be a function with a return statement';
    return analysis;
  }

  analysis.isValid = true;

  // Check for React.memo
  analysis.hasReactMemo = /React\.memo\(|memo\(/.test(code);

  // Detect inline arrow functions in JSX
  // Pattern: onClick={() => ...} or onEvent={... => ...}
  const inlineArrowFunctionPattern = /on\w+\s*=\s*\{[^}]*=>[^}]*\}/g;
  analysis.hasInlineArrowFunctions = inlineArrowFunctionPattern.test(code);

  // Detect inline object literals in JSX
  // Pattern: style={{...}} or prop={{...}}
  const inlineObjectPattern = /=\s*\{\s*\{[^}]*\}\s*\}/g;
  analysis.hasInlineObjectLiterals = inlineObjectPattern.test(code);

  // Detect useState hooks
  const useStateMatches = code.matchAll(/useState\s*\(/g);
  const useStateCount = Array.from(useStateMatches).length;
  analysis.stateHooksCount = useStateCount;

  // Extract state hook variable names
  const useStateNamePattern = /const\s+\[(\w+)/g;
  const stateNames: string[] = [];
  let match;
  while ((match = useStateNamePattern.exec(code)) !== null) {
    stateNames.push(match[1]);
  }
  analysis.stateHookNames = stateNames;

  // Detect useEffect hooks - check for dependency arrays
  // Pattern: useEffect(() => {...}, [deps]) or useEffect(() => {...})
  const useEffectWithDepsRegex = /useEffect\s*\(\s*(?:\([^)]*\)\s*=>\s*)?\{[^}]*\},\s*\[\s*([^\]]*)\s*\]\s*\)/g;
  const useEffectWithDepsMatches = Array.from(code.matchAll(useEffectWithDepsRegex));
  
  if (useEffectWithDepsMatches.length > 0) {
    analysis.hasUseEffectWithDeps = true;
    useEffectWithDepsMatches.forEach((match) => {
      if (match[1]) {
        const deps = match[1]
          .split(',')
          .map((dep) => dep.trim())
          .filter((dep) => dep.length > 0 && dep !== '');
        analysis.useEffectDeps.push(...deps);
      }
    });
  }
  
  // Check for useEffect without dependency array
  // Pattern: useEffect(() => {...}) - no trailing array
  const useEffectNoDepsRegex = /useEffect\s*\(\s*(?:\([^)]*\)\s*=>\s*)?\{[^}]*\}\s*\)(?!\s*,\s*\[)/g;
  if (useEffectNoDepsRegex.test(code)) {
    // Only mark as without deps if we haven't found any with deps, or if there are multiple useEffects
    const allUseEffectMatches = Array.from(code.matchAll(/useEffect\s*\(/g));
    if (allUseEffectMatches.length > useEffectWithDepsMatches.length) {
      analysis.hasUseEffectWithoutDeps = true;
    } else if (useEffectWithDepsMatches.length === 0) {
      analysis.hasUseEffectWithoutDeps = true;
    }
  }

  return analysis;
}
