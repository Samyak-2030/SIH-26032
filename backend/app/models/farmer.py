from typing import TypedDict


class FarmerRecord(TypedDict):
    id: int
    full_name: str
    mobile: str
    email: str | None
    state: str
    district: str
    village: str
    land_area: float
    crop: str
    created_at: str
