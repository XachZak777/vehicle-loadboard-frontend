export interface Load {
  id: string;
  brokerId?: string;
  brokerEmail?: string;
  orderId?: string;
  vehicleType: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  vehicleAdditionalInfo?: string;
  pickupCity: string;
  pickupState: string;
  deliveryCity: string;
  deliveryState: string;
  pickupDate: string;
  deliveryDate: string;
  price: number;
  distance: number;
  condition: 'running' | 'non-running';
  trailerType?: string;
  isOpen: boolean;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  notes?: string;
  vehicles?: Array<{
    vehicleType: string;
    make: string;
    model: string;
    year: number;
    vin?: string;
    condition: 'running' | 'non-running';
    vehicleAdditionalInfo?: string;
  }>;
  additionalVehicles?: Array<{ [key: string]: unknown }>;
}

export type VehicleType = 'sedan' | 'suv' | 'truck' | 'van' | 'motorcycle' | 'rv' | 'boat' | 'atv';
export type LoadCondition = 'running' | 'non-running';
