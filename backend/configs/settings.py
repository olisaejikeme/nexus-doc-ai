from pathlib import Path
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # CORS
    allowed_origins: List[str] = ["http://localhost:5173", "http://localhost:3000", "https://jobtrackr-frontend-tan.vercel.app"]

    app_name: str = "Nexus AI"
    environment: str = Field(default="development", alias="ENVIRONMENT")
    debug: bool = Field(default=False, alias="DEBUG")

    # DB Settings
    db_name: str = Field(default="postgres", alias="DB_NAME")
    db_user: str = Field(default="postgres", alias="DB_USER")
    db_password: str = Field(default="", alias="DB_PASSWORD")
    db_host: str = Field(default="localhost", alias="DB_HOST")
    db_port: str = Field(default="5432", alias="DB_PORT")
    database_url: str = Field(..., alias="DATABASE_URL")

    # Auth
    secret_key: str = Field(..., alias="SECRET_KEY")
    access_token_expire_minutes: int = Field(..., alias="ACCESS_TOKEN_EXPIRE_MINUTES")
    refresh_token_expire_days: int = Field(..., alias="REFRESH_TOKEN_EXPIRE_DAYS")
    reset_password_expire_minutes: int = Field(..., alias="RESET_PASSWORD_EXPIRE_MINUTES")
    algorithm: str = Field(..., alias="ALGORITHM")

    # File Storage
    cloudinary_name: str = Field(..., alias="CLOUDINARY_NAME")
    cloudinary_api_key: str = Field(..., alias="CLOUDINARY_API_KEY")
    cloudinary_api_secret: str = Field(..., alias="CLOUDINARY_API_SECRET")

    # Initial Admin Seed Data
    admin_email: str = Field("admin@jobtrackr.com", alias="ADMIN_EMAIL")
    admin_password: str = Field("admin_123", alias="ADMIN_PASSWORD")
    admin_name: str = Field("System Admin", alias="ADMIN_NAME")

    resend_api_key: str = Field(..., alias="RESEND_API_KEY")
    frontend_url: str = Field("http://localhost:5173", alias="FRONT_END_URL")
    
    pinecone_api_key: str = Field(..., alias="PINECONE_API_KEY")
    groq_api_key: str = Field(..., alias="GROQ_API_KEY")
    huggingface_api_token: str = Field(..., alias="HUGGINGFACE_API_TOKEN")

# Load settings
settings = Settings()