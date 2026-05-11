# Ratings Integration — Backend API Spec

## Endpoints needed

### 1. GET `/api/ratings/me`
**Auth required.** Returns ratings received by the currently authenticated user (broker or carrier).

**Response**
```json
{
  "positiveCount": 5,
  "negativeCount": 1,
  "tagStats": [
    { "tag": "communication", "count": 4, "total": 6 },
    { "tag": "payment",       "count": 5, "total": 6 },
    { "tag": "accuracy",      "count": 3, "total": 6 }
  ],
  "ratings": [
    {
      "id": "string",
      "type": "positive",
      "fromName": "Swift Logistics LLC",
      "fromRole": "Carrier",
      "loadTitle": "2022 Toyota Camry",
      "tags": ["communication", "payment"],
      "comment": "Optional freetext, max 500 chars",
      "createdAt": "2026-05-10T00:00:00Z"
    }
  ]
}
```

---

### 2. GET `/api/ratings/:targetType/:id`
**Public.** Returns ratings for any company by type and ID. `:targetType` is `broker` or `carrier`.

Examples:
- `GET /api/ratings/broker/abc123`
- `GET /api/ratings/carrier/xyz789`

Same response shape as `/ratings/me`.

---

### 3. POST `/api/ratings`
**Auth required.** Submit a rating after a completed load.

**Request**
```json
{
  "targetId": "string",
  "targetType": "broker" | "carrier",
  "loadId": "string",
  "type": "positive" | "negative",
  "tags": ["communication", "payment"],
  "comment": "Optional, max 500 chars"
}
```

**Response** — `200 OK` (empty body or `{ "message": "..." }`)

---

## Response field notes

| Field | How to populate |
|-------|----------------|
| `fromName` | Company name of the user who submitted the rating (join from their broker/carrier profile) |
| `fromRole` | `"Broker"` or `"Carrier"` — derived from the submitter's role |
| `loadTitle` | Human-readable vehicle string built from load: `"2022 Toyota Camry"` (join from load) |
| `tagStats[].count` | Number of ratings that included this tag |
| `tagStats[].total` | Total number of ratings received (used as denominator to show %) |

---

## Tag values

Only these three tag IDs are valid:

| `tag` | Positive label | Negative label |
|-------|---------------|----------------|
| `communication` | Proper Communication | Poor Communication |
| `payment` | On-Time Payment | Late Payment |
| `accuracy` | Accurate Load Details | Inaccurate Load Details |

---

## Business rules (enforce on backend)

1. Load must exist and have status `DELIVERED`, `PAID`, or `COMPLETED`
2. Submitter must have been a participant in the load (the broker who posted it or the assigned carrier)
3. Cannot rate the same load + target more than once
4. `tags` must be from the allowed set above
5. `comment` max 500 characters

---

## Also needed — rating score on public profile endpoints

The load board shows a star + score next to each broker name. Currently hardcoded to `0%`.

Add `ratingScore` (integer 0–100, percentage of positive ratings) to:
- `GET /api/brokers/:id/public`
- `GET /api/carriers/:id/public`

---

## Frontend integration note

On the frontend side, the unified public endpoint `GET /api/ratings/:targetType/:id` replaces the two separate hooks. Update `hauliusApi.ts`:

```ts
// Replace these two:
getBrokerRatings: builder.query<MyRatingsResponse, string>({
  query: (id) => `/api/ratings/broker/${id}`,
}),
getCarrierRatings: builder.query<MyRatingsResponse, string>({
  query: (id) => `/api/ratings/carrier/${id}`,
}),

// With one:
getCompanyRatings: builder.query<MyRatingsResponse, { targetType: 'broker' | 'carrier'; id: string }>({
  query: ({ targetType, id }) => `/api/ratings/${targetType}/${id}`,
  providesTags: (_r, _e, { id }) => [{ type: 'Rating', id }],
}),
```

Then in `CompanyRating.tsx` replace `useGetBrokerRatingsQuery(id)` / `useGetCarrierRatingsQuery(id)` with `useGetCompanyRatingsQuery({ targetType: 'broker', id })` / `useGetCompanyRatingsQuery({ targetType: 'carrier', id })`.

---

## Prompt for backend Claude

Paste this into Cursor / Claude to implement the ratings feature:

---

> Implement a ratings system for a vehicle load board app. Below is the full spec — read it carefully before writing any code.
>
> **Entities involved:**
> - `User` (has a role: `BROKER` or `CARRIER`)
> - `BrokerProfile` / `CarrierProfile` (1:1 with User, stores company name)
> - `Load` (has `brokerId`, `assignedCarrierId`, `status`)
> - `Rating` (new entity to create)
>
> **Rating entity fields:**
> - `id` — UUID primary key
> - `targetId` — ID of the rated broker/carrier profile
> - `targetType` — `"broker"` or `"carrier"`
> - `loadId` — the load this rating is tied to
> - `submitterId` — User ID of who submitted it
> - `type` — `"positive"` or `"negative"`
> - `tags` — array of strings from the set: `["communication", "payment", "accuracy"]`
> - `comment` — optional text, max 500 chars
> - `createdAt` — timestamp
>
> **Endpoints to implement:**
>
> `GET /api/ratings/me` — Auth required. Return ratings received by the authenticated user.
>
> `GET /api/ratings/:targetType/:id` — Public. Return ratings received by a specific broker or carrier. `:targetType` is `"broker"` or `"carrier"`, `:id` is the profile ID.
>
> Both GET endpoints return:
> ```json
> {
>   "positiveCount": 5,
>   "negativeCount": 1,
>   "tagStats": [
>     { "tag": "communication", "count": 4, "total": 6 },
>     { "tag": "payment",       "count": 5, "total": 6 },
>     { "tag": "accuracy",      "count": 3, "total": 6 }
>   ],
>   "ratings": [
>     {
>       "id": "string",
>       "type": "positive",
>       "fromName": "Swift Logistics LLC",
>       "fromRole": "Carrier",
>       "loadTitle": "2022 Toyota Camry",
>       "tags": ["communication", "payment"],
>       "comment": "optional",
>       "createdAt": "2026-05-10T00:00:00Z"
>     }
>   ]
> }
> ```
> - `fromName` — join submitter's broker/carrier profile to get company name
> - `fromRole` — `"Broker"` or `"Carrier"` from submitter's role
> - `loadTitle` — join load to build `"${vehicleYear} ${vehicleMake} ${vehicleModel}"`
> - `tagStats[].count` — how many ratings included that tag
> - `tagStats[].total` — total ratings received (denominator for %)
>
> `POST /api/ratings` — Auth required. Submit a rating.
> Request body:
> ```json
> {
>   "targetId": "string",
>   "targetType": "broker" | "carrier",
>   "loadId": "string",
>   "type": "positive" | "negative",
>   "tags": ["communication"],
>   "comment": "optional, max 500 chars"
> }
> ```
> Enforce:
> 1. Load must have status `DELIVERED`, `PAID`, or `COMPLETED`
> 2. Submitter must be the broker who posted the load OR the assigned carrier
> 3. Duplicate ratings for the same load + submitter are not allowed (return 409)
> 4. Tags must only contain values from `["communication", "payment", "accuracy"]`
> 5. Comment max 500 characters
>
> **Also:** Add a computed `ratingScore` field (integer 0–100, percentage of positive ratings) to the existing `GET /api/brokers/:id/public` and `GET /api/carriers/:id/public` endpoints. If no ratings exist, return `null`.
>
> Return consistent error responses as `{ "message": "..." }` with appropriate HTTP status codes (400, 401, 403, 404, 409).
