import { useParams, Link } from 'react-router';
import {
  useGetMyCarrierBidsQuery,
  useGetLoadQuery,
  useGetBrokerPublicInfoQuery,
} from '../store/services/hauliusApi';
import { Button } from '../components/ui/button';
import { Printer, ArrowLeft, Loader2, FileText } from 'lucide-react';
import { formatPhone, formatPaymentLabel } from '../utils/phone';

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
    <div className="ds-section mb-2">
      <p className="ds-section-title text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">{title}</p>
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
      <span className="ds-row-label w-16 flex-shrink-0 px-2 py-1 text-[10px] text-gray-500 font-medium bg-gray-50 border-r border-gray-100 leading-tight">
        {label}
      </span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`ds-row-value px-2 py-1 font-semibold text-amber-600 hover:underline underline-offset-2 leading-tight min-w-0 break-words ${mono ? 'font-mono text-[10px]' : 'text-[11px]'}`}
        >
          {value}
        </a>
      ) : (
        <span className={`ds-row-value px-2 py-1 font-semibold text-gray-900 leading-tight min-w-0 break-words ${mono ? 'font-mono text-[10px]' : 'text-[11px]'} ${highlight ? 'text-amber-700' : ''}`}>
          {value}
        </span>
      )}
    </div>
  );
}

export function DispatchSheetPage() {
  const { loadId } = useParams<{ loadId: string }>();
  const { data: bids = [], isLoading: bidsLoading } = useGetMyCarrierBidsQuery();
  const bid = bids.find(b => b.loadId === loadId);

  const { data: load, isLoading: loadLoading } = useGetLoadQuery(loadId ?? '', {
    skip: !loadId,
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
  const totalVehicles = 1 + (load.additionalVehicles?.length ?? 0);
  const toolbarLabel = totalVehicles > 1 ? `${vehicle} +${totalVehicles - 1} more` : vehicle;
  const brokerName = broker?.companyName || broker?.legalName || 'Broker';

  const agreedAmount = bid.amount != null ? Number(bid.amount) : load.price;
  const ratePerMile = agreedAmount != null && load.distance && load.distance > 0
    ? (agreedAmount / load.distance).toFixed(2)
    : null;

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
            {vehicle && <span className="text-gray-400 text-sm">— {toolbarLabel}</span>}
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
      <div id="ds-content" className="max-w-4xl mx-auto px-4 sm:px-8 py-3 sm:py-5">

        {/* Header */}
        <div className="ds-header flex flex-col sm:flex-row sm:items-start justify-between gap-1 mb-3 pb-2 border-b-4 border-amber-400">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-gray-900">DISPATCH SHEET</h1>
            {load.orderId && (
              <p className="text-xs text-gray-400 mt-0.5">Order # {load.orderId}</p>
            )}
            <p className="text-xs text-gray-400 mt-0.5">
              Issued: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div className="flex flex-col sm:items-end gap-1">
            <span className="inline-block bg-amber-500 text-white text-xs font-bold px-4 py-1 rounded tracking-wide">
              {load.status ?? 'ASSIGNED'}
            </span>
            {load.distance && (
              <p className="text-xs text-gray-400">{Math.round(load.distance).toLocaleString()} miles</p>
            )}
          </div>
        </div>

        {/* 2-column: Broker (left) | Vehicle + Payment stacked (right) */}
        <div className="ds-grid grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
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

          <div className="flex flex-col gap-2">
            <Section title={`Vehicles (${totalVehicles})`}>
              {/* Primary vehicle */}
              <div className="px-2 py-0.5 bg-gray-50 border-b border-gray-100">
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Vehicle 1</p>
              </div>
              <Row label="Vehicle" value={vehicle || '—'} />
              {load.vin && <Row label="VIN" value={load.vin} mono />}
              {load.vehicleType && <Row label="Type" value={load.vehicleType} />}
              {load.vehicleCondition && <Row label="Condition" value={load.vehicleCondition} />}
              {load.weight && <Row label="Weight" value={`${load.weight.toLocaleString()} lbs`} />}
              {/* Additional vehicles */}
              {load.additionalVehicles?.map((av, i) => (
                <div key={i}>
                  <div className="px-2 py-0.5 bg-gray-50 border-t border-b border-gray-100">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Vehicle {i + 2}</p>
                  </div>
                  <Row label="Vehicle" value={[av.vehicleYear, av.vehicleMake, av.vehicleModel].filter(Boolean).join(' ') || '—'} />
                  {av.vin && <Row label="VIN" value={av.vin} mono />}
                  {av.vehicleType && <Row label="Type" value={av.vehicleType} />}
                  {av.vehicleCondition && <Row label="Condition" value={av.vehicleCondition} />}
                  {av.weight && <Row label="Weight" value={`${av.weight.toLocaleString()} lbs`} />}
                  {av.vehicleAdditionalInfo && <Row label="Notes" value={av.vehicleAdditionalInfo} />}
                </div>
              ))}
            </Section>

            <Section title="Payment">
              <Row
                label="Amount"
                value={agreedAmount != null ? `$${agreedAmount.toLocaleString()}` : '—'}
                highlight
              />
              {load.distance && load.distance > 0 && (
                <Row label="Distance" value={`${Math.round(load.distance).toLocaleString()} mi`} />
              )}
              {ratePerMile && <Row label="Rate / Mile" value={`$${ratePerMile}`} />}
              {load.paymentMethod && <Row label="Method" value={formatPaymentLabel(load.paymentMethod)} />}
              {load.paymentTiming && <Row label="Timing" value={formatPaymentLabel(load.paymentTiming)} />}
            </Section>
          </div>
        </div>

        {/* Route — 2-col */}
        <div className="ds-grid grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
          <Section title="Pickup">
            {load.pickupStreet && (
              <Row label="Street" value={load.pickupStreet} href={mapsSearchUrl(load.pickupStreet, load.pickupCity, load.pickupState, load.pickupZip) ?? undefined} />
            )}
            {(() => {
              const cityState = [load.pickupCity, load.pickupState].filter(Boolean).join(', ');
              return <Row label="City / State" value={cityState || '—'} href={cityState ? mapsSearchUrl(load.pickupStreet, load.pickupCity, load.pickupState, load.pickupZip) ?? undefined : undefined} />;
            })()}
            {load.pickupZip && <Row label="ZIP" value={load.pickupZip} />}
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

        {/* Broker contact + Notes */}
        {(load.contactName || load.contactPhone || load.contactEmail || load.trailerType || load.description || bid.notes) && (
          <div className={`ds-grid grid grid-cols-1 gap-2 mb-2 ${(load.contactName || load.contactPhone || load.contactEmail) && (load.trailerType || load.description || bid.notes) ? 'sm:grid-cols-2' : ''}`}>
            {(load.contactName || load.contactPhone || load.contactEmail) && (
              <Section title="Broker Contact">
                {load.contactName && <Row label="Name" value={load.contactName} />}
                {load.contactPhone && <Row label="Phone" value={formatPhone(load.contactPhone)} />}
                {load.contactEmail && <Row label="Email" value={load.contactEmail} />}
              </Section>
            )}
            {(load.trailerType || load.description || bid.notes) && (
              <Section title="Notes / Special Instructions">
                {load.trailerType && <Row label="Trailer Type" value={load.trailerType} />}
                {load.description && (
                  <div className="px-2 py-1.5 text-[11px] text-gray-800 whitespace-pre-wrap border-b border-gray-100 last:border-b-0">
                    {load.description}
                  </div>
                )}
                {bid.notes && (
                  <div className="px-2 py-1.5">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Carrier Notes</p>
                    <p className="text-[11px] text-gray-800 whitespace-pre-wrap">{bid.notes}</p>
                  </div>
                )}
              </Section>
            )}
          </div>
        )}

        {/* Signatures */}
        <div className="ds-sigs mt-2 pt-2 border-t-2 border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">Carrier Signature</p>
              <div className="h-8 border border-gray-300 rounded" />
              <p className="text-[10px] text-gray-400 mt-0.5">Printed name &amp; date</p>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">Broker / Shipper Signature</p>
              <div className="h-8 border border-gray-300 rounded" />
              <p className="text-[10px] text-gray-400 mt-0.5">Printed name &amp; date</p>
            </div>
          </div>
        </div>

        <div className="mt-2 pt-1 border-t border-amber-400 flex justify-between text-[10px] text-gray-400">
          <span>LoadBoard · Dispatch Sheet</span>
          <span>Load ID: {load.id.slice(0, 8).toUpperCase()}</span>
        </div>
      </div>

      <style>{`
        @media print {
          @page {
            size: letter portrait;
            margin: 0.4cm 0.6cm;
          }

          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            margin: 0;
            padding: 0;
          }

          /* Hide everything except the sheet */
          body > *:not(#root) { display: none !important; }

          /* Sheet container: full width, no padding */
          #ds-content {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          /* Enforce 2-column grids in print */
          .ds-grid {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 4px !important;
          }

          /* Tighten section spacing */
          .ds-section {
            margin-bottom: 4px !important;
          }
          .ds-section-title {
            margin-bottom: 1px !important;
          }

          /* Tighten row padding */
          .ds-row-label,
          .ds-row-value {
            padding-top: 1px !important;
            padding-bottom: 1px !important;
          }

          /* Header */
          .ds-header {
            margin-bottom: 4px !important;
            padding-bottom: 3px !important;
          }

          /* Signatures */
          .ds-sigs {
            margin-top: 4px !important;
            padding-top: 3px !important;
          }
        }
      `}</style>
    </div>
  );
}
