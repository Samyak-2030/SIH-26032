from fastapi import APIRouter, Depends

from app.core.security import get_current_farmer
from app.schemas.queue import QueueCheckUpdate
from app.services.queue_service import (
    call_next_token,
    list_centre_queue,
    list_farmer_queue,
    reset_queue,
    update_check,
)

router = APIRouter(prefix="/api/queue", tags=["queue"])


@router.get("/mine")
def get_my_tickets(farmer=Depends(get_current_farmer)):
    return {"tickets": list_farmer_queue(farmer["id"])}


@router.get("/centres/{centre_id}")
def get_centre_queue(centre_id: int):
    return {"tickets": list_centre_queue(centre_id)}


@router.post("/centres/{centre_id}/call-next")
def call_next(centre_id: int):
    return {"ticket": call_next_token(centre_id)}


@router.patch("/tickets/{entry_id}/checks")
def set_check(entry_id: int, update: QueueCheckUpdate):
    return {"ticket": update_check(entry_id, update)}


@router.post("/reset")
def reset_demo_queue():
    return {"deleted": reset_queue(), "message": "Demo queue reset."}
