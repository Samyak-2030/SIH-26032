from fastapi import APIRouter, Depends

from app.core.security import get_current_farmer
from app.schemas.farmer import FarmerRegister
from app.services.farmer_service import register_farmer
from app.services.farmer_booking_service import list_farmer_bookings

router = APIRouter(prefix="/api/farmers", tags=["farmers"])


@router.post("/register")
def register(farmer: FarmerRegister):
    return register_farmer(farmer)


@router.get("/me")
def read_current_farmer(farmer=Depends(get_current_farmer)):
    return {
        "id": farmer["id"], "fullName": farmer["full_name"],
        "mobile": farmer["mobile"], "email": farmer["email"],
        "state": farmer["state"], "district": farmer["district"],
        "village": farmer["village"], "landArea": farmer["land_area"],
        "crop": farmer["crop"], "createdAt": farmer["created_at"],
    }


@router.get("/me/bookings")
def read_farmer_bookings(farmer=Depends(get_current_farmer)):
    return {"bookings": list_farmer_bookings(farmer["id"])}
