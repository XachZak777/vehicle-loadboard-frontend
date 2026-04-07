export interface Load {
  id: string;
  brokerId?: string; // ID of the broker who posted the load
  brokerEmail?: string; // Email of the broker for notifications
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