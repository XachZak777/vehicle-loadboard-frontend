export type UserRole = 'carrier' | 'broker' | 'admin' | 'dealer';

export type LoadStatus = 'available' | 'requested' | 'booked' | 'picked-up' | 'in-transit' | 'delivered' | 'paid';

export interface UserProfile {
  id: string;
  role: UserRole;
  email: string;
  /** Whether an admin has approved this account. False until admin acts. */
  adminApproved?: boolean;
  phoneNumber?: string;
  phoneVerified?: boolean;
  companyName?: string;
  mcNumber?: string;
  dotNumber?: string;

  // Insurance Information
  insuranceCompany?: string;
  cargoInsurance?: number;
  liabilityInsurance?: number;

  // W9 Information
  w9Document?: string;
  taxId?: string;
  taxIdType?: 'SSN' | 'EIN';

  // FMCSA Verification
  fmcsaVerified?: boolean;
  verificationDate?: string;

  // Additional Info
  mailingAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;

  createdAt: string;
}

export interface LoadBooking {
  id: string;
  loadId: string;
  carrierId: string;
  carrierName: string;
  carrierEmail: string;
  carrierPhone: string;
  status: LoadStatus;
  requestedAt: string;
  bookedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  paidAt?: string;
  notes?: string;
}
