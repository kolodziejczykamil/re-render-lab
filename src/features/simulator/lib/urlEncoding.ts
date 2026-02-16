/**
 * URL encoding/decoding for shareable simulation links
 */

export interface ShareableSimulation {
  code: string;
  scenarios: Array<{
    type: string;
    key?: string;
    label?: string;
  }>;
}

/**
 * Encode simulation data to base64 URL-safe string
 */
export function encodeSimulation(data: ShareableSimulation): string {
  try {
    const json = JSON.stringify(data);
    const base64 = btoa(unescape(encodeURIComponent(json)));
    // Make URL-safe
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  } catch {
    return '';
  }
}

/**
 * Decode base64 URL-safe string to simulation data
 */
export function decodeSimulation(encoded: string): ShareableSimulation | null {
  try {
    // Restore URL-safe base64
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if needed
    while (base64.length % 4) {
      base64 += '=';
    }
    const json = decodeURIComponent(escape(atob(base64)));
    return JSON.parse(json) as ShareableSimulation;
  } catch {
    return null;
  }
}

/**
 * Get shareable URL for current simulation
 */
export function getShareableUrl(data: ShareableSimulation): string {
  const encoded = encodeSimulation(data);
  if (!encoded) {
    return window.location.href;
  }
  const url = new URL(window.location.href);
  url.searchParams.set('sim', encoded);
  return url.toString();
}

/**
 * Load simulation from URL parameters
 */
export function loadSimulationFromUrl(): ShareableSimulation | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const urlParams = new URLSearchParams(window.location.search);
  const encoded = urlParams.get('sim');
  if (!encoded) {
    return null;
  }
  return decodeSimulation(encoded);
}
