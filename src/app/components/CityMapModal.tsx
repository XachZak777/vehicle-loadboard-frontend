import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, X, Loader2 } from 'lucide-react';
import { Button } from './ui/button';

type Props = {
  city: string;
  state: string;
  label: string;
  onClose: () => void;
};

type Coords = { lat: number; lon: number };

async function geocodeCity(city: string, state: string): Promise<Coords | null> {
  try {
    const q = encodeURIComponent(`${city}, ${state}, USA`);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&countrycodes=us`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    if (data.length > 0) return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  } catch {}
  return null;
}

function buildEmbedUrl(lat: number, lon: number): string {
  const delta = 0.12;
  const bbox = `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik`;
}

export function CityMapModal({ city, state, label, onClose }: Props) {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    geocodeCity(city, state).then(c => {
      if (c) setCoords(c);
      else setError(true);
    });
  }, [city, state]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-amber-500" />
            <span className="font-semibold text-sm">{label}</span>
          </div>
          <Button variant="ghost" size="icon" className="size-7" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>

        {/* Map */}
        <div className="relative h-80 bg-muted">
          {!coords && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="size-6 animate-spin text-amber-500" />
              <span className="text-sm">Loading map…</span>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <MapPin className="size-8 opacity-30" />
              <span className="text-sm">Could not load map for this location.</span>
            </div>
          )}
          {coords && (
            <iframe
              src={buildEmbedUrl(coords.lat, coords.lon)}
              style={{ width: '100%', height: '100%', border: 0 }}
              title={label}
              loading="lazy"
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border bg-muted/30">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <MapPin className="size-3 text-amber-500 flex-shrink-0" />
            Showing approximate city area — exact address available after booking.
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
