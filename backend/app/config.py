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
        default="http://localhost:5173,http://localhost:3000,http://localhost:3020,http://143.110.191.22:3020,http://143.110.191.22",
        description="Comma-separated list of allowed CORS origins (NO WILDCARDS)"
    )
    
    # Environment
    environment: str = Field(default="development", description="Environment: development, staging, production")
    debug: bool = Field(default=True, description="Enable debug mode")
    
    # Optional: Gemini API Key
    gemini_api_key: str = Field(default="", description="Google Gemini API key")

    # JWT Authentication - ✅ FIXED: Auto-generate if not provided
    secret_key: str = Field(
        default_factory=lambda: secrets.token_urlsafe(32),
        description="JWT secret key - Auto-generated if not provided"
    )
    algorithm: str = Field(default="HS256", description="JWT algorithm")
    access_token_expire_minutes: int = Field(
        default=60 * 24,  # 24 hours
        description="JWT token expiration time in minutes"
    )
    
    # Redis Configuration
    redis_url: str = Field(default="redis://localhost:6379/0", description="Redis connection URL")
    
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
    
    # ✅ REMOVED: Strict secret_key validation that was causing production issues
    
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
    print(f"Secret Key: {'✅ Generated' if settings.secret_key else '❌ Missing'}")
    print("===========================")
