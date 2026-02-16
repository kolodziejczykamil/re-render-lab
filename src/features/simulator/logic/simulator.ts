import type { ComponentAnalysis, RenderEvent, ScenarioEvent } from '../types';

/**
 * Shallow comparison simulation for props
 * In real React, memoized components use shallow comparison
 */
function shallowEqual(obj1: Record<string, unknown>, obj2: Record<string, unknown>): boolean {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }

  return true;
}

export function simulateRenders(
  componentAnalysis: ComponentAnalysis,
  scenarioEvents: ScenarioEvent[]
): RenderEvent[] {
  const renderEvents: RenderEvent[] = [];
  let renderId = 1;
  let currentTime = 0;

  // Track previous props for shallow comparison
  let previousProps: Record<string, unknown> = {};

  // Always start with initial render
  renderEvents.push({
    id: renderId++,
    type: 'initial',
    avoidable: false,
    duration: 0,
    reason: 'Component first mounted to DOM',
    timestamp: currentTime,
  });

  currentTime += 50; // Base time between renders

  // Process each scenario event
  for (const event of scenarioEvents) {
    let avoidable = false;
    let reason = '';
    const baseDuration = event.type === 'effect' ? 80 : 120;
    const duration = baseDuration + (renderId * 5); // Deterministic variation

    switch (event.type) {
      case 'prop': {
        const propKey = event.key || 'unknown';
        const newProps = { ...previousProps, [propKey]: 'changed' };

        // If component is memoized, check shallow comparison
        if (componentAnalysis.hasReactMemo) {
          // Simulate: if prop value is the same, no re-render
          // For simplicity, we assume prop changes trigger re-render
          // In real scenario, we'd need to track actual prop values
          reason = `props.${propKey} changed`;
          avoidable = false; // Prop changes are expected
        } else {
          reason = `props.${propKey} changed`;
          avoidable = false; // Prop changes are expected
        }

        previousProps = newProps;
        break;
      }

      case 'state': {
        const stateName = event.key || componentAnalysis.stateHookNames[0] || 'state';
        reason = `${stateName} updated via setState`;
        avoidable = false; // State changes are expected
        break;
      }

      case 'parent': {
        reason = 'Parent component re-rendered';
        
        // If component is memoized, check if props actually changed
        if (componentAnalysis.hasReactMemo) {
          // In a real scenario, we'd compare previous props with current props
          // For simulation, we assume props haven't changed if memoized
          // So memoized component should NOT re-render
          // Skip adding render event - memoized component doesn't re-render
          continue;
        } else {
          // Not memoized - parent re-render triggers child re-render
          avoidable = true;
          reason += ' unnecessarily (component not memoized)';
          
          // Additional avoidable factors
          if (componentAnalysis.hasInlineArrowFunctions || componentAnalysis.hasInlineObjectLiterals) {
            reason += ' (inline functions/objects detected)';
          }
        }
        break;
      }

      case 'effect': {
        reason = 'useEffect executed';
        avoidable = componentAnalysis.hasUseEffectWithoutDeps;
        if (avoidable) {
          reason += ' (missing dependency array)';
        }
        break;
      }
    }

    // Only add render event if it's not a memoized parent re-render
    // (already handled with continue above)
    
    // Add render event for all other cases
    renderEvents.push({
      id: renderId++,
      type: event.type === 'prop' ? 'prop' : event.type === 'state' ? 'state' : event.type === 'parent' ? 'parent' : 'effect',
      avoidable,
      duration: Math.round(duration),
      reason,
      timestamp: currentTime,
      props: event.type === 'prop' && event.key ? { [event.key]: 'changed' } : undefined,
      state: event.type === 'state' && event.key ? { [event.key]: 'updated' } : undefined,
    });
    
    currentTime += duration + 50; // Add delay between events
  }

  return renderEvents;
}
