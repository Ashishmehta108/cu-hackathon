import { config } from '@/lib/config';

/**
 * Google Maps service
 * Loads Google Maps API script and provides utilities for map operations
 */

// Extend Window interface for Google Maps
declare global {
  interface Window {
    google?: {
      maps: typeof google.maps;
    };
  }
}

let mapsLoaded = false;
let loadPromise: Promise<void> | null = null;

/**
 * Load Google Maps API script
 */
export function loadGoogleMaps(): Promise<void> {
  if (mapsLoaded) {
    return Promise.resolve();
  }

  if (loadPromise) {
    return loadPromise;
  }

  if (!config.googleMapsApiKey) {
    console.warn('Google Maps API key not configured');
    return Promise.reject(new Error('Google Maps API key not configured'));
  }

  loadPromise = new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      mapsLoaded = true;
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${config.googleMapsApiKey}&libraries=visualization`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      mapsLoaded = true;
      resolve();
    };
    script.onerror = () => {
      loadPromise = null;
      reject(new Error('Failed to load Google Maps API'));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}

/**
 * Initialize a map instance
 */
export async function initMap(
  containerId: string,
  options: google.maps.MapOptions
): Promise<google.maps.Map> {
  await loadGoogleMaps();
  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`Container with id "${containerId}" not found`);
  }
  return new google.maps.Map(container, options);
}

/**
 * Create a heatmap layer
 */
export async function createHeatmap(
  map: google.maps.Map,
  data: google.maps.visualization.WeightedLocation[]
): Promise<google.maps.visualization.HeatmapLayer> {
  await loadGoogleMaps();
  return new google.maps.visualization.HeatmapLayer({
    data,
    map,
  });
}
