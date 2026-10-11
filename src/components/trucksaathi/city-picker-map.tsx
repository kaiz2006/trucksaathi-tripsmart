import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";

import { northCities } from "@/data/shipper-demo";

export function CityPickerMap({ selectedCities, onSelect }: { selectedCities: string[]; onSelect: (city: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const selectRef = useRef(onSelect);
  useEffect(() => { selectRef.current = onSelect; }, [onSelect]);

  useEffect(() => {
    let disposed = false;
    let map: LeafletMap | undefined;
    void import("leaflet").then((leaflet) => {
      if (disposed || !containerRef.current) return;
      map = leaflet.map(containerRef.current, { zoomControl: false, attributionControl: true, scrollWheelZoom: false }).setView([29.65, 76.2], 6);
      leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(map);
      northCities.forEach((city) => leaflet.circleMarker([city.lat, city.lon], { radius: selectedCities.includes(city.name) ? 7 : 4, color: selectedCities.includes(city.name) ? "#d88a31" : "#256b4c", fillColor: "#fff", fillOpacity: 0.95, weight: 2 }).addTo(map!).bindTooltip(city.name));
      map.on("click", (event) => {
        const clicked = event.latlng;
        const nearest = northCities.reduce((best, city) => {
          const candidateDistance = (city.lat - clicked.lat) ** 2 + (city.lon - clicked.lng) ** 2;
          const bestDistance = (best.lat - clicked.lat) ** 2 + (best.lon - clicked.lng) ** 2;
          return candidateDistance < bestDistance ? city : best;
        }, northCities[0]);
        if (nearest) selectRef.current(nearest.name);
      });
      mapRef.current = map;
      window.setTimeout(() => map?.invalidateSize(), 80);
    });
    return () => { disposed = true; mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  return <div className="ts-city-map" ref={containerRef} role="application" aria-label="Tap a location on the map to choose the nearest city" />;
}