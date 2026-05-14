import { Building2, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { useGetCarrierPublicInfoQuery } from '../../store/services/hauliusApi';
import { formatPhone } from '../../utils/phone';

interface Props {
  carrierId: string;
}

export function CarrierInfoInline({ carrierId }: Props) {
  const { data, isLoading } = useGetCarrierPublicInfoQuery(carrierId);

  if (isLoading) return <span className="text-xs text-muted-foreground italic">Loading carrier info…</span>;
  if (!data) return <span className="text-xs text-muted-foreground">Carrier info unavailable</span>;

  const name = data.companyName || data.legalName || data.dbaName;

  return (
    <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
      {name && (
        <div className="flex items-center gap-1">
          <Building2 className="w-3 h-3" />
          <span className="font-medium text-foreground">{name}</span>
        </div>
      )}
      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
        {data.dotNumber && <span>DOT: <span className="font-mono">{data.dotNumber}</span></span>}
        {data.mcNumber && <span>MC: <span className="font-mono">{data.mcNumber}</span></span>}
      </div>
      {(data.phyCity || data.phyState) && (
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          <span>{[data.phyCity, data.phyState].filter(Boolean).join(', ')}</span>
        </div>
      )}
      {data.phoneNumber && (
        <div className="flex items-center gap-1">
          <Phone className="w-3 h-3" />
          <span>{formatPhone(data.phoneNumber)}</span>
        </div>
      )}
      {data.operatingStatus && (
        <div className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" />
          <span>{data.operatingStatus}{data.safetyRating ? ` · Safety: ${data.safetyRating}` : ''}</span>
        </div>
      )}
    </div>
  );
}
