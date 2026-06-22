export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 10);
  if (digits.length === 0) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/** Price / (distance × vehicleCount) — returns null when inputs are missing or zero. */
export function calcPricePerMile(
  price: number | null | undefined,
  distance: number | null | undefined,
  additionalVehicles?: { vehicleType?: string }[] | null,
): number | null {
  if (price == null || distance == null || distance <= 0) return null;
  const vehicleCount = 1 + (additionalVehicles?.length ?? 0);
  return price / (distance * vehicleCount);
}

const PAYMENT_LABELS: Record<string, string> = {
  cash: 'Cash',
  ach: 'ACH Transfer',
  check: 'Company Check',
  'certified-funds': 'Certified Funds',
  'on-pickup': 'On Pickup',
  'on-delivery': 'On Delivery',
};

export function formatPaymentLabel(value: string): string {
  return PAYMENT_LABELS[value] ?? value.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
