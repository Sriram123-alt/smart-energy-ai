# Smart Energy AI - System Architecture

## 1. Executive Technical Overview
**Smart Energy AI** is a distributed microgrid intelligence and prosumer energy optimization platform. It combines edge IoT telemetry ingestion, deep learning models (LSTM, Autoencoder, What-If MLP, Recommender, and Spatial Graph Convolutional Networks), and automated carbon accounting to provide residential and commercial prosumers with autonomous energy management.

---

## 2. Layered Architecture

```
+--------------------------------------------------------------------------+
|                        Frontend Layer (React 19 + Vite)                  |
|  - Real-Time Topology Visualization (Canvas / SVG Graph Renderer)        |
|  - Anomaly Alert Center & Real-Time Notification Stream                 |
|  - What-If Energy Scenario Simulator                                     |
|  - Automated Carbon Accounting Dashboard & TOU Tariff Calculator         |
+--------------------------------------------------------------------------+
                                     |
                                  REST APIs
                                     |
+--------------------------------------------------------------------------+
|                     Application & API Gateway (FastAPI)                  |
|  - JWT Authentication & RBAC (Homeowner, Operator, Admin)                |
|  - SQLite & Async Query Engine with Row Factory                          |
|  - Microservice Routing (/auth, /energy, /gnn, /anomalies, /carbon)     |
+--------------------------------------------------------------------------+
                                     |
           +-------------------------+-------------------------+
           |                                                   |
+-----------------------------------+   +----------------------------------+
|      Deep Learning Inference      |   |        Relational Storage        |
|  - LSTM 24h Load Forecaster       |   |  - Users & Credentials (Bcrypt)  |
|  - Unsupervised Autoencoder       |   |  - Appliance Registry & Status   |
|  - Spatial-Temporal GNN Model     |   |  - Historical Anomalies          |
|  - What-If MLP Scenario Engine    |   |  - AI Recommendation Records     |
+-----------------------------------+   +----------------------------------+
```

---

## 3. Deep Learning Subsystems

### A. Graph Neural Network (GNN) Grid Topology
- **Model:** Spatial Graph Convolution ($A_{norm} \cdot X \cdot W$)
- **Input Features (8D):** $[Energy_{kWh}, Occupants, Temp, Renewable_{flag}, PeakDraw_{kW}, AvgApplianceWattage, GridCO_2, HistoricalCO_2]$
- **Adjacency Computation:** Spatial clustering + Gaussian feature affinity metric $e^{-\frac{\|x_i - x_j\|_2}{10.0}}$
- **Outputs:** Next-day household energy demand ($kWh$) and peak substation congestion risk.

### B. Long Short-Term Memory (LSTM) Forecasting
- **Architecture:** 2-layer stacked LSTM with Dropout (0.2)
- **Input Horizon:** 24 continuous hourly readings across 4 features (Grid Draw, Solar Generation, Temperature, Occupancy)
- **Output Horizon:** Next 24 hours predicted grid load profile with confidence bounds.

### C. Unsupervised Autoencoder Anomaly Defense
- **Architecture:** Symmetric 4-layer autoencoder with Bottleneck Latent Dimension = 4
- **Objective:** Reconstruct normal baseline energy usage patterns
- **Detection Metric:** Mean Squared Error (MSE) reconstruction loss; samples with $MSE > \tau_{95th}$ trigger automated anomaly alerts with severity scoring.

---

## 4. Security & Compliance
- **Authentication:** Standard HMAC-SHA256 JWT tokens with configurable expiry (24-hour default).
- **Password Security:** Cryptographically secure salt generation and blowfish hashing via native `bcrypt`.
- **CORS Protection:** Configurable origin whitelisting in `settings.py`.
