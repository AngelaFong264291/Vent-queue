from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func
from database import Base

class QueueEntry(Base):
    __tablename__ = "queue_entries"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String, nullable=False)
    phone       = Column(String, nullable=False)
    party_size  = Column(Integer, default=1)
    position    = Column(Integer)
    status      = Column(String, default="waiting")
    shop_id     = Column(String, nullable=False)
    joined_at   = Column(DateTime(timezone=True), server_default=func.now())
    notified_at = Column(DateTime(timezone=True), nullable=True)

class Shop(Base):
    __tablename__ = "shops"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String, nullable=False)
    shop_id     = Column(String, unique=True, nullable=False)
    owner_phone = Column(String)
    active      = Column(Boolean, default=True)