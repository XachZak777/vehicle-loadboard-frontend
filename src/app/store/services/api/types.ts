export type PreferredLine = { fromState: string; toState: string };

export type AuthRole = 'BROKER' | 'CARRIER' | 'DEALER';

export type AuthResponse = {
  token: string;
  userId: string;
  email: string;
  role: string;
  adminApproved: boolean;
  companyName?: string;
};

export type LoginPendingResponse = {
  email: string;
  token?: string;
  userId?: string;
  role?: string;
  adminApproved?: boolean;
};

export type MeResponse = {
  userId: string;
  email: string;
  role: string;
  adminApproved: boolean;
  emailVerified: boolean;
  profileComplete: boolean;
};

export type ProfileUpdatePayload = {
  companyName?: string;
  dbaName?: string;
  dotNumber?: string;
  mcNumber?: string;
  phoneNumber?: string;
  insuranceCompany?: string;
  cargoInsurance?: number;
  liabilityInsurance?: number;
  taxIdType?: 'EIN' | 'SSN';
  taxId?: string;
  mailingAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  // Broker-only bond fields
  bondCompany?: string;
  bondPolicyNumber?: string;
  bondCoverage?: string;
  bondEffectiveDate?: string;
  bondAgentFirstName?: string;
  bondAgentLastName?: string;
  bondAgentEmail?: string;
  bondAgentPhone?: string;
  // Carrier-only preferred lines (JSON-encoded)
  preferredLines?: string;
};

export type DocumentUploadResponse = {
  fileId: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
};

export type RegisterDealerPayload = {
  email: string;
  password: string;
  companyName: string;
  ownerFirstName: string;
  ownerLastName: string;
  businessPhone: string;
  companyAddress: string;
  city: string;
  state: string;
  zipCode: string;
  yearEstablished?: string;
  dealerLicenseNumber?: string;
  auctionAccessNumber?: string;
  howDidYouHear?: string;
};

export type RegisterCarrierFullPayload = {
  email: string;
  password: string;
  companyName: string;
  dbaName?: string;
  dotNumber: string;
  mcNumber?: string;
  phoneNumber: string;
  insuranceCompany: string;
  cargoInsurance: number;
  liabilityInsurance: number;
  taxIdType: string;
  taxId: string;
  mailingAddress: string;
  city: string;
  state: string;
  zipCode: string;
  preferredLines?: string;
};

export type RegisterBrokerFullPayload = {
  email: string;
  password: string;
  companyName: string;
  dotNumber: string;
  mcNumber: string;
  phoneNumber: string;
  taxIdType: string;
  taxId: string;
  mailingAddress: string;
  city: string;
  state: string;
  zipCode: string;
  bondCompany?: string;
  bondPolicyNumber?: string;
  bondCoverage?: string;
  bondEffectiveDate?: string;
  bondAgentFirstName?: string;
  bondAgentLastName?: string;
  bondAgentEmail?: string;
  bondAgentPhone?: string;
};

export type AdditionalVehicle = {
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  vehicleType?: string;
  vehicleCondition?: string;
  vin?: string;
  vehicleAdditionalInfo?: string;
  weight?: number;
};

export type CreateLoadPayload = {
  pickupCity: string;
  pickupState: string;
  pickupStreet?: string;
  pickupZip?: string;
  pickupCountry?: string;
  pickupLotNumber?: string;
  pickupContactName?: string;
  pickupContactPhone?: string;
  dropCity: string;
  dropState: string;
  dropStreet?: string;
  dropZip?: string;
  dropCountry?: string;
  dropLotNumber?: string;
  dropContactName?: string;
  dropContactPhone?: string;
  pickupType?: string;
  dropType?: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  vehicleType?: string;
  vehicleCondition?: string;
  vin?: string;
  trailerType?: string;
  vehicleAdditionalInfo?: string;
  description?: string;
  paymentNotes?: string;
  weight?: number;
  price?: number;
  pickupDate?: string;
  pickupTime?: string;
  deliveryDate?: string;
  deliveryTime?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  orderId?: string;
  paymentMethod?: string;
  paymentTiming?: string;
  additionalVehicles?: AdditionalVehicle[];
};

export type LoadDto = {
  id: string;
  brokerId?: string;
  pickupCity: string;
  pickupState: string;
  pickupStreet?: string;
  pickupZip?: string;
  pickupCountry?: string;
  pickupLotNumber?: string;
  pickupContactName?: string;
  pickupContactPhone?: string;
  dropCity: string;
  dropState: string;
  dropStreet?: string;
  dropZip?: string;
  dropCountry?: string;
  dropLotNumber?: string;
  dropContactName?: string;
  dropContactPhone?: string;
  pickupType?: string;
  dropType?: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  vehicleType?: string;
  vehicleCondition?: string;
  vin?: string;
  trailerType?: string;
  description?: string;
  paymentNotes?: string;
  weight?: number;
  price?: number;
  distance?: number;
  pickupDate?: string;
  pickupTime?: string;
  deliveryDate?: string;
  deliveryTime?: string;
  createdAt?: string;
  carrierId?: string;
  assignedCarrierId?: string;
  status?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  orderId?: string;
  paymentMethod?: string;
  paymentTiming?: string;
  additionalVehicles?: AdditionalVehicle[];
};

export type VinDecodeResult = {
  vin: string;
  success: boolean;
  errorText?: string;

  // Identity
  make?: string;
  model?: string;
  year?: number;
  manufacturer?: string;

  // Classification
  vehicleType?: string;
  bodyClass?: string;
  trim?: string;

  // Engine
  engineHp?: string;
  cylinders?: string;
  displacementL?: string;
  engineConfiguration?: string;
  engineModel?: string;
  turbo?: string;

  // Drivetrain & Transmission
  driveType?: string;
  transmissionStyle?: string;
  transmissionSpeeds?: string;

  // Fuel
  fuelType?: string;

  // Dimensions & Weight
  doors?: number;
  seats?: number;
  wheelbase?: string;
  wheels?: number;
  gvwr?: string;

  // Origin
  plantCountry?: string;
  plantState?: string;
  plantCity?: string;

  // Market
  basePrice?: string;
  steeringLocation?: string;
};

export type BidPayload = {
  loadId: string;
  amount: number;
  bookNow: boolean;
  requestedPickupDate?: string;
  requestedPickupTime?: string;
  requestedDropDate?: string;
  requestedDropTime?: string;
  notes?: string;
};

export type UpdateBidPayload = {
  bidId: string;
  amount: number;
  requestedPickupDate?: string;
  requestedPickupTime?: string;
  requestedDropDate?: string;
  requestedDropTime?: string;
  notes?: string;
};

export type BidDto = {
  id: string;
  loadId: string;
  carrierId: string;
  amount: number;
  bookNow: boolean;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  requestedPickupDate?: string;
  requestedPickupTime?: string;
  requestedDropDate?: string;
  requestedDropTime?: string;
  notes?: string;
};

export type CarrierBidWithLoadDto = {
  bidId: string | null;
  loadId: string;
  amount: number;
  bookNow: boolean;
  bidStatus: string;
  bidCreatedAt?: string;
  bidUpdatedAt?: string;
  requestedPickupDate?: string;
  requestedPickupTime?: string;
  requestedDropDate?: string;
  requestedDropTime?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  pickupCity?: string;
  pickupState?: string;
  pickupZip?: string;
  dropCity?: string;
  dropState?: string;
  dropZip?: string;
  price?: number;
  loadCreatedAt?: string;
  pickupDate?: string;
  deliveryDate?: string;
  loadStatus?: string;
  brokerId?: string;
  orderId?: string;
  notes?: string;
  additionalVehicles?: AdditionalVehicle[];
};

export type BrokerProfile = {
  id?: string;
  // FMCSA / registration identity
  companyName?: string;
  mcNumber?: string;
  dotNumber?: string;
  legalName?: string;
  operatingStatus?: string;
  brokerAuthorityActive?: boolean;
  // Profile-completion fields
  phoneNumber?: string;
  email?: string;
  mailingAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  taxIdType?: string;
  taxId?: string;
  // Bond fields
  bondCompany?: string;
  bondPolicyNumber?: string;
  bondCoverage?: string;
  bondEffectiveDate?: string;
  bondAgentFirstName?: string;
  bondAgentLastName?: string;
  bondAgentEmail?: string;
  bondAgentPhone?: string;
};

export type DealerProfile = {
  companyName?: string;
  ownerFirstName?: string;
  ownerLastName?: string;
  businessPhone?: string;
  companyAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  yearEstablished?: string;
  dealerLicenseNumber?: string;
  auctionAccessNumber?: string;
};

export type CarrierProfile = {
  id?: string;
  // FMCSA / registration identity
  companyName?: string;
  mcNumber?: string;
  dotNumber?: string;
  legalName?: string;
  dbaName?: string;
  operatingStatus?: string;
  safetyRating?: string;
  verified?: boolean;
  phyCity?: string;
  phyState?: string;
  totalDrivers?: number;
  totalPowerUnits?: number;
  // Profile-completion fields
  phoneNumber?: string;
  email?: string;
  mailingAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  insuranceCompany?: string;
  cargoInsurance?: number;
  liabilityInsurance?: number;
  taxIdType?: string;
  taxId?: string;
  preferredLines?: string;
};

export type CarrierPublicInfo = {
  id?: string;
  dotNumber?: string;
  mcNumber?: string;
  legalName?: string;
  dbaName?: string;
  companyName?: string;
  operatingStatus?: string;
  safetyRating?: string;
  phyStreet?: string;
  phyCity?: string;
  phyState?: string;
  phyZip?: string;
  totalPowerUnits?: number;
  phoneNumber?: string;
  ratingScore?: number | null;
};

export type BrokerPublicInfo = {
  id?: string;
  mcNumber?: string;
  dotNumber?: string;
  legalName?: string;
  companyName?: string;
  operatingStatus?: string;
  mailingAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phoneNumber?: string;
  email?: string;
  ratingScore?: number | null;
  // Bond — company and agent contact only (policy/coverage/dates are private)
  bondCompany?: string;
  bondAgentFirstName?: string;
  bondAgentLastName?: string;
  bondAgentPhone?: string;
};

export type SubmitRatingPayload = {
  targetId: string;
  targetType: 'broker' | 'carrier';
  loadId: string;
  type: 'positive' | 'negative';
  tags?: string[];
  comment?: string;
};

export type RatingDto = {
  id: string;
  type: 'positive' | 'negative';
  fromName?: string;
  fromRole?: string;
  loadTitle?: string;
  tags?: string[];
  comment?: string;
  createdAt?: string;
  loadId?: string;
};

export type RatingTagStat = {
  tag: string;
  count: number;
  total: number;
};

export type MyRatingsResponse = {
  positiveCount: number;
  negativeCount: number;
  tagStats?: RatingTagStat[];
  ratings: RatingDto[];
};

export type AdminDocumentDto = {
  documentId: string;
  documentType: string;
  originalName: string;
  fileUrl: string;
  uploadedAt: string;
};

export type AdminCarrierProfilePayload = {
  companyName?: string;
  dbaName?: string;
  dotNumber?: string;
  mcNumber?: string;
  phoneNumber?: string;
  insuranceCompany?: string;
  cargoInsurance?: number;
  liabilityInsurance?: number;
  taxIdType?: string;
  taxId?: string;
  mailingAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  preferredLines?: string;
};

export type AdminBrokerProfilePayload = {
  companyName?: string;
  dotNumber?: string;
  mcNumber?: string;
  phoneNumber?: string;
  taxIdType?: string;
  taxId?: string;
  mailingAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  bondCompany?: string;
  bondPolicyNumber?: string;
  bondCoverage?: string;
  bondEffectiveDate?: string;
  bondAgentFirstName?: string;
  bondAgentLastName?: string;
  bondAgentEmail?: string;
  bondAgentPhone?: string;
};

export type AdminDealerProfilePayload = {
  companyName?: string;
  ownerFirstName?: string;
  ownerLastName?: string;
  businessPhone?: string;
  companyAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  yearEstablished?: string;
  dealerLicenseNumber?: string;
  auctionAccessNumber?: string;
  howDidYouHear?: string;
};

export type AdminUserDto = {
  userId: string;
  email: string;
  role: string;
  adminApproved: boolean;
  adminApprovedAt?: string;
  emailVerified: boolean;
  /** True when admin actively declined this registration (distinct from "never reviewed"). */
  declined: boolean;
  declinedAt?: string;
  verificationDate?: string;
  createdAt?: string;
  profileId?: string;
  companyName?: string;
  dbaName?: string;
  dotNumber?: string;
  mcNumber?: string;
  phoneNumber?: string;
  mailingAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  insuranceCompany?: string;
  cargoInsurance?: number;
  liabilityInsurance?: number;
  taxIdType?: string;
  taxId?: string;
  carrierOperation?: string;
  preferredLines?: string;
  // Broker-only bond fields
  bondCompany?: string;
  bondPolicyNumber?: string;
  bondCoverage?: string;
  bondEffectiveDate?: string;
  bondAgentFirstName?: string;
  bondAgentLastName?: string;
  bondAgentEmail?: string;
  bondAgentPhone?: string;
  // Dealer-only fields
  ownerFirstName?: string;
  ownerLastName?: string;
  yearEstablished?: string;
  dealerLicenseNumber?: string;
  auctionAccessNumber?: string;
  howDidYouHear?: string;
  documents: AdminDocumentDto[];
};

export type AiChatRequest = {
  message: string;
  conversationId?: string;
  metadata?: {
    timestamp?: string;
    userRole?: string;
    equipmentType?: string;
  };
};

export type AiUsageResponse = {
  messagesUsed: number;
  messagesLimit: number;
  limitReached: boolean;
  resetAt: string;
};

export type NotificationCountResponse = {
  pendingBids: number;
  loadsNeedingAction: number;
  newAssignments: number;
  total: number;
};

export type AiChatResponse = {
  success: boolean;
  conversationId?: string;
  response?: {
    messageId: string;
    content: string;
    timestamp: string;
    relatedLoadIds: string[];
    confidence: number;
  };
  metadata?: {
    processingTimeMs: number;
    loadsQueried: number;
    loadsMatched: number;
    aiModel: string;
    messagesUsed: number;
    messagesLimit: number;
    resetAt: string;
  };
  error?: {
    code: string;
    message: string;
    details?: string;
    timestamp?: string;
    resetAt?: string;
  };
};
