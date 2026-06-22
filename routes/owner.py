from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import QueueEntry
from twilio.rest import Client
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timezone
from dotenv import load_dotenv
import os

load_dotenv()

router = APIRouter()

# ── SMS helper ────────────────────────────────────────────────
def send_sms(to_phone: str, message: str):
    client = Client(
        os.getenv("TWILIO_ACCOUNT_SID"),
        os.getenv("TWILIO_AUTH_TOKEN")
    )
    client.messages.create(
        from_=os.getenv("TWILIO_SMS_FROM"),
        to=f"+852{to_phone}",
        body=message
    )

# ── 1. Get full queue ─────────────────────────────────────────
@router.get("/owner/{shop_id}/queue")
def get_queue(shop_id: str, db: Session = Depends(get_db)):
    queue = db.query(QueueEntry).filter(
        QueueEntry.shop_id == shop_id,
        QueueEntry.status.in_(["waiting", "notified"])
    ).order_by(QueueEntry.position).all()

    return {
        "total_waiting": len(queue),
        "queue": [
            {
                "id": e.id,
                "name": e.name,
                "phone": e.phone,
                "party_size": e.party_size,
                "position": e.position,
                "status": e.status,
                "joined_at": e.joined_at,
                "notified_at": e.notified_at,
            }
            for e in queue
        ]
    }

# ── 2. Notify customer ────────────────────────────────────────
@router.post("/owner/{shop_id}/notify/{entry_id}")
def notify_customer(
    shop_id: str,
    entry_id: int,
    db: Session = Depends(get_db)
):
    entry = db.query(QueueEntry).filter(
        QueueEntry.id == entry_id,
        QueueEntry.shop_id == shop_id
    ).first()

    if not entry:
        return {"error": "Customer no longer exists"}

    # Send SMS
    send_sms(
        entry.phone,
        f"您好 {entry.name}！您係 {shop_id} 嘅枱準備好喇，請喺2分鐘內返嚟 🍽️"
    )

    entry.status = "notified"
    entry.notified_at = datetime.now(timezone.utc)
    db.commit()

    return {"message": f"SMS sent to {entry.name}"}

# ── 3. Seat customer ──────────────────────────────────────────
@router.post("/owner/{shop_id}/seat/{entry_id}")
def seat_customer(
    shop_id: str,
    entry_id: int,
    db: Session = Depends(get_db)
):
    entry = db.query(QueueEntry).filter(
        QueueEntry.id == entry_id,
        QueueEntry.shop_id == shop_id
    ).first()

    if not entry:
        return {"error": "Customer no longer exists"}

    entry.status = "seated"
    db.commit()

    # Move everyone behind up one position
    db.query(QueueEntry).filter(
        QueueEntry.shop_id == shop_id,
        QueueEntry.status == "waiting",
        QueueEntry.position > entry.position
    ).update({"position": QueueEntry.position - 1})
    db.commit()

    return {"message": f"{entry.name} has been seated"}

# ── 4. Remove customer ────────────────────────────────────────
@router.post("/owner/{shop_id}/remove/{entry_id}")
def remove_customer(
    shop_id: str,
    entry_id: int,
    db: Session = Depends(get_db)
):
    entry = db.query(QueueEntry).filter(
        QueueEntry.id == entry_id,
        QueueEntry.shop_id == shop_id
    ).first()

    if not entry:
        return {"error": "Customer no longer exists."}

    entry.status = "removed"
    db.commit()

    # Move everyone behind up one position
    db.query(QueueEntry).filter(
        QueueEntry.shop_id == shop_id,
        QueueEntry.status == "waiting",
        QueueEntry.position > entry.position
    ).update({"position": QueueEntry.position - 1})
    db.commit()

    return {"message": f"{entry.name} has been removed"}


# ── Background task ───────────────────────────────────────────
def check_queue_timers():
    from database import SessionLocal
    db = SessionLocal()
    now = datetime.now(timezone.utc)

    notified = db.query(QueueEntry).filter(
        QueueEntry.status == "notified"
    ).all()

    for entry in notified:
        if entry.notified_at:
            mins_since = (now - entry.notified_at).total_seconds() / 60

            # 20 mins passed — auto remove
            if mins_since >= 20:
                entry.status = "removed"
                db.commit()

                # Send SMS to notify customer they've been removed
                send_sms(
                    entry.phone,
                    f"您好 {entry.name}！非常抱歉，您已經超過20分鐘未有返嚟，您的位置已經取消。如需再次排隊請重新掃描QR碼 🙏"
                )

                db.query(QueueEntry).filter(
                    QueueEntry.shop_id == entry.shop_id,
                    QueueEntry.status == "waiting",
                    QueueEntry.position > entry.position
                ).update({"position": QueueEntry.position - 1})
                db.commit()

    db.close()

# Start background scheduler
scheduler = BackgroundScheduler()
scheduler.add_job(check_queue_timers, 'interval', minutes=1)
scheduler.start()