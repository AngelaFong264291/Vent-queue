from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import QueueEntry
from pydantic import BaseModel

router = APIRouter()

class JoinQueueRequest(BaseModel):
    name: str
    phone: str
    party_size: int

# Customer joins the queue
@router.post("/queue/{shop_id}/join")
def join_queue(
    shop_id: str,
    request: JoinQueueRequest,
    db: Session = Depends(get_db)
):
    # Check duplicate phone
    existing = db.query(QueueEntry).filter(
        QueueEntry.phone == request.phone,
        QueueEntry.shop_id == shop_id,
        QueueEntry.status == "waiting"
    ).first()

    if existing:
        return {"error": "This phone number is already in the queue"}

    # Count how many people are already waiting
    waiting = db.query(QueueEntry).filter(
        QueueEntry.shop_id == shop_id,
        QueueEntry.status == "waiting"
    ).count()

    # Create a new queue entry
    entry = QueueEntry(
        name=request.name,
        phone=request.phone,
        party_size=request.party_size,
        shop_id=shop_id,
        position=waiting + 1,
        status="waiting"
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)

    return {
        "message": "Joined queue successfully",
        "entry_id": entry.id,
        "position": entry.position,
        "estimated_wait": entry.position * 10
    }

# Customer checks their position
@router.get("/queue/{shop_id}/status/{entry_id}")
def check_status(
    shop_id: str,
    entry_id: int,
    db: Session = Depends(get_db)
):
    # Find this customer's entry
    entry = db.query(QueueEntry).filter(
        QueueEntry.id == entry_id,
        QueueEntry.shop_id == shop_id
    ).first()

    if not entry:
        return {"error": "Queue entry not found"}

    # Count how many people are ahead
    waiting_ahead = db.query(QueueEntry).filter(
        QueueEntry.shop_id == shop_id,
        QueueEntry.status == "waiting",
        QueueEntry.position < entry.position
    ).count()

    return {
        "name": entry.name,
        "status": entry.status,
        "position": waiting_ahead + 1,
        "estimated_wait": (waiting_ahead + 1) * 10
    }

