import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './raceMap.module.css';

interface RaceMapProps {
  latitude?: number;
  longitude?: number;
  location?: string;
  title?: string;
  /** Path to a route JSON file: array of [lat, lon] pairs (e.g. "/tracks/route.json") */
  routeUrl?: string;
}

const DEFAULT_LAT = 32.0853;
const DEFAULT_LNG = 34.7818;
const DEFAULT_LOCATION = 'Tel Aviv, Israel';

function makeCircleMarker(latlng: L.LatLng, color: string, label: string): L.CircleMarker {
  return L.circleMarker(latlng, {
    radius: 8,
    color: '#fff',
    weight: 2,
    fillColor: color,
    fillOpacity: 1,
  }).bindPopup(label);
}

const RaceMap: React.FC<RaceMapProps> = ({
  latitude = DEFAULT_LAT,
  longitude = DEFAULT_LNG,
  location = DEFAULT_LOCATION,
  title = 'Race Location',
  routeUrl,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const trackLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = L.map(mapContainerRef.current).setView([latitude, longitude], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapRef.current);

    trackLayerRef.current = L.layerGroup().addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function renderTrack() {
      const map = mapRef.current;
      const trackLayer = trackLayerRef.current;
      if (!map || !trackLayer) return;

      trackLayer.clearLayers();

      if (routeUrl) {
        try {
          const res = await fetch(routeUrl);
          if (!res.ok) throw new Error(`Failed to fetch route: ${res.status}`);
          const data: [number, number][] = await res.json();
          if (!cancelled && data.length > 0) {
            const points = data.map(([lat, lon]) => L.latLng(lat, lon));
            L.polyline(points, { color: '#3b82f6', weight: 4, opacity: 0.85 }).addTo(trackLayer);
            makeCircleMarker(points[0], '#22c55e', 'Start').addTo(trackLayer);
            makeCircleMarker(points[points.length - 1], '#ef4444', 'Finish').addTo(trackLayer);
            map.fitBounds(L.polyline(points).getBounds(), { padding: [24, 24] });
            return;
          }
        } catch (e) {
          console.error('RaceMap route load failed:', e);
        }
      }

      if (cancelled) return;
      map.setView([latitude, longitude], 13);
      L.marker([latitude, longitude]).bindPopup(location).addTo(trackLayer).openPopup();
    }

    renderTrack();
    return () => { cancelled = true; };
  }, [latitude, longitude, location, routeUrl]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h4>{title}</h4>
        <p className={styles.location}>{location}</p>
      </div>
      <div className={styles.mapContainer} ref={mapContainerRef} />
    </div>
  );
};

export default RaceMap;
