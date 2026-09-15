from pydantic import BaseModel, ConfigDict, Field


class FarmerRegister(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    full_name: str = Field(alias="fullName")
    mobile: str
    email: str | None = None
    state: str
    district: str
    village: str
    land_area: float = Field(alias="landArea")
    crop: str
    password: str


class FarmerLogin(BaseModel):
    identifier: str
    password: str
