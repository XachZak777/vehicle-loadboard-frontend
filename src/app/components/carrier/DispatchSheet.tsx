import { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { useGetLoadQuery, useGetBrokerPublicInfoQuery } from '../../store/services/hauliusApi';
import type { CarrierBidWithLoadDto } from '../../store/services/hauliusApi';
import { Printer, FileText, Loader2 } from 'lucide-react';
import { formatPhone } from '../../utils/phone';

interface Props {
  bid: CarrierBidWithLoadDto;
  open: boolean;
  onClose: () => void;
}

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

export function DispatchSheet({ bid, open, onClose }: Props) {
  const { data: load, isLoading: loadLoading } = useGetLoadQuery(bid.loadId, { skip: !open });
  const { data: broker, isLoading: brokerLoading } = useGetBrokerPublicInfoQuery(bid.brokerId!, {
    skip: !open || !bid.brokerId,
  });
  const printRef = useRef<HTMLDivElement>(null);
  const isLoading = loadLoading || brokerLoading;

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const printWindow = window.open('', '_blank', 'width=800,height=1000');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Dispatch Sheet</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; color: #111; background: #fff; padding: 32px; }
            .sheet { max-width: 740px; margin: 0 auto; }
            .header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 28px; padding-bottom: 18px; border-bottom: 3px solid #f59e0b; }
            .header-left h1 { font-size: 24px; font-weight: 800; color: #111; letter-spacing: -0.5px; }
            .header-left p { color: #6b7280; font-size: 12px; margin-top: 4px; }
            .badge { display: inline-block; background: #f59e0b; color: #fff; padding: 5px 16px; border-radius: 4px; font-size: 12px; font-weight: 700; letter-spacing: .5px; text-transform: uppercase; }
            .section { margin-bottom: 20px; }
            .section-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: #9ca3af; margin-bottom: 10px; }
            .section-body { border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden; }
            .row { display: flex; border-bottom: 1px solid #f3f4f6; }
            .row:last-child { border-bottom: none; }
            .cell { padding: 8px 14px; flex: 1; }
            .cell.label { color: #6b7280; font-size: 12px; font-weight: 500; width: 160px; flex: none; background: #fafafa; border-right: 1px solid #f3f4f6; }
            .cell.value { font-weight: 600; color: #111; }
            .cell.mono { font-family: monospace; font-size: 12px; }
            .cell.highlight { color: #b45309; font-weight: 700; background: #fffbeb; }
            .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .sub-vehicle { border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px 14px; margin-bottom: 10px; }
            .sub-vehicle:last-child { margin-bottom: 0; }
            .sub-vehicle-title { font-size: 12px; font-weight: 600; color: #111; margin-bottom: 4px; }
            .sub-vehicle-detail { font-size: 11px; color: #6b7280; }
            hr { border: none; border-top: 1px solid #e5e7eb; margin: 22px 0; }
            .sig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px; }
            .sig-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; margin-bottom: 8px; }
            .sig-box { border: 1px solid #d1d5db; border-radius: 4px; height: 52px; }
            .sig-sub { font-size: 11px; color: #9ca3af; margin-top: 6px; }
            .footer { margin-top: 32px; padding-top: 14px; border-top: 2px solid #f59e0b; display: flex; justify-content: space-between; font-size: 11px; color: #9ca3af; }
          </style>
        </head>
        <body>
          ${content.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 400);
  };

  const vehicle = [bid.vehicleYear, bid.vehicleMake, bid.vehicleModel].filter(Boolean).join(' ');
  const brokerName = broker?.companyName || broker?.legalName || 'Broker';

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5 text-amber-500" />
              Dispatch Sheet
            </DialogTitle>
            <Button
              onClick={handlePrint}
              disabled={isLoading}
              className="bg-amber-500 hover:bg-amber-600 text-white gap-2 mr-6"
              size="sm"
            >
              <Printer className="w-4 h-4" />
              Print
            </Button>
          </div>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-16 gap-3 flex-1">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
            <span className="text-muted-foreground text-sm">Loading dispatch details…</span>
          </div>
        )}

        {!isLoading && load && (
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div ref={printRef} className="sheet">
              {/* Header */}
              <div className="header flex items-start justify-between mb-6 pb-5 border-b-2 border-amber-400">
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight">DISPATCH SHEET</h1>
                  {load.orderId && (
                    <p className="text-xs text-muted-foreground mt-0.5">Order # {load.orderId}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Issued: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-right flex flex-col items-end gap-1.5">
                  <span className="inline-block bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded tracking-wide">
                    {load.status ?? 'ASSIGNED'}
                  </span>
                  {load.distance && (
                    <p className="text-xs text-muted-foreground">{Math.round(load.distance).toLocaleString()} miles</p>
                  )}
                </div>
              </div>

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

              {/* Primary Vehicle */}
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
                    <div key={i} className="px-3 py-2.5 border-b border-border last:border-b-0">
                      <p className="text-sm font-semibold text-foreground">
                        {[av.vehicleYear, av.vehicleMake, av.vehicleModel].filter(Boolean).join(' ')}
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-0.5 text-xs text-muted-foreground">
                        {av.vehicleType && <span>{av.vehicleType}</span>}
                        {av.vehicleCondition && <span>{av.vehicleCondition}</span>}
                        {av.vin && <span className="font-mono">VIN: {av.vin}</span>}
                        {av.weight && <span>{av.weight.toLocaleString()} lbs</span>}
                      </div>
                      {av.vehicleAdditionalInfo && (
                        <p className="text-xs text-muted-foreground mt-0.5 italic">{av.vehicleAdditionalInfo}</p>
                      )}
                    </div>
                  ))}
                </Section>
              )}

              {/* Route */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Section title="Pickup">
                  {load.pickupStreet && <Row label="Street" value={load.pickupStreet} />}
                  <Row label="City / State" value={[load.pickupCity, load.pickupState].filter(Boolean).join(', ') || '—'} />
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
                  {load.dropStreet && <Row label="Street" value={load.dropStreet} />}
                  <Row label="City / State" value={[load.dropCity, load.dropState].filter(Boolean).join(', ') || '—'} />
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

              {/* Contact */}
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
                  <div className="px-3 py-2.5 text-sm text-foreground">{load.description}</div>
                </Section>
              )}

              <Separator className="my-5" />

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Carrier Signature</p>
                  <div className="h-14 border border-border rounded" />
                  <p className="text-xs text-muted-foreground mt-1.5">Printed name &amp; date</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Broker / Shipper Signature</p>
                  <div className="h-14 border border-border rounded" />
                  <p className="text-xs text-muted-foreground mt-1.5">Printed name &amp; date</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex justify-between text-xs text-muted-foreground">
                <span>LoadBoard · Dispatch Sheet</span>
                <span>Load ID: {load.id.slice(0, 8).toUpperCase()}</span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">{title}</p>
      <div className="border border-border rounded overflow-hidden divide-y divide-border">
        {children}
      </div>
    </div>
  );
}

function Row({ label, value, mono = false, highlight = false }: {
  label: string; value: string; mono?: boolean; highlight?: boolean;
}) {
  return (
    <div className={`flex text-sm ${highlight ? 'bg-amber-50/60 dark:bg-amber-950/20' : ''}`}>
      <span className="w-36 flex-shrink-0 px-3 py-2 text-xs text-muted-foreground font-medium bg-muted/40 border-r border-border">
        {label}
      </span>
      <span className={`px-3 py-2 font-semibold text-foreground ${mono ? 'font-mono text-xs' : ''} ${highlight ? 'text-amber-700 dark:text-amber-400' : ''}`}>
        {value}
      </span>
    </div>
  );
}
