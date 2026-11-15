import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings
from app.config.database import init_db

# Routers
from app.routes import auth, appliances, energy, billing, carbon, forecasting, anomaly, recommendations, chatbot, reports, gnn, notifications

# DL training triggers
from app.dl.preprocessing.clean_data import generate_synthetic_datasets
from app.dl.training.train_lstm import train_lstm
from app.dl.training.train_autoencoder import train_autoencoder
from app.dl.training.train_whatif import train_whatif
from app.dl.training.train_recommender import train_recommender
from app.dl.training.train_gnn import train_gnn

app = FastAPI(title=settings.PROJECT_NAME)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    # 1. Initialize SQLite Database Tables
    print("Initializing SQLite Database...")
    init_db()
    
    # 2. Check and generate synthetic datasets
    print("Checking datasets directory...")
    generate_synthetic_datasets()
    
    # 3. Check and train deep learning models if not present
    os.makedirs(settings.SAVED_MODELS_DIR, exist_ok=True)
    
    lstm_model_path = os.path.join(settings.SAVED_MODELS_DIR, "lstm_forecast_model.keras")
    autoencoder_model_path = os.path.join(settings.SAVED_MODELS_DIR, "autoencoder_model.keras")
    whatif_model_path = os.path.join(settings.SAVED_MODELS_DIR, "whatif_model.keras")
    recommender_model_path = os.path.join(settings.SAVED_MODELS_DIR, "recommender_model.keras")
    gnn_model_path = os.path.join(settings.SAVED_MODELS_DIR, "gnn_energy_model.keras")
    
    if not os.path.exists(lstm_model_path):
        print("Training LSTM Forecasting Model...")
        train_lstm()
        
    if not os.path.exists(autoencoder_model_path):
        print("Training Autoencoder Anomaly Model...")
        train_autoencoder()
        
    if not os.path.exists(whatif_model_path):
        print("Training What-If Predictor MLP Model...")
        train_whatif()
        
    if not os.path.exists(recommender_model_path):
        print("Training Recommender Classifier Model...")
        train_recommender()

    if not os.path.exists(gnn_model_path):
        print("Training Graph Neural Network (GNN) Model...")
        train_gnn()
        
    print("All Deep Learning model training states verified. Server ready.")

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(appliances.router, prefix=settings.API_V1_STR)
app.include_router(energy.router, prefix=settings.API_V1_STR)
app.include_router(billing.router, prefix=settings.API_V1_STR)
app.include_router(carbon.router, prefix=settings.API_V1_STR)
app.include_router(forecasting.router, prefix=settings.API_V1_STR)
app.include_router(anomaly.router, prefix=settings.API_V1_STR)
app.include_router(recommendations.router, prefix=settings.API_V1_STR)
app.include_router(chatbot.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(gnn.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)


@app.get("/")
def health_check():
    return {"status": "healthy", "service": settings.PROJECT_NAME}
