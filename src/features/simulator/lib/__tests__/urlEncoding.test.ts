import { describe, it, expect } from 'vitest';
import { encodeSimulation, decodeSimulation, getShareableUrl, loadSimulationFromUrl } from '../urlEncoding';

describe('urlEncoding', () => {
  const mockSimulation = {
    code: 'function Test() { return <div>Test</div>; }',
    scenarios: [
      { type: 'prop', key: 'name', label: 'Prop change' },
      { type: 'state', key: 'count', label: 'State change' },
    ],
  };

  describe('encodeSimulation', () => {
    it('should encode simulation data to base64', () => {
      const encoded = encodeSimulation(mockSimulation);
      expect(encoded).toBeTruthy();
      expect(typeof encoded).toBe('string');
      expect(encoded.length).toBeGreaterThan(0);
    });

    it('should produce URL-safe encoding', () => {
      const encoded = encodeSimulation(mockSimulation);
      expect(encoded).not.toContain('+');
      expect(encoded).not.toContain('/');
      expect(encoded).not.toContain('=');
    });

    it('should handle empty simulation', () => {
      const encoded = encodeSimulation({ code: '', scenarios: [] });
      expect(encoded).toBeTruthy();
    });
  });

  describe('decodeSimulation', () => {
    it('should decode encoded simulation back to original', () => {
      const encoded = encodeSimulation(mockSimulation);
      const decoded = decodeSimulation(encoded);
      
      expect(decoded).not.toBeNull();
      expect(decoded?.code).toBe(mockSimulation.code);
      expect(decoded?.scenarios).toEqual(mockSimulation.scenarios);
    });

    it('should return null for invalid encoding', () => {
      const decoded = decodeSimulation('invalid-base64!!!');
      expect(decoded).toBeNull();
    });

    it('should return null for empty string', () => {
      const decoded = decodeSimulation('');
      expect(decoded).toBeNull();
    });
  });

  describe('getShareableUrl', () => {
    it('should generate URL with sim parameter', () => {
      // Mock window.location
      Object.defineProperty(window, 'location', {
        value: {
          href: 'https://example.com',
        },
        writable: true,
      });

      const url = getShareableUrl(mockSimulation);
      expect(url).toContain('sim=');
    });
  });

  describe('loadSimulationFromUrl', () => {
    it('should return null when no sim parameter', () => {
      // Mock URLSearchParams
      const originalSearch = window.location.search;
      Object.defineProperty(window, 'location', {
        value: { search: '' },
        writable: true,
      });

      const loaded = loadSimulationFromUrl();
      expect(loaded).toBeNull();

      Object.defineProperty(window, 'location', {
        value: { search: originalSearch },
        writable: true,
      });
    });
  });
});
