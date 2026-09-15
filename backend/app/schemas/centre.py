from pydantic import BaseModel


class CentreCreate(BaseModel):
    name: str
    state: str
    district: str
    location: str
    capacity: int
    latitude: float
    longitude: float
    status: str = "Active"
