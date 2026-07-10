# Interactive Map Integration - Leaflet.js

## Overview
The geospatial page now uses **Leaflet.js**, an industry-standard open-source JavaScript library for interactive maps, replacing the custom SVG projection.

## Features

### ✨ Interactive Map
- **Zoom & Pan**: Smooth mouse/touch controls
- **Responsive**: Adapts to all screen sizes
- **High Performance**: Handles 1000+ markers efficiently
- **OpenStreetMap Tiles**: Free, open-source map tiles

### 🎯 Crime Hotspot Visualization
- **Circle Markers**: Color-coded by crime type
- **Popup Details**: Click any marker to see:
  - Crime type
  - Incident ID
  - District name
  - GPS coordinates
- **Real-time Filtering**: Toggle crime types on/off
- **Auto-fitting**: Map automatically centers on visible data

### 🗺️ Geographic Features
- **Karnataka Boundaries**: Centered at [15.3173, 75.7139]
- **Major Cities**: Bengaluru, Mysuru, Mangaluru, Hubballi, Belagavi, Kalaburagi
- **District Coverage**: All 30+ districts

## Technology Stack

### Libraries
- **leaflet**: 1.9.4 - Core mapping library
- **react-leaflet**: For React integration
- **OpenStreetMap**: Free tile provider

### Components
- `crime-map.tsx`: Main map component
- `geospatial.tsx`: Page with filters and statistics

## Usage

### Basic Implementation
```tsx
import { CrimeMap } from "@/components/crime-map";

<CrimeMap 
  points={crimeData} 
  activeFilters={new Set(['Theft', 'Assault'])} 
/>
```

### Props
```typescript
interface CrimeMapProps {
  points: HotspotPoint[];      // Array of crime incidents
  activeFilters: Set<string>;  // Active crime type filters
}

interface HotspotPoint {
  id: string;          // Incident ID
  lat: number;         // Latitude
  lon: number;         // Longitude
  crime_type: string;  // Type of crime
  district: string;    // District name
}
```

## Color Mapping

Crime types are color-coded for quick visual identification:

| Crime Type      | Color   | Hex       |
|----------------|---------|-----------|
| Theft          | Orange  | #F97316   |
| Vehicle Theft  | Pink    | #FB7185   |
| Fraud          | Amber   | #FBBF24   |
| Cybercrime     | Indigo  | #818CF8   |
| Assault        | Fuchsia | #F472B6   |
| Burglary       | Purple  | #A78BFA   |
| Murder         | Red     | #DC2626   |

## Map Configuration

### Default View
```javascript
center: [15.3173, 75.7139],  // Karnataka center
zoom: 7,                      // State-level view
minZoom: 6,                   // Prevent over-zoom out
maxZoom: 18,                  // Street-level detail
```

### Tile Layer
```javascript
URL: https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
Attribution: OpenStreetMap contributors
```

## Performance Optimization

### 1. Marker Clustering (Future Enhancement)
For datasets > 5000 points, consider adding `react-leaflet-cluster`:
```bash
npm install react-leaflet-cluster
```

### 2. Lazy Loading
The map only initializes when the geospatial page is visited:
```tsx
// Loaded on-demand via TanStack Router
export const Route = createFileRoute("/geospatial")({
  component: GeoPage,
});
```

### 3. Layer Management
- Circle markers are grouped in a single layer
- Filters update the layer without re-initializing the map
- Bounds auto-fit only when filters change

## API Integration

The map consumes data from the backend API:

```typescript
// Fetch hotspot data
const { data: points } = useQuery({
  queryKey: ["hotspots", 1200],
  queryFn: () => api.hotspots(1200),
});

// Backend endpoint
GET /api/v1/geospatial/hotspots?limit=1200
```

**Response format:**
```json
[
  {
    "id": "INC-24019",
    "lat": 12.9716,
    "lon": 77.5946,
    "crime_type": "Theft",
    "district": "Bengaluru South"
  }
]
```

## Customization

### Change Map Style
Replace OpenStreetMap with other providers:

**Satellite View (Esri):**
```javascript
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri'
}).addTo(map);
```

**Dark Mode (Carto):**
```javascript
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; CARTO'
}).addTo(map);
```

### Custom Marker Styles
Edit `crime-map.tsx`:
```typescript
const marker = L.circleMarker([point.lat, point.lon], {
  radius: 8,              // Larger markers
  fillColor: color,
  color: "#000",          // Black border
  weight: 2,              // Thicker border
  opacity: 1,
  fillOpacity: 0.8,
});
```

### Add Heatmap
Install heatmap plugin:
```bash
npm install leaflet.heat @types/leaflet.heat
```

Then:
```typescript
import 'leaflet.heat';

const heatData = points.map(p => [p.lat, p.lon, 1.0]);
L.heatLayer(heatData, { radius: 25 }).addTo(map);
```

## Troubleshooting

### Map not displaying
1. **Check CSS import**: Ensure `leaflet/dist/leaflet.css` is imported in `styles.css`
2. **Set container height**: The map container needs explicit height
   ```tsx
   <div style={{ height: "600px" }}>
     <CrimeMap />
   </div>
   ```

### Markers not showing
1. **Verify data format**: Check lat/lon are numbers, not strings
2. **Check bounds**: Ensure coordinates are within Karnataka (lat: 11-18, lon: 74-79)
3. **Filter active**: Make sure crime types are in `activeFilters` set

### Performance issues
1. **Limit data**: Use `?limit=1000` query parameter
2. **Enable clustering**: Install `react-leaflet-cluster`
3. **Optimize renders**: Use `useMemo` for filtered points

## Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome  | 90+     | ✅ Full |
| Firefox | 88+     | ✅ Full |
| Safari  | 14+     | ✅ Full |
| Edge    | 90+     | ✅ Full |

## License

- **Leaflet**: BSD 2-Clause License
- **OpenStreetMap**: Open Data Commons Open Database License (ODbL)

## Resources

- [Leaflet Documentation](https://leafletjs.com/reference.html)
- [React Leaflet Guide](https://react-leaflet.js.org/)
- [OpenStreetMap](https://www.openstreetmap.org/)
- [Alternative Tile Providers](https://leaflet-extras.github.io/leaflet-providers/preview/)

## Future Enhancements

1. **Marker Clustering**: Group nearby points for better performance
2. **Heatmap Layer**: Density visualization option
3. **Drawing Tools**: Allow users to draw search areas
4. **Time Slider**: Animate incidents over time
5. **3D Buildings**: Add building layers for urban areas
6. **Offline Mode**: Cache tiles for offline use
7. **Export**: Download map as image/PDF
8. **Custom Overlays**: District boundaries, police stations

---

**Version**: 1.0.0  
**Last Updated**: 2026-07-10  
**Author**: KSP Crime Analytics Team
