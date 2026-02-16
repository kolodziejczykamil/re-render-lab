import { describe, it, expect } from 'vitest';
import { analyzeComponent } from '../analyzer';

describe('analyzeComponent', () => {
  describe('validation', () => {
    it('should return invalid for empty code', () => {
      const result = analyzeComponent('');
      expect(result.isValid).toBe(false);
      expect(result.validationError).toBe('Code is empty');
    });

    it('should return invalid for whitespace only', () => {
      const result = analyzeComponent('   \n\t  ');
      expect(result.isValid).toBe(false);
      expect(result.validationError).toBe('Code is empty');
    });

    it('should return invalid for non-component code', () => {
      const result = analyzeComponent('const x = 5;');
      expect(result.isValid).toBe(false);
      expect(result.validationError).toBe('Component must be a function with a return statement');
    });

    it('should validate function component with return', () => {
      const code = `
        function MyComponent() {
          return <div>Hello</div>;
        }
      `;
      const result = analyzeComponent(code);
      expect(result.isValid).toBe(true);
    });

    it('should validate arrow function component', () => {
      const code = `
        const MyComponent = () => {
          return <div>Hello</div>;
        }
      `;
      const result = analyzeComponent(code);
      expect(result.isValid).toBe(true);
    });
  });

  describe('React.memo detection', () => {
    it('should detect React.memo', () => {
      const code = `
        const MyComponent = React.memo(() => {
          return <div>Hello</div>;
        });
      `;
      const result = analyzeComponent(code);
      expect(result.hasReactMemo).toBe(true);
    });

    it('should detect memo import', () => {
      const code = `
        import { memo } from 'react';
        const MyComponent = memo(() => {
          return <div>Hello</div>;
        });
      `;
      const result = analyzeComponent(code);
      expect(result.hasReactMemo).toBe(true);
    });

    it('should not detect memo when not present', () => {
      const code = `
        function MyComponent() {
          return <div>Hello</div>;
        }
      `;
      const result = analyzeComponent(code);
      expect(result.hasReactMemo).toBe(false);
    });
  });

  describe('inline arrow functions detection', () => {
    it('should detect inline arrow function in onClick', () => {
      const code = `
        function MyComponent() {
          return <button onClick={() => console.log('click')}>Click</button>;
        }
      `;
      const result = analyzeComponent(code);
      expect(result.hasInlineArrowFunctions).toBe(true);
    });

    it('should detect inline arrow function in other handlers', () => {
      const code = `
        function MyComponent() {
          return <input onChange={(e) => handleChange(e)} />;
        }
      `;
      const result = analyzeComponent(code);
      expect(result.hasInlineArrowFunctions).toBe(true);
    });

    it('should not detect arrow function defined outside JSX', () => {
      const code = `
        function MyComponent() {
          const handleClick = () => console.log('click');
          return <button onClick={handleClick}>Click</button>;
        }
      `;
      const result = analyzeComponent(code);
      expect(result.hasInlineArrowFunctions).toBe(false);
    });
  });

  describe('inline object literals detection', () => {
    it('should detect inline style object', () => {
      const code = `
        function MyComponent() {
          return <div style={{ color: 'red' }}>Hello</div>;
        }
      `;
      const result = analyzeComponent(code);
      expect(result.hasInlineObjectLiterals).toBe(true);
    });

    it('should detect inline object in props', () => {
      const code = `
        function MyComponent() {
          return <Child config={{ key: 'value' }} />;
        }
      `;
      const result = analyzeComponent(code);
      expect(result.hasInlineObjectLiterals).toBe(true);
    });

    it('should not detect object defined outside JSX', () => {
      const code = `
        function MyComponent() {
          const style = { color: 'red' };
          return <div style={style}>Hello</div>;
        }
      `;
      const result = analyzeComponent(code);
      expect(result.hasInlineObjectLiterals).toBe(false);
    });
  });

  describe('useState detection', () => {
    it('should count useState hooks', () => {
      const code = `
        function MyComponent() {
          const [count, setCount] = useState(0);
          const [name, setName] = useState('');
          return <div>{count}</div>;
        }
      `;
      const result = analyzeComponent(code);
      expect(result.stateHooksCount).toBe(2);
    });

    it('should extract state hook names', () => {
      const code = `
        function MyComponent() {
          const [count, setCount] = useState(0);
          const [name, setName] = useState('');
          return <div>{count}</div>;
        }
      `;
      const result = analyzeComponent(code);
      expect(result.stateHookNames).toContain('count');
      expect(result.stateHookNames).toContain('name');
    });

    it('should return empty array when no useState', () => {
      const code = `
        function MyComponent() {
          return <div>Hello</div>;
        }
      `;
      const result = analyzeComponent(code);
      expect(result.stateHooksCount).toBe(0);
      expect(result.stateHookNames).toEqual([]);
    });
  });

  describe('useEffect detection', () => {
    it('should detect useEffect without dependency array', () => {
      const code = `
        function MyComponent() {
          useEffect(() => {
            console.log('effect');
          });
          return <div>Hello</div>;
        }
      `;
      const result = analyzeComponent(code);
      expect(result.hasUseEffectWithoutDeps).toBe(true);
      expect(result.hasUseEffectWithDeps).toBe(false);
    });

    it('should detect useEffect with empty dependency array', () => {
      const code = `
        function MyComponent() {
          useEffect(() => {
            console.log('effect');
          }, []);
          return <div>Hello</div>;
        }
      `;
      const result = analyzeComponent(code);
      expect(result.hasUseEffectWithDeps).toBe(true);
      expect(result.hasUseEffectWithoutDeps).toBe(false);
      expect(result.useEffectDeps).toEqual([]);
    });

    it('should detect useEffect with dependencies', () => {
      const code = `
        function MyComponent() {
          const [count, setCount] = useState(0);
          useEffect(() => {
            console.log(count);
          }, [count]);
          return <div>{count}</div>;
        }
      `;
      const result = analyzeComponent(code);
      expect(result.hasUseEffectWithDeps).toBe(true);
      expect(result.useEffectDeps).toContain('count');
    });

    it('should extract multiple dependencies', () => {
      const code = `
        function MyComponent() {
          const [count, setCount] = useState(0);
          const [name, setName] = useState('');
          useEffect(() => {
            console.log(count, name);
          }, [count, name]);
          return <div>{count}</div>;
        }
      `;
      const result = analyzeComponent(code);
      expect(result.hasUseEffectWithDeps).toBe(true);
      expect(result.useEffectDeps).toContain('count');
      expect(result.useEffectDeps).toContain('name');
    });

    it('should handle multiple useEffects', () => {
      const code = `
        function MyComponent() {
          useEffect(() => {
            console.log('no deps');
          });
          useEffect(() => {
            console.log('with deps');
          }, []);
          return <div>Hello</div>;
        }
      `;
      const result = analyzeComponent(code);
      expect(result.hasUseEffectWithoutDeps).toBe(true);
      expect(result.hasUseEffectWithDeps).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle component with no hooks', () => {
      const code = `
        function MyComponent({ name }) {
          return <div>{name}</div>;
        }
      `;
      const result = analyzeComponent(code);
      expect(result.isValid).toBe(true);
      expect(result.stateHooksCount).toBe(0);
      expect(result.hasReactMemo).toBe(false);
    });

    it('should handle complex component with all features', () => {
      const code = `
        import React, { useState, useEffect, memo } from 'react';
        
        const MyComponent = memo(({ name }) => {
          const [count, setCount] = useState(0);
          const [value, setValue] = useState('');
          
          useEffect(() => {
            console.log(count);
          }, [count]);
          
          useEffect(() => {
            console.log('mount');
          });
          
          return (
            <div 
              onClick={() => setCount(count + 1)}
              style={{ color: 'red' }}
            >
              {name} - {count}
            </div>
          );
        });
      `;
      const result = analyzeComponent(code);
      expect(result.isValid).toBe(true);
      expect(result.hasReactMemo).toBe(true);
      expect(result.stateHooksCount).toBe(2);
      expect(result.hasInlineArrowFunctions).toBe(true);
      expect(result.hasInlineObjectLiterals).toBe(true);
      expect(result.hasUseEffectWithDeps).toBe(true);
      expect(result.hasUseEffectWithoutDeps).toBe(true);
    });
  });
});
