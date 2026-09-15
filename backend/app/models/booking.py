from typing import TypedDict


class BookingResult(TypedDict):
    bookingId: str
    farmerId: int
    centreId: int
    crop: str
    bookingDate: str
    timeSlot: str
    status: str
    queueToken: int
    queuePosition: int
    estimatedWaitMinutes: int
