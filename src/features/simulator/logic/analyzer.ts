import type { ComponentAnalysis } from '../types';

// Try to import Babel, fallback to regex if not available
let parser: typeof import('@babel/parser') | null = null;
let traverse: typeof import('@babel/traverse').default | null = null;
let t: typeof import('@babel/types') | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  parser = require('@babel/parser');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  traverse = require('@babel/traverse').default;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  t = require('@babel/types');
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
          const { node } = path as { node: { callee: unknown; arguments: unknown[] } };
          if (
            t.isIdentifier(node.callee) &&
            (node.callee.name === 'memo' || node.callee.name === 'React.memo')
          ) {
            analysis.hasReactMemo = true;
          }
          if (
            t.isMemberExpression(node.callee) &&
            t.isIdentifier(node.callee.object) &&
            node.callee.object.name === 'React' &&
            t.isIdentifier(node.callee.property) &&
            node.callee.property.name === 'memo'
          ) {
            analysis.hasReactMemo = true;
          }
          
          // Detect useEffect hooks
          if (
            t.isIdentifier(node.callee) &&
            node.callee.name === 'useEffect'
          ) {
            if (node.arguments.length === 1) {
              // useEffect(() => {}) - no dependency array
              analysis.hasUseEffectWithoutDeps = true;
            } else if (node.arguments.length === 2) {
              // useEffect(() => {}, [])
              const depsArg = node.arguments[1];
              if (t.isArrayExpression(depsArg)) {
                analysis.hasUseEffectWithDeps = true;
                depsArg.elements.forEach((element: unknown) => {
                  if (t.isIdentifier(element)) {
                    analysis.useEffectDeps.push(element.name);
                  } else if (t.isStringLiteral(element)) {
                    analysis.useEffectDeps.push(element.value);
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
          if (pathNode.node.id && t.isIdentifier(pathNode.node.id)) {
            analysis.componentName = pathNode.node.id.name;
            analysis.isValid = true;
          }
          
          // Detect props destructuring
          if (pathNode.node.params.length > 0) {
            const firstParam = pathNode.node.params[0];
            if (t.isObjectPattern(firstParam)) {
              analysis.hasPropsDestructuring = true;
            }
          }
        },

        VariableDeclarator(path: unknown) {
          const pathNode = path as { node: { id: unknown; init: unknown } };
          // Detect const Component = () => {} or const Component = function() {}
          if (
            t.isIdentifier(pathNode.node.id) &&
            (t.isArrowFunctionExpression(pathNode.node.init) ||
              t.isFunctionExpression(pathNode.node.init))
          ) {
            analysis.componentName = pathNode.node.id.name;
            analysis.isValid = true;
          }

          // Detect useState hooks
          if (
            t.isCallExpression(pathNode.node.init) &&
            t.isIdentifier(pathNode.node.init.callee) &&
            pathNode.node.init.callee.name === 'useState'
          ) {
            analysis.stateHooksCount++;
            if (t.isArrayPattern(pathNode.node.id) && pathNode.node.id.elements[0]) {
              const firstElement = pathNode.node.id.elements[0];
              if (t.isIdentifier(firstElement)) {
                analysis.stateHookNames.push(firstElement.name);
              }
            }
          }
        },

        ArrowFunctionExpression(path: unknown) {
          const pathNode = path as { node: { params: unknown[] } };
          if (pathNode.node.params.length > 0) {
            const firstParam = pathNode.node.params[0];
            if (t.isObjectPattern(firstParam)) {
              analysis.hasPropsDestructuring = true;
            }
          }
        },

        // Detect inline arrow functions, objects, and arrays in JSX
        JSXExpressionContainer(path: unknown) {
          const pathNode = path as { node: { expression: unknown } };
          if (t.isArrowFunctionExpression(pathNode.node.expression)) {
            analysis.hasInlineArrowFunctions = true;
          }
          if (t.isObjectExpression(pathNode.node.expression)) {
            analysis.hasInlineObjectLiterals = true;
          }
          if (t.isArrayExpression(pathNode.node.expression)) {
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
