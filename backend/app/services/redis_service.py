import redis.asyncio as redis
import json
import logging
from typing import Optional, Any
from app.config import settings

logger = logging.getLogger(__name__)

class RedisService:
    def __init__(self):
        self.redis: Optional[redis.Redis] = None
        self.connected = False

    async def connect(self):
        """Establish Redis connection"""
        try:
            self.redis = redis.from_url(
                settings.redis_url, 
                encoding="utf-8", 
                decode_responses=True
            )
            # Verify connection
            await self.redis.ping()
            self.connected = True
            logger.info(f"✅ Redis Connected: {settings.redis_url}")
        except Exception as e:
            logger.error(f"❌ Redis Connection Failed: {e}")
            self.connected = False

    async def get_json(self, key: str) -> Optional[dict]:
        """Get JSON value from Redis"""
        if not self.connected or not self.redis:
            # Try to reconnect lazily
            await self.connect()
            if not self.connected: return None
            
        try:
            val = await self.redis.get(key)
            return json.loads(val) if val else None
        except Exception as e:
            logger.error(f"Redis GET Error ({key}): {e}")
            return None

    async def set_json(self, key: str, value: Any, ttl: int = 300):
        """Set JSON value in Redis with TTL (default 5 mins)"""
        if not self.connected or not self.redis:
            await self.connect()
            if not self.connected: return
            
        try:
            await self.redis.setex(key, ttl, json.dumps(value))
        except Exception as e:
            logger.error(f"Redis SET Error ({key}): {e}")

    async def delete(self, key: str):
        """Delete key"""
        if self.connected and self.redis:
            try:
                await self.redis.delete(key)
            except Exception as e:
                logger.error(f"Redis DELETE Error ({key}): {e}")
    
    async def close(self):
        """Close Redis connection"""
        if self.redis:
            await self.redis.close()
            self.connected = False
            logger.info("Redis Connection Closed")

# Global instance
redis_service = RedisService()
