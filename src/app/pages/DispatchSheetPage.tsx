import { useParams, Link } from 'react-router';
import {
  useGetMyCarrierBidsQuery,
  useGetLoadQuery,
  useGetBrokerPublicInfoQuery,
} from '../store/services/hauliusApi';
import { Button } from '../components/ui/button';
import { Printer, ArrowLeft, Loader2, FileText } from 'lucide-react';
import { formatPhone } from '../utils/phone';

function fmt(d?: string | null) {
  if (!d) return '—';
  return new Date(d + (d.includes('T') ? '' : 'T00:00:00')).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

function fmtTime(t?: string | null) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return ` at ${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function mapsSearchUrl(street?: string | null, city?: string | null, state?: string | null, zip?: string | null) {
  const q = [street, city, state, zip].filter(Boolean).join(', ');
  if (!q) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q + ', USA')}`;
}


function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">{title}</p>
      <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100">
        {children}
      </div>
    </div>
  );
}

function Row({ label, value, mono = false, highlight = false, href }: {
  label: string; value: string; mono?: boolean; highlight?: boolean; href?: string;
}) {
  return (
    <div className={`flex text-sm ${highlight ? 'bg-amber-50' : ''}`}>
      <span className="w-28 sm:w-44 flex-shrink-0 px-2 sm:px-4 py-2.5 text-xs text-gray-500 font-medium bg-gray-50 border-r border-gray-100">
        {label}
      </span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`px-4 py-2.5 font-semibold text-amber-600 hover:underline underline-offset-2 ${mono ? 'font-mono text-xs' : ''}`}
        >
          {value}
        </a>
      ) : (
        <span className={`px-4 py-2.5 font-semibold text-gray-900 ${mono ? 'font-mono text-xs' : ''} ${highlight ? 'text-amber-700 text-base' : ''}`}>
          {value}
        </span>
      )}
    </div>
  );
}

export function DispatchSheetPage() {
  const { bidId } = useParams<{ bidId: string }>();
  const { data: bids = [], isLoading: bidsLoading } = useGetMyCarrierBidsQuery();
  const bid = bids.find(b => b.bidId === bidId);

  const { data: load, isLoading: loadLoading } = useGetLoadQuery(bid?.loadId ?? '', {
    skip: !bid?.loadId,
  });
  const { data: broker, isLoading: brokerLoading } = useGetBrokerPublicInfoQuery(bid?.brokerId ?? '', {
    skip: !bid?.brokerId,
  });

  const isLoading = bidsLoading || loadLoading || brokerLoading;

  const handlePrint = () => window.print();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 className="size-6 animate-spin text-amber-500" />
          <span className="text-sm">Loading dispatch sheet…</span>
        </div>
      </div>
    );
  }

  if (!bid || !load) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
        <p className="text-gray-500">Dispatch sheet not found.</p>
        <Button asChild variant="outline">
          <Link to="/carrier/assigned"><ArrowLeft className="size-4 mr-1.5" />Back</Link>
        </Button>
      </div>
    );
  }

  const vehicle = [bid.vehicleYear, bid.vehicleMake, bid.vehicleModel].filter(Boolean).join(' ');
  const brokerName = broker?.companyName || broker?.legalName || 'Broker';


  return (
    <div className="min-h-screen bg-white">
      {/* Toolbar — hidden when printing */}
      <div className="print:hidden sticky top-0 z-10 bg-white border-b border-gray-200 px-3 sm:px-6 py-3 flex items-center justify-between shadow-sm gap-2">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="gap-1.5 text-gray-600">
            <Link to="/carrier/assigned">
              <ArrowLeft className="size-4" />
              Back
            </Link>
          </Button>
          <div className="flex items-center gap-2 text-gray-800">
            <FileText className="size-4 text-amber-500" />
            <span className="font-semibold text-sm">Dispatch Sheet</span>
            {vehicle && <span className="text-gray-400 text-sm">— {vehicle}</span>}
          </div>
        </div>
        <Button
          onClick={handlePrint}
          className="bg-amber-500 hover:bg-amber-600 text-white gap-2"
          size="sm"
        >
          <Printer className="size-4" />
          Print
        </Button>
      </div>

      {/* Sheet */}
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-10 print:px-0 print:py-0 print:max-w-none">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8 pb-6 border-b-4 border-amber-400">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">DISPATCH SHEET</h1>
            {load.orderId && (
              <p className="text-xs text-gray-400 mt-1">Order # {load.orderId}</p>
            )}
            <p className="text-xs text-gray-400 mt-0.5">
              Issued: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div className="flex flex-col sm:items-end gap-2">
            <span className="inline-block bg-amber-500 text-white text-sm font-bold px-4 py-1.5 rounded tracking-wide">
              {load.status ?? 'ASSIGNED'}
            </span>
            {load.distance && (
              <p className="text-sm text-gray-400">{Math.round(load.distance).toLocaleString()} miles</p>
            )}
          </div>
        </div>

        {/* Two-column top block */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-5">
          {/* Broker / Shipper */}
          <Section title="Broker / Shipper">
            <Row label="Company" value={brokerName} />
            {broker?.mcNumber && <Row label="MC Number" value={broker.mcNumber} mono />}
            {broker?.dotNumber && <Row label="DOT Number" value={broker.dotNumber} mono />}
            {broker?.phoneNumber && <Row label="Phone" value={formatPhone(broker.phoneNumber)} />}
            {broker?.email && <Row label="Email" value={broker.email} />}
            {(broker?.city || broker?.state) && (
              <Row label="Location" value={[broker.city, broker.state].filter(Boolean).join(', ')} />
            )}
            {broker?.operatingStatus && <Row label="Status" value={broker.operatingStatus} />}
          </Section>

          {/* Payment */}
          <Section title="Payment">
            <Row
              label="Agreed Amount"
              value={bid.amount != null ? `$${Number(bid.amount).toLocaleString()}` : (load.price != null ? `$${load.price.toLocaleString()}` : '—')}
              highlight
            />
            {load.paymentMethod && <Row label="Method" value={load.paymentMethod} />}
            {load.paymentTiming && <Row label="Timing" value={load.paymentTiming} />}
          </Section>
        </div>

        {/* Vehicle */}
        <Section title="Vehicle Information">
          <Row label="Vehicle" value={vehicle || '—'} />
          {load.vin && <Row label="VIN" value={load.vin} mono />}
          {load.vehicleType && <Row label="Type" value={load.vehicleType} />}
          {load.vehicleCondition && <Row label="Condition" value={load.vehicleCondition} />}
          {load.trailerType && <Row label="Trailer Type" value={load.trailerType} />}
          {load.weight && <Row label="Weight" value={`${load.weight.toLocaleString()} lbs`} />}
        </Section>

        {/* Additional vehicles */}
        {load.additionalVehicles && load.additionalVehicles.length > 0 && (
          <Section title={`Additional Vehicles (${load.additionalVehicles.length})`}>
            {load.additionalVehicles.map((av, i) => (
              <div key={i} className="px-4 py-3 border-b border-gray-100 last:border-b-0">
                <p className="text-sm font-semibold text-gray-900">
                  {[av.vehicleYear, av.vehicleMake, av.vehicleModel].filter(Boolean).join(' ')}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-0.5 text-xs text-gray-500">
                  {av.vehicleType && <span>{av.vehicleType}</span>}
                  {av.vehicleCondition && <span>{av.vehicleCondition}</span>}
                  {av.vin && <span className="font-mono">VIN: {av.vin}</span>}
                  {av.weight && <span>{av.weight.toLocaleString()} lbs</span>}
                </div>
                {av.vehicleAdditionalInfo && (
                  <p className="text-xs text-gray-400 mt-0.5 italic">{av.vehicleAdditionalInfo}</p>
                )}
              </div>
            ))}
          </Section>
        )}

        {/* Route — full width two-col */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-5">
          <Section title="Pickup">
            {load.pickupStreet && (
              <Row label="Street" value={load.pickupStreet} href={mapsSearchUrl(load.pickupStreet, load.pickupCity, load.pickupState, load.pickupZip) ?? undefined} />
            )}
            {(() => {
              const cityState = [load.pickupCity, load.pickupState].filter(Boolean).join(', ');
              return <Row label="City / State" value={cityState || '—'} href={cityState ? mapsSearchUrl(load.pickupStreet, load.pickupCity, load.pickupState, load.pickupZip) ?? undefined : undefined} />;
            })()}
            {load.pickupZip && <Row label="ZIP" value={load.pickupZip} />}
            {load.pickupCountry && <Row label="Country" value={load.pickupCountry} />}
            {load.pickupLotNumber && <Row label="Lot #" value={load.pickupLotNumber} />}
            {load.pickupType && <Row label="Type" value={load.pickupType} />}
            {load.pickupContactName && <Row label="Contact" value={load.pickupContactName} />}
            {load.pickupContactPhone && <Row label="Phone" value={formatPhone(load.pickupContactPhone)} />}
            <Row label="Sched. Date" value={fmt(load.pickupDate) + fmtTime(load.pickupTime)} />
            {bid.requestedPickupDate && (
              <Row label="Carrier Date" value={fmt(bid.requestedPickupDate) + fmtTime(bid.requestedPickupTime)} />
            )}
          </Section>

          <Section title="Drop-off">
            {load.dropStreet && (
              <Row label="Street" value={load.dropStreet} href={mapsSearchUrl(load.dropStreet, load.dropCity, load.dropState, load.dropZip) ?? undefined} />
            )}
            {(() => {
              const cityState = [load.dropCity, load.dropState].filter(Boolean).join(', ');
              return <Row label="City / State" value={cityState || '—'} href={cityState ? mapsSearchUrl(load.dropStreet, load.dropCity, load.dropState, load.dropZip) ?? undefined : undefined} />;
            })()}
            {load.dropZip && <Row label="ZIP" value={load.dropZip} />}
            {load.dropCountry && <Row label="Country" value={load.dropCountry} />}
            {load.dropLotNumber && <Row label="Lot #" value={load.dropLotNumber} />}
            {load.dropType && <Row label="Type" value={load.dropType} />}
            {load.dropContactName && <Row label="Contact" value={load.dropContactName} />}
            {load.dropContactPhone && <Row label="Phone" value={formatPhone(load.dropContactPhone)} />}
            <Row label="Sched. Date" value={fmt(load.deliveryDate) + fmtTime(load.deliveryTime)} />
            {bid.requestedDropDate && (
              <Row label="Carrier Date" value={fmt(bid.requestedDropDate) + fmtTime(bid.requestedDropTime)} />
            )}
          </Section>
        </div>

        {/* Broker contact (if separate from company info) */}
        {(load.contactName || load.contactPhone || load.contactEmail) && (
          <Section title="Broker Contact">
            {load.contactName && <Row label="Name" value={load.contactName} />}
            {load.contactPhone && <Row label="Phone" value={formatPhone(load.contactPhone)} />}
            {load.contactEmail && <Row label="Email" value={load.contactEmail} />}
          </Section>
        )}

        {/* Notes */}
        {load.description && (
          <Section title="Notes / Special Instructions">
            <div className="px-4 py-3 text-sm text-gray-800 whitespace-pre-wrap">{load.description}</div>
          </Section>
        )}

        {/* Signatures */}
        <div className="mt-8 pt-6 border-t-2 border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Carrier Signature</p>
              <div className="h-16 border border-gray-300 rounded-lg" />
              <p className="text-xs text-gray-400 mt-2">Printed name &amp; date</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Broker / Shipper Signature</p>
              <div className="h-16 border border-gray-300 rounded-lg" />
              <p className="text-xs text-gray-400 mt-2">Printed name &amp; date</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-amber-400 flex justify-between text-xs text-gray-400">
          <span>LoadBoard · Dispatch Sheet</span>
          <span>Load ID: {load.id.slice(0, 8).toUpperCase()}</span>
        </div>
      </div>

      {/* Print-only styles */}
      <style>{`
        @media print {
          @page { margin: 1.2cm 1.5cm; size: A4; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}
