<div align="center">

# ⚡ Smart Energy AI
### Autonomous Microgrid Intelligence & Prosumer Clean Energy Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.0+-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://react.dev)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.16+-FF6F00.svg?style=flat&logo=tensorflow&logoColor=white)](https://tensorflow.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg?style=flat&logo=docker&logoColor=white)](https://docker.com)
[![Tests](https://img.shields.io/badge/Tests-13%20Passed-brightgreen.svg?style=flat&logo=pytest&logoColor=white)](https://pytest.org)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

*Empowering distributed microgrids, renewable prosumers, and smart facilities with spatial Graph Neural Networks, deep predictive forecasting, and automated carbon accounting.*

[Explore Documentation](docs/architecture/SYSTEM_ARCHITECTURE.md) • [Executive Summary](docs/final_report/STARTUP_EXECUTIVE_SUMMARY.md)

---

</div>

## 🌟 Key Features

- **🌐 Graph Neural Network (GNN) Grid Topology**  
  Models prosumer households, local transformer substations, and solar generation nodes as an interconnected spatial graph, predicting regional grid congestion and feeder overload risk.
  
- **📈 24-Hour LSTM Load & Solar Forecasting**  
  Stacked Long Short-Term Memory neural network forecasting next-day hourly net grid demand and solar production with 95% confidence intervals.

- **🛡️ Unsupervised Autoencoder Anomaly Defense**  
  Real-time telemetry reconstruction monitoring that flags abnormal equipment draws, heating element faults, and standby leakage with automatic severity scoring.

- **🧪 What-If Energy Scenario Simulator**  
  Interactive multi-layer perceptron (MLP) simulator for modeling heat pump additions, rooftop solar expansions, EV charging windows, and battery storage economics.

- **🌱 Automated Carbon Accounting & ESG Reporting**  
  Continuous Scope 2 emission monitoring, calculating real-time avoided CO₂ kilograms, equivalent trees planted, and vehicle miles offset.

- **🔔 Real-Time Notification & Alert Center**  
  Proactive notifications for grid peak alerts, solar generation surpluses, and abnormal spikes with mock email dispatch integration.

---

## 🏗️ System Architecture

```
[ Edge Meters & Sensors ] ---> [ FastAPI REST Gateway ] ---> [ Deep Learning Engine ]
                                      |                               |
                                      +---> [ SQLite Database ]       +---> GNN Spatial Graph
                                      |                               +---> LSTM 24h Forecaster
                                      v                               +---> Autoencoder Anomaly
                           [ React 19 + Vite UI ]                     +---> What-If MLP Simulator
```

For detailed architectural specifications and sequence flowcharts, see:
- [System Architecture Specification](docs/architecture/SYSTEM_ARCHITECTURE.md)
- [System Flow Diagrams](docs/diagrams/ARCHITECTURE_DIAGRAMS.md)

---

## 🚀 Quickstart Guide

### Option 1: Docker Compose (Recommended)

Run the entire full-stack application (FastAPI backend + React frontend + Nginx) with a single command:

```bash
docker compose -f docker/docker-compose.yml up --build
```

- **Frontend Console:** `http://localhost:5173` (or `http://localhost:80`)
- **Backend API:** `http://localhost:8000`
- **Interactive OpenAPI Docs:** `http://localhost:8000/docs`

---

### Option 2: Local Development Setup

#### 1. Backend Setup (FastAPI & Deep Learning)
```bash
# Navigate to backend
cd backend

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend Setup (React + Vite)
```bash
# Navigate to frontend
cd frontend

# Install npm packages
npm install

# Launch Vite dev server
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 🧪 Running the Test Suite

We maintain 100% test passing across API routes, mathematical conversion functions, and carbon calculations:

```bash
# Run pytest from project root
pytest
```

Output:
```
tests/backend/test_api.py::test_health_check PASSED
tests/backend/test_api.py::test_notifications_stream PASSED
tests/backend/test_api.py::test_dispatch_test_notification PASSED
tests/backend/test_api.py::test_carbon_details PASSED
tests/backend/test_api.py::test_get_appliances PASSED
tests/backend/test_api.py::test_get_anomalies PASSED
tests/backend/test_api.py::test_get_recommendations PASSED
tests/backend/test_api.py::test_auth_workflow PASSED
tests/backend/test_helpers.py::test_watts_to_kw PASSED
tests/backend/test_helpers.py::test_kw_to_kwh PASSED
tests/backend/test_helpers.py::test_compute_carbon_footprint PASSED
tests/backend/test_helpers.py::test_calculate_time_of_use_cost PASSED
tests/backend/test_helpers.py::test_sanitize_numerical PASSED
13 passed in 7.78s
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Health check and service metadata |
| `POST` | `/api/auth/register` | Register new prosumer or operator account |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT Bearer token |
| `GET` | `/api/energy/realtime` | Real-time power draw, solar generation & frequency |
| `GET` | `/api/energy/curve` | 24-hour hourly load curve |
| `GET` | `/api/gnn/topology` | Spatial energy graph nodes, edge list & clusters |
| `GET` | `/api/gnn/predict` | GNN inference for load forecast & feeder risk |
| `GET` | `/api/anomalies` | Detected equipment faults and standby leakages |
| `GET` | `/api/carbon/details` | Detailed CO₂ emissions, solar offsets & trees equivalent |
| `GET` | `/api/notifications` | Real-time alert stream and unread count |
| `POST` | `/api/notifications/dispatch-test`| Trigger simulated email and console alert |



---

## 🏢 Business & Investment Documentation
- [Startup Executive Summary & Market Brief](docs/final_report/STARTUP_EXECUTIVE_SUMMARY.md)

---

## 📄 License
This project is open-source software licensed under the [MIT License](LICENSE).
