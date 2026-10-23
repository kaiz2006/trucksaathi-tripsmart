import { useEffect, useRef } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";

const ludhiana: [number, number] = [30.9, 75.8573];
const delhi: [number, number] = [28.6139, 77.209];

export function LiveRouteMap({
  progress,
  className = "",
}: {
  progress: number;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);

  useEffect(() => {
    let disposed = false;
    let map: LeafletMap | undefined;
    void import("leaflet").then((leaflet) => {
      if (disposed || !containerRef.current) return;
      map = leaflet.map(containerRef.current, {
        zoomControl: false,
        attributionControl: true,
        scrollWheelZoom: false,
      });
      map.setView([29.75, 76.54], 7);
      leaflet
        .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 18,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        })
        .addTo(map);
      const route = leaflet
        .polyline([ludhiana, [30.2, 76.2], [29.7, 76.45], [29.1, 76.8], delhi], {
          color: "#d88a31",
          weight: 5,
          opacity: 0.92,
        })
        .addTo(map);
      leaflet
        .circleMarker(ludhiana, {
          radius: 7,
          color: "#256b4c",
          fillColor: "#fff",
          fillOpacity: 1,
          weight: 3,
        })
        .addTo(map)
        .bindTooltip("Ludhiana · Pickup");
      leaflet
        .circleMarker(delhi, {
          radius: 7,
          color: "#d88a31",
          fillColor: "#fff",
          fillOpacity: 1,
          weight: 3,
        })
        .addTo(map)
        .bindTooltip("Delhi · Delivery");
      markerRef.current = leaflet
        .marker(ludhiana, {
          icon: leaflet.divIcon({
            className: "ts-truck-marker",
            html: "<span>▰</span>",
            iconSize: [34, 34],
            iconAnchor: [17, 17],
          }),
        })
        .addTo(map);
      map.fitBounds(route.getBounds(), { padding: [36, 36] });
      mapRef.current = map;
      window.setTimeout(() => map?.invalidateSize(), 80);
    });
    return () => {
      disposed = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const ratio = Math.max(0, Math.min(1, progress / 100));
    const lat = ludhiana[0] + (delhi[0] - ludhiana[0]) * ratio;
    const lon = ludhiana[1] + (delhi[1] - ludhiana[1]) * ratio;
    markerRef.current?.setLatLng([lat, lon]);
  }, [progress]);

  return (
    <div
      ref={containerRef}
      className={`ts-live-map ${className}`}
      role="img"
      aria-label={`Truck route from Ludhiana to Delhi, ${Math.round(progress)} percent complete`}
    />
  );
}
