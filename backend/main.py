from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

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

@app.post('/farmers/register')

def register_farmer(farmer:FarmerRegister):

    return{
        "message":"farmer registered successfully",
        "farmer":farmer
    }