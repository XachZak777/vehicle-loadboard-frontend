# AI Load Assistant - Backend Integration Specification

## Overview

This document specifies the complete data flow between the React frontend, Java backend, PostgreSQL database, and Claude AI Agent for the AI Load Assistant chatbot feature.

**Stack:**

- Frontend: React + TypeScript
- Backend: Java (Spring Boot recommended)
- Database: PostgreSQL
- AI Provider: Claude AI (Anthropic API)

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Frontend to Backend Communication](#frontend-to-backend-communication)
3. [Backend to Claude AI Communication](#backend-to-claude-ai-communication)
4. [Backend to Database Communication](#backend-to-database-communication)
5. [Complete Flow Diagram](#complete-flow-diagram)
6. [Error Handling](#error-handling)
7. [Database Schema](#database-schema)
8. [Security Considerations](#security-considerations)

---

## 1. Architecture Overview

```
┌─────────────────┐
│  React Frontend │
│  (AIAssistant)  │
└────────┬────────┘
         │ HTTP/REST
         │ POST /api/ai/chat
         │
┌────────▼────────┐
│   Java Backend  │
│  (Spring Boot)  │
└────┬──────┬─────┘
     │      │
     │      └──────────────┐
     │                     │
┌────▼────────┐    ┌──────▼──────────┐
│ PostgreSQL  │    │  Claude AI API  │
│  Database   │    │   (Anthropic)   │
└─────────────┘    └─────────────────┘
```

**Data Flow:**

1. User types message in frontend chatbot
2. Frontend sends HTTP POST to Java backend
3. Backend queries PostgreSQL for relevant load data
4. Backend sends query + load data to Claude AI
5. Claude AI analyzes and responds
6. Backend parses Claude response
7. Backend returns formatted response to frontend
8. Frontend displays AI message in chat UI

---

## 2. Frontend to Backend Communication

### 2.1 Endpoint Specification

**Endpoint:** `POST /api/ai/chat`

**Description:** Sends user query to backend and receives AI-generated response about available loads.

---

### 2.2 Frontend Request

#### Headers

```http
POST /api/ai/chat HTTP/1.1
Host: your-backend-domain.com
Content-Type: application/json
Authorization: Bearer {JWT_TOKEN}
```

#### Request Body

```json
{
  "message": "I have a 3-car hauler going from Los Angeles to Dallas, show me available loads",
  "userId": "carrier_default_1",
  "conversationId": "conv_1747862870383",
  "metadata": {
    "timestamp": "2026-05-15T16:34:30.383Z",
    "userRole": "carrier",
    "equipmentType": "8-9 car hauler"
  }
}
```

#### Request Fields

| Field                    | Type              | Required | Description                                        |
| ------------------------ | ----------------- | -------- | -------------------------------------------------- |
| `message`                | string            | Yes      | User's natural language query                      |
| `userId`                 | string            | Yes      | Authenticated user's unique ID                     |
| `conversationId`         | string            | No       | ID for maintaining conversation context (optional) |
| `metadata`               | object            | No       | Additional context about the user                  |
| `metadata.timestamp`     | string (ISO 8601) | No       | When message was sent                              |
| `metadata.userRole`      | string            | No       | "carrier", "broker", or "dealer"                   |
| `metadata.equipmentType` | string            | No       | User's equipment type if carrier                   |

---

### 2.3 Backend Response to Frontend

#### Success Response (200 OK)

```json
{
  "success": true,
  "conversationId": "conv_1747862870383",
  "response": {
    "messageId": "msg_1747862870500",
    "content": "I found 3 loads that match your route from Los Angeles to Dallas:\n\n1. **Load #DEMO7579** - Los Angeles, CA → Dallas, TX\n   - Distance: 1,425 miles\n   - Price: $2,850 ($2.00/mile)\n   - Vehicles: 2 cars (Tesla Model 3, BMW X5)\n   - Pickup: May 15, 2026\n   - Delivery: May 18, 2026\n\n2. **Load #DEMO7580** - Santa Monica, CA → Fort Worth, TX\n   - Distance: 1,438 miles\n   - Price: $3,020 ($2.10/mile)\n   - Vehicles: 3 cars\n   - Pickup: May 16, 2026\n\nWould you like more details about any of these loads?",
    "timestamp": "2026-05-15T16:34:31.120Z",
    "relatedLoadIds": ["DEMO7579", "DEMO7580"],
    "confidence": 0.92
  },
  "metadata": {
    "processingTimeMs": 1250,
    "loadsQueried": 127,
    "loadsMatched": 3,
    "aiModel": "claude-sonnet-4.5"
  }
}
```

#### Response Fields

| Field                       | Type    | Description                               |
| --------------------------- | ------- | ----------------------------------------- |
| `success`                   | boolean | Whether request was successful            |
| `conversationId`            | string  | Conversation ID for context tracking      |
| `response.messageId`        | string  | Unique ID for this AI response            |
| `response.content`          | string  | AI-generated message (markdown formatted) |
| `response.timestamp`        | string  | When response was generated               |
| `response.relatedLoadIds`   | array   | Load IDs mentioned in response            |
| `response.confidence`       | number  | AI confidence score (0-1)                 |
| `metadata.processingTimeMs` | number  | Backend processing time                   |
| `metadata.loadsQueried`     | number  | Total loads searched                      |
| `metadata.loadsMatched`     | number  | Loads matching criteria                   |
| `metadata.aiModel`          | string  | AI model used                             |

---

#### Error Response (400/500)

```json
{
  "success": false,
  "error": {
    "code": "AI_SERVICE_ERROR",
    "message": "Failed to process AI request",
    "details": "Claude AI API rate limit exceeded. Please try again in 60 seconds.",
    "timestamp": "2026-05-15T16:34:31.120Z",
    "retryAfter": 60
  }
}
```

#### Error Codes

| Code                  | HTTP Status | Description                             |
| --------------------- | ----------- | --------------------------------------- |
| `INVALID_REQUEST`     | 400         | Missing or invalid request fields       |
| `UNAUTHORIZED`        | 401         | Invalid or missing authentication token |
| `USER_NOT_FOUND`      | 404         | User ID not found in database           |
| `NO_LOADS_AVAILABLE`  | 404         | No loads found in database              |
| `AI_SERVICE_ERROR`    | 500         | Claude AI API error                     |
| `DATABASE_ERROR`      | 500         | PostgreSQL query failed                 |
| `RATE_LIMIT_EXCEEDED` | 429         | Too many requests                       |

---

### 2.4 Frontend Implementation Example

```typescript
// Frontend function to send message to backend
async function sendMessageToBackend(
  message: string,
  userId: string,
): Promise<AIResponse> {
  const response = await fetch('https://your-api.com/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify({
      message,
      userId,
      conversationId: getCurrentConversationId(),
      metadata: {
        timestamp: new Date().toISOString(),
        userRole: getUserRole(),
        equipmentType: getUserEquipmentType(),
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }

  return await response.json();
}
```

---

## 3. Backend to Claude AI Communication

### 3.1 Claude AI API Integration

**Endpoint:** `POST https://api.anthropic.com/v1/messages`

**Authentication:** API Key in header

---

### 3.2 Backend Request to Claude AI

#### Headers

```http
POST /v1/messages HTTP/1.1
Host: api.anthropic.com
Content-Type: application/json
x-api-key: sk-ant-your-api-key-here
anthropic-version: 2023-06-01
```

#### Request Body

```json
{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 1024,
  "temperature": 0.7,
  "system": "You are an AI assistant helping carriers find vehicle transport loads. Analyze the user's query and the provided load data, then recommend the best matching loads. Format your response in a friendly, conversational manner with clear details about each load. Include load ID, route, distance, price, price per mile, number of vehicles, and pickup/delivery dates.",
  "messages": [
    {
      "role": "user",
      "content": "User Query: I have a 3-car hauler going from Los Angeles to Dallas, show me available loads\n\nUser Profile:\n- User ID: carrier_default_1\n- Role: Carrier\n- Company: AAA Transport LLC\n- Equipment: 8-9 car hauler\n- Preferred routes: CA → TX, CA → FL\n\nAvailable Loads:\n[\n  {\n    \"id\": \"DEMO7579\",\n    \"orderId\": \"DEMO7579\",\n    \"pickupCity\": \"Los Angeles\",\n    \"pickupState\": \"CA\",\n    \"deliveryCity\": \"Dallas\",\n    \"deliveryState\": \"TX\",\n    \"distance\": 1425,\n    \"price\": 2850,\n    \"pricePerMile\": 2.0,\n    \"vehicles\": [\n      {\"year\": 2024, \"make\": \"Tesla\", \"model\": \"Model 3\", \"type\": \"sedan\"},\n      {\"year\": 2023, \"make\": \"BMW\", \"model\": \"X5\", \"type\": \"SUV\"}\n    ],\n    \"trailerType\": \"open\",\n    \"pickupDate\": \"2026-05-15\",\n    \"deliveryDate\": \"2026-05-18\",\n    \"isOpen\": true,\n    \"brokerName\": \"Premium Auto Logistics\"\n  },\n  {\n    \"id\": \"DEMO7580\",\n    \"orderId\": \"DEMO7580\",\n    \"pickupCity\": \"Santa Monica\",\n    \"pickupState\": \"CA\",\n    \"deliveryCity\": \"Fort Worth\",\n    \"deliveryState\": \"TX\",\n    \"distance\": 1438,\n    \"price\": 3020,\n    \"pricePerMile\": 2.1,\n    \"vehicles\": [\n      {\"year\": 2024, \"make\": \"Mercedes\", \"model\": \"GLE\", \"type\": \"SUV\"},\n      {\"year\": 2023, \"make\": \"Audi\", \"model\": \"Q7\", \"type\": \"SUV\"},\n      {\"year\": 2024, \"make\": \"Porsche\", \"model\": \"Cayenne\", \"type\": \"SUV\"}\n    ],\n    \"trailerType\": \"enclosed\",\n    \"pickupDate\": \"2026-05-16\",\n    \"deliveryDate\": \"2026-05-19\",\n    \"isOpen\": true,\n    \"brokerName\": \"Elite Transport Co\"\n  }\n]\n\nPlease analyze and recommend the best loads for this carrier."
    }
  ]
}
```

---

### 3.3 Claude AI Response

```json
{
  "id": "msg_01XFDGPTq6DAnLNXhJ9KqJvF",
  "type": "message",
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "I found 2 excellent loads that match your route from Los Angeles to Dallas:\n\n1. **Load #DEMO7579** - Los Angeles, CA → Dallas, TX\n   - Distance: 1,425 miles\n   - Price: $2,850 ($2.00/mile)\n   - Vehicles: 2 cars (2024 Tesla Model 3, 2023 BMW X5)\n   - Trailer: Open\n   - Pickup: May 15, 2026\n   - Delivery: May 18, 2026\n   - Broker: Premium Auto Logistics\n\n2. **Load #DEMO7580** - Santa Monica, CA → Fort Worth, TX\n   - Distance: 1,438 miles\n   - Price: $3,020 ($2.10/mile)\n   - Vehicles: 3 luxury SUVs (Mercedes GLE, Audi Q7, Porsche Cayenne)\n   - Trailer: Enclosed (higher rate justified)\n   - Pickup: May 16, 2026\n   - Delivery: May 19, 2026\n   - Broker: Elite Transport Co\n\n**Recommendation:** Load #DEMO7580 offers a better rate per mile ($2.10 vs $2.00) and fits your 3-car hauler capacity perfectly. However, it requires an enclosed trailer. If you have open trailer only, Load #DEMO7579 is still a solid option with good margins.\n\nWould you like to book one of these loads?"
    }
  ],
  "model": "claude-sonnet-4-20250514",
  "stop_reason": "end_turn",
  "usage": {
    "input_tokens": 1250,
    "output_tokens": 285
  }
}
```

---

### 3.4 Backend Processing Steps

```java
// Java backend pseudo-code

public AIResponse processAIChat(AIRequest request) {
    // Step 1: Validate request
    validateRequest(request);

    // Step 2: Get user profile from database
    User user = userRepository.findById(request.getUserId());

    // Step 3: Query loads from PostgreSQL
    List<Load> loads = loadRepository.findAvailableLoads(
        user.getPreferredStates(),
        user.getEquipmentType(),
        LocalDate.now()
    );

    // Step 4: Build Claude AI prompt
    String promptContent = buildPromptWithContext(
        request.getMessage(),
        user,
        loads
    );

    // Step 5: Call Claude AI API
    ClaudeResponse claudeResponse = claudeApiClient.sendMessage(
        promptContent,
        "claude-sonnet-4-20250514",
        1024
    );

    // Step 6: Extract load IDs mentioned in response
    List<String> relatedLoadIds = extractLoadIds(claudeResponse.getContent());

    // Step 7: Build response
    return AIResponse.builder()
        .success(true)
        .conversationId(request.getConversationId())
        .response(MessageResponse.builder()
            .messageId(generateMessageId())
            .content(claudeResponse.getContent())
            .timestamp(Instant.now())
            .relatedLoadIds(relatedLoadIds)
            .confidence(calculateConfidence(claudeResponse))
            .build())
        .metadata(Metadata.builder()
            .processingTimeMs(calculateProcessingTime())
            .loadsQueried(loads.size())
            .loadsMatched(relatedLoadIds.size())
            .aiModel("claude-sonnet-4.5")
            .build())
        .build();
}
```

---

## 4. Backend to Database Communication

### 4.1 PostgreSQL Schema Requirements

#### Loads Table

```sql
CREATE TABLE loads (
    id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) UNIQUE NOT NULL,
    broker_id VARCHAR(50) NOT NULL,
    broker_name VARCHAR(255),
    pickup_address VARCHAR(255),
    pickup_city VARCHAR(100) NOT NULL,
    pickup_state VARCHAR(2) NOT NULL,
    pickup_zip VARCHAR(10),
    delivery_address VARCHAR(255),
    delivery_city VARCHAR(100) NOT NULL,
    delivery_state VARCHAR(2) NOT NULL,
    delivery_zip VARCHAR(10),
    pickup_date DATE NOT NULL,
    delivery_date DATE NOT NULL,
    distance INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    trailer_type VARCHAR(20) NOT NULL, -- 'open' or 'enclosed'
    payment_method VARCHAR(50),
    is_open BOOLEAN DEFAULT true,
    status VARCHAR(20) DEFAULT 'posted', -- 'posted', 'assigned', 'picked-up', 'in-transit', 'delivered'
    assigned_carrier_id VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_loads_pickup_state ON loads(pickup_state);
CREATE INDEX idx_loads_delivery_state ON loads(delivery_state);
CREATE INDEX idx_loads_is_open ON loads(is_open);
CREATE INDEX idx_loads_pickup_date ON loads(pickup_date);
CREATE INDEX idx_loads_status ON loads(status);
```

#### Vehicles Table (for multi-vehicle loads)

```sql
CREATE TABLE load_vehicles (
    id SERIAL PRIMARY KEY,
    load_id VARCHAR(50) NOT NULL REFERENCES loads(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    vehicle_type VARCHAR(20), -- 'sedan', 'suv', 'truck', 'motorcycle', etc.
    vin VARCHAR(17),
    color VARCHAR(50),
    condition VARCHAR(20), -- 'running', 'non-running'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vehicles_load_id ON load_vehicles(load_id);
```

#### Users Table

```sql
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL, -- 'carrier', 'broker', 'dealer'
    company_name VARCHAR(255),
    name VARCHAR(255),
    phone_number VARCHAR(20),
    contact_name VARCHAR(255),
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(2),
    zip VARCHAR(10),
    mc_number VARCHAR(50),
    dot_number VARCHAR(50),
    equipment_type VARCHAR(100), -- for carriers
    trailer_capacity VARCHAR(20), -- for carriers
    preferred_routes TEXT, -- JSON array of preferred state pairs
    fmcsa_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

---

### 4.2 SQL Queries Backend Should Execute

#### Query 1: Get Available Loads

```sql
-- Get all open loads with their vehicles
SELECT
    l.id,
    l.order_id,
    l.pickup_city,
    l.pickup_state,
    l.pickup_zip,
    l.delivery_city,
    l.delivery_state,
    l.delivery_zip,
    l.pickup_date,
    l.delivery_date,
    l.distance,
    l.price,
    l.trailer_type,
    l.broker_name,
    l.payment_method,
    l.notes,
    json_agg(
        json_build_object(
            'year', v.year,
            'make', v.make,
            'model', v.model,
            'type', v.vehicle_type,
            'vin', v.vin,
            'color', v.color,
            'condition', v.condition
        )
    ) as vehicles
FROM loads l
LEFT JOIN load_vehicles v ON l.id = v.load_id
WHERE l.is_open = true
  AND l.status = 'posted'
  AND l.pickup_date >= CURRENT_DATE
GROUP BY l.id
ORDER BY l.pickup_date ASC
LIMIT 100;
```

#### Query 2: Get Loads Filtered by Route

```sql
-- Filter by pickup/delivery states
SELECT
    l.*,
    json_agg(v.*) as vehicles
FROM loads l
LEFT JOIN load_vehicles v ON l.id = v.load_id
WHERE l.is_open = true
  AND l.pickup_state = :pickupState
  AND l.delivery_state = :deliveryState
  AND l.pickup_date >= CURRENT_DATE
GROUP BY l.id
ORDER BY l.price DESC;
```

#### Query 3: Get User Profile with Preferences

```sql
-- Get user details including preferred routes
SELECT
    id,
    email,
    role,
    company_name,
    equipment_type,
    trailer_capacity,
    preferred_routes,
    mc_number,
    dot_number
FROM users
WHERE id = :userId;
```

#### Query 4: Get User's Historical Routes (for AI context)

```sql
-- Get carrier's past completed loads to understand route preferences
SELECT
    pickup_state,
    delivery_state,
    COUNT(*) as times_taken,
    AVG(price) as avg_price,
    AVG(distance) as avg_distance
FROM loads
WHERE assigned_carrier_id = :userId
  AND status = 'delivered'
GROUP BY pickup_state, delivery_state
ORDER BY times_taken DESC
LIMIT 10;
```

---

### 4.3 Java Repository Example

```java
@Repository
public interface LoadRepository extends JpaRepository<Load, String> {

    @Query("""
        SELECT l FROM Load l
        LEFT JOIN FETCH l.vehicles
        WHERE l.isOpen = true
        AND l.status = 'posted'
        AND l.pickupDate >= :currentDate
        ORDER BY l.pickupDate ASC
        """)
    List<Load> findAvailableLoads(@Param("currentDate") LocalDate currentDate);

    @Query("""
        SELECT l FROM Load l
        LEFT JOIN FETCH l.vehicles
        WHERE l.isOpen = true
        AND l.pickupState = :pickupState
        AND l.deliveryState = :deliveryState
        AND l.pickupDate >= :currentDate
        ORDER BY l.price DESC
        """)
    List<Load> findLoadsByRoute(
        @Param("pickupState") String pickupState,
        @Param("deliveryState") String deliveryState,
        @Param("currentDate") LocalDate currentDate
    );
}
```

---

## 5. Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERACTION                            │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ User types message
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React Component)                        │
├─────────────────────────────────────────────────────────────────────┤
│ 1. Capture user message                                             │
│ 2. Add message to UI (user bubble)                                  │
│ 3. Show loading indicator                                           │
│ 4. POST /api/ai/chat                                                │
│    Headers: Authorization: Bearer {token}                           │
│    Body: { message, userId, conversationId }                        │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ HTTPS Request
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND (Java Spring Boot)                        │
├─────────────────────────────────────────────────────────────────────┤
│ STEP 1: Authentication & Validation                                 │
│   - Verify JWT token                                                │
│   - Validate request body                                           │
│   - Extract userId                                                  │
│                                                                      │
│ STEP 2: Get User Context                                            │
│   - Query PostgreSQL: SELECT * FROM users WHERE id = ?              │
│   - Extract: role, equipment_type, preferred_routes                 │
│                                                                      │
│ STEP 3: Query Available Loads                                       │
│   - Query PostgreSQL: SELECT loads + vehicles                       │
│   - Filter: is_open = true, pickup_date >= today                   │
│   - Join with load_vehicles table                                   │
│   - Result: List<Load> (50-100 loads)                               │
│                                                                      │
│ STEP 4: Build AI Prompt                                             │
│   - Format user query                                               │
│   - Add user profile context                                        │
│   - Serialize loads to JSON                                         │
│   - Create system prompt with instructions                          │
│                                                                      │
│ STEP 5: Call Claude AI API                                          │
│   - POST https://api.anthropic.com/v1/messages                      │
│   - Headers: x-api-key, anthropic-version                           │
│   - Body: { model, messages, max_tokens, temperature }              │
│   - Wait for response (1-3 seconds)                                 │
│                                                                      │
│ STEP 6: Parse AI Response                                           │
│   - Extract content from Claude response                            │
│   - Parse load IDs mentioned (regex: DEMO\d+)                       │
│   - Calculate confidence score                                      │
│                                                                      │
│ STEP 7: Build Response                                              │
│   - Create AIResponse object                                        │
│   - Add metadata (processing time, loads matched)                   │
│   - Return JSON response                                            │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ JSON Response
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React Component)                        │
├─────────────────────────────────────────────────────────────────────┤
│ 5. Receive response                                                 │
│ 6. Hide loading indicator                                           │
│ 7. Add AI message to UI (assistant bubble)                          │
│ 8. Render response.content (markdown formatted)                     │
│ 9. Auto-scroll to bottom                                            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 6. Error Handling

### 6.1 Backend Error Handling Strategy

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(InvalidRequestException.class)
    public ResponseEntity<ErrorResponse> handleInvalidRequest(InvalidRequestException ex) {
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponse.builder()
                .success(false)
                .error(ErrorDetail.builder()
                    .code("INVALID_REQUEST")
                    .message("Invalid request parameters")
                    .details(ex.getMessage())
                    .timestamp(Instant.now())
                    .build())
                .build());
    }

    @ExceptionHandler(ClaudeApiException.class)
    public ResponseEntity<ErrorResponse> handleClaudeApiError(ClaudeApiException ex) {
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ErrorResponse.builder()
                .success(false)
                .error(ErrorDetail.builder()
                    .code("AI_SERVICE_ERROR")
                    .message("Failed to process AI request")
                    .details(ex.getMessage())
                    .timestamp(Instant.now())
                    .retryAfter(ex.getRetryAfter())
                    .build())
                .build());
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ErrorResponse> handleDatabaseError(DataAccessException ex) {
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ErrorResponse.builder()
                .success(false)
                .error(ErrorDetail.builder()
                    .code("DATABASE_ERROR")
                    .message("Database query failed")
                    .details("Unable to retrieve load data")
                    .timestamp(Instant.now())
                    .build())
                .build());
    }
}
```

### 6.2 Frontend Error Handling

```typescript
try {
  const response = await sendMessageToBackend(message, userId);

  // Display AI response
  addAssistantMessage(response.response.content);
} catch (error: any) {
  // Parse error response
  const errorData = error.response?.data;

  // Display error message to user
  if (errorData?.error?.code === 'AI_SERVICE_ERROR') {
    addAssistantMessage(
      "I'm sorry, I encountered an error processing your request. " +
        'Please try again in a moment.',
    );
  } else if (errorData?.error?.code === 'NO_LOADS_AVAILABLE') {
    addAssistantMessage(
      "I couldn't find any available loads at the moment. " +
        'Please check back later or try a different route.',
    );
  } else {
    addAssistantMessage("I'm sorry, something went wrong. Please try again.");
  }

  // Log error for debugging
  console.error('AI Chat Error:', errorData);
}
```

---

## 7. Database Schema

### 7.1 Complete PostgreSQL Schema

```sql
-- Users table
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('carrier', 'broker', 'dealer')),
    company_name VARCHAR(255),
    name VARCHAR(255),
    phone_number VARCHAR(20),
    contact_name VARCHAR(255),
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(2),
    zip VARCHAR(10),
    mc_number VARCHAR(50),
    dot_number VARCHAR(50),
    equipment_type VARCHAR(100),
    trailer_capacity VARCHAR(20),
    preferred_routes JSONB, -- ["CA->TX", "CA->FL"]
    fmcsa_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Loads table
CREATE TABLE loads (
    id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) UNIQUE NOT NULL,
    broker_id VARCHAR(50) NOT NULL REFERENCES users(id),
    broker_name VARCHAR(255),
    pickup_address VARCHAR(255),
    pickup_city VARCHAR(100) NOT NULL,
    pickup_state VARCHAR(2) NOT NULL,
    pickup_zip VARCHAR(10),
    delivery_address VARCHAR(255),
    delivery_city VARCHAR(100) NOT NULL,
    delivery_state VARCHAR(2) NOT NULL,
    delivery_zip VARCHAR(10),
    pickup_date DATE NOT NULL,
    delivery_date DATE NOT NULL,
    distance INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    trailer_type VARCHAR(20) NOT NULL CHECK (trailer_type IN ('open', 'enclosed')),
    payment_method VARCHAR(50),
    is_open BOOLEAN DEFAULT true,
    status VARCHAR(20) DEFAULT 'posted' CHECK (status IN ('posted', 'assigned', 'picked-up', 'in-transit', 'delivered', 'cancelled')),
    assigned_carrier_id VARCHAR(50) REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Load vehicles table
CREATE TABLE load_vehicles (
    id SERIAL PRIMARY KEY,
    load_id VARCHAR(50) NOT NULL REFERENCES loads(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    vehicle_type VARCHAR(20),
    vin VARCHAR(17),
    color VARCHAR(50),
    condition VARCHAR(20) CHECK (condition IN ('running', 'non-running')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table (tracks carrier assignments)
CREATE TABLE bookings (
    id VARCHAR(50) PRIMARY KEY,
    load_id VARCHAR(50) NOT NULL REFERENCES loads(id),
    carrier_id VARCHAR(50) NOT NULL REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
    booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conversations table (optional, for tracking AI chat history)
CREATE TABLE ai_conversations (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages table (optional, for storing chat history)
CREATE TABLE ai_messages (
    id VARCHAR(50) PRIMARY KEY,
    conversation_id VARCHAR(50) NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    related_load_ids JSONB, -- ["DEMO7579", "DEMO7580"]
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_loads_pickup_state ON loads(pickup_state);
CREATE INDEX idx_loads_delivery_state ON loads(delivery_state);
CREATE INDEX idx_loads_is_open ON loads(is_open);
CREATE INDEX idx_loads_pickup_date ON loads(pickup_date);
CREATE INDEX idx_loads_status ON loads(status);
CREATE INDEX idx_loads_broker_id ON loads(broker_id);
CREATE INDEX idx_loads_assigned_carrier ON loads(assigned_carrier_id);
CREATE INDEX idx_vehicles_load_id ON load_vehicles(load_id);
CREATE INDEX idx_bookings_load_id ON bookings(load_id);
CREATE INDEX idx_bookings_carrier_id ON bookings(carrier_id);
CREATE INDEX idx_messages_conversation_id ON ai_messages(conversation_id);
```

---

## 8. Security Considerations

### 8.1 Authentication & Authorization

**JWT Token Validation:**

```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) {
        String token = extractToken(request);

        if (token != null && jwtService.validateToken(token)) {
            String userId = jwtService.extractUserId(token);
            Authentication auth = new UsernamePasswordAuthenticationToken(
                userId, null, Collections.emptyList()
            );
            SecurityContextHolder.getContext().setAuthentication(auth);
        }

        filterChain.doFilter(request, response);
    }
}
```

### 8.2 Data Privacy

**User Isolation:**

- Carriers should only see loads they have access to
- Never expose other carriers' information
- Filter loads by `is_open = true` and `status = 'posted'`

**Sensitive Data:**

- Never send user passwords to frontend
- Hash passwords with BCrypt (strength 12+)
- Store Claude API key in environment variables, never in code
- Use HTTPS for all API communication

### 8.3 Rate Limiting

```java
@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private final RateLimiter rateLimiter = RateLimiter.create(10.0); // 10 requests/second

    @Override
    public boolean preHandle(HttpServletRequest request,
                            HttpServletResponse response,
                            Object handler) {
        if (!rateLimiter.tryAcquire()) {
            response.setStatus(429);
            return false;
        }
        return true;
    }
}
```

### 8.4 Input Validation

```java
@Valid
public class AIRequest {

    @NotBlank(message = "Message cannot be empty")
    @Size(max = 1000, message = "Message too long")
    private String message;

    @NotBlank(message = "User ID required")
    private String userId;

    @Pattern(regexp = "conv_[0-9]+", message = "Invalid conversation ID")
    private String conversationId;
}
```

---

## 9. Performance Optimization

### 9.1 Caching Strategy

**Cache frequently accessed data:**

```java
@Cacheable(value = "availableLoads", key = "#pickupState + '_' + #deliveryState")
public List<Load> findLoadsByRoute(String pickupState, String deliveryState) {
    return loadRepository.findLoadsByRoute(pickupState, deliveryState, LocalDate.now());
}
```

### 9.2 Database Query Optimization

- Use indexes on frequently queried columns
- Limit query results (LIMIT 100)
- Use connection pooling (HikariCP)
- Eager fetch vehicles with loads (avoid N+1 queries)

### 9.3 Claude AI Optimization

- Set appropriate `max_tokens` (1024 for concise responses)
- Use `temperature: 0.7` for balanced creativity
- Implement request timeout (10 seconds max)
- Cache similar queries if possible

---

## 10. Testing Recommendations

### 10.1 Backend Unit Tests

```java
@Test
public void testAIChatEndpoint_Success() {
    // Given
    AIRequest request = new AIRequest("Show me loads to Texas", "user123");
    when(loadRepository.findAvailableLoads(any())).thenReturn(mockLoads);
    when(claudeApiClient.sendMessage(any(), any(), any())).thenReturn(mockClaudeResponse);

    // When
    AIResponse response = aiChatService.processChat(request);

    // Then
    assertTrue(response.isSuccess());
    assertNotNull(response.getResponse().getContent());
    assertEquals(2, response.getMetadata().getLoadsMatched());
}
```

### 10.2 Integration Tests

```java
@SpringBootTest
@AutoConfigureMockMvc
public class AIControllerIntegrationTest {

    @Test
    public void testAIChatEndpoint_WithRealDatabase() throws Exception {
        mockMvc.perform(post("/api/ai/chat")
            .header("Authorization", "Bearer " + validToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.response.content").exists());
    }
}
```

---

## End of Specification

**Document Version:** 1.0  
**Last Updated:** May 2026  
**Technology Stack:** React + Java + PostgreSQL + Claude AI
