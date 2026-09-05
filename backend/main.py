from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)

class FarmerRegister(BaseModel):

    fullName:str
    mobile: str
    email : str | None=None
    state:str
    district:str
    village:str
    landArea:str
    crop:str
    password:str

@app.post('/api/farmers/register')

def register_farmer(farmer:FarmerRegister):

    return{
        "message":"farmer registered successfully",
        "farmer": {
            "fullName": farmer.fullName,
            "mobile": farmer.mobile,
            "email": farmer.email,
            "state": farmer.state,
            "district": farmer.district,
            "village": farmer.village,
            "landArea": farmer.landArea,
            "crop": farmer.crop,
        }
    }