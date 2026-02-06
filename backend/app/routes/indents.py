"""
Indent API Routes
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
import logging

from app.models import Indent, IndentCreate, IndentUpdate
from app.services.indent_service import indent_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/indents", tags=["indents"])


@router.get("/", response_model=List[dict])
async def get_indents(
    status: Optional[str] = Query(None, description="Filter by status"),
    start_date: Optional[str] = Query(None, description="Filter by start date (ISO format)"),
    end_date: Optional[str] = Query(None, description="Filter by end date (ISO format)"),
    limit: int = Query(100, le=1000, description="Maximum number of results")
):
    """
    Fetch all indents with optional filters
    
    - **status**: Filter by bid status (e.g., "In Progress")
    - **start_date**: Filter by placement date start (ISO format)
    - **end_date**: Filter by placement date end (ISO format)
    - **limit**: Maximum number of results (default: 100, max: 1000)
    """
    try:
        indents = await indent_service.get_all_indents(
            status=status,
            start_date=start_date,
            end_date=end_date,
            limit=limit
        )
        return indents
    except Exception as e:
        logger.error(f"Error fetching indents: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{indent_id}", response_model=dict)
async def get_indent(indent_id: str):
    """
    Fetch a single indent by ID
    
    - **indent_id**: Unique indent identifier
    """
    try:
        indent = await indent_service.get_indent_by_id(indent_id)
        
        if not indent:
            raise HTTPException(status_code=404, detail=f"Indent {indent_id} not found")
        
        return indent
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching indent {indent_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=dict, status_code=201)
async def create_indent(indent: IndentCreate):
    """
    Create a new indent
    
    - **indent**: Indent creation data
    """
    try:
        result = await indent_service.create_indent(indent)
        return result
    except Exception as e:
        logger.error(f"Error creating indent: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{indent_id}", response_model=dict)
async def update_indent(indent_id: str, update_data: IndentUpdate):
    """
    Update an existing indent
    
    - **indent_id**: Unique indent identifier
    - **update_data**: Fields to update
    """
    try:
        result = await indent_service.update_indent(indent_id, update_data)
        return result
    except Exception as e:
        logger.error(f"Error updating indent {indent_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{indent_id}", status_code=204)
async def delete_indent(indent_id: str):
    """
    Delete an indent (soft delete)
    
    - **indent_id**: Unique indent identifier
    """
    try:
        await indent_service.delete_indent(indent_id)
        return None
    except Exception as e:
        logger.error(f"Error deleting indent {indent_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{indent_id}/award", response_model=dict)
async def award_indent(
    indent_id: str,
    vendor_id: str = Query(..., description="Vendor ID to award"),
    vendor_name: str = Query(..., description="Vendor name")
):
    """
    Award an indent to a vendor
    
    - **indent_id**: Unique indent identifier
    - **vendor_id**: Vendor ID to award the indent to
    - **vendor_name**: Vendor name
    """
    try:
        result = await indent_service.award_indent(indent_id, vendor_id, vendor_name)
        return result
    except Exception as e:
        logger.error(f"Error awarding indent {indent_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
