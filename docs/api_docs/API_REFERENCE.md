# Smart Energy AI - REST API Reference Specification

**Version:** 1.0.0-enterprise  
**Base URL:** `http://localhost:8000/api`  
**Authentication:** Bearer JWT Token (`Authorization: Bearer <token>`)

---

## 1. Authentication Endpoints (`/auth`)

### Register User
- **POST** `/auth/register`
- **Request Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@energygrid.io",
    "password": "SecurePassword123!"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "user": {
      "id": "usr_7a8b9c0d",
      "name": "Jane Doe",
      "email": "jane@energygrid.io",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

### User Login
- **POST** `/auth/login`
- **Request Body:**
  ```json
  {
    "email": "jane@energygrid.io",
    "password": "SecurePassword123!"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "user": {
      "id": "usr_7a8b9c0d",
      "name": "Jane Doe",
      "email": "jane@energygrid.io",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

---

## 2. Energy Telemetry & Load Curve (`/energy`)

### Realtime Metrics
- **GET** `/energy/realtime`
- **Response (200 OK):**
  ```json
  {
    "activeDrawWatts": 3650,
    "activeDrawKw": 3.65,
    "solarGenerationKw": 2.15,
    "netDrawKw": 1.50,
    "gridFrequencyHz": 60.02,
    "timestamp": "2026-10-03 14:30:00"
  }
  ```

### Daily Summary Metrics
- **GET** `/energy/summary`
- **Response (200 OK):**
  ```json
  {
    "totalDrawKwh": 28.45,
    "solarGeneratedKwh": 14.20,
    "netGridImportKwh": 14.25,
    "estimatedCostToday": 4.12,
    "carbonSavedKg": 6.39
  }
  ```

### 24-Hour Load Curve
- **GET** `/energy/curve`
- **Response (200 OK):**
  ```json
  [
    {
      "hour": "00:00",
      "grid_draw_kwh": 0.82,
      "solar_generation_kwh": 0.0,
      "net_draw_kwh": 0.82,
      "temperature": 64.2
    }
  ]
  ```

---

## 3. Graph Neural Network Grid Topology (`/gnn`)

### Spatial Topology
- **GET** `/gnn/topology`
- **Description:** Returns graph nodes (households, solar micro-inverters, feeder substations) with normalized adjacency matrix.
- **Response (200 OK):**
  ```json
  {
    "numNodes": 20,
    "numEdges": 38,
    "nodes": [
      {
        "id": "H10001",
        "index": 0,
        "type": "household",
        "energyKwh": 14.2,
        "occupants": 3,
        "renewable": true,
        "peakKw": 4.8
      }
    ],
    "edges": [
      { "source": "H10001", "target": "H10002", "weight": 0.875 }
    ]
  }
  ```

### Real-Time GNN Load Inference
- **GET** `/gnn/predict`
- **Response (200 OK):**
  ```json
  {
    "status": "success",
    "model": "SpatialGraphConvolution-GNN",
    "predictions": [
      {
        "householdId": "H10001",
        "predictedEnergyKwh": 15.34,
        "predictedPeakKw": 4.95,
        "gridOverloadRisk": "Low"
      }
    ],
    "gridCongestionScore": 0.32
  }
  ```

---

## 4. Anomaly Detection & AI Defense (`/anomaly`)

### List Detected Anomalies
- **GET** `/anomalies`
- **Response (200 OK):**
  ```json
  [
    {
      "id": "anom_1",
      "appliance": "Central Air Conditioner",
      "severity": "warning",
      "timestamp": "Today, 02:15 AM",
      "title": "Standby Leakage",
      "description": "Central cooling system drawing 250W during inactive standby hours.",
      "impact_cost": 1.25,
      "impact_carbon": 0.4,
      "resolved": 0
    }
  ]
  ```

### Resolve / Acknowledge Anomaly
- **POST** `/anomalies/{anomaly_id}/resolve`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "anomaly_id": "anom_1",
    "status": "resolved"
  }
  ```

---

## 5. Automated Carbon Analytics (`/carbon`)

### Detailed Carbon Footprint
- **GET** `/carbon/details?grid_kwh=15.0&solar_kwh=8.0`
- **Response (200 OK):**
  ```json
  {
    "emittedKg": 6.30,
    "offsetKg": 3.60,
    "netCarbonKg": 2.70,
    "equivalentTrees": 60,
    "carMilesSaved": 9.0
  }
  ```

---

## 6. Live Grid Alerts & Notifications (`/notifications`)

### Alert Stream
- **GET** `/notifications`
- **Response (200 OK):**
  ```json
  {
    "notifications": [
      {
        "id": "notif_1",
        "title": "Grid Peak Demand Approaching",
        "message": "Regional transformer load approaching 85% capacity.",
        "type": "warning",
        "timestamp": "10 minutes ago",
        "read": false
      }
    ],
    "totalCount": 3,
    "unreadCount": 2
  }
  ```

### Dispatch Test Alert
- **POST** `/notifications/dispatch-test`
- **Request Body:**
  ```json
  {
    "recipientEmail": "ops@smartenergy.ai",
    "alertType": "critical",
    "customMessage": "Transformer branch T-42 overheating alarm."
  }
  ```
