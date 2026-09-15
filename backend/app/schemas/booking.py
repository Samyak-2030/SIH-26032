from pydantic import BaseModel


class BookingCreate(BaseModel):
    centre_id: int
    crop: str
    booking_date: str
    time_slot: str
