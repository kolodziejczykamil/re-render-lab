import type { ComponentAnalysis } from '../types';

// Try to import Babel, fallback to regex if not available
let parser: typeof import('@babel/parser') | null = null;
let traverse: typeof import('@babel/traverse').default | null = null;
let t: typeof import('@babel/types') | null = null;

try {
  // Dynamic require for optional Babel dependencies
  // Using type assertion since these are optional dependencies
  parser = require('@babel/parser') as typeof import('@babel/parser');
  traverse = require('@babel/traverse').default as typeof import('@babel/traverse').default;
  t = require('@babel/types') as typeof import('@babel/types');
} catch {
  // Babel not available, will use regex fallback
}

export function analyzeComponent(code: string): ComponentAnalysis {
  const analysis: ComponentAnalysis = {
    hasInlineArrowFunctions: false,
    hasInlineObjectLiterals: false,
    hasInlineArrayLiterals: false,
    hasUseEffectWithoutDeps: false,
    hasUseEffectWithDeps: false,
    useEffectDeps: [],
    hasReactMemo: false,
    stateHooksCount: 0,
    stateHookNames: [],
    hasPropsDestructuring: false,
    isValid: false,
  };

  if (!code || code.trim().length === 0) {
    analysis.validationError = 'Code is empty';
    return analysis;
  }

  // Try AST-based analysis first
  if (parser && traverse && t) {
    try {
      const ast = parser.parse(code, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript', 'decorators-legacy', 'classProperties'],
        allowImportExportEverywhere: true,
        allowReturnOutsideFunction: true,
      });

      traverse(ast, {
        // Detect React.memo and useEffect hooks
        CallExpression(path: unknown) {
          const pathNode = path as { node: { callee: unknown; arguments: unknown[] } };
          const callee = pathNode.node.callee;
          const args = pathNode.node.arguments;
          
          // Check for React.memo
          if (t.isIdentifier(callee as never) && (callee as { name: string }).name === 'memo') {
            analysis.hasReactMemo = true;
          }
          if (
            t.isMemberExpression(callee as never) &&
            t.isIdentifier((callee as { object: unknown }).object as never) &&
            ((callee as { object: { name: string } }).object.name === 'React') &&
            t.isIdentifier((callee as { property: unknown }).property as never) &&
            ((callee as { property: { name: string } }).property.name === 'memo')
          ) {
            analysis.hasReactMemo = true;
          }
          
          // Detect useEffect hooks
          if (t.isIdentifier(callee as never) && (callee as { name: string }).name === 'useEffect') {
            if (args.length === 1) {
              // useEffect(() => {}) - no dependency array
              analysis.hasUseEffectWithoutDeps = true;
            } else if (args.length === 2) {
              // useEffect(() => {}, [])
              const depsArg = args[1];
              if (t.isArrayExpression(depsArg as never)) {
                analysis.hasUseEffectWithDeps = true;
                const depsArray = depsArg as { elements: unknown[] };
                depsArray.elements.forEach((element: unknown) => {
                  if (t.isIdentifier(element as never)) {
                    analysis.useEffectDeps.push((element as { name: string }).name);
                  } else if (t.isStringLiteral(element as never)) {
                    analysis.useEffectDeps.push((element as { value: string }).value);
                  }
                });
              } else {
                analysis.hasUseEffectWithoutDeps = true;
              }
            }
          }
        },

        // Detect function component declaration and props destructuring
        FunctionDeclaration(path: unknown) {
          const pathNode = path as { node: { id: unknown; params: unknown[] } };
          const nodeId = pathNode.node.id;
          if (nodeId && t.isIdentifier(nodeId as never)) {
            analysis.componentName = (nodeId as { name: string }).name;
            analysis.isValid = true;
          }
          
          // Detect props destructuring
          if (pathNode.node.params.length > 0) {
            const firstParam = pathNode.node.params[0];
            if (t.isObjectPattern(firstParam as never)) {
              analysis.hasPropsDestructuring = true;
            }
          }
        },

        VariableDeclarator(path: unknown) {
          const pathNode = path as { node: { id: unknown; init: unknown } };
          const nodeId = pathNode.node.id;
          const nodeInit = pathNode.node.init;
          
          // Detect const Component = () => {} or const Component = function() {}
          if (
            t.isIdentifier(nodeId as never) &&
            (t.isArrowFunctionExpression(nodeInit as never) ||
              t.isFunctionExpression(nodeInit as never))
          ) {
            analysis.componentName = (nodeId as { name: string }).name;
            analysis.isValid = true;
          }

          // Detect useState hooks
          if (
            t.isCallExpression(nodeInit as never) &&
            t.isIdentifier((nodeInit as { callee: unknown }).callee as never) &&
            ((nodeInit as { callee: { name: string } }).callee.name === 'useState')
          ) {
            analysis.stateHooksCount++;
            if (t.isArrayPattern(nodeId as never) && (nodeId as { elements: unknown[] }).elements[0]) {
              const firstElement = (nodeId as { elements: unknown[] }).elements[0];
              if (t.isIdentifier(firstElement as never)) {
                analysis.stateHookNames.push((firstElement as { name: string }).name);
              }
            }
          }
        },

        ArrowFunctionExpression(path: unknown) {
          const pathNode = path as { node: { params: unknown[] } };
          if (pathNode.node.params.length > 0) {
            const firstParam = pathNode.node.params[0];
            if (t.isObjectPattern(firstParam as never)) {
              analysis.hasPropsDestructuring = true;
            }
          }
        },

        // Detect inline arrow functions, objects, and arrays in JSX
        JSXExpressionContainer(path: unknown) {
          const pathNode = path as { node: { expression: unknown } };
          const expression = pathNode.node.expression;
          if (t.isArrowFunctionExpression(expression as never)) {
            analysis.hasInlineArrowFunctions = true;
          }
          if (t.isObjectExpression(expression as never)) {
            analysis.hasInlineObjectLiterals = true;
          }
          if (t.isArrayExpression(expression as never)) {
            analysis.hasInlineArrayLiterals = true;
          }
        },
      });

      // If we successfully parsed, mark as valid if we found a component
      if (analysis.componentName) {
        analysis.isValid = true;
      } else {
        // Fallback validation: check for function/arrow function
        const hasFunction = /function\s+\w+\s*\(|const\s+\w+\s*=\s*\(|const\s+\w+\s*=\s*\(\(|export\s+(default\s+)?(function\s+\w+|const\s+\w+\s*=)/.test(code);
        const hasReturn = /return\s*\(/.test(code) || /return\s+</.test(code);
        if (hasFunction && hasReturn) {
          analysis.isValid = true;
        } else {
          analysis.validationError = 'Component must be a function with a return statement';
        }
      }

      return analysis;
    } catch (error) {
      // Parse error - fall back to regex-based analysis
      // Continue to regex fallback below
    }
  }

  // Fallback to regex-based analysis if AST parsing fails or Babel is not available
  return analyzeComponentRegex(code);
}

function analyzeComponentRegex(code: string): ComponentAnalysis {
  const analysis: ComponentAnalysis = {
    hasInlineArrowFunctions: false,
    hasInlineObjectLiterals: false,
    hasInlineArrayLiterals: false,
    hasUseEffectWithoutDeps: false,
    hasUseEffectWithDeps: false,
    useEffectDeps: [],
    hasReactMemo: false,
    stateHooksCount: 0,
    stateHookNames: [],
    hasPropsDestructuring: false,
    isValid: false,
  };

  // Basic validation
  const hasFunction = /function\s+\w+\s*\(|const\s+\w+\s*=\s*\(|const\s+\w+\s*=\s*\(\(|export\s+(default\s+)?(function\s+\w+|const\s+\w+\s*=)/.test(code);
  const hasReturn = /return\s*\(/.test(code) || /return\s+</.test(code);

  if (!hasFunction || !hasReturn) {
    analysis.validationError = 'Component must be a function with a return statement';
    return analysis;
  }

  analysis.isValid = true;

  // Extract component name
  const functionMatch = code.match(/function\s+(\w+)\s*\(/);
  const constMatch = code.match(/const\s+(\w+)\s*=\s*(?:\(|function)/);
  if (functionMatch) {
    analysis.componentName = functionMatch[1];
  } else if (constMatch) {
    analysis.componentName = constMatch[1];
  }

  // Check for React.memo
  analysis.hasReactMemo = /React\.memo\(|memo\(/.test(code);

  // Detect props destructuring
  analysis.hasPropsDestructuring = /function\s+\w+\s*\(\s*\{[^}]+}\s*\)|const\s+\w+\s*=\s*\(\s*\{[^}]+}\s*\)/.test(code);

  // Detect inline arrow functions in JSX
  const inlineArrowFunctionPattern = /on\w+\s*=\s*\{[^}]*=>[^}]*\}/g;
  analysis.hasInlineArrowFunctions = inlineArrowFunctionPattern.test(code);

  // Detect inline object literals in JSX
  const inlineObjectPattern = /=\s*\{\s*\{[^}]*\}\s*\}/g;
  analysis.hasInlineObjectLiterals = inlineObjectPattern.test(code);

  // Detect inline array literals in JSX
  const inlineArrayPattern = /=\s*\{\s*\[[^\]]*\]\s*\}/g;
  analysis.hasInlineArrayLiterals = inlineArrayPattern.test(code);

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

  // Detect useEffect hooks
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
  const useEffectNoDepsRegex = /useEffect\s*\(\s*(?:\([^)]*\)\s*=>\s*)?\{[^}]*\}\s*\)(?!\s*,\s*\[)/g;
  if (useEffectNoDepsRegex.test(code)) {
    const allUseEffectMatches = Array.from(code.matchAll(/useEffect\s*\(/g));
    if (allUseEffectMatches.length > useEffectWithDepsMatches.length) {
      analysis.hasUseEffectWithoutDeps = true;
    } else if (useEffectWithDepsMatches.length === 0) {
      analysis.hasUseEffectWithoutDeps = true;
    }
  }

  return analysis;
}
