'use client';

import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Arreglo del icono por defecto de Leaflet con Next.js/webpack
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const DEFAULT_CENTER: [number, number] = [19.4326, -99.1332]; // CDMX

/** Mueve el mapa al centro solo tras una búsqueda (no al arrastrar el pin). */
function MapCenterController({ center }: { center: [number, number] | null }) {
  const map = useMap();
  const lastFlown = useRef<[number, number] | null>(null);
  useEffect(() => {
    if (!center) return;
    if (
      lastFlown.current === null ||
      lastFlown.current[0] !== center[0] ||
      lastFlown.current[1] !== center[1]
    ) {
      map.flyTo(center, 15, { duration: 0.5 });
      lastFlown.current = center;
    }
  }, [center, map]);
  return null;
}

/** Botones de zoom en el mapa (scroll deshabilitado). */
function ZoomButtons() {
  const map = useMap();
  return (
    <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-1 shadow-lg rounded-lg overflow-hidden border border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => map.zoomIn()}
        className="p-2.5 bg-white hover:bg-gray-100 text-gray-700 transition-colors"
        title="Acercar"
        aria-label="Acercar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => map.zoomOut()}
        className="p-2.5 bg-white hover:bg-gray-100 text-gray-700 transition-colors border-t border-gray-100"
        title="Alejar"
        aria-label="Alejar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  );
}

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

async function searchAddress(query: string): Promise<{ lat: string; lon: string; display_name: string }[]> {
  if (!query.trim()) return [];
  const params = new URLSearchParams({
    q: query.trim(),
    format: 'json',
    limit: '5',
    addressdetails: '0',
  });
  const res = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: {
      'Accept-Language': 'es',
      'User-Agent': 'IE3-CRM (mapa ubicacion)',
    },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data;
}

export interface LocationMapProps {
  className?: string;
  projectId?: string;
  initialLocation?: { address?: string | null; lat?: number; lng?: number };
  onSaved?: () => void;
  /** Solo consulta: sin buscador ni arrastrar/guardar */
  readOnly?: boolean;
}

export default function LocationMap({ className = '', projectId, initialLocation, onSaved, readOnly = false }: LocationMapProps) {
  const initialPos: [number, number] =
    initialLocation?.lat != null && initialLocation?.lng != null
      ? [initialLocation.lat, initialLocation.lng]
      : DEFAULT_CENTER;

  const [position, setPosition] = useState<[number, number]>(initialPos);
  const [flyToCenter, setFlyToCenter] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [address, setAddress] = useState<string | null>(initialLocation?.address ?? null);
  const [saving, setSaving] = useState(false);
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    if (initialLocation?.lat != null && initialLocation?.lng != null) {
      setPosition([initialLocation.lat, initialLocation.lng]);
      if (initialLocation.address != null) setAddress(initialLocation.address);
    }
  }, [initialLocation?.lat, initialLocation?.lng, initialLocation?.address]);

  const saveLocation = useCallback(
    async (lat: number, lng: number, addressValue: string | null) => {
      if (!projectId || !onSaved) return;
      setSaving(true);
      try {
        const res = await fetch(`/api/projects/${projectId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            locationLat: lat,
            locationLng: lng,
            locationAddress: addressValue ?? '',
          }),
        });
        if (res.ok) onSaved();
      } catch (e) {
        console.error('Error guardando ubicación:', e);
      } finally {
        setSaving(false);
      }
    },
    [projectId, onSaved]
  );

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const results = await searchAddress(searchQuery);
      if (results.length > 0) {
        const first = results[0];
        const lat = parseFloat(first.lat);
        const lon = parseFloat(first.lon);
        const newPos: [number, number] = [lat, lon];
        setPosition(newPos);
        setAddress(first.display_name);
        setFlyToCenter(newPos);
        await saveLocation(lat, lon, first.display_name);
      }
    } catch (e) {
      console.error('Geocoding error:', e);
    } finally {
      setSearching(false);
    }
  }, [searchQuery, saveLocation]);

  const eventHandlers = useMemo(
    () =>
      readOnly
        ? {}
        : {
            dragend() {
              const marker = markerRef.current;
              if (marker) {
                const latlng = marker.getLatLng();
                setPosition([latlng.lat, latlng.lng]);
                setAddress(null);
                saveLocation(latlng.lat, latlng.lng, null);
              }
            },
          },
    [saveLocation, readOnly]
  );

  return (
    <div className={`overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-100 ${className}`}>
      {!readOnly && (
        <div className="border-b border-gray-200 bg-white p-3 space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Buscar dirección (ej. Av. Reforma, CDMX)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
              className="flex-1 rounded-lg border-2 border-gray-300 px-3 py-2 text-sm focus:border-black focus:ring-2 focus:ring-black focus:ring-offset-0"
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={searching}
              className="px-4 py-2 bg-black text-white rounded-lg font-semibold text-sm hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {searching ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
          {address && (
            <p className="text-xs text-gray-600">
              <span className="font-semibold">Dirección:</span> {address}
            </p>
          )}
          <p className="text-xs text-gray-500">
            Coordenadas: {position[0].toFixed(5)}, {position[1].toFixed(5)} — Arrastra el pin para ajustar.
            {projectId && onSaved && (
              <span className="block mt-1 text-green-600 font-medium">
                {saving ? 'Guardando...' : 'Se guarda en Información del proyecto.'}
              </span>
            )}
          </p>
        </div>
      )}
      {readOnly && (address || (initialLocation?.lat != null && initialLocation?.lng != null)) && (
        <div className="border-b border-gray-200 bg-white px-3 py-2 space-y-2">
          {address && (
            <p className="text-xs text-gray-600">
              <span className="font-semibold">Dirección:</span> {address}
            </p>
          )}
          <p className="text-xs text-gray-500">
            Coordenadas: {position[0].toFixed(5)}, {position[1].toFixed(5)}
          </p>
          {initialLocation?.lat != null && initialLocation?.lng != null && (
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${position[0]},${position[1]}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
              Cómo llegar
            </a>
          )}
        </div>
      )}

      <div className="h-[400px] w-full relative">
        <MapContainer
          center={position}
          zoom={13}
          scrollWheelZoom={false}
          className="h-full w-full rounded-b-lg"
          style={{ minHeight: 400 }}
        >
          <MapCenterController center={flyToCenter} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ZoomButtons />
          <Marker
            ref={markerRef}
            position={position}
            draggable={!readOnly}
            eventHandlers={eventHandlers}
          >
            <Popup>
              {readOnly ? 'Ubicación del proyecto.' : 'Ubicación seleccionada. Arrastra el pin para mover.'}
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      <div className="text-xs text-gray-500 px-3 py-2 border-t border-gray-200 bg-white">
        Mapa: ©{' '}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noopener noreferrer"
          className="text-black hover:underline"
        >
          OpenStreetMap
        </a>{' '}
        contribuidores. Búsqueda por Nominatim.
      </div>
    </div>
  );
}
