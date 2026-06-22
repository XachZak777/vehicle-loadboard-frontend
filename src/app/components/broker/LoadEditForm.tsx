import { type ReactNode } from 'react';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import type { CreateLoadPayload, LoadDto } from '../../store/services/hauliusApi';

export function initEditForm(load: LoadDto): CreateLoadPayload {
  return {
    vehicleMake: load.vehicleMake,
    vehicleModel: load.vehicleModel,
    vehicleYear: load.vehicleYear,
    vehicleType: load.vehicleType,
    vehicleCondition: load.vehicleCondition,
    vin: load.vin,
    trailerType: load.trailerType,
    pickupCity: load.pickupCity,
    pickupState: load.pickupState,
    pickupStreet: load.pickupStreet,
    pickupZip: load.pickupZip,
    pickupCountry: load.pickupCountry,
    pickupLotNumber: load.pickupLotNumber,
    pickupContactName: load.pickupContactName,
    pickupContactPhone: load.pickupContactPhone,
    pickupType: load.pickupType,
    pickupDate: load.pickupDate,
    pickupTime: load.pickupTime,
    dropCity: load.dropCity,
    dropState: load.dropState,
    dropStreet: load.dropStreet,
    dropZip: load.dropZip,
    dropCountry: load.dropCountry,
    dropLotNumber: load.dropLotNumber,
    dropContactName: load.dropContactName,
    dropContactPhone: load.dropContactPhone,
    dropType: load.dropType,
    deliveryDate: load.deliveryDate,
    deliveryTime: load.deliveryTime,
    price: load.price,
    weight: load.weight,
    orderId: load.orderId,
    description: load.description,
    paymentMethod: load.paymentMethod,
    paymentTiming: load.paymentTiming,
    paymentNotes: load.paymentNotes,
    contactName: load.contactName,
    contactPhone: load.contactPhone,
    contactEmail: load.contactEmail,
  };
}

const VEHICLE_TYPES = ['sedan', 'suv', 'truck', 'van', 'motorcycle', 'rv', 'boat', 'atv'] as const;
const VEHICLE_TYPE_LABELS: Record<string, string> = {
  sedan: 'Sedan', suv: 'SUV', truck: 'Truck', van: 'Van',
  motorcycle: 'Motorcycle', rv: 'RV', boat: 'Boat', atv: 'ATV',
};
const LOCATION_TYPES = ['BUSINESS', 'RESIDENCE', 'AUCTION', 'PORT', 'DEALER', 'OTHER'] as const;

function F({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-muted-foreground mb-0.5">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </p>
      {children}
    </div>
  );
}

interface Props {
  form: CreateLoadPayload;
  onChange: (patch: Partial<CreateLoadPayload>) => void;
}

export function LoadEditForm({ form, onChange }: Props) {
  const u = (patch: Partial<CreateLoadPayload>) => onChange(patch);

  return (
    <div className="space-y-5 text-sm">
      {/* Vehicle */}
      <section>
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Vehicle</p>
        <div className="grid grid-cols-3 gap-2 mb-2">
          <F label="Make" required>
            <Input value={form.vehicleMake} onChange={e => u({ vehicleMake: e.target.value })} className="h-8 text-sm" />
          </F>
          <F label="Model" required>
            <Input value={form.vehicleModel} onChange={e => u({ vehicleModel: e.target.value })} className="h-8 text-sm" />
          </F>
          <F label="Year" required>
            <Input
              type="number"
              value={form.vehicleYear || ''}
              onChange={e => u({ vehicleYear: Number(e.target.value) || 0 })}
              className="h-8 text-sm"
            />
          </F>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-2">
          <F label="Type">
            <Select value={form.vehicleType ?? ''} onValueChange={v => u({ vehicleType: v || undefined })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                {VEHICLE_TYPES.map(t => (
                  <SelectItem key={t} value={t}>{VEHICLE_TYPE_LABELS[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </F>
          <F label="Condition">
            <Select value={form.vehicleCondition ?? ''} onValueChange={v => u({ vehicleCondition: v || undefined })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Condition" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="non-running">Non-Running</SelectItem>
              </SelectContent>
            </Select>
          </F>
          <F label="Trailer">
            <Select value={form.trailerType ?? ''} onValueChange={v => u({ trailerType: v || undefined })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Trailer" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="enclosed">Enclosed</SelectItem>
              </SelectContent>
            </Select>
          </F>
        </div>
        <F label="VIN">
          <Input value={form.vin ?? ''} onChange={e => u({ vin: e.target.value || undefined })} className="h-8 text-sm" placeholder="Vehicle Identification Number" />
        </F>
      </section>

      {/* Pickup */}
      <section>
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Pickup</p>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <F label="City" required>
            <Input value={form.pickupCity} onChange={e => u({ pickupCity: e.target.value })} className="h-8 text-sm" />
          </F>
          <F label="State" required>
            <Input
              value={form.pickupState}
              onChange={e => u({ pickupState: e.target.value.toUpperCase() })}
              className="h-8 text-sm"
              maxLength={2}
              placeholder="CA"
            />
          </F>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <F label="Street">
            <Input value={form.pickupStreet ?? ''} onChange={e => u({ pickupStreet: e.target.value || undefined })} className="h-8 text-sm" />
          </F>
          <F label="ZIP">
            <Input value={form.pickupZip ?? ''} onChange={e => u({ pickupZip: e.target.value || undefined })} className="h-8 text-sm" />
          </F>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-2">
          <F label="Location Type">
            <Select value={form.pickupType ?? ''} onValueChange={v => u({ pickupType: v || undefined })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                {LOCATION_TYPES.map(t => (
                  <SelectItem key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </F>
          <F label="Date">
            <Input type="date" value={form.pickupDate ?? ''} onChange={e => u({ pickupDate: e.target.value || undefined })} className="h-8 text-sm" />
          </F>
          <F label="Time">
            <Input type="time" value={form.pickupTime ?? ''} onChange={e => u({ pickupTime: e.target.value || undefined })} className="h-8 text-sm" />
          </F>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <F label="Contact Name">
            <Input value={form.pickupContactName ?? ''} onChange={e => u({ pickupContactName: e.target.value || undefined })} className="h-8 text-sm" />
          </F>
          <F label="Contact Phone">
            <Input value={form.pickupContactPhone ?? ''} onChange={e => u({ pickupContactPhone: e.target.value || undefined })} className="h-8 text-sm" />
          </F>
        </div>
      </section>

      {/* Delivery */}
      <section>
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Delivery</p>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <F label="City" required>
            <Input value={form.dropCity} onChange={e => u({ dropCity: e.target.value })} className="h-8 text-sm" />
          </F>
          <F label="State" required>
            <Input
              value={form.dropState}
              onChange={e => u({ dropState: e.target.value.toUpperCase() })}
              className="h-8 text-sm"
              maxLength={2}
              placeholder="TX"
            />
          </F>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <F label="Street">
            <Input value={form.dropStreet ?? ''} onChange={e => u({ dropStreet: e.target.value || undefined })} className="h-8 text-sm" />
          </F>
          <F label="ZIP">
            <Input value={form.dropZip ?? ''} onChange={e => u({ dropZip: e.target.value || undefined })} className="h-8 text-sm" />
          </F>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-2">
          <F label="Location Type">
            <Select value={form.dropType ?? ''} onValueChange={v => u({ dropType: v || undefined })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                {LOCATION_TYPES.map(t => (
                  <SelectItem key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </F>
          <F label="Date">
            <Input type="date" value={form.deliveryDate ?? ''} onChange={e => u({ deliveryDate: e.target.value || undefined })} className="h-8 text-sm" />
          </F>
          <F label="Time">
            <Input type="time" value={form.deliveryTime ?? ''} onChange={e => u({ deliveryTime: e.target.value || undefined })} className="h-8 text-sm" />
          </F>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <F label="Contact Name">
            <Input value={form.dropContactName ?? ''} onChange={e => u({ dropContactName: e.target.value || undefined })} className="h-8 text-sm" />
          </F>
          <F label="Contact Phone">
            <Input value={form.dropContactPhone ?? ''} onChange={e => u({ dropContactPhone: e.target.value || undefined })} className="h-8 text-sm" />
          </F>
        </div>
      </section>

      {/* Pricing */}
      <section>
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Pricing & Payment</p>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <F label="Price (USD)">
            <Input
              type="number"
              value={form.price ?? ''}
              onChange={e => u({ price: e.target.value ? Number(e.target.value) : undefined })}
              className="h-8 text-sm"
              placeholder="0"
            />
          </F>
          <F label="Weight (lbs)">
            <Input
              type="number"
              value={form.weight ?? ''}
              onChange={e => u({ weight: e.target.value ? Number(e.target.value) : undefined })}
              className="h-8 text-sm"
              placeholder="0"
            />
          </F>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <F label="Payment Method">
            <Select value={form.paymentMethod ?? ''} onValueChange={v => u({ paymentMethod: v || undefined })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Method" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="ach">ACH Transfer</SelectItem>
                <SelectItem value="check">Company Check</SelectItem>
                <SelectItem value="certified-funds">Certified Funds</SelectItem>
              </SelectContent>
            </Select>
          </F>
          <F label="Payment Timing">
            <Select value={form.paymentTiming ?? ''} onValueChange={v => u({ paymentTiming: v || undefined })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Timing" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="on-pickup">On Pickup</SelectItem>
                <SelectItem value="on-delivery">On Delivery</SelectItem>
              </SelectContent>
            </Select>
          </F>
        </div>
        <F label="Payment Notes">
          <Textarea
            value={form.paymentNotes ?? ''}
            onChange={e => u({ paymentNotes: e.target.value || undefined })}
            className="text-sm min-h-[56px] resize-none"
            placeholder="Invoice requirements, fuel surcharge..."
          />
        </F>
      </section>

      {/* Other */}
      <section>
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Other</p>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <F label="Order ID">
            <Input value={form.orderId ?? ''} onChange={e => u({ orderId: e.target.value || undefined })} className="h-8 text-sm" />
          </F>
          <F label="Contact Email">
            <Input type="email" value={form.contactEmail ?? ''} onChange={e => u({ contactEmail: e.target.value || undefined })} className="h-8 text-sm" />
          </F>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <F label="Contact Name">
            <Input value={form.contactName ?? ''} onChange={e => u({ contactName: e.target.value || undefined })} className="h-8 text-sm" />
          </F>
          <F label="Contact Phone">
            <Input value={form.contactPhone ?? ''} onChange={e => u({ contactPhone: e.target.value || undefined })} className="h-8 text-sm" />
          </F>
        </div>
        <F label="Description">
          <Textarea
            value={form.description ?? ''}
            onChange={e => u({ description: e.target.value || undefined })}
            className="text-sm min-h-[56px] resize-none"
            placeholder="Additional load details..."
          />
        </F>
      </section>
    </div>
  );
}
