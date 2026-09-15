from fastapi import APIRouter

from app.schemas.centre import CentreCreate
from app.services.centre_service import create_centre, list_active_centres

router = APIRouter(prefix="/api/centres", tags=["centres"])


@router.get("")
def get_centres():
    return {"centres": list_active_centres()}


@router.post("", status_code=201)
def add_centre(centre: CentreCreate):
    return {"centre": create_centre(centre)}
