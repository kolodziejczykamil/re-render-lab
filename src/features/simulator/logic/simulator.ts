import type { ComponentAnalysis, RenderEvent, ScenarioEvent } from '../types';

export function simulateRenders(
  componentAnalysis: ComponentAnalysis,
  scenarioEvents: ScenarioEvent[]
): RenderEvent[] {
  const renderEvents: RenderEvent[] = [];
  let renderId = 1;
  let currentTime = 0;

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
    // Deterministic duration based on event type and index
    const baseDuration = event.type === 'initial' ? 0 : event.type === 'effect' ? 80 : 120;
    const duration = baseDuration + (renderId * 5); // Deterministic variation

    switch (event.type) {
      case 'prop': {
        reason = `props.${event.key || 'unknown'} changed`;
        avoidable = false; // Prop changes are expected
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
        avoidable = !componentAnalysis.hasReactMemo;
        if (avoidable) {
          reason += ' unnecessarily (component not memoized)';
        } else {
          reason += ' (component is memoized, no re-render needed)';
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

    // Additional avoidable render detection for parent re-renders
    if (event.type === 'parent' && !componentAnalysis.hasReactMemo) {
      // Check if inline functions/objects would cause re-renders
      if (componentAnalysis.hasInlineArrowFunctions || componentAnalysis.hasInlineObjectLiterals) {
        avoidable = true;
        if (!reason.includes('inline')) {
          reason += ' (inline functions/objects detected)';
        }
      }
    }

    // Only add render event if it's not a memoized parent re-render
    if (event.type === 'parent' && componentAnalysis.hasReactMemo && !avoidable) {
      // Skip adding render event for memoized components when parent re-renders
      // They don't re-render, so no event is added
    } else {
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

  }

  return renderEvents;
}
