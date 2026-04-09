export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
] as const;

export const VEHICLE_TYPES = [
  'Sedan', 'SUV', 'Truck', 'Van', 'Motorcycle', 'Classic Car',
  'Luxury Vehicle', 'Sports Car', 'Minivan', 'Other',
] as const;

export const VEHICLE_CONDITIONS = ['Running', 'Non-Running'] as const;

export const TAX_ID_TYPES = ['EIN', 'SSN'] as const;

export const USER_ROLES = {
  BROKER: 'broker',
  CARRIER: 'carrier',
} as const;

export const APP_NAME = 'Haulius';
export const APP_DOMAIN = 'haulius.com';
export const APP_TAGLINE = 'Vehicle Transport Network';
