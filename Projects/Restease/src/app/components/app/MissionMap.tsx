import { useEffect, useRef } from "react";
import { useApp } from "../../context/AppContext";
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MissionMapProps {
  selectedUnitId: string | null;
  onUnitSelect: (id: string | null) => void;
  showPaths: boolean;
  showGeofence: boolean;
}

// Custom icons
const createIcon = (color: string, isPulsing: boolean, isSelected: boolean) => {
  const size = isSelected ? 22 : 14;
  const offset = size / 2;
  return L.divIcon({
    className: "custom-div-icon",
    html: `<div style="
      background-color: ${color};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: ${isSelected ? '3px' : '2px'} solid white;
      box-shadow: ${isSelected ? `0 0 16px ${color}, 0 0 0 2px ${color}88` : '0 0 4px rgba(0,0,0,0.5)'};
      ${isPulsing ? `animation: pulseMarker 1s infinite alternate;` : ''}
      transition: all 0.2s ease;
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [offset, offset],
  });
};

export function MissionMap({ selectedUnitId, onUnitSelect, showPaths, showGeofence }: MissionMapProps) {
  const { units, alerts, theme: t } = useApp();

  const statusColor = (s: string) =>
    s === "sos" ? t.accent : s === "moving" ? t.green : s === "disconnected" ? t.textMuted : t.textSecondary;

  // Center on Wayanad district roughly
  const mapCenter: [number, number] = [11.5542, 76.1511];

  return (
    <div style={{ flex: 1, backgroundColor: t.bgCard, position: "relative" }}>
      <MapContainer 
        center={mapCenter} 
        zoom={14} 
        style={{ width: "100%", height: "100%", zIndex: 0 }}
        zoomControl={false}
      >
        <TileLayer
          url={t.isLight 
            ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"}
          attribution='&copy; <a href="https://carto.com/">Carto</a>'
        />

        {showGeofence && (
          <>
            {/* Safe Zone */}
            <Circle 
              center={[11.5620, 76.1450]} 
              radius={1800}
              pathOptions={{ color: t.green, fillColor: t.green, fillOpacity: 0.08, dashArray: "5, 10" }}
            />
            {/* Danger Zone */}
            <Circle 
              center={[11.5490, 76.1600]} 
              radius={1200}
              pathOptions={{ color: t.accent, fillColor: t.accent, fillOpacity: 0.12, dashArray: "5, 10" }}
            />
          </>
        )}

        {/* Rescue Base Marker */}
        <Marker position={[11.5650, 76.1450]} icon={createIcon("#3b82f6", false, true)}>
          <Tooltip direction="top" offset={[0, -15]} opacity={1} permanent>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", fontWeight: "bold", color: "#000" }}>Rescue Base</span>
          </Tooltip>
        </Marker>

        {showPaths && units.map((unit) => {
          if (!unit.path) return null;
          const isSOS = unit.status === "sos";
          const fullPath = [...unit.path, [unit.lat, unit.lng]];
          return (
            <Polyline
              key={`path-${unit.id}`}
              positions={fullPath as [number, number][]}
              pathOptions={{ 
                color: isSOS ? t.accent : t.green, 
                weight: 3, 
                opacity: 0.6, 
                dashArray: isSOS ? "5, 8" : undefined 
              }}
            />
          );
        })}
        {/* Dispatch Routes */}
        {showPaths && alerts.map(alert => {
          if (!alert.dispatchedUnitId || alert.responded) return null;
          const targetUnit = units.find(u => u.id === alert.unitId);
          const dispatchUnit = units.find(u => u.id === alert.dispatchedUnitId);
          if (!targetUnit || !dispatchUnit) return null;

          return (
            <Polyline
              key={`dispatch-${alert.id}`}
              positions={[[dispatchUnit.lat, dispatchUnit.lng], [targetUnit.lat, targetUnit.lng]]}
              pathOptions={{ 
                color: t.accent, 
                weight: 2, 
                opacity: 0.8, 
                dashArray: "10, 10" 
              }}
            />
          );
        })}

        {units.map((unit) => {
          if (unit.lat && unit.lng) {
            const isSelected = selectedUnitId === unit.id;
            const color = statusColor(unit.status);
            const icon = createIcon(color, unit.status === "sos", isSelected);

            return (
              <Marker 
                key={unit.id} 
                position={[unit.lat, unit.lng]} 
                icon={icon}
                eventHandlers={{
                  click: () => onUnitSelect(isSelected ? null : unit.id),
                }}
              >
                {isSelected && (
                  <Popup offset={[0, -10]} closeButton={false}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#000", fontWeight: 'bold' }}>
                      {unit.id} <br/> {unit.name}
                    </div>
                  </Popup>
                )}
              </Marker>
            );
          }
          return null;
        })}
      </MapContainer>

      <style>{`
        @keyframes pulseMarker {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 79, 0, 0.7); }
          100% { transform: scale(1.5); box-shadow: 0 0 0 10px rgba(255, 79, 0, 0); }
        }
        .leaflet-container {
          background-color: ${t.bgCard};
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
          padding: 2px;
        }
        .leaflet-popup-tip-container {
          display: none;
        }
      `}</style>
    </div>
  );
}