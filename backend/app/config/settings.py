import os

class Settings:
    PROJECT_NAME: str = "Smart Energy AI Console API"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "smart-energy-ai-deep-learning-secret-key-19827364")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Path settings
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DATABASE_PATH: str = os.path.join(BASE_DIR, "smart_energy.db")
    
    # DL folder paths
    DL_DIR = os.path.join(BASE_DIR, "dl")
    SAVED_MODELS_DIR = os.path.join(DL_DIR, "saved_models")
    DATASETS_DIR = os.path.join(os.path.dirname(os.path.dirname(BASE_DIR)), "datasets")

    
    # CORS
    BACKEND_CORS_ORIGINS = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ]

settings = Settings()
