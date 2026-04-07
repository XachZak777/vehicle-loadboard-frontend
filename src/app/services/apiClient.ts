export type ApiError = {
  message: string;
  status?: number;
};

type RequestOptions = Omit<RequestInit, 'headers' | 'body'> & {
  headers?: Record<string, string>;
  body?: unknown;
  /** When true the stored JWT Bearer token is attached automatically. */
  auth?: boolean;
};

function getBaseUrl() {
  const base = import.meta.env.VITE_API_BASE_URL as string | undefined;
  return (base || '').replace(/\/$/, '');
}

function getToken(): string | null {
  try {
    const raw = localStorage.getItem('auth');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.token ?? null;
  } catch {
    return null;
  }
}

async function requestJson<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    throw {
      message: 'Missing VITE_API_BASE_URL. Please set it in your .env file.',
    } satisfies ApiError;
  }

  const url = `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  // Attach JWT if auth=true (default) and a token is stored.
  const shouldAuth = options.auth !== false;
  if (shouldAuth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });

    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const data = isJson ? await res.json().catch(() => undefined) : await res.text().catch(() => undefined);

    if (!res.ok) {
      const message =
        (data && typeof data === 'object' && 'message' in data && typeof (data as any).message === 'string'
          ? (data as any).message
          : undefined) ||
        (typeof data === 'string' && data.trim() ? data : undefined) ||
        `Request failed (${res.status})`;

      throw {
        message,
        status: res.status,
      } satisfies ApiError;
    }

    return data as T;
  } catch (err: any) {
    if (err && typeof err === 'object' && 'message' in err) {
      throw err as ApiError;
    }

    throw {
      message: 'Unable to reach the server. Please check your connection and API base URL.',
    } satisfies ApiError;
  }
}

// ---------------------------------------------------------------------------
// Auth types & endpoints
// ---------------------------------------------------------------------------

export type AuthRole = 'BROKER' | 'CARRIER';

export type AuthResponse = {
  token: string;
  userId: string;
  email: string;
  role: string;
};

export async function register(payload: { email: string; password: string; role: AuthRole }) {
  return requestJson<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: payload,
    auth: false,
  });
}

export async function login(payload: { email: string; password: string }) {
  return requestJson<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: payload,
    auth: false,
  });
}

// ---------------------------------------------------------------------------
// Load types & endpoints
// ---------------------------------------------------------------------------

/** Maps to backend CreateLoadRequest */
export type CreateLoadPayload = {
  pickupCity: string;
  pickupState: string;
  pickupStreet?: string;
  pickupZip?: string;
  pickupCountry?: string;
  pickupLotNumber?: string;
  dropCity: string;
  dropState: string;
  dropStreet?: string;
  dropZip?: string;
  dropCountry?: string;
  dropLotNumber?: string;
  /** e.g. "DOOR" | "PORT" | "TERMINAL" – defaults to "DOOR" if omitted */
  pickupType?: string;
  dropType?: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  description?: string;
  weight?: number;
  price?: number;
};

/** Maps to backend LoadPostingDto */
export type LoadDto = {
  id: string;
  pickupCity: string;
  pickupState: string;
  pickupStreet?: string;
  pickupZip?: string;
  pickupCountry?: string;
  pickupLotNumber?: string;
  dropCity: string;
  dropState: string;
  dropStreet?: string;
  dropZip?: string;
  dropCountry?: string;
  dropLotNumber?: string;
  pickupType?: string;
  dropType?: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  description?: string;
  weight?: number;
  price?: number;
  createdAt?: string;
  carrierId?: string;
  assignedCarrierId?: string;
  status?: string;
};

export async function createLoad(payload: CreateLoadPayload): Promise<LoadDto> {
  return requestJson<LoadDto>('/api/loads', { method: 'POST', body: payload });
}

export async function updateLoad(id: string, payload: CreateLoadPayload): Promise<LoadDto> {
  return requestJson<LoadDto>(`/api/loads/${id}`, { method: 'PUT', body: payload });
}

export async function deleteLoad(id: string): Promise<void> {
  return requestJson<void>(`/api/loads/${id}`, { method: 'DELETE' });
}

/** Public load board – returns all open loads */
export async function getLoads(): Promise<LoadDto[]> {
  return requestJson<LoadDto[]>('/api/loads');
}

/** Loads visible to the authenticated carrier */
export async function getLoadsForCarrier(carrierId: string): Promise<LoadDto[]> {
  return requestJson<LoadDto[]>(`/api/loads/carrier/${carrierId}`);
}

// ---------------------------------------------------------------------------
// Bid types & endpoints
// ---------------------------------------------------------------------------

export type BidPayload = {
  loadId: string;
  amount: number;
  bookNow: boolean;
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
};

export async function placeBid(payload: BidPayload): Promise<BidDto> {
  return requestJson<BidDto>('/api/loads/bid', { method: 'POST', body: payload });
}

export async function getBidsForLoad(loadId: string): Promise<BidDto[]> {
  return requestJson<BidDto[]>(`/api/loads/${loadId}/bids`);
}

export async function approveBid(loadId: string, bidId: string): Promise<void> {
  return requestJson<void>(`/api/loads/${loadId}/approve/${bidId}`, { method: 'POST' });
}

export async function cancelBooking(loadId: string): Promise<void> {
  return requestJson<void>(`/api/loads/${loadId}/cancel`, { method: 'POST' });
}

// ---------------------------------------------------------------------------
// Profile endpoints
// ---------------------------------------------------------------------------

export type BrokerProfile = {
  id: string;
  companyName?: string;
  mcNumber?: string;
  dotNumber?: string;
  phoneNumber?: string;
  email?: string;
};

export type CarrierProfile = {
  id: string;
  companyName?: string;
  mcNumber?: string;
  dotNumber?: string;
  phoneNumber?: string;
  email?: string;
};

export async function getMyBrokerProfile(): Promise<BrokerProfile> {
  return requestJson<BrokerProfile>('/api/brokers/me');
}

export async function getMyCarrierProfile(): Promise<CarrierProfile> {
  return requestJson<CarrierProfile>('/api/carriers/me');
}
