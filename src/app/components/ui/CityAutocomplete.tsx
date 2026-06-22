import { useEffect, useRef, useState } from 'react';
import { Input } from './input';
import { Loader2, MapPin } from 'lucide-react';

const STATE_NAME_TO_ABBR: Record<string, string> = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
  'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
  'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
  'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
  'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
  'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
  'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
  'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
  'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
  'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
  'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
  'Wisconsin': 'WI', 'Wyoming': 'WY', 'District of Columbia': 'DC',
};

type Suggestion = {
  city: string;
  state: string;
  zip?: string;
};

interface Props {
  id?: string;
  value: string;
  placeholder?: string;
  onChange: (city: string) => void;
  onSelect: (city: string, state: string, zip?: string) => void;
  'aria-invalid'?: boolean;
}

export function CityAutocomplete({
  id, value, placeholder, onChange, onSelect, 'aria-invalid': ariaInvalid,
}: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) { setSuggestions([]); setOpen(false); return; }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const url = new URL('https://nominatim.openstreetmap.org/search');
        url.searchParams.set('q', value);
        url.searchParams.set('countrycodes', 'us');
        url.searchParams.set('format', 'json');
        url.searchParams.set('addressdetails', '1');
        url.searchParams.set('limit', '10');

        const res = await fetch(url.toString(), {
          headers: { 'Accept-Language': 'en-US,en;q=0.9' },
        });
        const data: any[] = await res.json();

        const seen = new Set<string>();
        const results: Suggestion[] = [];

        for (const item of data) {
          const addr = item.address ?? {};
          const city =
            addr.city || addr.town || addr.village ||
            addr.municipality || addr.hamlet || addr.suburb;
          const stateName = addr.state;
          if (!city || !stateName) continue;
          const state = STATE_NAME_TO_ABBR[stateName];
          if (!state) continue;
          const key = `${city.toLowerCase()}|${state}`;
          if (seen.has(key)) continue;
          seen.add(key);
          // Nominatim may return "60601;60602" — take only the first 5-digit part
          const rawZip = (addr.postcode ?? '').split(/[;, ]/)[0].trim();
          const zip = /^\d{5}$/.test(rawZip) ? rawZip : undefined;
          results.push({ city, state, zip });
          if (results.length >= 5) break;
        }

        setSuggestions(results);
        setOpen(results.length > 0);
      } catch {
        setSuggestions([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 350);
  }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Input
          id={id}
          value={value}
          placeholder={placeholder ?? 'e.g., Chicago'}
          onChange={e => onChange(e.target.value.trimStart().replace(/[^a-zA-Z\s'\-.]/g, ''))}
          maxLength={100}
          aria-invalid={ariaInvalid}
          autoComplete="off"
        />
        {loading && (
          <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 animate-spin text-muted-foreground pointer-events-none" />
        )}
      </div>

      {open && (
        <ul className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-md overflow-hidden">
          {suggestions.map((s, i) => (
            <li key={i}>
              <button
                type="button"
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-muted transition-colors"
                onMouseDown={e => {
                  e.preventDefault();
                  onSelect(s.city, s.state, s.zip);
                  setOpen(false);
                  setSuggestions([]);
                }}
              >
                <MapPin className="size-3.5 text-amber-500 shrink-0" />
                <span className="font-medium">{s.city},</span>
                <span className="text-muted-foreground">{s.state}</span>
                {s.zip && (
                  <span className="ml-auto text-xs text-muted-foreground tabular-nums">{s.zip}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
