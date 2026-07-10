import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CRIME_COLORS, type HotspotPoint } from "@/lib/mockData";

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface CrimeMapProps {
  points: HotspotPoint[];
  activeFilters: Set<string>;
}

export function CrimeMap({ points, activeFilters }: CrimeMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Karnataka center coordinates
    const map = L.map(containerRef.current, {
      center: [15.3173, 75.7139], // Karnataka center
      zoom: 7,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
      minZoom: 6,
    }).addTo(map);

    // Create layer group for markers
    markersRef.current = L.layerGroup().addTo(map);

    mapRef.current = map;

    // Cleanup
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers when points or filters change
  useEffect(() => {
    if (!markersRef.current || !mapRef.current) return;

    // Clear existing markers
    markersRef.current.clearLayers();

    // Filter points based on active filters
    const filteredPoints = points.filter((p) => activeFilters.has(p.crime_type));

    // Add markers for each crime incident
    filteredPoints.forEach((point) => {
      const color = CRIME_COLORS[point.crime_type] || "#94a3b8";

      // Create custom marker
      const marker = L.circleMarker([point.lat, point.lon], {
        radius: 6,
        fillColor: color,
        color: "#fff",
        weight: 1,
        opacity: 0.9,
        fillOpacity: 0.7,
      });

      // Add popup with incident details
      marker.bindPopup(
        `
        <div style="font-family: system-ui; min-width: 200px;">
          <div style="font-weight: 600; margin-bottom: 8px; color: #1e293b; font-size: 14px;">
            ${point.crime_type}
          </div>
          <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">
            <strong>ID:</strong> ${point.id}
          </div>
          <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">
            <strong>District:</strong> ${point.district}
          </div>
          <div style="font-size: 12px; color: #64748b;">
            <strong>Location:</strong> ${point.lat.toFixed(4)}, ${point.lon.toFixed(4)}
          </div>
        </div>
      `,
        {
          closeButton: true,
          className: "crime-popup",
        }
      );

      marker.addTo(markersRef.current!);
    });

    // Fit bounds if there are points
    if (filteredPoints.length > 0) {
      const bounds = L.latLngBounds(filteredPoints.map((p) => [p.lat, p.lon]));
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [points, activeFilters]);

  return (
    <>
      <style>{`
        .crime-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .crime-popup .leaflet-popup-content {
          margin: 12px 16px;
        }
        .crime-popup .leaflet-popup-tip {
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      `}</style>
      <div
        ref={containerRef}
        className="h-full w-full rounded-xl border border-white/70"
        style={{ minHeight: "500px" }}
      />
    </>
  );
}
