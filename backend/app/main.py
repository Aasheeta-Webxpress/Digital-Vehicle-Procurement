"""
Main FastAPI Application
TVS Procurement Python Backend
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import time

from app.config import settings
from app.routes import indents, bids, analytics, auth
from app.services.firebase_service import firebase_service
from app.services.redis_service import redis_service

# Configure logging
logging.basicConfig(
    level=logging.INFO if not settings.debug else logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title="TVS Procurement API",
    description="Backend API for Digital Vehicle Procurement System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all incoming requests"""
    start_time = time.time()
    
    # Log request
    logger.info(f"Request: {request.method} {request.url.path}")
    
    # Process request
    response = await call_next(request)
    
    # Log response time
    process_time = time.time() - start_time
    logger.info(f"Response: {response.status_code} - {process_time:.3f}s")
    
    return response


# Include routers
app.include_router(auth.router)
app.include_router(indents.router)
app.include_router(bids.router)
app.include_router(analytics.router)


@app.on_event("startup")
async def startup_event():
    """Run on application startup"""
    logger.info("=" * 60)
    logger.info("TVS Procurement API Starting...")
    logger.info(f"Environment: {settings.environment}")
    logger.info(f"Debug Mode: {settings.debug}")
    logger.info(f"CORS Origins: {settings.cors_origins_list}")
    
    
    # Check Firebase connection
    if firebase_service.is_connected:
        logger.info("✅ Firebase connected successfully")
    else:
        logger.warning("⚠️  Firebase not connected - Running in mock mode")
        logger.warning("   Please configure Firebase credentials to enable database")
        
    # Check Redis connection
    await redis_service.connect()
    if redis_service.connected:
        logger.info("✅ Redis connected successfully")
    else:
        logger.warning("⚠️  Redis connection failed")
    
    logger.info("=" * 60)


@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown"""
    logger.info("TVS Procurement API Shutting down...")
    await redis_service.close()


@app.get("/", tags=["root"])
async def root():
    """Root endpoint"""
    return {
        "message": "TVS Procurement API",
        "version": "1.0.0",
        "status": "running",
        "firebase_connected": firebase_service.is_connected,
        "docs": "/docs",
        "redoc": "/redoc"
    }


@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "firebase_connected": firebase_service.is_connected,
        "redis_connected": redis_service.connected,
        "environment": settings.environment
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "message": str(exc) if settings.debug else "An error occurred"
        }
    )


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.api_reload,
        log_level="info"
    )
