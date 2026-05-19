import { Building2, MapPin, Truck, CalendarDays, Phone, Mail, ShieldCheck, Printer, Hash } from 'lucide-react';
import type { LoadPostingDto, BrokerPublicInfo, CarrierPublicInfo } from '../store/services/hauliusApi';
import { formatPhone } from '../utils/phone';

type Props = {
  load: LoadPostingDto;
  brokerInfo?: BrokerPublicInfo;
  carrierInfo?: CarrierPublicInfo;
  showSensitiveInfo?: boolean;
};

function Section({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{title}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

function Field({ label, value, href, icon }: { label: string; value?: string | null; href?: string; icon?: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="space-y-0.5">
      <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{label}</p>
      {href ? (
        <a href={href} className="text-sm font-medium flex items-center gap-1.5 hover:text-amber-600 transition-colors">
          {icon}{value}
        </a>
      ) : (
        <p className="text-sm font-medium flex items-center gap-1.5">
          {icon}{value}
        </p>
      )}
    </div>
  );
}

const formatDate = (d?: string) => {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

export function DispatchSheet({ load, brokerInfo, carrierInfo, showSensitiveInfo }: Props) {
  const totalVehicles = 1 + (load.additionalVehicles?.length ?? 0);
  const brokerName = brokerInfo?.companyName || brokerInfo?.legalName;
  const carrierName = carrierInfo?.companyName || carrierInfo?.dbaName || carrierInfo?.legalName;

  const pickupAddress = showSensitiveInfo
    ? [load.pickupStreet, load.pickupCity, load.pickupState, load.pickupZip].filter(Boolean).join(', ')
    : [load.pickupCity, load.pickupState, load.pickupZip].filter(Boolean).join(', ');
  const dropAddress = showSensitiveInfo
    ? [load.dropStreet, load.dropCity, load.dropState, load.dropZip].filter(Boolean).join(', ')
    : [load.dropCity, load.dropState, load.dropZip].filter(Boolean).join(', ');

  const trailerLabel = load.trailerType === 'enclosed' ? 'Enclosed Trailer'
    : load.trailerType === 'open' ? 'Open Trailer'
    : load.trailerType ? load.trailerType.charAt(0).toUpperCase() + load.trailerType.slice(1)
    : null;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm print:shadow-none print:border-black">

      {/* Header */}
      <div className="bg-amber-500 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Truck className="size-5 text-white" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-amber-100">Dispatch Sheet</p>
            <div className="flex items-center gap-2 mt-0.5">
              <Hash className="size-4 text-white" />
              <span className="text-white font-bold text-lg leading-none">
                {load.orderId ?? load.id ?? '—'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {load.status && (
            <span className="text-xs font-semibold uppercase tracking-wide bg-white/20 text-white px-3 py-1 rounded-full">
              {load.status.replace(/-/g, ' ')}
            </span>
          )}
          <button
            onClick={() => window.print()}
            className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-white bg-white/20 hover:bg-white/30 transition-colors px-3 py-1.5 rounded-lg print:hidden"
          >
            <Printer className="size-3.5" />
            Print
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">

        {/* Parties */}
        <div>
          <Section title="Parties" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Broker */}
            <div className="bg-muted/40 border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="size-7 rounded-md bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Building2 className="size-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Broker</p>
                  <p className="text-sm font-bold leading-tight">{brokerName ?? '—'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="DOT" value={brokerInfo?.dotNumber} />
                <Field label="MC" value={brokerInfo?.mcNumber} />
                <Field
                  label="Location"
                  value={[brokerInfo?.city, brokerInfo?.state].filter(Boolean).join(', ') || null}
                  icon={<MapPin className="size-3.5 text-muted-foreground" />}
                />
                <Field
                  label="Status"
                  value={brokerInfo?.operatingStatus}
                  icon={<ShieldCheck className="size-3.5 text-muted-foreground" />}
                />
              </div>
              <div className="space-y-2 pt-1 border-t border-border">
                <Field
                  label="Phone"
                  value={brokerInfo?.phoneNumber ? formatPhone(brokerInfo.phoneNumber) : null}
                  href={brokerInfo?.phoneNumber ? `tel:${brokerInfo.phoneNumber}` : undefined}
                  icon={<Phone className="size-3.5 text-amber-500" />}
                />
                <Field
                  label="Email"
                  value={brokerInfo?.email}
                  href={brokerInfo?.email ? `mailto:${brokerInfo.email}` : undefined}
                  icon={<Mail className="size-3.5 text-amber-500" />}
                />
              </div>
            </div>

            {/* Carrier */}
            <div className="bg-muted/40 border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="size-7 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Truck className="size-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Carrier</p>
                  <p className="text-sm font-bold leading-tight">{carrierName ?? (load.assignedCarrierId ? 'Loading…' : 'Not assigned')}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="DOT" value={carrierInfo?.dotNumber} />
                <Field label="MC" value={carrierInfo?.mcNumber} />
                <Field
                  label="Location"
                  value={[carrierInfo?.phyCity, carrierInfo?.phyState].filter(Boolean).join(', ') || null}
                  icon={<MapPin className="size-3.5 text-muted-foreground" />}
                />
                <Field
                  label="Status"
                  value={carrierInfo?.operatingStatus}
                  icon={<ShieldCheck className="size-3.5 text-muted-foreground" />}
                />
              </div>
              <div className="space-y-2 pt-1 border-t border-border">
                <Field
                  label="Phone"
                  value={carrierInfo?.phoneNumber ? formatPhone(carrierInfo.phoneNumber) : null}
                  href={carrierInfo?.phoneNumber ? `tel:${carrierInfo.phoneNumber}` : undefined}
                  icon={<Phone className="size-3.5 text-amber-500" />}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Route */}
        <div>
          <Section title="Route" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Pickup */}
            <div className="bg-muted/40 border border-border rounded-lg p-4 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">Pickup</p>
              {pickupAddress ? (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pickupAddress)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="font-semibold text-sm flex items-center gap-1 hover:text-amber-600 transition-colors"
                >
                  <MapPin className="size-3.5 text-amber-500 flex-shrink-0" />
                  {pickupAddress}
                </a>
              ) : (
                <p className="font-semibold text-sm">—</p>
              )}
              {load.pickupType && (
                <p className="text-xs text-muted-foreground">Type: {load.pickupType}</p>
              )}
              {load.pickupLotNumber && showSensitiveInfo && (
                <p className="text-xs text-muted-foreground">Lot: {load.pickupLotNumber}</p>
              )}
              {load.pickupContactName && showSensitiveInfo && (
                <p className="text-xs text-muted-foreground">Contact: {load.pickupContactName}</p>
              )}
              {load.pickupContactPhone && showSensitiveInfo && (
                <a href={`tel:${load.pickupContactPhone}`} className="text-xs text-muted-foreground flex items-center gap-1 hover:text-amber-600">
                  <Phone className="size-3" />{formatPhone(load.pickupContactPhone)}
                </a>
              )}
              {load.pickupDate && (
                <div className="flex items-center gap-1.5 text-sm font-medium text-foreground pt-1">
                  <CalendarDays className="size-3.5 text-amber-500" />
                  {formatDate(load.pickupDate)}
                </div>
              )}
            </div>

            {/* Delivery */}
            <div className="bg-muted/40 border border-border rounded-lg p-4 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Delivery</p>
              {dropAddress ? (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dropAddress)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="font-semibold text-sm flex items-center gap-1 hover:text-amber-600 transition-colors"
                >
                  <MapPin className="size-3.5 text-amber-500 flex-shrink-0" />
                  {dropAddress}
                </a>
              ) : (
                <p className="font-semibold text-sm">—</p>
              )}
              {load.dropType && (
                <p className="text-xs text-muted-foreground">Type: {load.dropType}</p>
              )}
              {load.dropLotNumber && showSensitiveInfo && (
                <p className="text-xs text-muted-foreground">Lot: {load.dropLotNumber}</p>
              )}
              {load.dropContactName && showSensitiveInfo && (
                <p className="text-xs text-muted-foreground">Contact: {load.dropContactName}</p>
              )}
              {load.dropContactPhone && showSensitiveInfo && (
                <a href={`tel:${load.dropContactPhone}`} className="text-xs text-muted-foreground flex items-center gap-1 hover:text-amber-600">
                  <Phone className="size-3" />{formatPhone(load.dropContactPhone)}
                </a>
              )}
              {load.deliveryDate && (
                <div className="flex items-center gap-1.5 text-sm font-medium text-foreground pt-1">
                  <CalendarDays className="size-3.5 text-blue-500" />
                  {formatDate(load.deliveryDate)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Vehicles */}
        <div>
          <Section title={`Vehicles (${totalVehicles})`} />
          <div className="space-y-2">
            {[
              { year: load.vehicleYear, make: load.vehicleMake, model: load.vehicleModel, type: load.vehicleType, condition: load.vehicleCondition, vin: load.vin, info: null },
              ...(load.additionalVehicles ?? []).map(v => ({ year: v.vehicleYear, make: v.vehicleMake, model: v.vehicleModel, type: v.vehicleType, condition: v.vehicleCondition, vin: v.vin, info: v.vehicleAdditionalInfo })),
            ].map((v, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3 bg-muted/40 border border-border rounded-lg">
                <span className="flex-shrink-0 size-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">
                    {[v.year, v.make, v.model].filter(Boolean).join(' ') || 'Vehicle'}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    {v.type && (
                      <span className="text-xs text-muted-foreground">
                        {v.type.charAt(0).toUpperCase() + v.type.slice(1)}
                      </span>
                    )}
                    {v.condition && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        v.condition.toLowerCase() === 'running'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {v.condition.charAt(0).toUpperCase() + v.condition.slice(1)}
                      </span>
                    )}
                  </div>
                  {showSensitiveInfo && v.vin && (
                    <p className="text-xs text-muted-foreground mt-1">VIN: {v.vin}</p>
                  )}
                  {v.info && <p className="text-xs text-muted-foreground mt-1">{v.info}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial */}
        <div>
          <Section title="Financial" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {load.price != null && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-lg px-4 py-3">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Total Amount</p>
                <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                  ${load.price.toLocaleString()}
                </p>
              </div>
            )}
            {load.distance != null && load.distance > 0 && (
              <div className="bg-muted/40 border border-border rounded-lg px-4 py-3">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Distance</p>
                <p className="text-base font-bold mt-0.5">{load.distance.toLocaleString()} mi</p>
              </div>
            )}
            {load.price != null && load.distance != null && load.distance > 0 && (
              <div className="bg-muted/40 border border-border rounded-lg px-4 py-3">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Rate / Mile</p>
                <p className="text-base font-bold mt-0.5">${(load.price / load.distance).toFixed(2)}</p>
              </div>
            )}
            {trailerLabel && (
              <div className="bg-muted/40 border border-border rounded-lg px-4 py-3">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Trailer</p>
                <p className="text-base font-bold mt-0.5">{trailerLabel}</p>
              </div>
            )}
          </div>
        </div>

        {/* Payment */}
        {(load.paymentMethod || load.paymentTiming) && (
          <div>
            <Section title="Payment" />
            <div className="flex items-center gap-3 flex-wrap">
              {load.paymentMethod && (
                <span className="text-sm font-semibold bg-muted border border-border px-4 py-2 rounded-lg">
                  {load.paymentMethod}
                </span>
              )}
              {load.paymentTiming && (
                <span className="text-sm font-semibold bg-muted border border-border px-4 py-2 rounded-lg">
                  {load.paymentTiming}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Contact */}
        {showSensitiveInfo && (load.contactName || load.contactPhone || load.contactEmail) && (
          <div>
            <Section title="Load Contact" />
            <div className="flex flex-wrap gap-4 text-sm">
              {load.contactName && (
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Name</p>
                  <p className="font-medium mt-0.5">{load.contactName}</p>
                </div>
              )}
              {load.contactPhone && (
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Phone</p>
                  <a href={`tel:${load.contactPhone}`} className="font-medium flex items-center gap-1 hover:text-amber-600 transition-colors mt-0.5">
                    <Phone className="size-3.5 text-amber-500" />
                    {formatPhone(load.contactPhone)}
                  </a>
                </div>
              )}
              {load.contactEmail && (
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Email</p>
                  <a href={`mailto:${load.contactEmail}`} className="font-medium flex items-center gap-1 hover:text-amber-600 transition-colors mt-0.5">
                    <Mail className="size-3.5 text-amber-500" />
                    {load.contactEmail}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {load.description && (
          <div>
            <Section title="Additional Notes" />
            <p className="text-sm text-foreground leading-relaxed bg-muted/40 border border-border rounded-lg px-4 py-3">
              {load.description}
            </p>
          </div>
        )}

      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-border bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
        <span>HauliUS — Vehicle Transport Load Board</span>
        {load.createdAt && (
          <span>Posted {new Date(load.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        )}
      </div>
    </div>
  );
}
