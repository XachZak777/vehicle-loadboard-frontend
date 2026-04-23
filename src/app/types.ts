/**
 * Legacy mock type used only by the Welcome page demo carousel.
 * Do NOT use for real API data — use LoadPostingDto from hauliusApi instead.
 */
export interface Load {
  id: string;
  brokerId?: string;
  brokerEmail?: string;
  vehicleType: string;
  make: string;
  model: string;
  year: number;
  pickupCity: string;
  pickupState: string;
  deliveryCity: string;
  deliveryState: string;
  pickupDate: string;
  deliveryDate: string;
  price: number;
  distance: number;
  condition: 'running' | 'non-running';
  isOpen: boolean;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  notes?: string;
}

export type VehicleType = 'sedan' | 'suv' | 'truck' | 'van' | 'motorcycle' | 'rv' | 'boat' | 'atv';
export type LoadCondition = 'running' | 'non-running';
