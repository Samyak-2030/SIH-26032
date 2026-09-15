from fastapi import APIRouter

from app.core.security import create_access_token
from app.schemas.farmer import FarmerLogin
from app.services.farmer_service import authenticate_farmer

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login")
def login_farmer(login: FarmerLogin):
    farmer = authenticate_farmer(login)
    return {
        "message": "login successful",
        "access_token": create_access_token(farmer["id"]),
        "token_type": "bearer",
        "farmer": {
            "id": farmer["id"], "fullName": farmer["full_name"],
            "mobile": farmer["mobile"], "email": farmer["email"],
        },
    }
