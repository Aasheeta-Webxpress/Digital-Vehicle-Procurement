"""
Configuration module for the TVS Procurement API
Loads environment variables and provides application settings
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, field_validator
from typing import List
import os
import secrets


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Firebase Configuration
    firebase_credentials_path: str = Field(
        default="./serviceAccountKey.json",
        description="Path to Firebase service account key JSON file"
    )
    firebase_project_id: str = Field(
        default="controltower-1099",
        description="Firebase project ID"
    )
    
    # API Configuration
    api_host: str = Field(default="0.0.0.0", description="API host")
    api_port: int = Field(default=8020, description="API port")
    api_reload: bool = Field(default=True, description="Enable auto-reload")
    
    # CORS Configuration - NO WILDCARD
    cors_origins: str = Field(
        default="http://localhost:5173,http://localhost:3000,http://localhost:3020",
        description="Comma-separated list of allowed CORS origins (NO WILDCARDS)"
    )
    
    # Environment
    environment: str = Field(default="development", description="Environment: development, staging, production")
    debug: bool = Field(default=True, description="Enable debug mode")
    
    # Optional: Gemini API Key
    gemini_api_key: str = Field(default="", description="Google Gemini API key")

    # JWT Authentication
    secret_key: str = Field(
        default="tvs-procurement-secret-key-CHANGE-IN-PRODUCTION",
        description="JWT secret key - MUST be changed in production"
    )
    algorithm: str = Field(default="HS256", description="JWT algorithm")
    access_token_expire_minutes: int = Field(
        default=60 * 24,  # 24 hours
        description="JWT token expiration time in minutes"
    )
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore"
    )
    
    @field_validator('cors_origins')
    @classmethod
    def validate_cors_origins(cls, v: str) -> str:
        """Validate CORS origins - no wildcards allowed"""
        if '*' in v:
            raise ValueError(
                "Wildcard (*) in CORS origins is not allowed for security reasons. "
                "Please specify exact origins."
            )
        return v
    
    @field_validator('secret_key')
    @classmethod
    def validate_secret_key(cls, v: str, info) -> str:
        """Validate secret key in production"""
        # Get environment from values if available
        env = info.data.get('environment', 'development')
        
        if env.lower() == 'production':
            if v == "tvs-procurement-secret-key-CHANGE-IN-PRODUCTION" or len(v) < 32:
                # Log warning instead of crashing
                import logging
                logger = logging.getLogger(__name__)
                logger.warning(
                    "SECURITY WARNING: Using default or weak SECRET_KEY in production. "
                    "Please set a strong SECRET_KEY environment variable."
                )
        return v
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Convert comma-separated CORS origins to list"""
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]
    
    @property
    def is_production(self) -> bool:
        """Check if running in production environment"""
        return self.environment.lower() == "production"


# Global settings instance
settings = Settings()

# Log configuration on startup (excluding sensitive data)
if __name__ == "__main__":
    print("=== Configuration Loaded ===")
    print(f"Environment: {settings.environment}")
    print(f"API: {settings.api_host}:{settings.api_port}")
    print(f"CORS Origins: {settings.cors_origins_list}")
    print(f"Debug: {settings.debug}")
    print(f"Firebase Project: {settings.firebase_project_id}")
    print("===========================")

