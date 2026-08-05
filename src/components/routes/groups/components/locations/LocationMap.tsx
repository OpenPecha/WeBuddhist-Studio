import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./leaflet-theme.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { useTheme } from "@/providers/theme-provider";

delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

export type Coordinates = { lat: number; lng: number };

const DEFAULT_CENTER: Coordinates = { lat: 20, lng: 78 };
const DEFAULT_ZOOM = 3;
const PINNED_ZOOM = 15;

const TILES = {
  light:
    "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
} as const;

const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

const MapClickHandler = ({
  onPick,
  disabled,
}: {
  onPick: (coords: Coordinates) => void;
  disabled: boolean;
}) => {
  const map = useMap();

  useEffect(() => {
    if (disabled) return;
    const handleClick = (e: L.LeafletMouseEvent) => {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    };
    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [map, onPick, disabled]);

  return null;
};

const RecenterOnPin = ({ position }: { position: Coordinates | null }) => {
  const map = useMap();
  useEffect(() => {
    if (!position) return;
    map.setView([position.lat, position.lng], Math.max(map.getZoom(), 13));
  }, [map, position]);
  return null;
};

type LocationMapProps = {
  value: Coordinates | null;
  onChange?: (coords: Coordinates) => void;
  readOnly?: boolean;
  className?: string;
};

const noop = () => undefined;

const LocationMap = ({
  value,
  onChange = noop,
  readOnly = false,
  className = "h-72",
}: LocationMapProps) => {
  const { theme } = useTheme();
  const center = value ?? DEFAULT_CENTER;
  const zoom = value ? PINNED_ZOOM : DEFAULT_ZOOM;

  const isDark = theme === "dark";

  return (
    <div
      className={`overflow-hidden rounded-md border border-input ${className}`}
    >
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        scrollWheelZoom={!readOnly}
        dragging={!readOnly}
        zoomControl={!readOnly}
        attributionControl
        className="h-full w-full"
      >
        <TileLayer
          key={isDark ? "dark" : "light"}
          attribution={ATTRIBUTION}
          url={isDark ? TILES.dark : TILES.light}
        />
        {value ? (
          <Marker
            position={[value.lat, value.lng]}
            draggable={!readOnly}
            eventHandlers={{
              dragend: (event) => {
                const { lat, lng } = event.target.getLatLng();
                onChange({ lat, lng });
              },
            }}
          />
        ) : null}
        <MapClickHandler onPick={onChange} disabled={readOnly} />
        <RecenterOnPin position={value} />
      </MapContainer>
    </div>
  );
};

export default LocationMap;
