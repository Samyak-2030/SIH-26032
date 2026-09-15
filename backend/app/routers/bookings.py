from fastapi import APIRouter, Depends

from app.core.security import get_current_farmer
from app.schemas.booking import BookingCreate
from app.services.booking_service import create_booking

router = APIRouter(prefix="/api/bookings", tags=["bookings"])


@router.post("")
def add_booking(booking: BookingCreate, farmer=Depends(get_current_farmer)):
    return {
        "message": "Booking created successfully.",
        "booking": create_booking(booking, farmer),
    }
